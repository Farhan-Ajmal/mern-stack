import express from "express";
import { getRealtimeData } from "../controllers/stripeWebhook.controller.js";
import { testingDB } from "../controllers/testingDB.controller.js";

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), getRealtimeData);

// router.post("/",testingDB)

export default router;
