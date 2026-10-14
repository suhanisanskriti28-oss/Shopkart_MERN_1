const Product = require('../models/product.model');


// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    res.status(400).json({
      message: 'Failed to create product',
      error: error.message
    });
  }
};


// GET ALL PRODUCTS + SEARCH + CATEGORY FILTER
const getAllProducts = async (req, res) => {
  try {

    const { search, category } = req.query;

    const filter = {};

    // Search by product name
    if (search) {
      filter.name = {
        $regex: search,
        $options: 'i'
      };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter);

    res.status(200).json({
      products
    });

  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.status(200).json({
      product
    });

  } catch (error) {
    res.status(400).json({
      message: 'Invalid product ID'
    });
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  getProductById
};