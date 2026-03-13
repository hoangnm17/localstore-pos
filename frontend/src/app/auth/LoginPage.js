import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginAPI } from "../../services/Auth/auth.service";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const redirectByRole = (role) => {
    switch (role) {
      case 'Manager':
        navigate("/dashboard");
        break;
      case 'Cashier':
        navigate("/sales");
        break;
      case 'Warehouse':
        navigate("/inventory/menu");
        break;
      default:
        navigate("/sales");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) { localStorage.clear(); }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      setLoading(true);
      setError("");
      localStorage.clear();

      const response = await loginAPI(form);
      const serverData = response.data ?? response;

      if (serverData.success) {
        const { token, user } = serverData.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        redirectByRole(user.roleName);
      } else {
        setError(serverData.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Sai tên đăng nhập hoặc mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        backgroundImage: `url("/store.jpg")`,
        backgroundSize: "cover", backgroundPosition: "center",
        backgroundRepeat: "no-repeat", position: "relative"
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.1)" }}></div>
      <div
        className="card border-0 p-4 text-center"
        style={{
          maxWidth: "450px", width: "90%", borderRadius: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.75)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", zIndex: 1
        }}
      >
        <div className="card-body px-4">
          <h1 className="fw-bold mb-5 text-dark" style={{ fontFamily: "serif", fontSize: "50px" }}>
            LocalStore POS
          </h1>
          <h5 className="fw-bolder text-secondary">Đăng nhập hệ thống quản lý</h5>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control py-3 border-0 shadow-sm"
                placeholder="Tên đăng nhập "
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                style={{ borderRadius: "8px", outline: "none" }}
              />
            </div>
            <div className="mb-2 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control py-3 border-0 shadow-sm pe-5"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ borderRadius: "8px", outline: "none" }}
              />
              <button
                type="button"
                className="btn position-absolute top-50 end-0 translate-middle-y pe-3"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: "transparent", border: "none", zIndex: 10 }}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-secondary fs-5`}></i>
              </button>
            </div>
            <div className="d-flex justify-content-end mb-4">
              <Link to="/forgot-password" className="text-decoration-none fw-bold text-dark" style={{ fontSize: "0.9rem" }}>
                Quên mật khẩu?
              </Link>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 py-3 fw-bold shadow-sm"
              disabled={loading}
              style={{ borderRadius: "12px", backgroundColor: "#5eaaff", border: "none", fontSize: "1.1rem" }}
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;
