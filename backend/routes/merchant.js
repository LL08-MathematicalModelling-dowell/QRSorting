import { Router } from "express";
import { createOrder, getOrderDetails, updateOrderDetails, uploadFile} from "../controllers/merchant.js";

const router = Router();

router.post("/create-order", createOrder);
router.get("/get-order", getOrderDetails);
router.put("/update-order", updateOrderDetails);
router.post("/upload", uploadFile)

export default router;