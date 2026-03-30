import express from "express";
import { protect, adminOnly } from "../../middleware/auth.js";
import {
  getAllUsers,
  blockOrUnblockUser,
} from "./userManagement.js";
import {
  getAdminStats,
  getSalesData,
  getRecentBuyers,
  getRecentOrders,
  getAdminBoostedProducts
} from "./analytics.js";
import {
  getVerificationRequests,
  approveVerification,
  rejectVerification,
  requestKycVerification
} from "./sellerVerification.js";
import {
  getPendingReports,
  resolveReport
} from "./reportManagement.js";
import { adminCategoryRouter } from "./categories.js";
import { adminSubCategoryRouter } from "./subcategories.js";
import {
  getAllSupportTickets,
  updateTicketStatus,
  deleteTicket
} from "./supportManagement.js";
import settingsRouter from "./settings.js";


const router = express.Router();

// Admin Dashboard Analytics
router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/sales-data", protect, adminOnly, getSalesData);
router.get("/recent-buyers", protect, adminOnly, getRecentBuyers);
router.get("/recent-orders", protect, adminOnly, getRecentOrders);
router.get("/boosted-products", protect, adminOnly, getAdminBoostedProducts);

// User Management
router.get("/users", protect, adminOnly, getAllUsers);
router.put("/block/:id", protect, adminOnly, blockOrUnblockUser);

// Seller Verification Management
router.get("/verifications", protect, adminOnly, getVerificationRequests);
router.put("/verifications/:id/approve", protect, adminOnly, approveVerification);
router.put("/verifications/:id/reject", protect, adminOnly, rejectVerification);
router.post("/verifications/request-kyc", protect, adminOnly, requestKycVerification);

// Report Management
router.get("/reports", protect, adminOnly, getPendingReports);
router.put("/reports/:id/resolve", protect, adminOnly, resolveReport);

// Support Ticket Management
router.get("/support", protect, adminOnly, getAllSupportTickets);
router.put("/support/:id", protect, adminOnly, updateTicketStatus);
router.delete("/support/:id", protect, adminOnly, deleteTicket);

// Categories (Admin)
router.use("/categories", protect, adminOnly, adminCategoryRouter);
router.use("/subcategories", protect, adminOnly, adminSubCategoryRouter);

// Settings (Logo, etc.)
router.use("/settings", settingsRouter);

export default router;
