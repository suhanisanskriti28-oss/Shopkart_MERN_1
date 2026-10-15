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


const updateProductImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (typeof image !== "string" || !image.trim()) {
      return res.status(400).json({
        message: "A valid image URL is required",
      });
    }

    if (!/^https?:\/\/\S+$/i.test(image.trim())) {
      return res.status(400).json({
        message: "Image must be a valid HTTP or HTTPS URL",
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { image: image.trim() } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product image updated successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update product image",
      error: error.message,
    });
  }
};



module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductImage,
};