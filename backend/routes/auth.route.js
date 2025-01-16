import express from "express";
import { login } from "../controllers/login.controller.js";
import { signup } from "../controllers/signup.controller.js";
import validation from "../middlewares/authValidation.middleware.js";

const router = express.Router();

router.post("/login", validation.loginValidation, login);
router.post("/signup", validation.signupValidation, signup);

export default router;
