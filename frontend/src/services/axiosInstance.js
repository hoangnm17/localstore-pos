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
      return Promise.reject(
        Object.assign(new Error("Không thể kết nối tới server"), { response: null })
      );
    }

    const { status, data } = error.response;

    // 401: xử lý đặc biệt cho auth flows
    if (status === 401) {
      const token = localStorage.getItem("token");
      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return Promise.resolve({
          success: false,
          message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
          status: 401,
        });
      } else {
        return Promise.resolve({
          success: false,
          message: data?.message || "Tên đăng nhập hoặc mật khẩu không đúng!",
          status: 401,
          data,
        });
      }
    }

    // 403: resolve để UI hiển thị quyền truy cập
    if (status === 403) {
      return Promise.resolve({
        success: false,
        message: "Bạn không có quyền truy cập",
        status: 403,
      });
    }

    // 4xx và 5xx còn lại: REJECT để catch block trong hooks nhận lỗi đúng cách
    return Promise.reject(error);
  }
);

export default api;
