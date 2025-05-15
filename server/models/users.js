const mongoose = require("../configs/db");

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    ipAddress: { type: String, unique: true, required: true },
    plan: { type: String, required: true, default: "free", enum: ["free", "regular", "pro"] },
    billingCycle: { type: String, required: true, default: "none", enum: ["none", "monthly", "yearly"] },
    subscriptionStatus: { type: String, default: "none", enum: ["none", "active", "cancelled", "expired"] },
    uploadLimit: { type: Number, required: true, default: 5, enum: [5, 50, 100] },
    planStartDate: { type: Date, default: null },
    planEndDate: { type: Date, default: null },
    lastLogIn: { type: Date, default: null },
    role: { type: String, required: true, default: "1128", enum: ["1128", "4202"] }, // 1128 - USER, 4202 - ADMIN
    status: { type: String, required: true, default: "active", enum: ["active", "inactive"] }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
