import React, { useState, useEffect } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import { getStaffDetail } from '../../../services/Staff/staff.service';

const StaffDetailModal = ({ staffId, onClose, onEdit }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

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
        const fetchStaffData = async () => {
            try {
                const res = await getStaffDetail(staffId);
                if (res?.success && res?.data) {
                    const s = res.data;
                    setData({ ...s, createdAt: s.createdAt ? s.createdAt.split('T')[0] : '' });
                }
            } catch (err) { console.error('Lỗi tải chi tiết:', err); }
            finally { setLoading(false); }
        };
        if (staffId) fetchStaffData();
    }, [staffId]);

    const roleBadgeColor = data?.roleName === 'Manager' ? '#6366f1' : data?.roleName === 'Cashier' ? '#22c55e' : '#f59e0b';
    const employBadge = data?.employmentStatus === 'working'
        ? { label: 'Đang làm việc', color: 'bg-success-subtle text-success border border-success', icon: 'bi-briefcase-fill' }
        : { label: 'Đã nghỉ việc', color: 'bg-warning-subtle text-warning border border-warning', icon: 'bi-person-dash-fill' };

    const leftStyle  = { background: '#f8faff', borderRadius: '12px', padding: '20px', border: '1px solid #e0eaff' };
    const rightStyle = { background: '#f0fdf4', borderRadius: '12px', padding: '20px', border: '1px solid #bbf7d0' };

    const InfoRow = ({ label, icon, value, children }) => (
        <div className="mb-3">
            <label className="small fw-bold text-secondary">
                <i className={`bi ${icon} me-1`} />{label}
            </label>
            {children ?? (
                <div className="form-control bg-white" style={{ color: '#1e293b', fontWeight: 500 }}>
                    {value || '—'}
                </div>
            )}
        </div>
    );

    if (loading) return (
        <BaseModal onClose={onClose} maxWidth="900px">
            <div style={{ background: '#fff', borderRadius: '20px', padding: '60px', textAlign: 'center' }}>
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3 text-secondary fw-bold">Đang tải thông tin...</p>
            </div>
        </BaseModal>
    );

    return (
        <BaseModal onClose={onClose} maxWidth="900px">
            <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                {/* HEADER */}
                <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', padding: '24px 32px', color: '#fff' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>
                                {data?.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <h5 className="fw-bold m-0">{data?.fullName}</h5>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                    <span className="badge rounded-pill" style={{ background: roleBadgeColor, fontSize: '0.75rem' }}>
                                        {data?.roleName}
                                    </span>
                                    <small className="opacity-75">
                                        <i className="bi bi-at me-1" />{data?.username}
                                    </small>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose}
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>
                {/* BODY */}
                <div style={{ padding: '28px 32px', maxHeight: '65vh', overflowY: 'auto' }}>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div style={leftStyle}>
                                <h6 className="fw-bold text-primary mb-3">
                                    <i className="bi bi-person-vcard-fill me-2" />Hồ Sơ Cá Nhân
                                </h6>
                                <InfoRow label="Họ và tên" icon="bi-person-fill" value={data?.fullName} />
                                <InfoRow label="Email liên lạc" icon="bi-envelope-fill" value={data?.email} />
                                <InfoRow label="Số điện thoại" icon="bi-telephone-fill" value={data?.phoneNumber} />
                                <InfoRow label="Ngày vào làm" icon="bi-calendar3" value={data?.createdAt} />
                                <InfoRow label="Tình trạng nhân sự" icon="bi-person-badge-fill">
                                    <div className="mt-1">
                                        <span className={`badge px-3 py-2 rounded-pill ${employBadge.color}`}>
                                            <i className={`bi ${employBadge.icon} me-1`} />
                                            {employBadge.label}
                                        </span>
                                    </div>
                                </InfoRow>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div style={rightStyle}>
                                <h6 className="fw-bold text-success mb-3">
                                    <i className="bi bi-briefcase-fill me-2" />Tài Khoản & Lương
                                </h6>
                                <InfoRow label="Vai trò" icon="bi-shield-check">
                                    <div className="mt-1">
                                        <span className="badge px-3 py-2 fs-6 rounded-pill" style={{ background: roleBadgeColor }}>
                                            {getVietnameseRole(data?.roleName)}
                                        </span>
                                    </div>
                                </InfoRow>
                                <InfoRow label="Trạng thái tài khoản" icon="bi-toggle-on">
                                    <div className="mt-1">
                                        <span className={`badge px-3 py-2 rounded-pill ${data?.isActive === 'active' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'}`}>
                                            <i className={`bi ${data?.isActive === 'active' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`} />
                                            {data?.isActive === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                                        </span>
                                    </div>
                                </InfoRow>
                                <InfoRow label="Tên đăng nhập" icon="bi-person-circle" value={data?.username} />
                                <InfoRow label="Loại lương" icon="bi-wallet2"
                                    value={data?.salaryType === 'hourly' ? 'Theo giờ' : 'Theo tháng'} />
                                <InfoRow label="Lương cơ bản" icon="bi-cash-coin">
                                    <div className="form-control bg-white fw-bold text-success">
                                        {data?.baseSalary?.toLocaleString('vi-VN')} VNĐ
                                    </div>
                                </InfoRow>
                            </div>
                        </div>
                    </div>
                </div>
                {/* FOOTER */}
                <div style={{ padding: '20px 32px', borderTop: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button className="btn btn-light border px-4 fw-bold" style={{ borderRadius: '12px' }} onClick={onClose}>
                        <i className="bi bi-x-lg me-2" />Đóng
                    </button>
                    <button className="btn text-white px-4 fw-bold"
                        style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', borderRadius: '12px' }}
                        onClick={() => onEdit(staffId)}>
                        <i className="bi bi-pencil-square me-2" />Chỉnh Sửa
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};
export default StaffDetailModal;
