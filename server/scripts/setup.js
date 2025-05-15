const Admin = require("../models/admin");
const bcrypt = require("bcrypt");

exports.createAdmin = async () => {
    try {
        const existing = await Admin.findOne({ email: "sameet@admin.com" });
        if (existing) {
            console.log("Admin already exists");
        } else {
            const hashedPassword = await bcrypt.hash("sameet@111", 10);
            const newAdmin = new Admin({
                email: "sameet@admin.com",
                password: hashedPassword,
                key: 11223344,
                ipAddress: "::1",
                role: "4202",
                status: "active"
            });

            await newAdmin.save();
            console.log("Admin created successfully");
        }
    } catch (e) {
        console.error("Error creating admin:", e.message);
    }
}
