const mongoose = require("../configs/db");

const adminSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    key: { type: Number, unique: true, required: true },
    ipAddress: { type: String, unique: true, required: true },
    role: { type: String, required: true, default: "4202", enum: ["1128", "4202"] }, // 1128 - USER, 4202 - ADMIN
    status: { type: String, required: true, default: "active", enum: ["active", "inactive"] }
}, {
    timestamps: true
});

const Admin = mongoose.model("Admin", adminSchema, "admin");

module.exports = Admin;
