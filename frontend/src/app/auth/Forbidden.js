import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
const Forbidden = () => {
    const navigate = useNavigate();
    const { roleName } = useAuth();
    const goHome = () => {
        if (roleName === 'Manager') navigate('/dashboard');
        else if (roleName === 'Cashier') navigate('/my-schedule');
        else if (roleName === 'Warehouse') navigate('/inventory/menu');
        else navigate('/login');
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center vh-100"
            style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <div className="text-center p-5 rounded-4 bg-white shadow"
                style={{ maxWidth: '480px' }}>
                <div style={{ fontSize: '5rem' }}>🚫</div>
                <h1 className="fw-bold text-danger mt-3">403</h1>
                <h4 className="fw-bold">Không có quyền truy cập</h4>
                <p className="text-muted">
                    Trang này không dành cho bạn. <br />
                    Vui lòng liên hệ Quản lý nếu cần hỗ trợ.
                </p>
                <button className="btn btn-primary px-4 mt-2" onClick={goHome}>
                    Về trang chính
                </button>
            </div>
        </div>
    );
};

export default Forbidden;
