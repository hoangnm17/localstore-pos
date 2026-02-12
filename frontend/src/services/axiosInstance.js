import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// interceptor (optional nhưng rất nên có)
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error("API error:", error);
    return Promise.reject(error);
  }
);

export default api;
