
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:8089";

const money = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const readable = (value) =>
  String(value || "PENDING")
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/orders`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your orders.");
      }

      setOrders(data.orders || []);
    } catch (requestError) {
      setError(
        requestError.message || "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <main className="page-shell">
      <header className="page-heading">
        <p className="eyebrow">SHOPKART / ACCOUNT</p>
        <h1>My orders.</h1>
        <p>Your purchases and their latest payment and delivery status.</p>
      </header>

      {loading && (
        <div className="state-panel">Loading your orders...</div>
      )}

      {!loading && error && (
        <div className="state-panel state-error">
          <p>{error}</p>
          <button
            className="button button-secondary"
            onClick={loadOrders}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p className="muted-text">
            Your next favourite find could be one click away.
          </p>
          <Link className="button button-primary" to="/products">
            Browse products
          </Link>
        </div>
      )}

      {!loading &&
        !error &&
        orders.map((order) => (
          <article className="order-card" key={order._id}>
            <div className="order-card-header">
              <div>
                <p className="eyebrow">
                  ORDER PLACED{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN")
                    : ""}
                </p>
                <h2>Order #{order._id}</h2>
              </div>

              <div className="status-stack">
                <span
                  className={`status-pill ${
                    order.paymentStatus === "PAID"
                      ? "status-paid"
                      : "status-pending"
                  }`}
                >
                  Payment: {readable(order.paymentStatus || order.status)}
                </span>

                <span className="status-pill status-neutral">
                  Order: {readable(order.status)}
                </span>
              </div>
            </div>

            <div className="order-lines">
              {(order.items || []).map((item, index) => {
                const product =
                  item.product && typeof item.product === "object"
                    ? item.product
                    : null;

                const name = item.name || product?.name || "Product";
                const quantity = Number(item.quantity || 0);
                const price = Number(item.price ?? product?.price ?? 0);

                return (
                  <div
                    className="order-line"
                    key={product?._id || item.product || index}
                  >
                    <span>
                      <strong>{name}</strong>
                      <br />
                      <small>Quantity: {quantity}</small>
                    </span>

                    <strong>{money(price * quantity)}</strong>
                  </div>
                );
              })}
            </div>

            {order.shippingAddress && (
              <div className="shipping-summary">
                <strong>Delivery address</strong>
                <p>
                  {order.shippingAddress.fullName}
                  <br />
                  {order.shippingAddress.addressLine1}
                  <br />
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state}{" "}
                  {order.shippingAddress.pincode}
                  <br />
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>
            )}

            <div className="order-card-footer">
              <strong>Total: {money(order.totalAmount)}</strong>
              <Link to={`/my-orders/${order._id}`}>
                View order
              </Link>
            </div>
          </article>
        ))}
    </main>
  );
}
