
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = "http://localhost:8089";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch(`${API}/orders/my-orders`, {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load orders.");
        }

        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <div>
      <Navbar />

      <main style={{ padding: "24px" }}>
        <h1>My Orders</h1>

        {loading && <p>Loading orders...</p>}

        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}

        {!loading && !error && orders.length === 0 && (
          <>
            <p>No orders found.</p>
            <Link to="/products">Continue Shopping</Link>
          </>
        )}

        {!loading && !error && orders.map((order) => (
          <article
            key={order._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <h2>Order #{order._id}</h2>

            <p>
              Date: {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>

            <p>
              Status: <strong>{order.status?.toUpperCase()}</strong>
            </p>

            {order.items?.map((item, index) => (
              <p key={item.product || index}>
                {item.name} × {item.quantity} — ₹
                {(item.price * item.quantity).toLocaleString("en-IN")}
              </p>
            ))}

            <h3>
              Total: ₹{Number(order.totalAmount).toLocaleString("en-IN")}
            </h3>
          </article>
        ))}
      </main>
    </div>
  );
}
