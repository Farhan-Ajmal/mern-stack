import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Use `userId` as the document ID

    email: { type: String, required: true, index: true },
    stripeId: { type: String, required: true },
    subscription: { type: String, ref: "Subscription", required: true },
  },
  { timestamps: true } // Adds `createdAt` and `updatedAt` fields
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
