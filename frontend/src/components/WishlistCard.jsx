import { Link } from "react-router-dom";

function WishlistCard({ product, onRemove, removing }) {
  if (!product) return null;

  const inStock = product.stock > 0;

  return (
    <div className="product-card wishlist-card" id={`wishlist-card-${product._id}`}>
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

        <p className="product-price">
          ₹{product.price}
        </p>

        <p className={`product-stock ${inStock ? "in-stock" : "out-of-stock"}`}>
          {inStock ? `${product.stock} available` : "Out of stock"}
        </p>

        <div className="wishlist-card-actions">
          <Link
            to={`/products/${product._id}`}
            className="details-button"
            id={`view-details-${product._id}`}
          >
            View Details
          </Link>

          <button
            type="button"
            className="remove-button"
            id={`remove-wishlist-${product._id}`}
            onClick={() => onRemove(product._id)}
            disabled={removing}
          >
            {removing ? "Removing..." : "Remove from Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishlistCard;