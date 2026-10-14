
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link
} from "react-router-dom";

import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";

import {
  CartProvider,
  useCart
} from "./context/CartContext";

const API = "http://localhost:8089";

function AuthPage() {
  const [page, setPage] = useState("login");
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const [customer, setCustomer] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: ""
  });

  const { refreshCart, clearCart } = useCart();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Register a new customer
  const register = async () => {
    try {
      const response = await fetch(`${API}/customers/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      setMessage(data.message || "Registration completed");

      if (response.ok) {
        setPage("login");
        setForm({});
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    }
  };

  // Login and load the customer's cart
  const login = async () => {
    try {
      const response = await fetch(`${API}/customers/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(form)
      });

      const data = await response.json();

      setMessage(data.message || "");

      if (response.ok) {
        setCustomer(data.customer);
        setPage("profile");
        setForm({});

        await refreshCart();
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    }
  };

  // Fetch the logged-in customer's profile
  const getProfile = async () => {
    try {
      const response = await fetch(`${API}/customers/me`, {
        credentials: "include"
      });

      const data = await response.json();

      if (response.ok) {
        setCustomer(data.customer);
        setMessage("Profile loaded");
        setPage("profile");

        await refreshCart();
      } else {
        setMessage(data.message || "Unable to load profile");
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    }
  };

  // Logout and clear the previous customer's cart from the UI
  const logout = async () => {
    try {
      const response = await fetch(`${API}/customers/logout`, {
        method: "POST",
        credentials: "include"
      });

      const data = await response.json();

      setMessage(data.message || "Logged out");
      setCustomer(null);
      setPage("login");
      clearCart();
    } catch (error) {
      setMessage("Unable to connect to server");
    }
  };

  // Change the customer's password
  const changePassword = async () => {
    try {
      const response = await fetch(
        `${API}/customers/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(passwordForm)
        }
      );

      const data = await response.json();

      setMessage(data.message || "");

      if (response.ok) {
        setPasswordForm({
          oldPassword: "",
          newPassword: ""
        });

        setPage("profile");
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Navbar />

      <div className="container">
        <h1>ShopKart</h1>

        <p className="message">{message}</p>

        {page === "login" && (
          <div className="card">
            <h2>Login</h2>

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email || ""}
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password || ""}
              onChange={handleChange}
            />

            <button onClick={login}>Login</button>

            <p>
              New customer?{" "}
              <button onClick={() => setPage("register")}>
                Register
              </button>
            </p>

            <Link to="/products" className="details-button">
              Browse Products
            </Link>
          </div>
        )}

        {page === "register" && (
          <div className="card">
            <h2>Register</h2>

            <input
              name="fullName"
              placeholder="Full Name"
              value={form.fullName || ""}
              onChange={handleChange}
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email || ""}
              onChange={handleChange}
            />

            <input
              name="phone"
              placeholder="Phone"
              value={form.phone || ""}
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password || ""}
              onChange={handleChange}
            />

            <button onClick={register}>Register</button>

            <p>
              Already registered?{" "}
              <button onClick={() => setPage("login")}>
                Login
              </button>
            </p>
          </div>
        )}

        {page === "profile" && customer && (
          <div className="card">
            <h2>My Profile</h2>

            <p>
              <strong>Name:</strong> {customer.fullName}
            </p>

            <p>
              <strong>Email:</strong> {customer.email}
            </p>

            <p>
              <strong>Phone:</strong> {customer.phone}
            </p>

            <button onClick={getProfile}>
              Refresh Profile
            </button>

            <button onClick={() => setPage("changePassword")}>
              Change Password
            </button>

            <Link to="/products" className="details-button">
              Shop Products
            </Link>

            <Link to="/wishlist" className="details-button">
              ❤️ Wishlist
            </Link>

            <Link to="/cart" className="details-button">
              🛒 My Cart
            </Link>

            <button onClick={logout}>Logout</button>
          </div>
        )}

        {page === "changePassword" && (
          <div className="card">
            <h2>Change Password</h2>

            <input
              type="password"
              placeholder="Old Password"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  oldPassword: e.target.value
                })
              }
            />

            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value
                })
              }
            />

            <button onClick={changePassword}>
              Update Password
            </button>

            <button onClick={() => setPage("profile")}>
              Back to Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />

          <Route
            path="/products"
            element={<ProductList />}
          />

          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="*"
            element={<Navigate to="/" />}
          />

          <Route path="/checkout" element={<Checkout />} />

          <Route
            path="/order-success"
            element={<OrderSuccess />}
          />

          <Route path="/my-orders" element={<MyOrders />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;