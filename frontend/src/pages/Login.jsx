import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      // Save token and user in AuthContext
      login(data);

      // Redirect based on user role
      if (data.user.role === "shop_owner") {
        navigate("/owner-dashboard");
      } else if (data.user.role === "assistant") {
        navigate("/assistant-dashboard");
      } else if (data.user.role === "customer") {
        navigate("/customer-dashboard");
      } else {
        setError("Invalid user role.");
      }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }

  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome to DokanSathi</h1>

        <p className="auth-subtitle">
          Login to your account
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;