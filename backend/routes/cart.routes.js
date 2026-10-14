
const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");

const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} = require("../controllers/cart.controller");

// Add a product to the cart
router.post("/:productId", protect, addToCart);

// Get the logged-in customer's cart
router.get("/", protect, getCart);

// Update the quantity of a cart item
router.patch("/:productId", protect, updateCartQuantity);

// Remove a product from the cart
router.delete("/:productId", protect, removeFromCart);

module.exports = router;