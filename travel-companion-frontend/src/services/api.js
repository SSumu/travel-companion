import axios from "axios";

// Create Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Automatically attach token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle common response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Unauthorized
    if (error.response?.status === 401) {
      console.error("Unauthorized access");

      // Optional: logout user automatically
      // localStorage.removeItem("token");
      // window.location.href = "/login"
    }

    // Server error
    if (error.response?.status === 500) {
      console.error("Server error");
    }

    return Promise.reject(error);
  },
);

export default API;
