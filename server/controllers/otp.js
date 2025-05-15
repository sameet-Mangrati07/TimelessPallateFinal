const OTP = require("../models/otp");
const crypto = require("crypto");
const User = require("../models/users");
const { scheduleOtpDeletion } = require("../scripts/scheduleOTPDeletion");
const { transporter } = require("../scripts/nodemailerTransporter");
const path = require("path");

// OTP expiry time (e.g., 5 minutes)
const OTP_EXPIRY_TIME = 5 * 60 * 1000;

// Generate a random 6-digit OTP
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// Generate a random string link for ip reset
const generateRandomLink = () => {
    const randomString = crypto.randomBytes(20).toString("hex");
    const baseUrl = "http://localhost:5173"
    return `${baseUrl}/login/${randomString}`;
}

/**
 * @desc Send OTP to email for registration or password reset
 * @route POST /api/v1/otp/send
 * @access Public
 */
exports.sendOtp = async (req, res) => {
    try {
        const { email, type } = req.body;

        // Ensure email and type are provided
        if (!email) return res.status(400).json({ message: "Email required" });

        if (!type || !["register", "password-reset"].includes(type)) {
            return res.status(400).json({ message: "Invalid type" });
        }

        const otp = generateOtp();

        const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);

        // Handle registration and password reset differently
        if (type === "register") {
            // For registration, ensure the email isn't already registered
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: "User with this email already exists" });
            }
        } else if (type === "password-reset") {
            // For password reset, ensure the email exists in the system
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                return res.status(400).json({ message: "User with this email doesn't exist" });
            }
        }

        // Save OTP to database (remove existing OTP for this email)
        const otpExists = await OTP.findOneAndUpdate(
            { email, type },
            { otp, type, expiry, link: "" },
            { upsert: true, new: true }
        );

        scheduleOtpDeletion(otpExists);

        // Define the HTML content
        const htmlContent = `
         <div style="background-color: #F6F6F6; font-family: Helvetica, sans-serif; text-align: left; padding: 20px; border: 1px solid #ddd; max-height: 100vh; max-width: 100vw; margin: auto; border-radius: 10px">
             <div style="margin-bottom: 14px; display: flex;">
                <img src="cid:logo" alt="logo" style="width: 50px; height: 50px;">
                <h1 style="font-size: 20px; margin-left: 14px;">Sajilo AI</h1>
             </div>
             <div style="background-color: #FFFFFF; text-align: left; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto; border-radius: 10px">
                <p style="font-size: 16px;">Your one-time verification code:</p>
                <h3 style="font-size: 24px; text-align: center; color: #000; font-weight: bold;">${otp}</h3>
                <p style="font-size: 16px; text-color: black;">This code expires after 5 minutes. If you did not request this, please ignore this message.</p>
             </div>
             <footer style="margin-top: 20px; text-align:center; font-size: 12px; color: #888;">This message was sent from Sajilo AI, 44600 Kathmandu, NP.</footer>
         </div>
     `;

        // Send OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP Code",
            html: htmlContent,
            attachments: [{
                filename: "logo.png",
                path: path.join(__dirname, "logo.png"),
                cid: "logo"
            }]
        });

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error("Error sending otp:", error);
        res.status(500).json({ message: "Server error - Sending OTP" });
    }
}

/**
 * @desc Verify OTP
 * @route POST /api/v1/otp/verify
 * @access Public
 */
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp, type } = req.body;

        if (!email || !otp || !type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!["register", "password-reset"].includes(type)) {
            return res.status(400).json({ message: "Invalid type" });
        }

        const otpRecord = await OTP.findOne({ email, type });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Check if OTP is expired
        if (otpRecord.expiry < new Date()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Validate OTP
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // OTP is valid, delete it from DB after successful verification
        await OTP.deleteOne({ email, type });

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error verifying otp:", error);
        res.status(500).json({ message: "Server error - OTP verification" });
    }
}

/**
 * @desc Send OTP to email for ip reset
 * @route POST /api/v1/admin/otp/send/ip-reset
 * @access Private
 */
exports.sendIPResetMail = async (req, res) => {
    try {
        const { email, type } = req.body;

        // Ensure email and type are provided
        if (!email || !type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });

        if (!userExists) return res.status(401).json({ message: "User not found" });

        if (!type || type !== "ip-reset") {
            return res.status(400).json({ message: "Invalid type" });
        }

        const otp = generateOtp();

        let randomLink;

        if (type === "ip-reset") {
            randomLink = generateRandomLink();
        }

        const expiry = new Date(Date.now() + OTP_EXPIRY_TIME);

        if (type === "ip-reset") {
            // For IP reset, ensure the email exists in the system
            const existingUser = await User.findOne({ email });
            if (!existingUser) {
                return res.status(400).json({ message: "User with this email doesn't exist" });
            }
        }

        // Save OTP to database (remove existing OTP for this email)
        const otpExists = await OTP.findOneAndUpdate(
            { email, type },
            { otp, type, expiry, link: randomLink },
            { upsert: true, new: true }
        );

        scheduleOtpDeletion(otpExists);

        const htmlContentIpReset = `
        <div style="background-color: #F6F6F6; font-family: Helvetica, sans-serif; text-align: left; padding: 20px; border: 1px solid #ddd; max-height: 100vh; max-width: 100vw; margin: auto; border-radius: 10px">
            <div style="margin-bottom: 14px; display: flex;">
                <img src="cid:logo" alt="logo" style="width: 50px; height: 50px;">
                <h1 style="font-size: 20px; margin-left: 14px;">Sajilo AI</h1>
            </div>
            <div style="background-color: #FFFFFF; text-align: left; padding: 20px; border: 1px solid #ddd; max-width: 600px; margin: auto; border-radius: 10px">
                <p style="font-size: 16px;">Please log in using the following link and enter the OTP provided below:</p>
                <a href="${randomLink}" target="_blank" rel="noopener noreferrer" style="text: blue; text-decoration: underline;">${randomLink}</a>
                <p style="font-size: 16px;">Your OTP code:</p>
                <h3 style="font-size: 24px; text-align: center; color: #000; font-weight: bold;">${otp}</h3>
                <p style="font-size: 16px; text-color: black;">This code and link expires after 5 minutes. If you did not request this, please ignore this message.</p>
            </div>
            <footer style="margin-top: 20px; text-align:center; font-size: 12px; color: #888;">This message was sent from Sajilo AI, 44600 Kathmandu, NP.</footer>
        </div>
    `;

        // Send OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP Code",
            html: htmlContentIpReset,
            attachments: [{
                filename: "logo.png",
                path: path.join(__dirname, "logo.png"),
                cid: "logo"
            }]
        });

        res.status(200).json({ message: `Mail sent to user ${email}` });
    } catch (error) {
        console.error("Error sending reset ip mail:", error);
        res.status(500).json({ message: "Server error - Sending Reset IP Mail" });
    }
}

/**
 * @desc Verify OTP link
 * @route POST /api/v1/otp/verify/link
 * @access Public
 */
exports.verifyIpResetLink = async (req, res) => {
    try {
        const { type, link } = req.body;

        // Ensure email, type, and link are provided
        if (!type || !link) {
            return res.status(400).json({ valid: false, message: "All fields are required" });
        }

        // Check if the type is valid
        if (type !== "ip-reset") {
            return res.status(400).json({ valid: false, message: "Invalid type" });
        }

        // Check if the link exists in the database and is valid
        const otpRecord = await OTP.findOne({ type, link });

        if (!otpRecord) {
            return res.status(400).json({ valid: false, message: "Invalid or expired link" });
        }

        // Check if the link has expired
        if (otpRecord.expiry < Date.now()) {
            return res.status(400).json({ valid: false, message: "The link has expired" });
        }

        // Link is valid, process further (e.g., allow user to reset their IP)
        res.status(200).json({ valid: true });
    } catch (error) {
        console.error("Error verifying link:", error);
        res.status(500).json({ message: "Server error - Verifying link" });
    }
}
