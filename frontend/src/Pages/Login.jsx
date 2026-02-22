import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Link, useNavigate, Navigate } from "react-router-dom";
import api from "../utils/axios";

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL;

const Login = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/user/login", {
        email,
        password,
        confirmPassword,
        role: "Patient",
      });

      toast.success(data.message);
      setIsAuthenticated(true);
      navigateTo("/");

      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  };

  const handleAdminLoginRedirect = () => {
    if (DASHBOARD_URL) window.location.href = `${DASHBOARD_URL}/login`;
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container form-component login-form">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.25rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Sign In</h2>
        {DASHBOARD_URL && (
          <button
            type="button"
            onClick={handleAdminLoginRedirect}
            style={{
              padding: "0.4rem 0.75rem",
              background: "transparent",
              border: "none",
              color: "#271776ca",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
              textDecoration: "underline",
            }}
          >
            Login as Admin
          </button>
        )}
      </div>
      <p style={{ marginTop: 0 }}>Please Login To Continue</p>

      <div
        style={{
          marginBottom: "1rem",
          padding: "0.75rem",
          background: "#f0f4ff",
          borderRadius: "8px",
          fontSize: "0.9rem",
        }}
      >
        <strong>Demo (Patient):</strong> test@test.com / test1234
      </div>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <p style={{ marginBottom: 0 }}>Not Registered?</p>
          <Link to="/register" style={{ color: "#271776ca" }}>
            Register Now
          </Link>
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
