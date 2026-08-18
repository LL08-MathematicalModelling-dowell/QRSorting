import { Router } from "express";
import { getFeedbacks, getQRCodeDetails } from "../controllers/feedback.js";

const router = Router();
router.get("/get-feedbacks", getFeedbacks);
router.get("/get-qr-code-details", getQRCodeDetails);


export default router;