
import { useState } from "react";

const API = "http://localhost:8089";

function App() {
  const [page, setPage] = useState("login");
  const [form, setForm] = useState({});
  const [message, setMessage] = useState("");
  const [customer, setCustomer] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // REGISTER
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

      setMessage(data.message);

      if (response.ok) {
        setPage("login");
        setForm({});
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    }
  };

  // LOGIN
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

      setMessage(data.message);

      if (response.ok) {
        setCustomer(data.customer);
        setPage("profile");
        setForm({});
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    }
  };

  // GET PROFILE
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
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      const response = await fetch(`${API}/customers/logout`, {
        method: "POST",
        credentials: "include"
      });

      const data = await response.json();

      setMessage(data.message);
      setCustomer(null);
      setPage("login");
    } catch (error) {
      setMessage("Unable to connect to server");
    }
  };

  // CHANGE PASSWORD
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

      setMessage(data.message);

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
    <div className="container">
      <h1>ShopKart</h1>

      <p className="message">{message}</p>

      {/* LOGIN PAGE */}
      {page === "login" && (
        <div className="card">
          <h2>Login</h2>

          <input
            name="email"
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

          <button onClick={login}>
            Login
          </button>

          <p>
            New customer?{" "}
            <button onClick={() => setPage("register")}>
              Register
            </button>
          </p>
        </div>
      )}

      {/* REGISTER PAGE */}
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

          <button onClick={register}>
            Register
          </button>

          <p>
            Already registered?{" "}
            <button onClick={() => setPage("login")}>
              Login
            </button>
          </p>
        </div>
      )}

      {/* PROFILE PAGE */}
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

          <button onClick={logout}>
            Logout
          </button>
        </div>
      )}

      {/* CHANGE PASSWORD PAGE */}
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
  );
}

export default App;