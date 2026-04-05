import React, { useState, useEffect } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import AlertMessage from '../../../components/common/AlertMessage';
import ConfirmModal from '../../../components/common/ConfirmModal'; 
import { useNotification } from '../../../components/global/Notification/NotificationContext';
import { updateStaff, getStaffRoles, getStaffDetail, resetStaffPassword } from '../../../services/Staff/staff.service';

const StaffUpdateModal = ({ staffId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    
    const [currentUserId, setCurrentUserId] = useState(null); 
    const [errorMsg, setErrorMsg] = useState('');
    const [errorType, setErrorType] = useState('danger');
    const [originalData, setOriginalData] = useState(null);
    const { showNotification } = useNotification();
    const [roleList, setRoleList] = useState([]);

    const [formData, setFormData] = useState({
        username: '', fullName: '', email: '', phoneNumber: '',
        roleId: '', salaryType: 'hourly', baseSalary: 0,
        isActive: '', employmentStatus: 'working', createdAt: ''
    });

    const getVietnameseRole = (roleName) => {
        if (!roleName) return '';
        const roleMap = {
            'manager': 'Quản lý',
            'cashier': 'Thu ngân',
            'warehouse': 'Thủ Kho',
        };
        return roleMap[roleName.toLowerCase()] || roleName;
    };
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await getStaffRoles();
                if (res?.success) setRoleList(res.data);
            } catch (error) {}
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        const fetchStaffData = async () => {
            try {
                const res = await getStaffDetail(staffId);
                if (res?.success) {
                    const s = res.data;
                    setCurrentUserId(s.userId); 
                    const data = {
                        username: s.username || '', fullName: s.fullName || '',
                        email: s.email || '', phoneNumber: s.phoneNumber || '',
                        roleId: s.roleId?.toString() || '', salaryType: s.salaryType || 'hourly',
                        baseSalary: s.baseSalary ? Number(s.baseSalary).toLocaleString("vi-VN") : "",
                        isActive: s.isActive || 'active', employmentStatus: s.employmentStatus || 'working',
                        createdAt: s.createdAt ? s.createdAt.split('T')[0] : ''
                    };
                    setFormData(data);
                    setOriginalData(data);
                }
            } catch { 
                setErrorMsg('Lỗi kết nối Server! Không thể tải dữ liệu.'); 
            } finally { setLoading(false); }
        };
        if (staffId) fetchStaffData();
    }, [staffId]);

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
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setErrorMsg('');
    };

    const validate = () => {
        const nameRegex = /^[\p{L}]+([\s\p{L}]+)*$/u;
        const phoneRegex = /^0[35789][0-9]{8}$/;
        const usernameRegex = /^[a-zA-Z0-9_]{4,30}$/;

        if (originalData) {
            const isChanged = Object.keys(formData).some(k => String(formData[k]) !== String(originalData[k]));
            if (!isChanged) return { msg: 'Bạn chưa chỉnh sửa thông tin nào!', type: 'warning' };
        }

        const name = formData.fullName?.trim();
        if (!name) return { msg: 'Họ tên không được để trống!', type: 'danger' };
        if (!nameRegex.test(name)) return { msg: 'Họ tên chỉ được chứa chữ cái và khoảng trắng!', type: 'danger' };

        const phone = formData.phoneNumber?.trim();
        if (!phone) return { msg: 'Số điện thoại không được để trống!', type: 'danger' };
        if (!phoneRegex.test(phone)) return { msg: 'SĐT không hợp lệ! Phải 10 số, bắt đầu 03x/05x/07x/08x/09x', type: 'danger' };

        if (!formData.roleId) return { msg: 'Vui lòng chọn vai trò!', type: 'danger' };
        if (!formData.createdAt) return { msg: 'Vui lòng chọn ngày vào làm!', type: 'danger' };

        const pureSalary = Number(String(formData.baseSalary).replace(/\./g, ""));
        if (isNaN(pureSalary) || pureSalary < 0) return { msg: 'Lương cơ bản không được âm!', type: 'danger' };
        if (pureSalary > 100000000) return { msg: 'Lương cơ bản không hợp lệ (tối đa 100 triệu)!', type: 'danger' };

        const un = formData.username?.trim();
        if (!un) return { msg: 'Tên đăng nhập không được để trống!', type: 'danger' };
        if (!usernameRegex.test(un)) return { msg: 'Tên đăng nhập 4-30 ký tự, chỉ gồm a-z, 0-9, dấu _!', type: 'danger' };

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setErrorType(err.type); return setErrorMsg(err.msg); }
        setSaving(true);
        setErrorMsg('');
        const pureSalary = Number(String(formData.baseSalary).replace(/\./g, ""));
        const payloadToSend = { ...formData, id: staffId, baseSalary: pureSalary };
        try {
            const res = await updateStaff(payloadToSend); 
            if (res?.success) {
                showNotification('Cập nhật thông tin nhân viên thành công!', 'success');
                onSuccess();
                return;
            }
            setErrorType('danger');
            setErrorMsg(res.message ?? 'Cập nhật thất bại!');
        } catch (error) {
            setErrorMsg(error?.response?.data?.message || 'Không kết nối được server!');
            setErrorType('danger');
        } finally { setSaving(false) }
    };

    const handleExecuteResetPassword = async () => {
        setShowConfirmReset(false); 
        try {
            setSaving(true);
            const res = await resetStaffPassword(currentUserId);
            showNotification(res.message, 'success');
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Lỗi reset mất kết nối!");
            setErrorType('danger');
        } finally {
            setSaving(false);
        }
    };

    const leftStyle = { background: '#f8faff', borderRadius: '12px', padding: '20px', border: '1px solid #e0eaff' };
    const rightStyle = { background: '#f0fdf4', borderRadius: '12px', padding: '20px', border: '1px solid #bbf7d0' };

    if (loading) return (
        <BaseModal onClose={onClose} maxWidth="920px">
            <div style={{ background: '#fff', borderRadius: '20px', padding: '60px', textAlign: 'center' }}>
                <div className="spinner-border text-success" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3 text-secondary fw-bold">Đang tải hồ sơ nhân viên...</p>
            </div>
        </BaseModal>
    );

    return (
        <BaseModal onClose={onClose} maxWidth="920px" disableClose={saving}>
            <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                <div style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', padding: '24px 32px', color: '#fff' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 'bold' }}>
                                {formData.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <h5 className="fw-bold m-0">Chỉnh Sửa Nhân Viên</h5>
                                <small className="opacity-75">{formData.fullName}</small>
                            </div>
                        </div>
                        <button onClick={onClose} disabled={saving} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>

                {errorMsg && <div style={{ padding: '16px 32px 0 32px' }}><AlertMessage type={errorType} message={errorMsg} /></div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '24px 32px 32px 32px', maxHeight: '65vh', overflowY: 'auto' }}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div style={leftStyle}>
                                    <h6 className="fw-bold text-primary mb-3">Hồ Sơ Cá Nhân</h6>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Họ và tên <span className="text-danger">*</span></label>
                                        <input type="text" name="fullName" className="form-control" value={formData.fullName} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Email liên lạc</label>
                                        <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Số điện thoại <span className="text-danger">*</span></label>
                                        <input type="text" name="phoneNumber" className="form-control" value={formData.phoneNumber} maxLength={11} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="small fw-bold">Ngày vào làm</label>
                                        <input type="date" name="createdAt" className="form-control" value={formData.createdAt} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-6">
                                <div style={rightStyle}>
                                    <h6 className="fw-bold text-success mb-3">Tài Khoản Và Lương</h6>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Vai trò <span className="text-danger">*</span></label>
                                            <select name="roleId" className="form-select" value={formData.roleId} onChange={handleChange}>
                                                <option value="">-- Chọn --</option>
                                                {roleList.map(role => <option key={role.id} value={role.id}>{getVietnameseRole(role.name)}</option>)}
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
                                    <div className="row mb-2">
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Loại lương</label>
                                            <select name="salaryType" className="form-select" value={formData.salaryType} onChange={handleChange}>
                                                <option value="hourly">Theo giờ</option>
                                                <option value="monthly">Theo tháng</option>
                                            </select>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="small fw-bold">Lương cơ bản</label>
                                            <input type="text" name="baseSalary" className="form-control" value={formData.baseSalary} onChange={handleChange} />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="small fw-bold">
                                            Tên đăng nhập <span className="text-danger">*</span>
                                        </label>
                                        <input type="text" name="username" className="form-control mb-3" value={formData.username} onChange={handleChange} />
                                        
                                        <button type="button" 
                                            disabled={saving || !currentUserId}
                                            onClick={() => setShowConfirmReset(true)}
                                            className="btn w-100 fw-bold hover-shadow"
                                            style={{ background: '#ffffff', color: '#b91c1c', border: '1.5px solid #fca5a5', borderRadius: '8px' }}>
                                            <i className="bi bi-arrow-counterclockwise fw-bold me-2" />
                                            Đặt lại mật khẩu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '20px 32px', borderTop: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn btn-light border px-4 fw-bold" style={{ borderRadius: '12px' }} onClick={onClose} disabled={saving}>Hủy</button>    
                        <button type="submit" className="btn text-white px-4 fw-bold" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', borderRadius: '12px' }} disabled={saving}>
                            {saving ? <><span className="spinner-border spinner-border-sm me-2" />Đang lưu...</> : <>Cập Nhật</>}
                        </button>
                    </div>
                </form>
            </div>

            {showConfirmReset && (
                <ConfirmModal
                    title="KHÔI PHỤC MẬT KHẨU"
                    message={
                        <>
                        Bạn có chắc chắn muốn khôi phục mật khẩu của <b>{formData.fullName}</b> về <b>123456</b>? 
                        Người dùng sẽ phải đổi mật khẩu ở lần đăng nhập tiếp theo.                        
                        </>
                    }
                    confirmText="Đồng ý"
                    onConfirm={handleExecuteResetPassword}
                    onCancel={() => setShowConfirmReset(false)}
                />
            )}
        </BaseModal>
    );
};
export default StaffUpdateModal;
