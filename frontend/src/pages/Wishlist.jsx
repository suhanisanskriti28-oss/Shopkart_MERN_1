import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WishlistCard from "../components/WishlistCard";
import Navbar from "../components/Navbar";
import { getWishlist, removeFromWishlist } from "../services/api";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlistData = async (isRetry = false) => {
    try {
      if (isRetry) {
        setLoading(true);
      }
      setError(false);
      const data = await getWishlist();
      setWishlist(data.wishlist || []);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistData(false);
  }, []);

  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      await removeFromWishlist(productId);
      // Immediately update UI without page reload
      setWishlist((prevWishlist) =>
        prevWishlist.filter((item) => item._id !== productId)
      );
    } catch (err) {
      console.error("Failed to remove product from wishlist:", err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="wishlist-page">
      <Navbar />

      <main className="wishlist-main-content">
        {loading && (
          <div className="state-message" id="wishlist-loading">
            <p>Loading your wishlist...</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-message error" id="wishlist-error">
            <p>Something went wrong.</p>
            <p>We couldn't load your wishlist.</p>
            <button
              type="button"
              className="retry-button"
              id="wishlist-retry"
              onClick={() => fetchWishlistData(true)}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="state-message empty-state" id="wishlist-empty">
            <div className="empty-heart-icon" role="img" aria-label="heart">
              ❤️
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <Link
              to="/products"
              className="browse-button"
              id="browse-products-link"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <div className="wishlist-content">
            <div className="wishlist-header">
              <div>
                <h1>My Wishlist</h1>
                <p>
                  {wishlist.length} {wishlist.length === 1 ? "saved product" : "saved products"}
                </p>
              </div>
            </div>

            <div className="product-grid wishlist-grid">
              {wishlist.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={handleRemove}
                  removing={removingId === product._id}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Wishlist;