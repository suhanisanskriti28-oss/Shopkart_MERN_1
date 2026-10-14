
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API = "http://localhost:8089";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { cartItems, subtotal, refreshCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCheckout(e) {
    e.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(form.phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay. Check your internet connection.");
      }

      const checkoutResponse = await fetch(`${API}/orders/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.message || "Unable to start checkout.");
      }

      const options = {
        key: checkoutData.keyId,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: "ShopKart",
        description: "Order payment",
        order_id: checkoutData.razorpayOrderId,
        prefill: {
          name: form.fullName,
          contact: form.phone,
        },
        theme: { color: "#2563eb" },

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(
              `${API}/orders/verify-payment`,
              {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentResponse),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            await refreshCart();
            navigate("/order-success", {
              state: { order: verifyData.order },
            });
          } catch (err) {
            setError(
              err.message ||
                "Payment verification failed. Please check your order status."
            );
          }
        },

        modal: {
          ondismiss: function () {
            setError("Payment was cancelled. Your cart has not been cleared.");
          },
        },
      };

      const payment = new window.Razorpay(options);

      payment.on("payment.failed", function (response) {
        setError(
          response.error?.description || "Payment failed. Please try again."
        );
      });

      payment.open();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <main>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate("/products")}>
          Continue shopping
        </button>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <h1>Checkout</h1>

      <form onSubmit={handleCheckout}>
        <label>
          Full Name
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </label>

        <br />

        <label>
          Phone Number
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={form.phone}
            onChange={handleChange}
            required
          />
        </label>

        <br />

        <label>
          Address
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </label>

        <br />

        <label>
          City
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
        </label>

        <br />

        <label>
          PIN Code
          <input
            name="pincode"
            inputMode="numeric"
            maxLength={6}
            value={form.pincode}
            onChange={handleChange}
            required
          />
        </label>

        <h2>Order Summary</h2>

        {cartItems.map((item) => (
          <p key={item.product?._id}>
            {item.product?.name || "Product"} × {item.quantity}
          </p>
        ))}

        <h3>Total: ₹{subtotal.toLocaleString("en-IN")}</h3>

        {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Pay with Razorpay"}
        </button>
      </form>
    </main>
  );
}
