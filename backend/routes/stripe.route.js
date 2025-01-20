import express from "express";
import { getCustomers } from "../controllers/stripeCustomers.controllers.js";

const router = express.Router();

router.get("/", getCustomers);

export default router;
