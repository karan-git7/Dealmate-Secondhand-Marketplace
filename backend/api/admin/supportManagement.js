import SupportTicket from "../../models/SupportTicket.js";
import { createNotification } from "../../services/notificationService.js";

// @desc    Get all support tickets
// @route   GET /api/admin/support
// @access  Private/Admin
export const getAllSupportTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({})
            .sort({ createdAt: -1 })
            .populate("user", "name email");
        res.json(tickets);
    } catch (err) {
        console.error("Fetch support tickets error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update support ticket status
// @route   PUT /api/admin/support/:id
// @access  Private/Admin
export const updateTicketStatus = async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        ticket.status = status || ticket.status;
        ticket.adminComment = adminComment || ticket.adminComment;
        const updatedTicket = await ticket.save();

        // Notify the user about status change
        if (updatedTicket.user) {
            const statusLabel = status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1);
            await createNotification({
                userId: updatedTicket.user,
                type: "support_update",
                title: `Support Ticket: ${statusLabel}`,
                message: `Your support ticket regarding "${updatedTicket.subject}" is now ${statusLabel.toLowerCase()}.${updatedTicket.adminComment ? ` Admin reply: ${updatedTicket.adminComment}` : ''}`,
                link: "/support"
            }).catch(err => console.error("Failed to notify user for support update:", err));
        }

        res.json(updatedTicket);
    } catch (err) {
        console.error("Update ticket error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Delete support ticket
// @route   DELETE /api/admin/support/:id
// @access  Private/Admin
export const deleteTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        res.json({ message: "Ticket deleted successfully" });
    } catch (err) {
        console.error("Delete ticket error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
