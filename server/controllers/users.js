const bcrypt = require("bcrypt");
const User = require("../models/users");

/**
 * @desc Register new user
 * @route POST /api/v1/users/register
 * @access Public
 */
exports.registerUser = async (req, res) => {
    try {
        // Extract the fields from the request body
        const { fullName, email, password } = req.body;

        const ipAddress = req.ip || req.connection.remoteAddress;

        // Check if all required fields are provided
        if (!fullName || !email || !password || !ipAddress) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the user with same ip address already exists in the database
        const existingUser = await User.findOne({ ipAddress });
        if (existingUser) {
            return res.status(429).json({ message: "Multiple accounts cannot be created from the same device" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        // Create a new user object
        const newUser = new User({
            fullName,
            email,
            password: hashPassword,
            ipAddress,
            plan: "free",
            billingCycle: "none",
            subscriptionStatus: "none",
            uploadLimit: 5,
            planStartDate: null,
            planEndDate: null,
            lastLogIn: null,
            role: "1128",
            status: "active",
        });

        // Save the new user to the database
        const savedUser = await newUser.save();

        // Respond with success
        res.status(201).json({ message: "Account created succesfully", user: savedUser });
    } catch (error) {
        console.error("Error registering new user:", error);
        res.status(500).json({ message: "Server error - Registering User" });
    }
}

/**
 * @desc Reset user password
 * @route PUT /api/v1/users/reset-password
 * @access Public
 */
exports.resetUserPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // Check if all required fields are provided
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Find the user by Email
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User with this email doesn't exist" });
        }

        // Check if the new password is different from the current password
        const isMatch = await bcrypt.compare(newPassword, existingUser.password);
        if (isMatch) {
            return res.status(400).json({ message: "New password cannot be the same as the current password" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        existingUser.password = hashedPassword;
        await existingUser.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Server error - Updating User Password" });
    }
}

/**
 * @desc Update user email and/or password (requires currentPassword for both)
 * @route PUT /api/v1/users/update-profile/:id
 * @access Private
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const { email, currentPassword, newPassword } = req.body;

        // Check for required fields
        if (!id || !email || !currentPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isUpdatingEmail = email && email !== user.email;

        const isUpdatingPassword = !!newPassword;

        // Validate current password before proceeding
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // If nothing is being updated, no need to proceed
        if (!isUpdatingEmail && !isUpdatingPassword) {
            return res.status(400).json({ message: "No changes detected" });
        }

        // Update password if it's being changed
        if (isUpdatingPassword) {
            const isSame = await bcrypt.compare(newPassword, user.password);
            if (isSame) {
                return res.status(400).json({ message: "New password must be different from current password" });
            }

            user.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await user.save();
        res.status(200).json({ message: "User updated successfully", user: updatedUser });

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error - Updating User" });
    }
}

/**
 * @desc Cancel active subscription
 * @route PUT /api/v1/users/cancel-subscription/:id
 * @access Private
 */
exports.cancelActiveSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user has a valid plan and billingCycle
        if (!user.plan || !user.billingCycle) {
            return res.status(400).json({ message: "User does not have an active subscription to cancel" });
        }

        if (user.subscriptionStatus === "cancelled") {
            return res.status(400).json({ message: "Subscription is already cancelled" });
        }

        // Update subscription status
        user.subscriptionStatus = "cancelled";
        await user.save();

        res.status(200).json({ message: "Subscription cancelled successfully", user });
    } catch (error) {
        console.error("Error cancelling subscription:", error);
        res.status(500).json({ message: "Server error - Cancelling Subscription" });
    }
}
