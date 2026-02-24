import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import api from '../../services/axiosInstance';

const StaffCreate = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        roleId: '',
        salaryType: 'hourly',
        baseSalary: 0,
        isActive: 'active',
        employmentStatus: 'working',
        password: '',
        createdAt: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg("");
        setSuccessMsg("");
    };

    const validateForm = () => {
        const nameRegex = /^[\p{L}]+(?:\s[\p{L}]+)*$/u;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10,11}$/;

        if (!nameRegex.test(formData.fullName)) return "Họ tên không được chứa số hay ký tự lạ!";
        if (!emailRegex.test(formData.email)) return "Định dạng Email không hợp lệ!";
        if (!phoneRegex.test(formData.phoneNumber)) return "SĐT phải là số, từ 10-11 ký tự!";
        if (!formData.roleId) return "Vui lòng chọn vai trò!";
        if (formData.password.length < 6) return "Mật khẩu phải từ 6 ký tự!";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const error = validateForm();
        if (error) return setErrorMsg(error);

        setLoading(true);
        try {
            const res = await api.post('/staff', formData);
            if (res.success) {
                setSuccessMsg("Tạo nhân viên thành công!");
                setErrorMsg("");

                setTimeout(() => {
                    navigate('/staff');
                }, 1500);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Có thể trùng Email hoặc SĐT.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar />
            <div className="flex-grow-1 p-4">
                <div className="card shadow border-0 rounded-4 overflow-hidden">
                    <div className="card-header bg-primary text-white p-3">
                        <h5 className="m-0 fw-bold">THÊM NHÂN VIÊN MỚI</h5>
                    </div>
                    <div className="card-body p-5">

                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                <div className="col-md-6 border-end pe-4">
                                    <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">Hồ sơ cá nhân</h6>

                                    <div className="mb-3">
                                        <label className="small fw-bold">Họ và tên *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            className="form-control"
                                            required
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="small fw-bold">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            required
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="small fw-bold">Số điện thoại *</label>
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            className="form-control"
                                            required
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="small fw-bold">Ngày vào làm</label>
                                        <input
                                            type="date"
                                            name="createdAt"
                                            className="form-control"
                                            value={formData.createdAt}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6 ps-4">
                                    <h6 className="fw-bold text-primary mb-3 border-bottom pb-2">Hệ thống & Lương</h6>

                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Vai trò *</label>
                                            <select name="roleId" className="form-select" required onChange={handleChange}>
                                                <option value="">-- Chọn --</option>
                                                <option value="1">Manager</option>
                                                <option value="2">Cashier</option>
                                                <option value="3">Warehouse</option>
                                            </select>
                                        </div>

                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Trạng thái tài khoản</label>
                                            <select name="isActive" className="form-select" onChange={handleChange}>
                                                <option value="active">Hoạt động</option>
                                                <option value="locked">Khóa</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Loại lương</label>
                                            <select name="salaryType" className="form-select" onChange={handleChange}>
                                                <option value="hourly">Theo giờ</option>
                                                <option value="monthly">Theo tháng</option>
                                            </select>
                                        </div>

                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Lương cơ bản (VNĐ)</label>
                                            <input type="number" name="baseSalary" className="form-control" onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="small fw-bold">Mật khẩu *</label>
                                        <div className="input-group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                className="form-control"
                                                required
                                                onChange={handleChange}
                                            />
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 🔥 THÔNG BÁO HIỂN THỊ PHÍA DƯỚI */}
                            {(errorMsg || successMsg) && (
                                <div className={`alert mt-4 shadow-sm ${errorMsg ? 'alert-danger' : 'alert-success'}`}>
                                    <i className={`bi me-2 ${errorMsg ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`}></i>
                                    {errorMsg || successMsg}
                                </div>
                            )}

                            <div className="d-flex justify-content-end gap-3 mt-4">
                                <button
                                    type="button"
                                    className="btn btn-light px-4 border"
                                    onClick={() => navigate('/staff')}
                                >
                                    THOÁT
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary px-4 shadow fw-bold"
                                    disabled={loading}
                                >
                                    {loading ? "ĐANG LƯU..." : "LƯU NHÂN VIÊN"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffCreate;