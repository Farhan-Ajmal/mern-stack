import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import productRoutes from "./routes/product.route.js";
import authRouter from "./routes/auth.route.js";

// const express = require("express");
// const cors = require("cors");

dotenv.config();

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: "*", // Allow this specific origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Add headers you need
  })
);

app.use("/api/products", productRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/users/login", userRoutes);
app.use("/api/auth", authRouter);
app.listen(5000, () => {
  connectDB();
  console.log("Server started at http://localhost:5000");
});

// https://www.youtube.com/watch?v=O3BUHwfHf84&t=2359s
