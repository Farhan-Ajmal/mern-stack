import mongoose, { Schema } from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true },
    stripeId: { type: String, required: true },
    subscriptions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subscription",
      },
    ], // Now properly referencing Subscription documents
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
