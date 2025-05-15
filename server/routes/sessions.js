const express = require("express");
const { getAllSessions, updateSessionStatus, deleteSession } = require("../controllers/sessions");
const { verifyTokenAdmin } = require("../middlewares/authAdmin");

const router = express.Router();

router.get("/admin/get-all-sessions", verifyTokenAdmin, getAllSessions);
router.put("/admin/edit-session-status/:id", verifyTokenAdmin, updateSessionStatus);
router.delete("/admin/delete-session/:id", verifyTokenAdmin, deleteSession);

module.exports = router;
