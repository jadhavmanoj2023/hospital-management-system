import axios from "axios";

// In dev, use relative URL so Vite proxy sends requests to backend (cookies work). In prod, use env.
const baseURL = import.meta.env.DEV
  ? "/api/v1"
  : `${import.meta.env.VITE_BACKEND_URL || ""}/api/v1`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
