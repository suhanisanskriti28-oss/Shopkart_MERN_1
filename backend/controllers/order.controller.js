
const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

// POST /orders/checkout
const createCheckout = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id)
      .populate("cart.product");

    if (!customer || !customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty"
      });
    }

    let totalAmount = 0;
    const items = [];

    for (const cartItem of customer.cart) {
      const product = cartItem.product;
      const quantity = cartItem.quantity;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart no longer exists"
        });
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has insufficient stock`
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity
      });

      totalAmount += product.price * quantity;
    }

    // Razorpay expects the amount in paise.
    const paymentOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `sk_${new mongoose.Types.ObjectId()}`
    });

    const order = await Order.create({
      customer: customer._id,
      items,
      totalAmount,
      status: "pending",
      razorpayOrderId: paymentOrder.id
    });

    return res.status(201).json({
      success: true,
      message: "Checkout order created",
      orderId: order._id,
      razorpayOrderId: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to start checkout"
    });
  }
};

// POST /orders/verify-payment
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are incomplete"
      });
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      customer: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // Confirm the payment is actually captured/paid with Razorpay.
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.order_id !== razorpay_order_id ||
      payment.status !== "captured" ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured or does not match the order"
      });
    }

    // Recheck stock before finalising the order.
    for (const item of order.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity }
        },
        {
          $inc: { stock: -item.quantity }
        },
        { new: true }
      );

      if (!updatedProduct) {
        // Do not clear the cart or mark the order paid.
        // Payment refund/exception handling should be added for production.
        return res.status(409).json({
          success: false,
          message: "Payment received, but stock needs manual review"
        });
      }
    }

    order.status = "paid";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    await Customer.findByIdAndUpdate(req.user._id, {
      $set: { cart: [] }
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed",
      order
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify payment"
    });
  }
};

// GET /orders/my-orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders"
    });
  }
};

module.exports = {
  createCheckout,
  verifyPayment,
  getMyOrders
};

