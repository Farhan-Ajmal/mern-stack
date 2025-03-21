import mongoose, { Schema } from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Use `userId` as the document ID
    email: { type: String, required: true },
    stripeId: { type: String, required: true },
    // subscriptions: [{ type: Schema.Types.ObjectId, ref: "Subscription" }], // Array of subscription objects
  },
  { timestamps: true } // Adds `createdAt` and `updatedAt` fields
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
