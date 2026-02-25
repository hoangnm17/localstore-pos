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

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        roleId: '',
        salaryType: 'hourly',
        baseSalary: 0,
        isActive: 'active',
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

                    setFormData({
                        fullName: staffData.fullName || '',
                        email: staffData.email || '',
                        phoneNumber: staffData.phoneNumber || '',
                        roleId: staffData.roleId?.toString() || '',
                        salaryType: staffData.salaryType || 'hourly',
                        baseSalary: staffData.baseSalary || 0,
                        isActive: staffData.isActive || 'active',
                        employmentStatus: staffData.employmentStatus || 'working',
                        createdAt: formattedDate,
                        oldPassword: '',
                        newPassword: ''
                    });

                }
            } catch (err) {
                setMsgType("danger");
                setStatusMsg("Lỗi kết nối Server hoặc Backend chưa bật!");
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
        const nameRegex = /^[\p{L}]+(?:\s[\p{L}]+)*$/u;
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!formData.fullName?.trim()) {
            setMsgType("danger");
            setStatusMsg("Họ tên không được để trống!");
            return;
        }

        if (!nameRegex.test(formData.fullName)) {
            setMsgType("danger");
            setStatusMsg("Họ tên không được chứa số hay ký tự lạ!");
            return;
        }

        if (!formData.phoneNumber?.trim()) {
            setMsgType("danger");
            setStatusMsg("Số điện thoại không được để trống!");
            return;
        }

        if (!phoneRegex.test(formData.phoneNumber)) {
            setMsgType("danger");
            setStatusMsg("Số điện thoại phải là số, từ 10-11 ký tự!");
            return;
        }

        if (formData.newPassword && formData.newPassword.trim() !== "") {
            if (formData.newPassword.length < 6) {
                setMsgType("danger");
                setStatusMsg("Mật khẩu mới phải từ 6 ký tự trở lên!");
                return;
            }

            if (formData.oldPassword && formData.newPassword === formData.oldPassword) {
                setMsgType("danger");
                setStatusMsg("Mật khẩu mới không được trùng với mật khẩu hiện tại!");
                return;
            }
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

                    setTimeout(() => {
                        navigate('/staff');
                    }, 5000);
                } else {
                    setMsgType("danger");
                    setStatusMsg(res.message || res.data?.message || "Cập nhật thất bại!");
                }
            } catch (err) {
                setMsgType("danger");
                setStatusMsg(err.response?.data?.message || "Lỗi kết nối Server khi cập nhật!");
            } finally {
                setLoading(false);
            }
        };

        if (loading) return <div className="text-center p-5 fw-bold">Đang tải hồ sơ...</div>;

        return (
            <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
                <Sidebar />
                <div className="flex-grow-1 p-4 text-start">
                    <div className="card shadow border-0 rounded-4 overflow-hidden">
                        <div className="card-header bg-success text-white p-3">
                            <h5 className="m-0 fw-bold">CHỈNH SỬA THÔNG TIN NHÂN VIÊN</h5>
                        </div>
                        <div className="card-body p-5">

                            <form onSubmit={handleSubmit}>
                                <div className="row g-4">
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

                                        <div className="mb-3 mt-4 p-3 border rounded bg-light">
                                            <label className="small fw-bold text-danger">Mật khẩu mới (Nếu đổi)</label>
                                            <div className="input-group">
                                                <input type={showPassword ? "text" : "password"} name="newPassword" className="form-control" placeholder="Để trống nếu không đổi" onChange={handleChange} />
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
                                    <div className={`alert alert-${msgType} shadow-sm d-flex align-items-center mt-4 mb-0 animate__animated animate__fadeIn`}>
                                        {msgType === "success" ? (
                                            <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                                        ) : (
                                            <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                                        )}
                                        <div className="fw-bold">{statusMsg}</div>
                                    </div>
                                )}

                                <div className="d-flex justify-content-end gap-3 mt-4 border-top pt-4">
                                    <button type="button" className="btn btn-light px-5 border fw-bold" onClick={() => navigate('/staff')}>THOÁT</button>
                                    <button type="submit" className="btn btn-success px-5 shadow fw-bold" disabled={loading}>
                                        {loading ? "ĐANG LƯU..." : "CẬP NHẬT"}
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