import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionId: { type: String, required: true }, // Unique identifier for each subscription
    // planId: { type: String, required: true }, // Plan ID or name
    // startDate: { type: Date, required: true }, // Subscription start date
    // endDate: { type: Date }, // Subscription end date (if applicable)
    cancel_at: { type: Date, default: null }, // Subscription status (e.g., active, canceled)

    cancel_at_period_end: { type: Boolean, required: true }, // Unique identifier for each subscription
    canceled_at: { type: Date, default: null }, // Unique identifier for each subscription
    created: { type: Date, required: true }, // Subscription status (e.g., active, canceled)
    current_period_end: { type: Date, required: true }, // Subscription status (e.g., active, canceled)
    current_period_start: { type: Date, required: true }, // Subscription status (e.g., active, canceled)
    ended_at: { type: Date, default: null }, // Subscription status (e.g., active, canceled)
  },
  { _id: false } // Prevent automatic creation of _id for nested subscription objects
);

const customerSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Use `userId` as the document ID
    email: { type: String, required: true },
    stripeId: { type: String, required: true },
    subscriptions: [subscriptionSchema], // Array of subscription objects
  },
  { timestamps: true } // Adds `createdAt` and `updatedAt` fields
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
