import express from "express";
import User from "../../models/User.js";
import SupportTicket from "../../models/SupportTicket.js";
import { protect, optionalAuth } from "../../middleware/auth.js";
import { createNotification } from "../../services/notificationService.js";

const router = express.Router();

// @route   POST /api/support
// @desc    Create a support ticket
// @access  Public (or Protected)
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { email, subject, message, phoneNumber } = req.body;

    if (!email || !subject || !message) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const ticket = await SupportTicket.create({
      user: req.user ? req.user._id : null,
      email: req.user ? req.user.email : email,
      subject,
      message,
      phoneNumber
    });

    // Notify Admins about new support ticket
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        type: "new_support_ticket",
        title: "New Support Ticket",
        message: `New support request from ${ticket.email}: ${subject}`,
        link: "/admin?page=support"
      }).catch(err => console.error("Admin notification error:", err));
    }

    res.status(201).json({ message: "Ticket created successfully", ticket });
  } catch (err) {
    console.error("Support ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/support/my-tickets
// @desc    Get all support tickets created by the logged-in user
// @access  Private
router.get("/my-tickets", protect, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching my tickets:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
