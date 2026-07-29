import { Router } from "express";
import { getFeedbacks } from "../controllers/feedback.js";

const router = Router();
router.get("/get-feedbacks", getFeedbacks);

export default router;