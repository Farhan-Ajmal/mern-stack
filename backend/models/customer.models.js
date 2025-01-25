import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoice_id: { type: String, required: true }, // Unique identifier for each invoice
  amount_due: { type: Number, required: true },
  amount_paid: { type: Number, required: true },
  currency: { type: String, required: true },
  customer: { type: String, required: true },
  period: {
    end: { type: Date, default: null },
    start: { type: Date, default: null },
  },
  subscription: { type: String, required: true },
});

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionId: { type: String, required: true }, // Unique identifier for each subscription

    cancel_at: { type: Date, default: null }, // Subscription status (e.g., active, canceled)

    cancel_at_period_end: { type: Boolean, required: true }, // Unique identifier for each subscription
    canceled_at: { type: Date, default: null }, // Unique identifier for each subscription
    created: { type: Date }, // Subscription status (e.g., active, canceled)
    current_period_end: { type: Date }, // Subscription status (e.g., active, canceled)
    current_period_start: { type: Date }, // Subscription status (e.g., active, canceled)
    ended_at: { type: Date, default: null }, // Subscription status (e.g., active, canceled)

    invoice: [invoiceSchema],
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
