import { Router } from "express";
// import healtcheckRoutes from './health.js'
import merchant from './merchant.js'
import qr from './qr.js'

const router = Router()

// router.use("/healthcheck", healtcheckRoutes)
router.use("/merchant", merchant)
router.use("/qr", qr)

export default router