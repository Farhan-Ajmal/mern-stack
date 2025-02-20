// middleware/authMiddleware.js

import jwt from "jsonwebtoken";

const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"];
  const accessToken = token.split(" ")[1];
  console.log("token in verifyToken", accessToken);

  if (!accessToken) {
    return res.status(401).send("Access Denied. No token provided.");
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.REFRESH_SECRET);
    console.log("decoded in verifyToken", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: `${error.name}:::: ${error.message}` });
  }
};

export default verifyToken;
