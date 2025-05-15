const User = require("../models/users");
const Session = require("../models/sessions");
const { extractUserAgent } = require("../scripts/extractUserAgent");
const { scheduleSessionExpiry } = require("../scripts/scheduleSessionExpiry");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * @desc Login user
 * @route POST /api/v1/user/login
 * @access Public
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const keepAlive = true;

        // Get IP from the request
        const ip = req.ip || req.connection.remoteAddress;

        // Get the user agent
        const userAgent = req.headers["user-agent"];

        const formattedUserAgent = extractUserAgent(userAgent);

        if (!email || !password || !ip || !userAgent) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });

        if (!userExists) return res.status(401).json({ message: "Invalid credentials" });

        if (userExists.status !== "active") return res.status(403).json({ message: "Your account is inactive. Please contact support" });

        const isMatch = await bcrypt.compare(password, userExists.password);

        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Check if the stored IP in the User collection matches the IP from the request
        if (userExists.ipAddress && userExists.ipAddress !== ip) {
            return res.status(403).json({ message: "Login attempt from new device detected. Please contact support" });
        }

        // Check for an existing active session with the same userId
        const existingSession = await Session.findOne({
            userId: userExists._id,
            ip,
            userAgent: formattedUserAgent,
            expiresAt: { $gte: new Date() }, // Ensure the session is not expired
            status: "active"
        });

        if (existingSession) {
            // Delete the previous active session if found
            await Session.deleteOne({ _id: existingSession._id });
        }

        // Generate tokens
        const accessToken = jwt.sign({
            userId: userExists._id,
            fullName: userExists.fullName,
            email: userExists.email,
            plan: userExists.plan,
            billingCycle: userExists.billingCycle,
            subscriptionStatus: userExists.subscriptionStatus,
            uploadLimit: userExists.uploadLimit,
            planEndDate: userExists.planEndDate,
            role: userExists.role
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

        const refreshToken = jwt.sign({
            userId: userExists._id,
            fullName: userExists.fullName,
            email: userExists.email,
            plan: userExists.plan,
            billingCycle: userExists.billingCycle,
            subscriptionStatus: userExists.subscriptionStatus,
            uploadLimit: userExists.uploadLimit,
            planEndDate: userExists.planEndDate,
            role: userExists.role
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        // Clean up any expired sessions for this user
        await Session.deleteMany({
            userId: userExists._id,
            $or: [
                { expiresAt: { $lt: new Date() } },
                { status: "expired" }
            ]
        });

        // Create session
        const newSession = await Session.create({
            userId: userExists._id,
            refreshToken,
            ip,
            userAgent: formattedUserAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            status: "active"
        });

        userExists.lastLogIn = new Date();

        await userExists.save();

        scheduleSessionExpiry(newSession);

        // Set cookies
        res.cookie("_rt", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: true
        });

        res.cookie("_ka", keepAlive, {
            httpOnly: false, // Can be accessed by client-side JavaScript
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: true
        });

        return res.status(200).json({ accessToken, message: "Login successful" });

    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ message: "Server error - User login" });
    }
}

/**
 * @desc Logout user
 * @route POST /api/v1/user/logout
 * @access Public
 */
exports.logoutUser = async (req, res) => {
    try {
        const cookies = req.cookies;

        const ip = req.ip || req.connection.remoteAddress;

        // Check if keep alive cookie is true
        if (!cookies?._ka || cookies._ka !== "true") return res.status(204);

        // Check if the _rt cookie exists
        if (!cookies?._rt) return res.sendStatus(204);

        const refreshToken = cookies._rt;

        // Decode the refresh token to extract user ID
        let decoded;

        try {
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        // Find the session using the user ID and the refresh token
        const session = await Session.findOne({ refreshToken: refreshToken, userId: decoded.userId });

        // If session doesn't exist, return an error
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Check if the session status is "active"
        if (session.status !== "active") {
            return res.status(403).json({ message: "Session is not active" });
        }

        // Check if the session has expired
        if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
            return res.status(403).json({ message: "Session has expired" });
        }

        // Check if the IP address from the request matches the stored session IP
        if (session.ip !== ip) {
            return res.status(403).json({ message: "IP address mismatch, cannot log out from this device" });
        }

        // Remove the session from the database
        await Session.findOneAndDelete({ userId: decoded.userId });

        // Clear the cookies
        res.clearCookie("_rt", {
            httpOnly: true,
            sameSite: "none",
            secure: true
        });

        res.clearCookie("_ka", {
            httpOnly: false, // Can be accessed by client-side JavaScript
            sameSite: "none",
            secure: true
        });

        // Send success response
        return res.sendStatus(200);

    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({ message: "Server error - User logout" });
    }
}
