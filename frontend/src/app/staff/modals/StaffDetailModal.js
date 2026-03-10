import React, { useState, useEffect } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import api from '../../../services/axiosInstance';
const StaffDetailModal = ({ staffId, onClose, onEdit }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchStaffData = async () => {
            try {
                const res = await api.get(`/staff/detail`, { params: { id: staffId } });
                if (res.data.success && res.data.data) {
                    const s = res.data.data;
                    setData({
                        ...s,
                        createdAt: s.createdAt ? s.createdAt.split('T')[0] : ''
                    });
                }
            } catch (err) {
                console.error('Lỗi tải chi tiết:', err);
            } finally {
                setLoading(false);
            }
        };
        if (staffId) fetchStaffData();
    }, [staffId]);

    // const roleLabel = { '1': 'Manager', '2': 'Cashier', '3': 'Warehouse' };
    if (loading) return (
        <BaseModal onClose={onClose} maxWidth="860px">
            <div style={{ background: '#fff', borderRadius: '20px', padding: '60px', textAlign: 'center' }}>
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3 text-secondary fw-bold">Đang tải thông tin...</p>
            </div>
        </BaseModal>
    );
    return (
        <BaseModal onClose={onClose} maxWidth="860px">
            <div style={{
                background: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.15)'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    padding: '24px 32px',
                    color: '#fff'
                }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div style={{
                                width: 52, height: 52, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.4rem', fontWeight: 'bold', flexShrink: 0
                            }}>
                                {data?.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                                <h5 className="fw-bold m-0">{data?.fullName}</h5>
                                <small className="opacity-75">
                                    <i className="bi bi-eye-fill me-1" />
                                    Chi Tiết Thông Tin Nhân Viên
                                </small>
                            </div>
                        </div>
                        <button onClick={onClose}
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>
                <div style={{ padding: '32px', maxHeight: '65vh', overflowY: 'auto' }}>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div style={{
                                background: '#f8faff', borderRadius: '12px',
                                padding: '20px', border: '1px solid #e0eaff'
                            }}>
                                <h6 className="fw-bold text-primary mb-3">
                                    <i className="bi bi-person-vcard-fill me-2" />
                                    Hồ Sơ Cá Nhân
                                </h6>
                                {[
                                    { label: 'Họ và tên', value: data?.fullName, icon: 'bi-person-fill' },
                                    { label: 'Email (Tài khoản)', value: data?.email, icon: 'bi-envelope-fill' },
                                    { label: 'Số điện thoại', value: data?.phoneNumber, icon: 'bi-telephone-fill' },
                                    { label: 'Ngày vào làm', value: data?.createdAt, icon: 'bi-calendar3' },
                                ].map(({ label, value, icon }) => (
                                    <div key={label} className="mb-3">
                                        <label className="small fw-bold text-secondary">
                                            <i className={`bi ${icon} me-1`} />{label}
                                        </label>
                                        <div className="form-control bg-white" style={{ color: '#1e293b', fontWeight: 500 }}>
                                            {value || '—'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div style={{
                                background: '#f0fdf4', borderRadius: '12px',
                                padding: '20px', border: '1px solid #bbf7d0'
                            }}>
                                <h6 className="fw-bold text-success mb-3">
                                    <i className="bi bi-briefcase-fill me-2" />
                                    Tài Khoản & Lương
                                </h6>
                                <div className="mb-3">
                                    <label className="small fw-bold text-secondary">
                                        <i className="bi bi-shield-check me-1" />Vai trò
                                    </label>
                                    <div>
                                        <span className={`badge px-3 py-2 fs-6 rounded-pill ${
                                            data?.roleName === 'Manager' ? 'bg-primary' :
                                            data?.roleName === 'Cashier' ? 'bg-success' : 'bg-warning text-dark'
                                        }`}>{data?.roleName}</span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="small fw-bold text-secondary">
                                        <i className="bi bi-toggle-on me-1" />Trạng thái
                                    </label>
                                    <div>
                                        <span className={`badge px-3 py-2 rounded-pill ${
                                            data?.isActive === 'active'
                                                ? 'bg-success-subtle text-success border border-success'
                                                : 'bg-danger-subtle text-danger border border-danger'
                                        }`}>
                                            <i className={`bi ${data?.isActive === 'active' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`} />
                                            {data?.isActive === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="small fw-bold text-secondary">
                                        <i className="bi bi-wallet2 me-1" />Loại lương
                                    </label>
                                    <div className="form-control bg-white">
                                        {data?.salaryType === 'hourly' ? 'Theo giờ' : 'Theo tháng'}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="small fw-bold text-secondary">
                                        <i className="bi bi-cash-coin me-1" />Lương cơ bản
                                    </label>
                                    <div className="form-control bg-white fw-bold text-success">
                                        {data?.baseSalary?.toLocaleString()} VNĐ
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{
                    padding: '20px 32px',
                    borderTop: '1px solid #f0f0f0',
                    background: '#fafafa',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button
                        className="btn btn-light border px-4 fw-bold"
                        style={{ borderRadius: '12px' }}
                        onClick={onClose}
                    >
                        <i className="bi bi-x-lg me-2" />Đóng
                    </button>
                    <button
                        className="btn text-white px-4 fw-bold"
                        style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            border: 'none',
                            borderRadius: '12px'
                        }}
                        onClick={() => onEdit(staffId)}
                    >
                        <i className="bi bi-pencil-square me-2" />Chỉnh Sửa
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};
export default StaffDetailModal;
