const mongoose = require("../configs/db");

const ticketSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, required: true, default: "open", enum: ["open", "in-progress", "closed"] },
}, {
    timestamps: true
});

const Ticket = mongoose.model("Tickets", ticketSchema, "tickets");

module.exports = Ticket;
