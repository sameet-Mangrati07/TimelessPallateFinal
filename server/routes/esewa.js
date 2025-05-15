const express = require("express");
const { generateEsewaSignature, verifyEsewaPayment } = require("../controllers/esewa");
const { apiLimit } = require("../middlewares/rateLimit");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

router.post("/users/payment/esewa/initiate/:id", apiLimit, verifyToken, generateEsewaSignature);
router.post("/users/payment/esewa/verify/:id", apiLimit, verifyToken, verifyEsewaPayment);

module.exports = router;
