const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * @desc Login admin
 * @route POST /api/v1/admin/login
 * @access Public
 */
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const key = Number(req.body.key);

        // Get IP from the request
        const ip = req.ip || req.connection.remoteAddress;

        const keepAlive = true;

        if (!email || !password || !isNan(key || !ip)) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // If not found in User table, check in the user table
        const adminExists = await Admin.findOne({ email });

        if (!adminExists) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check if user is active
        if (adminExists.status !== "active") {
            return res.status(403).json({ message: "Your account is inactive. Please contact support" });
        }

        if (key !== adminExists.key) {
            return res.status(403).json({ message: "Invalid credentials" });
        }

        // Check if the stored IP in the Admin collection matches the IP from the request
        if (adminExists.ipAddress && adminExists.ipAddress !== ip) {
            return res.status(403).json({ message: "IP address mismatch. Unauthorized access" });
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, adminExists.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate tokens
        const accessToken = jwt.sign({
            adminId: adminExists._id,
            email: adminExists.email,
            role: adminExists.role
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

        const refreshToken = jwt.sign({
            adminId: adminExists._id,
            email: adminExists.email,
            role: adminExists.role
        }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

        // Set the refresh token in a cookie
        res.cookie("_rt_a", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: "none",
            secure: true
        });

        // Set the keep alive state in a cookie
        res.cookie("_ka_a", keepAlive, {
            httpOnly: false, // Can be accessed by client-side JavaScript
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: true
        });

        // Send the access token back in the response
        res.status(200).json({ accessToken, message: "Login successful" });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Server error - Admin login" });
    }
}

/**
 * @desc Logout admin
 * @route POST /api/v1/admin/logout
 * @access Public
 */
exports.logoutAdmin = async (req, res) => {
    try {
        const cookies = req.cookies;

        if (!cookies?._ka_a || cookies._ka_a !== "true") return res.sendStatus(204);

        if (!cookies?._rt_a) return res.sendStatus(204);

        res.clearCookie("_rt_a", {
            httpOnly: true,
            sameSite: "none",
            secure: true
        });

        res.clearCookie("_ka_a", {
            httpOnly: false,
            sameSite: "none",
            secure: true
        });

        return res.sendStatus(204);
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({ message: "Server error - Admin logout" });
    }
}
