import express from "express";
import { subscribeUser } from "../controllers/subscribeUser.controller.js";

const router = express.Router();

router.post("/", subscribeUser);

export default router;
