import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    _id: String, // or whatever your ID is (e.g., Firebase UID)
    email: String,
    stripeId: String,
  },
  { timestamps: true }
);

CustomerSchema.virtual("subscriptions", {
  ref: "Subscription",
  localField: "_id",
  foreignField: "customers", // this is the field in Subscription that refers to customer
});

CustomerSchema.virtual("invoices", {
  ref: "Invoice",
  localField: "_id",
  foreignField: "customers", // again, referencing the same field in Invoice
});

CustomerSchema.set("toObject", { virtuals: true });
CustomerSchema.set("toJSON", { virtuals: true });

const Customer = mongoose.model("Customer", CustomerSchema);

export default Customer;
