
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const API = "http://localhost:8089";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

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
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setError("");

    const shippingAddress = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };

    if (Object.values(shippingAddress).some((value) => !value)) {
      setError("Please complete every shipping field.");
      return;
    }

    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay. Check your internet connection."
        );
      }

      // Create a payment order on the backend.
      const checkoutResponse = await fetch(
        `${API}/orders/create-payment-order`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ shippingAddress }),
        }
      );

      const checkoutData = await checkoutResponse.json();

      if (
        !checkoutResponse.ok ||
        !checkoutData.razorpayOrderId ||
        !checkoutData.keyId
      ) {
        throw new Error(
          checkoutData.message || "Unable to start checkout."
        );
      }

      const payment = new window.Razorpay({
        key: checkoutData.keyId,
        amount: checkoutData.amount,
        currency: checkoutData.currency || "INR",
        name: "ShopKart",
        description: "ShopKart order payment",
        order_id: checkoutData.razorpayOrderId,

        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
        },

        notes: {
          shippingCity: shippingAddress.city,
          shippingState: shippingAddress.state,
        },

        theme: {
          color: "#123d3a",
        },

        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch(
              `${API}/orders/verify-payment`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentResponse),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            const order = verifyData.order;

            if (order?._id) {
              sessionStorage.setItem(
                "shopkartLastOrderId",
                order._id
              );
            }

            if (typeof refreshCart === "function") {
              await refreshCart();
            }

            navigate("/order-success", {
              state: { order },
            });
          } catch (verificationError) {
            setError(
              verificationError.message ||
                "Payment verification failed. Please check My Orders before trying again."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });

      payment.on("payment.failed", (response) => {
        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );
        setLoading(false);
      });

      payment.open();
    } catch (checkoutError) {
      setError(
        checkoutError.message || "Unable to start checkout."
      );
      setLoading(false);
    }
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <>
        <Navbar />

        <main className="page-shell">
          <section className="empty-state">
            <h1>Your cart is empty</h1>
            <p>Add something to your cart before checking out.</p>

            <button
              className="button button-primary"
              onClick={() => navigate("/products")}
            >
              Continue shopping
            </button>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-shell">
        <header className="page-heading">
          <p className="eyebrow">SHOPKART / CHECKOUT</p>
          <h1>Complete your order.</h1>
          <p>
            Enter your delivery details and review your items
            before payment.
          </p>
        </header>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="checkout-layout">
          <form
            className="checkout-panel"
            onSubmit={handleCheckout}
          >
            <h2>Shipping details</h2>

            <div className="form-grid">
              <label className="field field-full">
                Full name
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="field">
                Phone number
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  required
                />
              </label>

              <label className="field">
                PIN code
                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="postal-code"
                  required
                />
              </label>

              <label className="field field-full">
                Address
                <textarea
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleChange}
                  rows={3}
                  autoComplete="street-address"
                  required
                />
              </label>

              <label className="field">
                City
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  autoComplete="address-level2"
                  required
                />
              </label>

              <label className="field">
                State
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  autoComplete="address-level1"
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              className="button button-primary button-wide"
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay securely"}
            </button>

            <p className="secure-note">
              Payments are processed using Razorpay. Use your
              backend's configured Test Mode credentials.
            </p>
          </form>

          <aside className="order-summary">
            <h2>Order summary</h2>

            <div className="summary-items">
              {cartItems.map((item, index) => {
                const product = item.product || item;
                const quantity = Number(item.quantity || 1);

                return (
                  <div
                    className="summary-item"
                    key={product._id || item._id || index}
                  >
                    <span>
                      <strong>
                        {product.name || "Product"}
                      </strong>
                      <br />
                      <small>Qty: {quantity}</small>
                    </span>

                    <strong>
                      ₹
                      {(
                        Number(product.price || 0) * quantity
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                );
              })}
            </div>

            <div className="summary-total">
              <span>Estimated total</span>
              <strong>
                ₹{Number(subtotal || 0).toLocaleString("en-IN")}
              </strong>
            </div>

            <p className="summary-disclaimer">
              Final pricing is calculated and validated by the server.
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
