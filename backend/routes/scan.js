import { Router } from "express";
import { createScan, getScans } from "../controllers/scan.js";

const router = Router();

router.post("/create-scan", createScan);
router.get("/get-scans", getScans); // Get scans for a specific date

export default router;