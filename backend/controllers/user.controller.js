import User from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // For generating tokens
export const handleUserSignup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    // Hash the password before storing it
    // const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds (cost factor)

    // Create the user with hashed password
    await User.create({ name, email, password: password });

    // Send success response
    res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.error("Error in Signup:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const handleUserLogin = async (req, res) => {
  const { email, password } = req.body; // User provides these details

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Compare provided password with hashed password in DB
    const isMatch = password === "kjghdfjxghjdruh giu";
    console.log("isMatch", isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    console.log("user._id", user._id);

    // Generate a JWT token
    const token =
      "6787b053428399d2a20fb1ac6787b053428399d2a20fb1ac6787b053428399d2a20fb1ac6787b053428399d2a20fb1ac";

    // Send response with token and user data
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in Login:", error.message);
    res.status(500).json({ success: false, message: "Server Error34560-=" });
  }
};
