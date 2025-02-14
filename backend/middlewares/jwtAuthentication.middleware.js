// middleware/authMiddleware.js

import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.email = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export default verifyToken;
