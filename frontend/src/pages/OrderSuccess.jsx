
import { Link, useLocation } from "react-router-dom";

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <main className="order-success">
      <h1>🎉 Order Placed Successfully!</h1>

      <p>Your payment has been verified by ShopKart.</p>

      {order && (
        <>
          <h2>Order Summary</h2>

          <p>
            <strong>Order ID:</strong> {order._id}
          </p>

          <p>
            <strong>Payment ID:</strong>{" "}
            {order.razorpayPaymentId || "Verified"}
          </p>

          <p>
            <strong>Status:</strong> {order.status}
          </p>

          <h3>Items</h3>

          {order.items?.map((item, index) => (
            <p key={item.product || index}>
              {item.name} × {item.quantity}
            </p>
          ))}

          <h3>
            Total Paid: ₹
            {Number(order.totalAmount).toLocaleString("en-IN")}
          </h3>
        </>
      )}

      <p>
        <Link to="/my-orders">View My Orders</Link>
      </p>

      <p>
        <Link to="/products">Continue Shopping</Link>
      </p>
    </main>
  );
}
