import mongoose from "mongoose";

const userDataSchema = mongoose.Schema({
  customer: { type: String },
  email: { type: String },
  credits: {
    type: Number,
  },
  isPro: {
    type: String,
  },
  priceId: {
    type: String,
  },
  period: {
    end: { type: Date, default: null },
    start: { type: Date, default: null },
  },
});

const userData = mongoose.model("user-data", userDataSchema);

export default userData;
