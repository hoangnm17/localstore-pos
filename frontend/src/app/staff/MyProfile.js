import { useNotification } from 'components/global/Notification/NotificationContext';
import React, { useEffect, useState } from 'react';
import { changeMyPassword, getMyProfile } from 'services/Staff/staff.service';
import useTitle from "hooks/common/useTitle";

const MyProfile = () => {
    const [profile, setProfile] = useState(null);
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' });
    useTitle("Hồ Sơ Của Tôi")
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const { showNotification } = useNotification();

    const leftStyle = { background: '#f8faff', borderRadius: '12px', padding: '24px', border: '1px solid #e0eaff', height: '100%' };
    const rightInfoStyle = { background: '#f0fdf4', borderRadius: '12px', padding: '24px', border: '1px solid #bbf7d0', marginBottom: '24px' };
    const rightPassStyle = { background: '#fff', borderRadius: '12px', padding: '24px', border: '1px dashed #cbd5e1' };

    const getVietnameseRole = (role) => {
        if (!role) return '-';
        const roleMap = {
            'manager': 'Quản lý',
            'cashier': 'Thu ngân',
            'warehouse': 'Thủ kho'
        };
        return roleMap[role.toLowerCase()] || role;
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getMyProfile();
                setProfile(res.data);
            } catch (err) {
                showNotification("Lỗi quá trình tải hồ sơ!", "danger");
            }
        };
        fetchProfile();
    }, [showNotification]);

    const handleChangePass = async (e) => {
        e.preventDefault();
        try {
            await changeMyPassword(passData);
            showNotification("Cập nhật mật khẩu mới thành công!", "success");
            setPassData({ oldPassword: '', newPassword: '' });
        } catch (err) {
            showNotification(err.response?.data?.message || "Lỗi thay đổi mật khẩu!", "danger");
        }
    };

    if (!profile) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
        </div>
    );

    return (
        <div style={{ padding: '32px', width: '100%', margin: '0 auto' }}>
            <h3 className="fw-bold mb-4" style={{ color: '#1e293b' }}>
                HỒ SƠ CỦA TÔI
            </h3>
            <p className="text-secondary mb-4" style={{ fontSize: '0.95rem' }}>
                Xem thông tin cá nhân của tôi
            </p>

            <div className="row g-4">
                {/* THÔNG TIN CÁ NHÂN*/}
                <div className="col-md-5">
                    <div style={leftStyle}>
                        <h6 className="fw-bold text-primary mb-4 border-bottom pb-3">
                            Hồ sơ Cá Nhân
                        </h6>
                        <div className="mb-3">
                            <label className="small fw-bold text-secondary mb-1">Họ và tên</label>
                            <input type="text" className="form-control bg-white fw-bold" disabled value={profile.fullName || '-'} />
                        </div>
                        <div className="mb-3">
                            <label className="small fw-bold text-secondary mb-1">Email liên lạc</label>
                            <input type="text" className="form-control bg-white" disabled value={profile.email || '-'} />
                        </div>
                        <div className="mb-3">
                            <label className="small fw-bold text-secondary mb-1">Số điện thoại</label>
                            <input type="text" className="form-control bg-white" disabled value={profile.phoneNumber || '-'} />
                        </div>
                        <div className="mb-3">
                            <label className="small fw-bold text-secondary mb-1">Ngày vào làm</label>
                            <input type="date" className="form-control bg-white" disabled value={profile.createdAt ? profile.createdAt.split('T')[0] : ''} />
                        </div>
                        <p className="mt-4 mb-0 small text-muted fst-italic">
                            * Vui lòng liên hệ Quản lý nếu các thông tin cá nhân trên bị sai lệch.
                        </p>
                    </div>
                </div>

                <div className="col-md-7">

                    {/* Lương & Tài khoản */}
                    <div style={rightInfoStyle}>
                        <h6 className="fw-bold text-success mb-4 border-bottom pb-3">
                            Tài Khoản & Lương
                        </h6>
                        <div className="row mb-3">
                            <div className="col-6">
                                <label className="small fw-bold text-secondary mb-1">Vai trò</label>
                                <input type="text" className="form-control bg-white fw-bold text-success" disabled
                                    value={getVietnameseRole(profile.roleName)} />
                            </div>
                            <div className="col-6">
                                <label className="small fw-bold text-secondary mb-1">Trạng thái</label>
                                <input type="text" className="form-control bg-white fw-bold" disabled style={{ color: profile.isActive === 'active' ? '#16a34a' : '#d97706' }}
                                    value={profile.isActive === 'active' ? 'Đang hoạt động' : 'Tạm khóa'} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6">
                                <label className="small fw-bold text-secondary mb-1">Loại lương</label>
                                <input type="text" className="form-control bg-white fw-bold text-success" disabled
                                    value={profile.salaryType === 'monthly' ? 'Theo Tháng' : 'Theo Giờ'} />
                            </div>
                            <div className="col-6">
                                <label className="small fw-bold text-secondary mb-1">Lương cơ bản</label>
                                <input type="text" className="form-control bg-white fw-bold text-success" disabled
                                    value={`${profile.baseSalary ? profile.baseSalary.toLocaleString('vi-VN') : 0} VNĐ`} />
                            </div>
                        </div>
                    </div>

                    {/*Đổi Mật Khẩu */}
                    <div style={rightPassStyle}>
                        <h6 className="fw-bold text-secondary mb-3 border-bottom pb-3">
                            Thiết Lập Lại Mật khẩu
                        </h6>
                        <form onSubmit={handleChangePass}>
                            <div className="row">
                                <div className="col-6 mb-3">
                                    <label className="small fw-bold text-secondary mb-1">
                                        Mật khẩu Cũ
                                    </label>
                                    <div className="position-relative">
                                        <input 
                                            type={showOldPassword ? "text" : "password"} 
                                            className="form-control text-center tracking-widest font-mono fw-bold"
                                            style={{ paddingRight: '40px' }} 
                                            value={passData.oldPassword} 
                                            onChange={e => setPassData({ ...passData, oldPassword: e.target.value })} 
                                            required 
                                        />
                                        <i 
                                            className={`bi ${showOldPassword ? 'bi-eye-slash' : 'bi-eye'} position-absolute top-50 translate-middle-y`}
                                            style={{ right: '10px', cursor: 'pointer', color: '#64748b' }}
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                        ></i>
                                    </div>
                                </div>
                                <div className="col-6 mb-3">
                                    <label className="small fw-bold text-success mb-1">
                                        Mật khẩu Mới
                                    </label>
                                    <div className="position-relative">
                                        <input 
                                            type={showNewPassword ? "text" : "password"} 
                                            className="form-control text-center tracking-widest font-mono fw-bold text-success"
                                            style={{ paddingRight: '40px' }} 
                                            value={passData.newPassword} 
                                            onChange={e => setPassData({ ...passData, newPassword: e.target.value })} 
                                            required 
                                            minLength="6" 
                                        />
                                        <i 
                                            className={`bi ${showNewPassword ? 'bi-eye-slash' : 'bi-eye'} position-absolute top-50 translate-middle-y`}
                                            style={{ right: '10px', cursor: 'pointer', color: '#16a34a' }}
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        ></i>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-secondary w-100 fw-bold py-2 mt-2" style={{ borderRadius: '8px' }}>
                                Lưu Mật Khẩu mới
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MyProfile;