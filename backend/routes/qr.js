import { Router } from "express";
import { generateQRCode, generateCustomQR } from "../controllers/qrCode.js";
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.post("/create-qr-code", generateQRCode);
router.post("/create-custom-qr", upload.single('logo'), generateCustomQR);

export default router;