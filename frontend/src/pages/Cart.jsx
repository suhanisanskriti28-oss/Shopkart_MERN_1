
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";

function Cart() {
  const {
    cartItems,
    loading,
    error,
    totalItems,
    subtotal,
    refreshCart
  } = useCart();

  const navigate = useNavigate();

  // Load the saved cart when this page opens
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <div className="cart-page">
      <Navbar />

      <main className="cart-main">
        <h1>My Cart</h1>

        {loading && <p>Loading your cart...</p>}

        {!loading && error && (
          <div role="alert">
            <p>Unable to load your cart.</p>
            <p>{error}</p>
            <button onClick={refreshCart}>Try Again</button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="cart-empty">
            <h2>Your cart is empty 🛒</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products">Browse Products</Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-layout">
            <section className="cart-items">
              {cartItems.map((item) =>
                item.product ? (
                  <CartItem
                    key={item.product._id}
                    item={item}
                  />
                ) : null
              )}
            </section>

            <aside className="order-summary">
              <h2>Order Summary</h2>

              <p>
                Total units: <strong>{totalItems}</strong>
              </p>

              <p>
                Subtotal:{" "}
                <strong>
                  ₹{subtotal.toLocaleString("en-IN")}
                </strong>
              </p>

              <button
                onClick={() => navigate("/checkout")}
                disabled={loading || cartItems.length === 0}
              >
                Proceed to Checkout
              </button>

              <p className="checkout-note">
                Review your details before payment.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
