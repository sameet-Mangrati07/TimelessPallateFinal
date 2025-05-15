const express = require("express");
const { loginUser, logoutUser } = require("../controllers/auth");
const { refreshToken } = require("../utils/refreshToken");
const { apiLimit } = require("../middlewares/rateLimit");

const router = express.Router();

router.post("/users/login", apiLimit, loginUser);
router.post("/users/logout", apiLimit, logoutUser);
router.post("/auth/refresh-token", refreshToken);

module.exports = router;
