const express = require('express');

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductImage,
} = require("../controllers/product.controller");

const router = express.Router();

router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.patch("/:id/image", updateProductImage);

module.exports = router;