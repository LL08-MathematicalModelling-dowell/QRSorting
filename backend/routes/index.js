import { Router } from "express";
// import healtcheckRoutes from './health.js'
import merchant from './merchant.js'
import qr from './qr.js'
import admin from './admin.js'
import scan from './scan.js'
import feedback from './feedback.js'

const router = Router()

// router.use("/healthcheck", healtcheckRoutes)
router.use("/merchant", merchant)
router.use("/qr", qr)
router.use("/admin", admin)
router.use("/scan", scan)
router.use("/feedback", feedback)

export default router