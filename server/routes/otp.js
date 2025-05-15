const express = require("express");
const { sendOtp, verifyOtp, sendIPResetMail, verifyIpResetLink } = require("../controllers/otp")
const { apiLimit } = require("../middlewares/rateLimit");
const { verifyTokenAdmin } = require("../middlewares/authAdmin");

const router = express.Router();

router.post("/otp/send", apiLimit, sendOtp);
router.post("/otp/verify", apiLimit, verifyOtp);

router.post("/admin/otp/send/ip-reset", verifyTokenAdmin, sendIPResetMail);
router.post("/otp/verify/link", verifyIpResetLink);

module.exports = router;
