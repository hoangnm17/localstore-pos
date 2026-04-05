import React, { useEffect } from 'react';
import BaseModal from '../../../components/common/BaseModal';

const ROLE_NAME_MAP = {
    'Manager': 'Quản lý',
    'Cashier': 'Thu ngân',
    'Warehouse': 'Thủ kho'
};

const SalaryDetailModal = ({ row, month, year, onClose, autoPrint = false }) => {
    useEffect(() => {
        if (autoPrint && row) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoPrint, row]);

    if (!row) return null;

    const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

    const penalties = row.penaltyDetails ? row.penaltyDetails.split(';').map(s => s.trim()).filter(s => s) : [];

    return (
        <BaseModal onClose={onClose} maxWidth="500px">
            <style>
                {`
                @media print {
                    @page { 
                        size: A4; 
                        margin: 20mm; 
                    }
                    body { 
                        background: none !important; 
                        padding: 0 !important; 
                        margin: 0 !important; 
                    }
                    body * { visibility: hidden; }
                    #salary-slip-print, #salary-slip-print * { visibility: visible; }
                    #salary-slip-print { 
                        position: absolute; 
                        left: 0; 
                        top: 0;
                        width: 100% !important; 
                        padding: 0 !important;
                        box-shadow: none !important;
                        background: #fff !important;
                        border: none !important;
                    }
                    .no-print { display: none !important; }
                    .bg-light { 
                        background-color: #f8f9fa !important; 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact;
                    }
                }
                `}
            </style>

            <div id="salary-slip-print" className="bg-white rounded-4 shadow-lg overflow-hidden border">
                {/* Header (Web Only) */}
                <div className="no-print p-2 px-3 d-flex justify-content-between align-items-center" style={{ background: '#0891b2', color: '#fff' }}>
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-file-earmark-person-fill fs-5"></i>
                        <span className="fw-bold small">PHIẾU LƯƠNG NHÂN VIÊN</span>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-light fw-bold py-0 px-2" style={{ fontSize: '0.75rem' }} onClick={() => window.print()}>
                            <i className="bi bi-printer-fill me-1"></i>In
                        </button>
                        <button className="btn btn-sm btn-link text-white text-decoration-none fs-4 px-2 py-0" onClick={onClose}>&times;</button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-4">
                    <div className="text-center mb-3 pb-2 border-bottom">
                        <h5 className="fw-bold text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '1rem' }}>LocalStore POS</h5>
                        <p className="mb-0 text-secondary" style={{ fontSize: '0.75rem' }}>Kỳ lương: Tháng {month} / {year}</p>
                    </div>

                    <div className="row mb-3 bg-light p-2 rounded-3 mx-0 border" style={{ fontSize: '0.85rem' }}>
                        <div className="col-7 mb-1 font-weight-bold">
                            <span className="text-muted small">NV:</span> {row.fullName}
                        </div>
                        <div className="col-5 mb-1 text-end">
                            <span className="badge bg-primary" style={{ fontSize: '0.7rem' }}>{ROLE_NAME_MAP[row.roleName] || row.roleName}</span>
                        </div>
                        <div className="col-7">
                            <span className="text-muted small">Hình thức:</span> {row.salaryType === 'hourly' ? 'Theo giờ' : 'Cố định'}
                        </div>
                        <div className="col-5 text-end text-muted small">
                            {new Date().toLocaleDateString('vi-VN')}
                        </div>
                    </div>

                    <table className="table table-bordered mb-3" style={{ fontSize: '0.85rem' }}>
                        <thead className="bg-light text-center small fw-bold">
                            <tr>
                                <th className="py-1">DANH MỤC</th>
                                <th className="py-1">THÀNH TIỀN</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="ps-2 py-2">
                                    <div className="fw-bold">Lương cơ sở</div>
                                    <small className="text-muted">{formatVND(row.baseSalary)} {row.salaryType === 'hourly' ? '/giờ' : ''}</small>
                                </td>
                                <td className="text-end align-middle fw-semibold">{formatVND(row.baseSalary)}</td>
                            </tr>
                            {row.salaryType !== 'hourly' && (
                                <tr>
                                    <td className="ps-2 py-2">
                                        <div className="fw-bold">Lương 1 ngày công</div>
                                        <small className="text-muted">26 ngày công/tháng</small>
                                    </td>
                                    <td className="text-end align-middle fw-semibold">{formatVND(row.baseSalary / 26)}</td>
                                </tr>
                            )}
                            <tr>
                                <td className="ps-2 py-2">
                                    <div className="fw-bold">Công thực tế</div>
                                    <small className="text-muted">
                                        {row.salaryType === 'hourly' ? `${row.totalHours} giờ` : `${row.workingDays} ngày`}
                                    </small>
                                </td>
                                <td className="text-end align-middle fw-semibold">{formatVND(row.grossSalary)}</td>
                            </tr>
                            {row.deductions > 0 && (
                                <tr>
                                    <td className="ps-2 py-2 text-danger">
                                        <div className="fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>Khấu trừ vi phạm</div>
                                    </td>
                                    <td className="text-end align-middle text-danger fw-bold">-{formatVND(row.deductions)}</td>
                                </tr>
                            )}
                            <tr className="bg-light">
                                <td className="text-end py-2 fw-bold">TỔNG THỰC LĨNH:</td>
                                <td className="text-end py-2 fw-bold text-success fs-6">{formatVND(row.netSalary)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {penalties.length > 0 && (
                        <div className="mb-3 border p-2 rounded-2" style={{ background: '#fffcf5', fontSize: '0.75rem' }}>
                            <div className="fw-bold border-bottom pb-1 mb-1 text-warning-emphasis">
                                Chi tiết vi phạm:
                            </div>
                            <ul className="m-0 ps-3" style={{ lineHeight: '1.4' }}>
                                {penalties.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="row mt-4 text-center" style={{ fontSize: '0.75rem' }}>
                        <div className="col-6">
                            <p className="fw-bold mb-4 small">Người Nhận</p>
                            <div className="mt-3 text-muted text-decoration-underline">(Ký tên)</div>
                        </div>
                        <div className="col-6">
                            <p className="fw-bold mb-4 small">Xác Nhận Quản lý</p>
                            <div className="mt-3 text-muted text-decoration-underline">(Ký tên)</div>
                        </div>
                    </div>

                    <div className="text-center mt-4 no-print">
                        <button className="btn btn-secondary btn-sm px-4 rounded-pill" onClick={onClose}>Đóng</button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default SalaryDetailModal;