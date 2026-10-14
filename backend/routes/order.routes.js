
const express = require("express");
const router = express.Router();

const protect = require("../middlewares/auth.middleware");


const {
  createCheckout,
  verifyPayment,
  getMyOrders
} = require("../controllers/order.controller");

router.post("/checkout", protect, createCheckout);
router.post("/verify-payment", protect, verifyPayment);
router.get("/my-orders", protect, getMyOrders);


module.exports = router;
