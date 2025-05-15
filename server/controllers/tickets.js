const Ticket = require("../models/tickets");

/**
 * @desc Create a new ticket
 * @route POST /api/v1/users/create-ticket
 * @access Public
 */
exports.createTicket = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newTicket = new Ticket({ name, email, message });

        const savedTicket = await newTicket.save();

        res.status(201).json({ message: "Message submitted successfully", ticket: savedTicket });
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ message: "Server error - Creating Ticket" });
    }
}

/**
 * @desc Get all tickets
 * @route GET /api/v1/admin/get-all-tickets
 * @access Private
 */
exports.getAllTickets = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1; // Current page (default: 1)

        const limit = 10; // Items per page (default: 10)

        // Calculate skip value
        const skip = (page - 1) * limit;

        // Count total documents for pagination info
        const totalTickets = await Ticket.countDocuments();

        // Fetch tickets with pagination
        const tickets = await Ticket.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        // Pagination metadata
        const totalPages = Math.ceil(totalTickets / limit);

        res.status(200).json({
            tickets,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalTickets,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ message: "Server error - Fetching Tickets" });
    }
}

/**
 * @desc Update a ticket status
 * @route PUT /api/v1/admin/edit-ticket-status/:id
 * @access Private
 */
exports.updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const { status } = req.body;

        // Check if the status is provided in the request body
        if (!id || !status) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find the ticket by ID
        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Update only the status field
        ticket.status = status;

        // Save the updated ticket
        const updatedTicket = await ticket.save();

        res.status(200).json({ message: "Ticket status updated successfully", ticket: updatedTicket });
    } catch (error) {
        console.error("Error updating ticket status:", error);
        res.status(500).json({ message: "Server error - Updating Ticket status" });
    }
}

/**
 * @desc Delete a ticket
 * @route DELETE /api/v1/admin/delete-ticket/:id
 * @access Private
 */
exports.deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Ticket ID is required" });
        }

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        await Ticket.findByIdAndDelete(id);
        res.status(200).json({ message: "Ticket deleted successfully" });
    } catch (error) {
        console.error("Error deleting ticket:", error);
        res.status(500).json({ message: "Server error - Deleting Ticket" });
    }
}
