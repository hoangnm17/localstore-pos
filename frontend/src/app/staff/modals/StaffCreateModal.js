import React, { useState, useEffect } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import AlertMessage from '../../../components/common/AlertMessage';
import { useNotification } from '../../../components/global/Notification/NotificationContext';
import api from '../../../services/axiosInstance';

const StaffCreateModal = ({ onClose, onSuccess }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({});
    const [errorMsg, setErrorMsg] = useState('');

    const { showNotification } = useNotification();
    const [roleList, setRoleList] = useState([]);

    const [formData, setFormData] = useState({
        username: '', fullName: '', email: '', phoneNumber: '',
        roleId: '', salaryType: 'hourly', baseSalary: 0,
        isActive: 'active', password: '',
        createdAt: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await api.get('/staff/roles');
                if (res.data?.success) {
                    setRoleList(res.data.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách vai trò", error);
            }
        };
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === "baseSalary") {
            let pureNumber = value.replace(/\D/g, "");
            if (!pureNumber) {
                setFormData({ ...formData, baseSalary: "" });
            } else {
                let formatted = Number(pureNumber).toLocaleString("vi-VN");
                setFormData({ ...formData, baseSalary: formatted });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
        setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        setErrorMsg('');
    };

    const validateForm = () => {
        const e = {};
        const nameRegex = /^[\p{L}]+([\s\p{L}]+)*$/u;
        const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^0[35789][0-9]{8}$/;
        const usernameRegex = /^[a-zA-Z0-9_]{4,30}$/;

        const name = formData.fullName.trim();
        if (!name) e.fullName = 'Họ tên không được để trống!';
        else if (name.length < 3) e.fullName = 'Họ tên phải có ít nhất 3 ký tự!';
        else if (!nameRegex.test(name)) e.fullName = 'Họ tên chỉ được chứa chữ cái và khoảng trắng!';

        const email = formData.email.trim();
        if (!email) e.email = 'Email liên lạc không được để trống!';
        else if (!emailRegex.test(email)) e.email = 'Email không đúng định dạng! (VD: abc@gmail.com)';

        const phone = formData.phoneNumber.trim();
        if (!phone) e.phoneNumber = 'Số điện thoại không được để trống!';
        else if (!phoneRegex.test(phone)) e.phoneNumber = 'SĐT không hợp lệ! Phải 10 số, bắt đầu 03x...';

        if (!formData.roleId) e.roleId = 'Vui lòng chọn vai trò!';
        if (!formData.createdAt) e.createdAt = 'Vui lòng chọn ngày vào làm!';

        const pureSalary = Number(String(formData.baseSalary).replace(/\./g, ""));
        if (isNaN(pureSalary) || pureSalary < 0) e.baseSalary = 'Lương cơ bản không hợp lệ!';
        else if (pureSalary > 100000000) e.baseSalary = 'Lương cơ bản tối đa 100 triệu!';

        const un = formData.username.trim();
        if (!un) e.username = 'Tên đăng nhập không được để trống!';
        else if (!usernameRegex.test(un)) e.username = 'Tên đăng nhập 4-30 ký tự, chỉ gồm a-z, 0-9, dấu _!';

        if (!formData.password || formData.password.length < 6) e.password = 'Mật khẩu phải từ 6 ký tự trở lên!';

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setErrorMsg('');
        const pureSalary = Number(String(formData.baseSalary).replace(/\./g, ""));
        const payloadToSend = { ...formData, baseSalary: pureSalary };
        try {
            const res = await api.post('/staff', payloadToSend);
            if (res.data?.success) {
                showNotification('Tạo nhân viên thành công!', 'success');
                onSuccess();
                return;
            }
            setErrorMsg(res.message ?? res.data?.message ?? 'Đã có lỗi xảy ra!');
        } catch (error) {
            console.log("CHI TIẾT LỖI TỪ API MÀN TẠO MỚI:", error);
            const serverMsg = error?.response?.data?.message
                || error?.data?.message
                || error?.message
                || 'Không thể kết nối tới server!';
            setErrorMsg(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    const leftStyle = { background: '#f8faff', borderRadius: '12px', padding: '20px', border: '1px solid #e0eaff' };
    const rightStyle = { background: '#f0fdf4', borderRadius: '12px', padding: '20px', border: '1px solid #bbf7d0' };

    return (
        <BaseModal onClose={onClose} maxWidth="920px" disableClose={loading}>
            <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px 32px', color: '#fff' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="fw-bold m-0"><i className="bi bi-person-plus-fill me-2" />Thêm Nhân Viên Mới</h5>
                            <small className="opacity-75">Điền đầy đủ thông tin bên dưới</small>
                        </div>
                        <button onClick={onClose} disabled={loading}
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>

                {errorMsg && <div style={{ padding: '16px 32px 0 32px' }}><AlertMessage type="danger" message={errorMsg} /></div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '24px 32px 32px 32px', maxHeight: '65vh', overflowY: 'auto' }}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div style={leftStyle}>
                                    <h6 className="fw-bold text-primary mb-3">
                                        <i className="bi bi-person-vcard-fill me-2" />Hồ Sơ Cá Nhân
                                    </h6>

                                    <div className="mb-3">
                                        <label className="small fw-bold">Họ và tên <span className="text-danger">*</span></label>
                                        <input type="text" name="fullName"
                                            className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                                            placeholder="Nguyễn Văn A" onChange={handleChange} />
                                        {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Email liên lạc <span className="text-danger">*</span></label>
                                        <input type="email" name="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            placeholder="abc@gmail.com" onChange={handleChange} />
                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Số điện thoại <span className="text-danger">*</span></label>
                                        <input type="text" name="phoneNumber"
                                            className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                                            placeholder="0901234567" maxLength={11} onChange={handleChange} />
                                        {errors.phoneNumber && <div className="invalid-feedback">{errors.phoneNumber}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Ngày vào làm</label>
                                        <input type="date" name="createdAt"
                                            className={`form-control ${errors.createdAt ? 'is-invalid' : ''}`}
                                            value={formData.createdAt} onChange={handleChange} />
                                        {errors.createdAt && <div className="invalid-feedback">{errors.createdAt}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div style={rightStyle}>
                                    <h6 className="fw-bold text-success mb-3">
                                        <i className="bi bi-briefcase-fill me-2" />Hệ Thống & Lương
                                    </h6>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Vai trò <span className="text-danger">*</span></label>
                                            <select name="roleId"
                                                className={`form-select ${errors.roleId ? 'is-invalid' : ''}`}
                                                onChange={handleChange}>
                                                <option value="">-- Chọn --</option>
                                                {roleList.map(role => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                            {errors.roleId && <div className="invalid-feedback">{errors.roleId}</div>}
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Trạng thái</label>
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
                                            <input type="text" name="baseSalary"
                                                className={`form-control ${errors.baseSalary ? 'is-invalid' : ''}`}
                                                value={formData.baseSalary} onChange={handleChange} />
                                            {errors.baseSalary && <div className="invalid-feedback">{errors.baseSalary}</div>}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">
                                            Tên đăng nhập <span className="text-danger">*</span>
                                        </label>
                                        <input type="text" name="username"
                                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                            placeholder="VD: nhanvien01" onChange={handleChange} />
                                        {errors.username
                                            ? <div className="invalid-feedback">{errors.username}</div>
                                            : <small className="text-muted">4-30 ký tự, chỉ a-z, 0-9, dấu _</small>
                                        }
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Mật khẩu <span className="text-danger">*</span></label>
                                        <div className="input-group">
                                            <input type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                placeholder="Tối thiểu 6 ký tự" onChange={handleChange} />
                                            <button className="btn btn-outline-secondary" type="button"
                                                onClick={() => setShowPassword(!showPassword)}>
                                                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                                            </button>
                                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '20px 32px', borderTop: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn btn-light border px-4 fw-bold" style={{ borderRadius: '12px' }}
                            onClick={onClose} disabled={loading}>Hủy</button>
                        <button type="submit" className="btn text-white px-4 fw-bold"
                            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '12px' }}
                            disabled={loading}>
                            {loading
                                ? <><span className="spinner-border spinner-border-sm me-2" />Đang lưu...</>
                                : <><i className="bi bi-floppy-fill me-2" />Lưu Nhân Viên</>}
                        </button>
                    </div>
                </form>
            </div>
        </BaseModal>
    );
};
export default StaffCreateModal;