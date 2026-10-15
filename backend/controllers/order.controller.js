
const crypto = require("crypto");
const mongoose = require("mongoose");

const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const razorpay = require("../config/razorpay");

function validateShippingAddress(address) {
  if (!address || typeof address !== "object") {
    return "Shipping address is required";
  }

  const requiredFields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode"
  ];

  for (const field of requiredFields) {
    if (
      typeof address[field] !== "string" ||
      !address[field].trim()
    ) {
      return `${field} is required`;
    }
  }

  if (!/^\d{10}$/.test(address.phone.trim())) {
    return "Phone number must contain exactly 10 digits";
  }

  if (!/^\d{6}$/.test(address.pincode.trim())) {
    return "PIN code must contain exactly 6 digits";
  }

  return null;
}

// POST /orders/create-payment-order
// Legacy alias: POST /orders/checkout
const createCheckout = async (req, res) => {
  try {
    const shippingAddress = req.body.shippingAddress || {
      fullName: req.body.fullName,
      phone: req.body.phone,
      addressLine1: req.body.addressLine1 || req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode
    };

    const shippingError =
      validateShippingAddress(shippingAddress);

    if (shippingError) {
      return res.status(400).json({
        success: false,
        message: shippingError
      });
    }

    const customer = await Customer.findById(
      req.user._id
    ).populate("cart.product");

    if (
      !customer ||
      !Array.isArray(customer.cart) ||
      customer.cart.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty"
      });
    }

    const items = [];
    let totalAmount = 0;

    for (const cartItem of customer.cart) {
      const product = cartItem.product;
      const quantity = Number(cartItem.quantity);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart no longer exists"
        });
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}`
        });
      }

      if (product.stock < quantity) {
        return res.status(409).json({
          success: false,
          message: `${product.name} has insufficient stock`
        });
      }

      const price = Number(product.price);

      items.push({
        product: product._id,
        name: product.name,
        price,
        quantity,
        image: product.image || ""
      });

      totalAmount += price * quantity;
    }

    // Always calculate the total using database prices.
    totalAmount = Math.round(
      (totalAmount + Number.EPSILON) * 100
    ) / 100;

    const paymentOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `sk_${new mongoose.Types.ObjectId()}`
    });

    const order = await Order.create({
      customer: customer._id,
      items,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
      razorpayOrderId: paymentOrder.id
    });

    return res.status(201).json({
      success: true,
      message: "Payment order created",
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

    // Prevent duplicate stock deduction on repeated requests.
    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Payment configuration is missing"
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest();

    let receivedSignature;

    try {
      if (!/^[a-fA-F0-9]+$/.test(razorpay_signature)) {
        throw new Error("Malformed signature");
      }

      receivedSignature = Buffer.from(
        razorpay_signature,
        "hex"
      );
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(
        receivedSignature,
        expectedSignature
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // Verify payment directly with Razorpay too.
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== order.razorpayOrderId ||
      payment.status !== "captured" ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment is not captured or does not match this order"
      });
    }

    // Check all products before attempting stock updates.
    for (const item of order.items) {
      const product = await Product.findById(
        item.product
      ).select("name stock");

      if (!product || product.stock < item.quantity) {
        return res.status(409).json({
          success: false,
          paymentReceived: true,
          message:
            "Payment was received, but stock is unavailable for an item. Contact the store for refund or review."
        });
      }
    }

    // Conditional updates protect against stock changing
    // between the stock check and the update.
    for (const item of order.items) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity }
        },
        {
          $inc: { stock: -item.quantity }
        },
        { new: true }
      );

      if (!updated) {
        return res.status(409).json({
          success: false,
          paymentReceived: true,
          message:
            "Payment was received, but stock changed during verification. Contact the store for refund or review."
        });
      }
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;

    await order.save();

    // Clear cart only after successful verification.
    await Customer.findByIdAndUpdate(
      req.user._id,
      { $set: { cart: [] } }
    );

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

// GET /orders
// Legacy alias: GET /orders/my-orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
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

// GET /orders/:id
const getOrderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    // A customer can access only their own orders.
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order"
    });
  }
};

module.exports = {
  createCheckout,
  verifyPayment,
  getMyOrders,
  getOrderById
};
