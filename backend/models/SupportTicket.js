import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false // Allow guests? For now, let's say required or optional if we capture email
    },
    email: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting", "closed"],
      default: "open"
    },
    adminComment: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
export default SupportTicket;
