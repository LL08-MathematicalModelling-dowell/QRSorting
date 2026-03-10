import { Router } from "express";
import { createOrder, getOrderDetails, updateOrderDetails, uploadFile } from "../controllers/merchant.js";
import multer from 'multer';
const router = Router();
const upload = multer({ dest: 'uploads/' })
router.post("/create-order", createOrder);
router.get("/get-order", getOrderDetails);
router.put("/update-order", updateOrderDetails);
router.post("/upload", upload.single('file'), uploadFile)

export default router;