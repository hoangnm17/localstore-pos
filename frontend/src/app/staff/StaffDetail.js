import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import api from '../../services/axiosInstance';

const StaffDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const id = location.state?.id; 

    const [loading, setLoading] = useState(true);
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
                const staffData = res.data.data;

                if (res.data.success && staffData) {
                    const formattedDate = staffData.createdAt ? staffData.createdAt.split('T')[0] : '';
                    setFormData({
                        ...staffData,
                        createdAt: formattedDate
                    });
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStaffData();
    }, [id, navigate]);

    if (loading) return <div className="text-center p-5 fw-bold">Đang tải thông tin...</div>;

    return (
        <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar />
            <div className="flex-grow-1 p-4 text-start">
                <div className="card shadow border-0 rounded-4 overflow-hidden">
                    <div className="card-header bg-info text-white p-3">
                        <h5 className="m-0 fw-bold">CHI TIẾT THÔNG TIN NHÂN VIÊN</h5>
                    </div>
                    <div className="card-body p-5">
                        <form>
                            <div className="row g-4">
                                {/* Hồ sơ cá nhân - Tất cả input dùng disabled */}
                                <div className="col-md-6 border-end pe-4">
                                    <h6 className="fw-bold text-info mb-3 border-bottom pb-2">Hồ sơ cá nhân</h6>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Họ và tên</label>
                                        <input type="text" className="form-control bg-light" value={formData.fullName} disabled />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Email</label>
                                        <input type="email" className="form-control bg-light" value={formData.email} disabled />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Số điện thoại</label>
                                        <input type="text" className="form-control bg-light" value={formData.phoneNumber} disabled />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Ngày vào làm</label>
                                        <input type="date" className="form-control bg-light" value={formData.createdAt} disabled />
                                    </div>
                                </div>

                                <div className="col-md-6 ps-4">
                                    <h6 className="fw-bold text-info mb-3 border-bottom pb-2">Tài khoản & Lương</h6>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Vai trò</label>
                                            <select className="form-select bg-light" value={formData.roleId} disabled>
                                                <option value="1">Manager</option>
                                                <option value="2">Cashier</option>
                                                <option value="3">Warehouse</option>
                                            </select>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Trạng thái</label>
                                            <select className="form-select bg-light" value={formData.isActive} disabled>
                                                <option value="active">Đang hoạt động</option>
                                                <option value="locked">Tạm khóa</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Loại lương</label>
                                            <input type="text" className="form-control bg-light" value={formData.salaryType === 'hourly' ? 'Theo giờ' : 'Theo tháng'} disabled />
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Lương cơ bản</label>
                                            <input type="text" className="form-control bg-light" value={formData.baseSalary.toLocaleString() + ' VNĐ'} disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-3 mt-4 border-top pt-4">
                                <button
                                    type="button"
                                    className="btn btn-secondary px-5 fw-bold"
                                    onClick={() => navigate('/staff')}
                                >
                                    <i className="bi bi-arrow-left me-2"></i>QUAY LẠI
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary px-5 shadow fw-bold"
                                    onClick={() => navigate('/staff/update', { state: { id } })}
                                >
                                    <i className="bi bi-pencil-square me-2"></i>CHỈNH SỬA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDetail;