
import { useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist } from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const [status, setStatus] = useState("default");
  const [cartStatus, setCartStatus] = useState("default");

  const { addToCart } = useCart();

  const handleAddToWishlist = async () => {
    if (status === "saving" || status === "success") return;

    try {
      setStatus("saving");
      await addToWishlist(product._id);
      setStatus("success");
    } catch (error) {
      console.error("Wishlist error:", error);
      setStatus("error");
    }
  };

  const handleAddToCart = async () => {
    if (cartStatus === "saving" || product.stock < 1) return;

    try {
      setCartStatus("saving");
      await addToCart(product._id);
      setCartStatus("success");
    } catch (error) {
      console.error("Cart error:", error);
      setCartStatus("error");
    }
  };

  const inStock = product.stock > 0;

  return (
    <div className="product-card" id={`product-card-${product._id}`}>
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
      </div>

      <div className="product-info">
        <span className="product-category">
          {product.category}
        </span>

        <h3 className="product-title">{product.name}</h3>

        <p className="product-description">
          {product.description}
        </p>

        <p className="product-price">
          ₹{product.price}
        </p>

        <p
          className={`product-stock ${
            inStock ? "in-stock" : "out-of-stock"
          }`}
        >
          {inStock ? `${product.stock} available` : "Out of stock"}
        </p>

        <div className="product-card-actions">
          <Link
            to={`/products/${product._id}`}
            className="details-button"
            id={`product-details-${product._id}`}
          >
            View Details
          </Link>

          <button
            type="button"
            className={`wishlist-action-btn ${status}`}
            id={`wishlist-btn-${product._id}`}
            onClick={handleAddToWishlist}
            disabled={status === "saving" || status === "success"}
          >
            {status === "default" && "♡ Add to Wishlist"}
            {status === "saving" && "⏳ Saving..."}
            {status === "success" && "♥️ Added to Wishlist"}
            {status === "error" && "♡ Try Wishlist Again"}
          </button>

          <button
            type="button"
            className={`cart-action-btn ${cartStatus}`}
            id={`cart-btn-${product._id}`}
            onClick={handleAddToCart}
            disabled={!inStock || cartStatus === "saving"}
          >
            {cartStatus === "saving" && "⏳ Adding..."}
            {cartStatus === "success" && "✓ Added to Cart"}
            {(cartStatus === "default" || cartStatus === "error") &&
              (inStock ? "🛒 Add to Cart" : "Out of Stock")}
          </button>
        </div>

        {status === "error" && (
          <div
            className="product-card-error"
            id={`wishlist-error-${product._id}`}
          >
            <p>Unable to save product.</p>
            <p>Please try again.</p>
          </div>
        )}

        {cartStatus === "error" && (
          <div className="product-card-error">
            <p>Unable to add product to cart.</p>
            <button
              type="button"
              onClick={handleAddToCart}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;