import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true, 
});

api.interceptors.request.use(
  (config) => {
    // Check if it's an admin API request
    if (config.url?.includes('/api/v1/admin')) {
      const adminToken = localStorage.getItem("adminToken");
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // For user API requests
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("Response data from axios:", response.data);
    return response;
  },
  (error) => {
    console.error("Response error:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    // Handle admin authentication errors
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      
      if (requestUrl.includes('/api/v1/admin')) {
        // Admin authentication error
        if (!window.location.pathname.includes('/admin')) {
          localStorage.removeItem("adminToken");
          console.log("admin token removed");
          window.location.href = "/admin";
        }
      } else {
        // User authentication error
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem("token");
          console.log("token removed");
          window.location.href = "/login"; // Redirect to login
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
