const mongoose = require("../configs/db");

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    refreshToken: { type: String, unique: true, required: true },
    ip: { type: String, unique: true, required: true },
    userAgent: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    status: { type: String, required: true, default: "active", enum: ["active", "inactive", "expired"] },
}, {
    timestamps: true
});

const Session = mongoose.model("Sessions", sessionSchema, "sessions");

module.exports = Session;
