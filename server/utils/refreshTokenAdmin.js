const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * @desc Refresh access token admin
 * @route POST /api/v1/auth/refresh-token-admin
 * @access Public
 */
exports.adminRefreshToken = async (req, res) => {
    try {
        const cookies = req.cookies;

        const clearAuthCookiesAdmin = (res) => {
            res.clearCookie("_ka_a", {
                httpOnly: false,
                sameSite: "none",
                secure: true
            });
            res.clearCookie("_ka_a", {
                httpOnly: false,
                sameSite: "none",
                secure: true
            });
        };

        const isAdminKeepAliveInvalid = !cookies?._ka_a || cookies._ka_a !== "true";

        const isAdminRefreshTokenMissing = !cookies?._rt_a;

        if (isAdminKeepAliveInvalid || isAdminRefreshTokenMissing) {
            clearAuthCookiesAdmin(res);
            return res.status(401).json({ message: "Authentication cookies are missing or invalid. Please log in" });
        }

        // Continue with refresh token verification only if both cookies are valid
        const refreshToken = cookies._rt_a;

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                clearAuthCookiesAdmin(res);
                return res.status(403).json({ message: "Invalid refresh token" });
            }

            // Verify if the admin exists in the database
            const adminExists = await Admin.findById(decoded.adminId).lean().select("-password -key");
            if (!adminExists) {
                clearAuthCookiesAdmin(res);
                return res.status(404).json({ message: "Admin not found" });
            }

            if (adminExists.status !== "active") {
                clearAuthCookiesAdmin(res);
                return res.status(403).json({ message: "Your account is inactive. Please contact support" });
            }

            // Check if IP matches
            const ip = req.ip || req.connection.remoteAddress;
            if (adminExists.ipAddress !== ip) {
                clearAuthCookiesAdmin(res);
                return res.status(403).json({ message: "IP address mismatch. Unauthorized access" });
            }

            // Generate new access token
            const accessToken = jwt.sign({
                adminId: adminExists._id,
                email: adminExists.email,
                role: adminExists.role
            }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

            res.status(200).json({ accessToken });
        });
    } catch (error) {
        console.error("Error refreshing token:", error);
        res.status(500).json({ message: "Server error - Admin Refreshing token" });
    }
}
