import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheckService = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json({ 
            success: true,
            message: "Application setup completed successfully. Services are now available." 
        });
});

export { 
    healthCheckService 
}
