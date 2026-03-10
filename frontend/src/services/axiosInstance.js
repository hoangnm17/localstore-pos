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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.resolve({
        success: false,
        message: "Không thể kết nối tới server",
      });
    }

    const { status, data } = error.response;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return Promise.resolve({
        success: false,
        message: "Phiên đăng nhập đã hết hạn",
        status: 401,
      });
    }

    if (status === 403) {
      return Promise.resolve({
        success: false,
        message: "Bạn không có quyền truy cập",
        status: 403,
      });
    }

    return Promise.resolve({
      success: false,
      message: data?.message || "Có lỗi xảy ra",
      status,
    });
  }
);

export default api;
