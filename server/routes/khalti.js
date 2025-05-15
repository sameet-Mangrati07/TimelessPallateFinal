const express = require("express");
const { initiateKhaltiPayment, verifyKhaltiPayment } = require("../controllers/khalti");
const { apiLimit } = require("../middlewares/rateLimit");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

router.post("/users/payment/khalti/initiate/:id", apiLimit, verifyToken, initiateKhaltiPayment);
router.post("/users/payment/khalti/verify/:id", apiLimit, verifyToken, verifyKhaltiPayment);

module.exports = router;
