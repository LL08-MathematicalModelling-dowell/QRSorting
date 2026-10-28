import { Router } from "express";
import { getFeedbacksByDate, getQRCodeDetails, getProductFeedbacks, updateFeedbackStatus } from "../controllers/feedback.js";

const router = Router();
router.get("/get-feedbacks-by-date", getFeedbacksByDate);
router.get("/get-qr-code-details", getQRCodeDetails);
router.get("/get-product-feedbacks", getProductFeedbacks);
router.put("/update-feedback-status", updateFeedbackStatus);


export default router;