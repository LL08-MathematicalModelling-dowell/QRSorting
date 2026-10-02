import { Router } from "express";
import { getFeedbacksByDate, getQRCodeDetails, getProductFeedbacks } from "../controllers/feedback.js";

const router = Router();
router.get("/get-feedbacks-by-date", getFeedbacksByDate);
router.get("/get-qr-code-details", getQRCodeDetails);
router.get("/get-product-feedbacks", getProductFeedbacks);


export default router;