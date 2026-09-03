import { Router } from "express";
import { getFeedbacksByDate, getQRCodeDetails } from "../controllers/feedback.js";

const router = Router();
router.get("/get-feedbacks-by-date", getFeedbacksByDate);
router.get("/get-qr-code-details", getQRCodeDetails);


export default router;