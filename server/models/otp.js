const mongoose = require("../configs/db");

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    type: { type: String, required: true, enum: ["register", "password-reset", "ip-reset"] },
    expiry: { type: Date, required: true },
    link: { type: String }
});

const Otp = mongoose.model("Otp", otpSchema, "otp");

module.exports = Otp;
