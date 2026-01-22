import { Router } from "express";
import { createScan, getScansForDate } from "../controllers/scan.js";

const router = Router();

router.post("/create-scan", createScan);
router.get("/get-scans", getScansForDate); // Get scans for a specific date

export default router;