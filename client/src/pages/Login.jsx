import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const data = await login(phone, password);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-brand">
          <div className="logo">A</div>
          <h1>AquaFlow</h1>
          <p>Water Supply Management</p>
        </div>

        <div className="login-header">
          <h2>Welcome back</h2>
          <p>Sign in to manage your AquaFlow account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>

            <input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button type="submit" className="login-button">
            Sign In
          </button>

        </form>

        <div className="login-footer">
          <p>AquaFlow Management System</p>
        </div>

      </div>
    </div>
  );
};

export default Login;