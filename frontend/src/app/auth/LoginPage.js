import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import { loginAPI } from "../../services/Auth/auth.service";
import bgImage from "../../assets/images/store.jpg"; 

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await loginAPI(form);
      if (res.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/sales");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",       
        backgroundPosition: "center",  
        backgroundRepeat: "no-repeat",
        position: "relative"
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.1)" }}></div>

      <div 
        className="card border-0 p-4 text-center" 
        style={{ 
          maxWidth: "450px", 
          width: "90%", 
          borderRadius: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.75)", 
          backdropFilter: "blur(0px)", 
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          zIndex: 1 
        }}
      >
        <div className="card-body px-4">
          <h1 className="fw-bold mb-5 text-dark" style={{ fontFamily: "serif", fontSize: "50px" }}>
            LocalStore POS
          </h1>
          <h5 className="fw-bolder text-secondary ">Đăng nhập hệ thống quản lý</h5>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="email"
                className="form-control py-3 border-0 shadow-sm"
                placeholder="Email của bạn"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{ borderRadius: "8px", outline: "none" }}
              />
            </div>

            <div className="mb-2">
              <input
                type="password"
                className="form-control py-3 border-0 shadow-sm"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ borderRadius: "8px", outline: "none" }}
              />
            </div>

            <div className="d-flex justify-content-end mb-4">
              <Link 
                to="/forgot-password" 
                className="text-decoration-none fw-bold text-dark"
                style={{ fontSize: "0.9rem", textShadow: "0px 0px 1px rgba(255,255,255,0.8)" }}
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-3 fw-bold shadow-sm"
              disabled={loading}
              style={{ 
                borderRadius: "12px", 
                backgroundColor: "#5eaaff", 
                border: "none",
                fontSize: "1.1rem"
              }}
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}