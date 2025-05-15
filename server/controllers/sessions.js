const Session = require("../models/sessions");

/**
 * @desc Get all sessions
 * @route GET /api/v1/admin/get-all-sessions
 * @access Private
 */
exports.getAllSessions = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1; // Current page (default: 1)

        const limit = 10; // Items per page (default: 10)

        // Calculate skip value
        const skip = (page - 1) * limit;

        // Count total documents for pagination info
        const totalSessions = await Session.countDocuments();

        // Fetch sessions with pagination
        const sessions = await Session.find().sort({ createdAt: -1 }).populate("userId", "fullName email").skip(skip).limit(limit);

        // Pagination metadata
        const totalPages = Math.ceil(totalSessions / limit);

        res.status(200).json({
            sessions,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalSessions,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: "Server error - Fetching Sessions" });
    }
}

/**
 * @desc Update a session status
 * @route PUT /api/v1/admin/edit-session-status/:id
 * @access Private
 */
exports.updateSessionStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const { status } = req.body;

        // Check if the id & status is provided in the request body
        if (!id || !status) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find the session by ID
        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Update only the status field
        session.status = status;

        // Save the updated ticket
        const updatedSession = await session.save();

        res.status(200).json({ message: "Session status updated successfully", session: updatedSession });
    } catch (error) {
        console.error("Error updating session status:", error);
        res.status(500).json({ message: "Server error - Updating Session status" });
    }
}

/**
 * @desc Delete a session
 * @route DELETE /api/v1/admin/delete-session/:id
 * @access Private
 */
exports.deleteSession = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        const session = await Session.findById(id);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        await Session.findByIdAndDelete(id);
        res.status(200).json({ message: "Session deleted successfully" });
    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({ message: "Server error - Deleting Session" });
    }
}
