import { Router } from "express";
import { createFinancialYearController, verifyMerchant, registerMerchant } from "../controllers/admin.js";

const router = Router();

router.post("/create-financial-year", createFinancialYearController);
router.get("/verify", verifyMerchant);
router.post("/register", registerMerchant)

export default router;