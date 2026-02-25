import { Router } from "express";
import { createFinancialYearController, verifyMerchant, registerMerchant, decryptPayloadController } from "../controllers/admin.js";

const router = Router();

router.post("/create-financial-year", createFinancialYearController);
router.get("/verify", verifyMerchant);
router.post("/register", registerMerchant)
router.post("/decrypt", decryptPayloadController)

export default router;