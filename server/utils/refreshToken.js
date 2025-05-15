const User = require("../models/users");
const Session = require("../models/sessions");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * @desc Refresh access token
 * @route POST /api/v1/auth/refresh-token
 * @access Public
 */
exports.refreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;

        const clearAuthCookies = (res) => {
            res.clearCookie("_ka", {
                httpOnly: false,
                sameSite: "none",
                secure: true
            });
            res.clearCookie("_rt", {
                httpOnly: true,
                sameSite: "none",
                secure: true
            });
        };

        const isKeepAliveInvalid = !cookies?._ka || cookies._ka !== "true";

        const isRefreshTokenMissing = !cookies?._rt;

        if (isKeepAliveInvalid || isRefreshTokenMissing) {
            clearAuthCookies(res);
            return res.status(401).json({ message: "Authentication cookies are missing or invalid. Please log in" });
        }

        const refreshToken = cookies._rt;

        // Look for session with this token
        const session = await Session.findOne({ refreshToken: refreshToken });

        if (!session) {
            clearAuthCookies(res);
            return res.status(403).json({ message: "Session not found. Please log in again" });
        }

        // Check if session is active
        if (session.status !== "active") {
            clearAuthCookies(res);
            return res.status(403).json({ message: "Session is not active. Please log in again" });
        }

        // Check if session has expired
        const currentDate = new Date();
        if (session.expiresAt < currentDate) {
            clearAuthCookies(res);
            // Optional: Delete the expired session
            await Session.deleteOne({ _id: session._id });
            return res.status(403).json({ message: "Session has expired. Please log in again" });
        }

        // Check if IP matches
        const ip = req.ip || req.connection.remoteAddress;
        if (session.ip !== ip) {
            clearAuthCookies(res);
            return res.status(403).json({ message: "IP address mismatch. Unauthorized access" });
        }

        // Verify JWT token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                clearAuthCookies(res);
                return res.status(403).json({ message: "Invalid refresh token" });
            }

            // Find user in DB
            const userExists = await User.findById(decoded.userId).lean().select("-password -ipAddress -lastLogIn");
            if (!userExists) {
                clearAuthCookies(res);
                return res.status(404).json({ message: "User not found" });
            }

            if (userExists.status !== "active") {
                clearAuthCookies(res);
                return res.status(403).json({ message: "Your account is inactive. Please contact support" });
            }

            // Generate new access token
            const accessToken = jwt.sign({
                userId: userExists._id,
                fullName: userExists.fullName,
                email: userExists.email,
                plan: userExists.plan,
                subscriptionStatus: userExists.subscriptionStatus,
                billingCycle: userExists.billingCycle,
                queryLimit: userExists.queryLimit,
                planEndDate: userExists.planEndDate,
                role: userExists.role
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

            return res.status(200).json({ accessToken });
        });
    } catch (error) {
        console.error("Error refreshing token:", error);
        res.status(500).json({ message: "Server error - Refreshing token" });
    }
}
