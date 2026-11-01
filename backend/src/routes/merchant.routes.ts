import { Router } from "express";
import {
  getMerchantProfile,
  updateMerchantSettings,
  regenerateApiKey,
  getMerchantPayments,
} from "../controllers/merchant.controller.js";
import { authenticateMerchantJwt } from "../middleware/auth.middleware.js";

const router = Router();

// All merchant routes require JWT authentication
router.use(authenticateMerchantJwt);

router.get("/profile", getMerchantProfile);
router.put("/settings", updateMerchantSettings);
router.post("/regenerate-api-key", regenerateApiKey);
router.get("/payments", getMerchantPayments);

export default router;
