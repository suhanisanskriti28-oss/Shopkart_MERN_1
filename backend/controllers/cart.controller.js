
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Helper: populate product details in the customer's cart
const getPopulatedCart = async (customerId) => {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: "_id name price image category stock"
  });

  if (!customer) {
    return null;
  }

  // Ignore cart entries whose products no longer exist
  return (customer.cart || []).filter(
    (item) => item.product != null
  );
};

// POST /cart/:productId
// Add a product to the cart
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found"
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock"
      });
    }

    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    const newQuantity = cartItem
      ? cartItem.quantity + 1
      : 1;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock"
      });
    }

    if (cartItem) {
      cartItem.quantity = newQuantity;
    } else {
      customer.cart.push({
        product: product._id,
        quantity: 1
      });
    }

    await customer.save();

    const cart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// GET /cart
// Fetch the logged-in customer's cart
const getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);

    if (cart === null) {
      return res.status(401).json({
        success: false,
        message: "Customer not found"
      });
    }

    return res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// PATCH /cart/:productId
// Update the quantity of a cart item
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock"
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found"
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    const cartItem = customer.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart"
      });
    }

    cartItem.quantity = quantity;

    await customer.save();

    const cart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart
    });
  } catch (error) {
    console.error("Update cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// DELETE /cart/:productId
// Remove a product from the cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found"
      });
    }

    if (!customer.cart) {
      customer.cart = [];
    }

    const exists = customer.cart.some(
      (item) => item.product.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart"
      });
    }

    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await customer.save();

    const cart = await getPopulatedCart(customer._id);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart
    });
  } catch (error) {
    console.error("Remove from cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
};