import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
  },
  isPro: {
    type: Boolean,
  },
  priceId: {
    type: String,
  },
});

const User = mongoose.model("users", userSchema);

export default User;
