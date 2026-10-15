
const express = require("express");
const router = express.Router();

const {
  createCheckout,
  verifyPayment,
  getMyOrders,
  getOrderById
} = require("../controllers/order.controller");

const authMiddleware = require("../middlewares/auth.middleware");

// All order routes require login.
router.use(authMiddleware);

// Create Razorpay payment order.
router.post("/create-payment-order", createCheckout);

// Backward compatibility with the older checkout endpoint.
router.post("/checkout", createCheckout);

// Verify payment and place order.
router.post("/verify-payment", verifyPayment);

// Fetch the logged-in customer's orders.
router.get("/", getMyOrders);

// Keep this route before "/:id".
router.get("/my-orders", getMyOrders);

// Fetch one order belonging to the logged-in customer.
router.get("/:id", getOrderById);

module.exports = router;
