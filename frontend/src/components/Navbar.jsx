
import { Link, useNavigate } from "react-router-dom";
import { logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { totalItems, clearCart } = useCart();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearCart();
      navigate("/");
    }
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar" aria-label="Main Navigation">
        <div className="navbar-brand">
          <Link to="/" className="brand-link" id="nav-brand">
            ShopKart
          </Link>
        </div>

        <div className="navbar-links">
          <Link to="/" className="nav-link" id="nav-home">
            Home
          </Link>

          <Link to="/products" className="nav-link" id="nav-products">
            Products
          </Link>

          <Link to="/wishlist" className="nav-link" id="nav-wishlist">
            Wishlist
          </Link>

          <Link to="/cart" className="nav-link" id="nav-cart">
            🛒 Cart ({totalItems})
          </Link>

          <Link to="/my-orders" className="nav-link" id="nav-orders">
            My Orders
          </Link>

          <button
            type="button"
            className="nav-logout-btn"
            id="nav-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
