import express from "express";
import {
  createOrder,
  getCurrentPlan,
  getPayment,
  getPlans,
  verifyPayment,
} from "../controllers/billing.controller.js";

const router = express.Router();

router.get("/plans", getPlans);
router.get("/current", getCurrentPlan);
router.post("/orders", createOrder);
router.post("/verify", verifyPayment);
router.get("/payments/:orderId", getPayment);

export default router;
