import mongoose from "mongoose";

const userDataSchema = mongoose.Schema({
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
});

const userData = mongoose.model("user-data", userDataSchema);

export default userData;
