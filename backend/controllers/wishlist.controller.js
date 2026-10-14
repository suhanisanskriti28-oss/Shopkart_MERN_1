
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if productId is a valid MongoDB ObjectId (24 hex characters)
    if (!productId || !mongoose.isValidObjectId(productId) || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      return res.status(400).json({
        message: 'Invalid product ID'
      });
    }

    // Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        message: 'Customer not found'
      });
    }

    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    // Check if product is already in wishlist
    const alreadyExists = customer.wishlist.some(
      (id) => (id._id || id).toString() === productId.toString()
    );

    if (alreadyExists) {
      return res.status(409).json({
        message: 'Product already in wishlist'
      });
    }

    // Add product ObjectId to wishlist
    customer.wishlist.push(product._id);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist'
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: '_id name price category image stock'
    });

    if (!customer) {
      return res.status(401).json({
        message: 'Customer not found'
      });
    }

    const validWishlist = (customer.wishlist || []).filter((item) => item != null);

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error'
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if productId is valid
    if (!productId || !mongoose.isValidObjectId(productId) || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      return res.status(400).json({
        message: 'Invalid product ID'
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({
        message: 'Customer not found'
      });
    }

    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    // Find product in wishlist
    const exists = customer.wishlist.some(
      (id) => (id._id || id).toString() === productId.toString()
    );

    if (!exists) {
      return res.status(404).json({
        message: 'Product not in wishlist'
      });
    }

    // Remove product ObjectId
    customer.wishlist = customer.wishlist.filter(
      (id) => (id._id || id).toString() !== productId.toString()
    );

    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist'
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Server error'
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist
};