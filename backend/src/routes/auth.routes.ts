import { Router } from "express";
import { registerMerchant, loginMerchant } from "../controllers/merchant.controller.js";

const router = Router();

router.post("/register", registerMerchant);
router.post("/login", loginMerchant);

export default router;
