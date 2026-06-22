import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

import "../styles/login.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();

  const token = Cookies.get("jwt_token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (token) {
    return <Navigate to="/" replace />;
  }

  const submitForm = async (event) => {
    event.preventDefault();

    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );

      if (response.status === 200) {
        Cookies.set("jwt_token", response.data.token, {
          expires: 1 / 24,
        });

        navigate("/", {
          replace: true,
        });
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="login-container">
      <form
        className="login-form-container"
        onSubmit={submitForm}
      >
        <h1 className="login-heading">Login</h1>

        <div className="input-container">
          <label htmlFor="email" className="para">
            Email
          </label>

          <input
            id="email"
            className="input-el"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-container">
          <label htmlFor="password" className="para">
            Password
          </label>

          <input
            id="password"
            className="input-el"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {errorMsg && (
          <p className="err-msg">{errorMsg}</p>
        )}

        <button type="submit" className="login-btn">
          Login
        </button>

        <p className="signup-text">
          Don't have an account?{" "}
          <button
            type="button"
            className="signup-link-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;