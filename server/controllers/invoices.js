const Invoice = require("../models/invoices");

/**
 * @desc Get all invoices
 * @route GET /api/v1/admin/get-all-invoices
 * @access Private
 */
exports.getAllInvoices = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1; // Current page (default: 1)

        const limit = 10; // Items per page (default: 10)

        // Calculate skip value
        const skip = (page - 1) * limit;

        // Count total documents for pagination info
        const totalInvoices = await Invoice.countDocuments();

        // Fetch sessions with pagination
        const invoices = await Invoice.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        // Pagination metadata
        const totalPages = Math.ceil(totalInvoices / limit);

        res.status(200).json({
            invoices,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalInvoices,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ message: "Server error - Fetching Invoices" });
    }
}

/**
 * @desc Update a invoice status
 * @route PUT /api/v1/admin/edit-invoice-status/:id
 * @access Private
 */
exports.updateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const { status } = req.body;

        // Check if the id & status is provided in the request body
        if (!id || !status) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find the invoice by ID
        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Update only the status field
        invoice.status = status;

        // Save the updated ticket
        const updatedInvoice = await invoice.save();

        res.status(200).json({ message: "Invoice status updated successfully", invoice: updatedInvoice });
    } catch (error) {
        console.error("Error updating invoice status:", error);
        res.status(500).json({ message: "Server error - Updating Invoice status" });
    }
}

/**
 * @desc Delete a invoice
 * @route DELETE /api/v1/admin/delete-invoice/:id
 * @access Private
 */
exports.deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Invoice ID is required" });
        }

        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        await Invoice.findByIdAndDelete(id);
        res.status(200).json({ message: "Invoice deleted successfully" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ message: "Server error - Deleting Invoice" });
    }
}
