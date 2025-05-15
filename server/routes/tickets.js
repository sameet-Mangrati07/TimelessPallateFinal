const express = require("express");
const { createTicket, getAllTickets, updateTicketStatus, deleteTicket } = require("../controllers/tickets");
const { apiLimit } = require("../middlewares/rateLimit");
const { verifyTokenAdmin } = require("../middlewares/authAdmin");

const router = express.Router();

router.post("/users/create-ticket", apiLimit, createTicket);

router.get("/admin/get-all-tickets", verifyTokenAdmin, getAllTickets);
router.put("/admin/edit-ticket-status/:id", verifyTokenAdmin, updateTicketStatus);
router.delete("/admin/delete-ticket/:id", verifyTokenAdmin, deleteTicket);

module.exports = router;
