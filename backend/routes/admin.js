import { Router } from "express";
import { createFinancialYearController } from "../controllers/admin.js";

const router = Router();

router.post("/create-financial-year", createFinancialYearController);

export default router;