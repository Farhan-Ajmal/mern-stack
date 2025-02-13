import express from "express";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import verifyToken from "../middlewares/jwtAuthentication.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
