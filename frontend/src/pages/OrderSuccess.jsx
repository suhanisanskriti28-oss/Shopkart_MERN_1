
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const API = "http://localhost:8089";

export default function OrderSuccess() {
  const location = useLocation();
  const initialOrder = location.state?.order || null;

  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialOrder?._id) {
      sessionStorage.setItem("shopkartLastOrderId", initialOrder._id);
      setOrder(initialOrder);
      setLoading(false);
      return;
    }

    const savedId = sessionStorage.getItem("shopkartLastOrderId");

    if (!savedId) {
      setLoading(false);
      setError("No recent order could be found.");
      return;
    }

    let active = true;

    async function fetchOrder() {
      try {
        const response = await fetch(
          `${API}/orders/${encodeURIComponent(savedId)}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load order details."
          );
        }

        if (active) {
          setOrder(data.order || data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message || "Unable to load order details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    return () => {
      active = false;
    };
  }, [initialOrder]);

  if (loading) {
    return (
      <main className="page-shell success-shell">
        <div className="state-panel">Loading your order...</div>
      </main>
    );
  }

  return (
    <main className="page-shell success-shell">
      <section className="success-panel">
        <div className="success-mark">✓</div>

        <p className="eyebrow">SHOPKART / ORDER CONFIRMATION</p>

        <h1>
          {order ? "Thanks for your order." : "Order details"}
        </h1>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {order && (
          <>
            <p className="success-intro">
              {order.paymentStatus === "PAID"
                ? "Your payment has been verified and your order is placed."
                : "Your order details are available below."}
            </p>

            <div className="success-details">
              <div>
                <span>Order ID</span>
                <strong>{order._id}</strong>
              </div>

              <div>
                <span>Payment status</span>
                <strong>{order.paymentStatus || "PENDING"}</strong>
              </div>

              <div>
                <span>Order status</span>
                <strong>{order.status || "PENDING_PAYMENT"}</strong>
              </div>

              <div>
                <span>Total</span>
                <strong>
                  ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>
          </>
        )}

        <div className="success-actions">
          <Link className="button button-primary" to="/my-orders">
            View my orders
          </Link>

          <Link className="button button-secondary" to="/products">
            Continue shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
