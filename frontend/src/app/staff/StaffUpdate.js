import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import api from '../../services/axiosInstance';

const StaffUpdate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const id = location.state?.id;

    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [msgType, setMsgType] = useState("");

    // Lưu bản gốc để so sánh
    const [originalData, setOriginalData] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        roleId: '',
        salaryType: 'hourly',
        baseSalary: 0,
        isActive: '',
        employmentStatus: 'working',
        createdAt: '',
        newPassword: ''
    });

    useEffect(() => {
        if (!id) {
            alert("Không tìm thấy thông tin nhân viên!");
            navigate('/staff');
            return;
        }

        const fetchStaffData = async () => {
            try {
                const res = await api.get(`/staff/detail`, { params: { id } });
                if (res.data && res.data.success) {
                    const staffData = res.data.data;
                    const formattedDate = staffData.createdAt ? staffData.createdAt.split('T')[0] : '';

                    const data = {
                        fullName: staffData.fullName || '',
                        email: staffData.email || '',
                        phoneNumber: staffData.phoneNumber || '',
                        roleId: staffData.roleId?.toString() || '',
                        salaryType: staffData.salaryType || 'hourly',
                        baseSalary: staffData.baseSalary || 0,
                        isActive: staffData.isActive || 'active',
                        employmentStatus: staffData.employmentStatus || 'working',
                        createdAt: formattedDate,
                        newPassword: ''
                    };

                    setFormData(data);
                    setOriginalData(data);
                }
            } catch (err) {
                setMsgType("danger");
                setStatusMsg("Lỗi kết nối Server!");
            } finally {
                setLoading(false);
            }
        };
        fetchStaffData();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setStatusMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isChanged = Object.keys(formData).some(key => formData[key] !== originalData[key]);
        if (!isChanged) {
            setMsgType("warning");
            setStatusMsg("Bạn chưa chỉnh sửa thông tin nào!");
            return;
        }

        const nameRegex = /^[\p{L}]+(?:\s[\p{L}]+)*$/u;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^0[0-9]{9,10}$/;

        if (!formData.fullName?.trim()) {
            setMsgType("danger");
            setStatusMsg("Họ tên không được để trống!");
            return;
        }

        if (!nameRegex.test(formData.fullName.trim())) {
            setMsgType("danger");
            setStatusMsg("Họ tên không được chứa số hay ký tự lạ!");
            return;
        }

        if (!formData.email?.trim()) {
            setMsgType("danger");
            setStatusMsg("Email không được để trống!");
            return;
        }

        if (!emailRegex.test(formData.email)) {
            setMsgType("danger");
            setStatusMsg("Định dạng Email không hợp lệ! (VD: abc@email.com)");
            return;
        }

        if (!formData.phoneNumber?.trim()) {
            setMsgType("danger");
            setStatusMsg("Số điện thoại không được để trống!");
            return;
        }

        if (!phoneRegex.test(formData.phoneNumber)) {
            setMsgType("danger");
            setStatusMsg("SĐT phải bắt đầu từ 0 và có 10-11 chữ số!");
            return;
        }

        if (!formData.roleId) {
            setMsgType("danger");
            setStatusMsg("Vui lòng chọn vai trò!");
            return;
        }

        if (!formData.createdAt) {
            setMsgType("danger");
            setStatusMsg("Vui lòng chọn ngày vào làm!");
            return;
        }

        if (formData.baseSalary < 0) {
            setMsgType("danger");
            setStatusMsg("Lương cơ bản không được âm!");
            return;
        }

        if (formData.newPassword && formData.newPassword.length < 6) {
            setMsgType("danger");
            setStatusMsg("Mật khẩu mới phải từ 6 ký tự!");
            return;
        }

        setLoading(true);
        setStatusMsg("");

        try {
            const res = await api.put(`/staff/update`, { id, ...formData });
            const isSuccess = res.success || res.data?.success;

            if (isSuccess) {
                setMsgType("success");
                setStatusMsg("Cập nhật thông tin nhân viên thành công!");
                window.scrollTo(0, 0);

                setOriginalData({ ...formData });

                setTimeout(() => navigate('/staff'), 3000);
            } else {
                setMsgType("danger");
                setStatusMsg(res.data?.message || "Cập nhật thất bại!");
            }
        } catch (err) {
            setMsgType("danger");
            setStatusMsg(err.response?.data?.message || "Lỗi kết nối Server!");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-5 fw-bold text-success">Đang tải hồ sơ...</div>;

    return (
        <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar />
            <div className="flex-grow-1 p-4 text-start">
                <div className="card shadow border-0 rounded-4 overflow-hidden">
                    <div className="card-header bg-success text-white p-3">
                        <h5 className="m-0 fw-bold text-uppercase">Chỉnh sửa thông tin nhân viên</h5>
                    </div>
                    <div className="card-body p-5">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                {/* Cột Trái */}
                                <div className="col-md-6 border-end pe-4">
                                    <h6 className="fw-bold text-success mb-3 border-bottom pb-2">Hồ sơ cá nhân</h6>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Họ và tên *</label>
                                        <input type="text" name="fullName" className="form-control" value={formData.fullName} required onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Email (Tên đăng nhập)</label>
                                        <input type="email" name="email" className="form-control bg-light" value={formData.email} disabled />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Số điện thoại *</label>
                                        <input type="text" name="phoneNumber" className="form-control" value={formData.phoneNumber} required onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Ngày vào làm</label>
                                        <input type="date" name="createdAt" className="form-control" value={formData.createdAt} onChange={handleChange} />
                                    </div>
                                </div>

                                {/* Cột Phải */}
                                <div className="col-md-6 ps-4">
                                    <h6 className="fw-bold text-success mb-3 border-bottom pb-2">Tài khoản & Lương</h6>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Vai trò *</label>
                                            <select name="roleId" className="form-select" value={formData.roleId} required onChange={handleChange}>
                                                <option value="">-- Chọn --</option>
                                                <option value="1">Manager</option>
                                                <option value="2">Cashier</option>
                                                <option value="3">Warehouse</option>
                                            </select>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Trạng thái</label>
                                            <select name="isActive" className="form-select" value={formData.isActive} onChange={handleChange}>
                                                <option value="active">Đang hoạt động</option>
                                                <option value="locked">Tạm khóa</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="small fw-bold text-secondary">Mật khẩu hiện tại</label>
                                        <input type="text" className="form-control bg-light" value="********" readOnly disabled />
                                    </div>

                                    <div className="mb-3 mt-4 p-3 border rounded bg-light shadow-sm">
                                        <label className="small fw-bold text-danger">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
                                        <div className="input-group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="newPassword"
                                                className="form-control"
                                                value={formData.newPassword}
                                                placeholder="Nhập mật khẩu mới"
                                                onChange={handleChange}
                                            />
                                            <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="row mt-4">
                                        <div className="col-6">
                                            <label className="small fw-bold">Loại lương</label>
                                            <select name="salaryType" className="form-select" value={formData.salaryType} onChange={handleChange}>
                                                <option value="hourly">Theo giờ</option>
                                                <option value="monthly">Theo tháng</option>
                                            </select>
                                        </div>
                                        <div className="col-6">
                                            <label className="small fw-bold">Lương cơ bản</label>
                                            <input type="number" name="baseSalary" className="form-control" value={formData.baseSalary} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {statusMsg && (
                                <div className={`alert alert-${msgType} shadow-sm d-flex align-items-center mt-4 animate__animated animate__fadeIn`}>
                                    <i className={`bi ${msgType === "success" ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2 fs-5`}></i>
                                    <div className="fw-bold">{statusMsg}</div>
                                </div>
                            )}

                            <div className="d-flex justify-content-end gap-3 mt-4 border-top pt-4">
                                <button type="button" className="btn btn-light px-5 border fw-bold shadow-sm" onClick={() => navigate('/staff')}>THOÁT</button>
                                <button type="submit" className="btn btn-success px-5 shadow fw-bold text-uppercase" disabled={loading}>
                                    {loading ? "Đang xử lý..." : "Cập nhật"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffUpdate;