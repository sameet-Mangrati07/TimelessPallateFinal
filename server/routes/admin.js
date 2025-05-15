const express = require("express");
const { loginAdmin, logoutAdmin } = require("../controllers/admin");
const { adminRefreshToken } = require("../utils/refreshTokenAdmin");
const { apiLimit } = require("../middlewares/rateLimit");

const router = express.Router();

router.post("/admin/login", apiLimit, loginAdmin);
router.post("/admin/logout", apiLimit, logoutAdmin);
router.post("/auth/refresh-token-admin", adminRefreshToken);

module.exports = router;
