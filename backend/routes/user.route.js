import express from "express";
import { handleUserLogin, handleUserSignup } from "../controllers/user.controller.js";
const router = express.Router();

// router.post("/", handleUserSignup);
router.post("/", handleUserLogin);

export default router;
