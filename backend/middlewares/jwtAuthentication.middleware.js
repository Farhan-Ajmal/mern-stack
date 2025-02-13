// middleware/authMiddleware.js

import jwt from "jsonwebtoken";

// function verifyToken(req, res, next) {
//   const token = req.header("Authorization");
//   console.log("token", token);
//   if (!token)
//     return res.status(401).json({ error: "Access denied dfgrthuyjujio" });
//   try {
//     const decoded = jwt.verify(token, "secret-1234");
//     console.log("decoded", decoded);

//     req.email = decoded.email;
//     next();
//   } catch (error) {
//     res.status(401).json({ error: error.message });
//   }
// }

function verifyToken(req, res, next) {
  const authHeader = req.header("Authorization");

  console.log("Received Authorization Header:", authHeader);
  console.log("authHeader", authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied, token missing" });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied, invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, "secret-1234");
    console.log("Decoded Token:", decoded);

    req.email = decoded.email; // Attach email to the request object if needed
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export default verifyToken;
