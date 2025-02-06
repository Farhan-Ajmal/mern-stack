import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import productRoutes from "./routes/product.route.js";
import subscriptionRoutes from "./routes/subscription.route.js";
import authRouter from "./routes/auth.route.js";
import stripeCustomerRouter from "./routes/stripe.route.js";
import stripeWebhookRouter from "./routes/stripeWebhook.route.js";
import userData from "./models/userData.models.js";
// import Stripe from "stripe";

// Initialize the Stripe instance with your secret key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// const express = require("express");
// const cors = require("cors");

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "*", // Allow this specific origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Add headers you need
  })
);
// Webhook route
app.use("/api/stripe/webhook", stripeWebhookRouter);
app.use(express.json());
app.use("/api/products", productRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/users/login", userRoutes);
app.use("/api/auth", authRouter);
app.use("/api/stripe/customers", stripeCustomerRouter);

app.post("/api/user-data", async (req, res) => {
  const { userEmail } = req.body;

  try {
    const findUserData = await userData.findOne({ email: userEmail });
    if (!findUserData) {
      console.log("user data not found");
      res.status(404).json({ success: false, message: "user data not found" });
    }
    res.status(200).json({ success: true, data: findUserData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use("/subscribe", subscriptionRoutes);

// Middleware to parse JSON requests

app.listen(5001, () => {
  connectDB();

  console.log("Server started at http://localhost:5001");
});

// https://www.youtube.com/watch?v=O3BUHwfHf84&t=2359s
