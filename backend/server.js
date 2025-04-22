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
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import Subscription from "./models/subscription.models.js";
import Invoice from "./models/invoice.models.js";
import Customer from "./models/customer.models.js";
import Stripe from "stripe";
// import Stripe from "stripe";

// Initialize the Stripe instance with your secret key
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(
  "sk_test_51QkKNSFRpxCUo2PABo52EiZ1cCFV3wl5JZLRqnbqfGJOrfMi4KZ21ijcQpWbrsxM3aKSwxHOz3elWWMRVjijsMdb00IUrffgj2"
);
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
app.use(cookieParser()); // This enables req.cookies
app.use("/api/products", productRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/users/login", userRoutes);
app.use("/api/auth", authRouter);
app.use("/api/stripe/customers", stripeCustomerRouter);

app.post("/api/refresh", (req, res) => {
  const refreshToken = req.cookies["refreshToken"];
  if (!refreshToken) {
    return res.status(401).send("Access Denied. No refresh token provided.");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const accessToken = jwt.sign(
      { email: decoded.email, _id: decoded._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1m",
      }
    );
    res.status(200).json({ success: true, accessToken: accessToken });
    res.header("Authorization", accessToken).send(decoded.user);
  } catch (error) {
    return res
      .status(400)
      .json({ message: `${error.name}:: ${error.message}` });
  }
});

app.post("/api/user-data", async (req, res) => {
  const { userEmail, creditsToDeduct } = req.body;

  try {
    const findUserData = await userData.findOne({ email: userEmail });
    var endPeriodSeconds = findUserData.period.end.getTime() / 1000;
    const currentDate = new Date();
    const currentDateSeconds = Math.round(currentDate.getTime() / 1000);

    if (!findUserData) {
      console.log("user data not found");
      res.status(404).json({ success: false, message: "user data not found" });
    }
    let newCredits;
    if (findUserData.credits > 0 && currentDateSeconds < endPeriodSeconds) {
      newCredits = findUserData.credits - creditsToDeduct;
    } else {
      newCredits = 0;
    }
    await userData.updateOne({ email: userEmail }, { credits: newCredits });
    const plainUserData = findUserData.toObject();
    const newUserData = { ...plainUserData, credits: newCredits };
    res.status(200).json({ success: true, data: newUserData });
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

app.post("/api/fetchUserData", async (req, res) => {
  // Fetch Customer with populated subscriptions and invoices
  try {
    const customerData = await Customer.findOne({
      stripeId: "cus_S68JH5XksfeBhS",
    }).populate({
      path: "subscription", // populate blogs
      populate: {
        path: "invoice", // in blogs, populate comments
      },
    });

    const findSubscriptions = await stripe.subscriptions.list({
      customer: "cus_S68JH5XksfeBhS",
    });
    const subscriptionIds = findSubscriptions.data.map((subscription) => {
      return subscription.id;
    });
    // const
    console.log("subscriptionIds", subscriptionIds);
    return;
    const subscriptionData = findSubscriptions.subscriptions;

    subscriptionData.map(async (subscription, index) => {
      console.log("subscr", subscription.subscriptionId);
      await stripe.subscriptions.update(subscription.subscriptionId, {
        cancel_at_period_end: true,
      });
    });

    // Set your secret key. Remember to switch to your live secret key in production.
    // See your keys here: https://dashboard.stripe.com/apikeys

    const subscription = await stripe.subscriptions.update(
      "{{SUBSCRIPTION_ID}}",
      {
        cancel_at_period_end: true,
      }
    );

    const execStats = await Customer.findOne({
      email: "example8@mailinator.com",
    })
      .populate({
        path: "subscription", // populate blogs
        populate: {
          path: "invoice", // in blogs, populate comments
        },
      })
      .explain("executionStats");
    // console.log("execStats", execStats);
    // console.log(JSON.stringify(customerData, null, 2));
    return res.json(customerData);
  } catch (error) {
    console.log("error in fetchUserData", error);
  }

  // res.json(customerData);
});
// app.post("/api/fetchUserData", async () => {
//   const fetchSubData = await Subscription.find({
//     user: "firebase_user_123",
//   }).populate("user");
//   console.log("fetchSubData------>", fetchSubData);
// });
