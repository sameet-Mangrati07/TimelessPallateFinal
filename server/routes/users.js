const express = require("express");
const { registerUser, resetUserPassword, updateUserProfile, cancelActiveSubscription } = require("../controllers/users");
const { apiLimit } = require("../middlewares/rateLimit");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

router.post("/users/register", apiLimit, registerUser);
router.put("/users/reset-password", apiLimit, resetUserPassword);
router.put("/users/update-profile/:id", apiLimit, verifyToken, updateUserProfile);
router.put("/users/cancel-subscription/:id", apiLimit, verifyToken, cancelActiveSubscription);

module.exports = router;
