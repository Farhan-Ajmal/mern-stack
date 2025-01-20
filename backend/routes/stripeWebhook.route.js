import express from "express";
import { getRealtimeData } from "../controllers/stripeWebhook.controller.js";

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), getRealtimeData);

export default router;
