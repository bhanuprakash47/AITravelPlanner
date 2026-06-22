import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie"

import "../styles/register.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
  const navigate = useNavigate();

  const token = Cookies.get("jwt_token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (token) {
    return <Navigate to="/" replace />;
  }

  const submitForm = async (event) => {
    event.preventDefault();

    setErrorMsg("");

    if (!name.trim() || !email.trim() || !password.trim()) {
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
        `${API_BASE_URL}/api/auth/register`,
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }
      );

      if (response.status === 201) {
        navigate("/login", {
          replace: true,
        });
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="signup-container">
      <form className="form-container" onSubmit={submitForm}>
        <h1 className="heading">Create Account</h1>

        <div className="input-container">
          <label htmlFor="name" className="para">
            Name
          </label>

          <input
            id="name"
            className="input-el"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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

        {errorMsg && <p className="err-msg">{errorMsg}</p>}

        <button type="submit" className="button">
          Register
        </button>

        <p className="login-text">
          Already have an account?{" "}
          <button
            type="button"
            className="login-link-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default Register;