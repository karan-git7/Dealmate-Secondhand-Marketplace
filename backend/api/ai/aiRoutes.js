import express from "express";
import multer from "multer";
import { analyzeProductImage, analyzeSellerSentiment, chatbotAssistant } from "./aiController.js";
import { protect, optionalAuth } from "../../middleware/auth.js";

const router = express.Router();
const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/analyze", protect, memUpload.array("images", 10), analyzeProductImage);
router.get("/sentiment/seller/:sellerId", protect, analyzeSellerSentiment);
router.post("/chatbot", optionalAuth, chatbotAssistant);

export default router;
