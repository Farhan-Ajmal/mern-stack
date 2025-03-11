import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  stripeId: { type: String, required: true }, // Unique identifier for each subscription
  subscription: {
    subscriptionId: { type: String, required: true }, // Unique identifier for each subscription

    cancel_at: { type: Date, default: null }, // Subscription status (e.g., active, canceled)

    cancel_at_period_end: { type: Boolean, required: true }, // Unique identifier for each subscription
    canceled_at: { type: Date, default: null }, // Unique identifier for each subscription
    created: { type: Date }, // Subscription status (e.g., active, canceled)
    current_period_end: { type: Date }, // Subscription status (e.g., active, canceled)
    current_period_start: { type: Date }, // Subscription status (e.g., active, canceled)
    ended_at: { type: Date, default: null }, // Subscription status (e.g., active, canceled)
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
