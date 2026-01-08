import { Router } from "express";
// import healtcheckRoutes from './health.js'
import merchant from './merchant.js'

const router = Router()

// router.use("/healthcheck", healtcheckRoutes)
router.use("/merchant", merchant)

export default router