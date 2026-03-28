import React from 'react';

const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

const DailyAuditModal = ({ workDate, auditData, daySummary, onClose }) => {
    const isReadyToClose = auditData?.pendingShifts === 0;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '500px' }}>
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

                    {/* Header */}
                    <div className="modal-header border-0 bg-primary text-white p-3">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-file-earmark-check-fill me-2" />
                            Tổng Kết Ngày: {new Date(workDate).toLocaleDateString('vi-VN')}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>

                    <div className="modal-body p-4" id="daily-audit-print" style={{ background: '#fff' }}>
                        {/* CSS cho in ấn */}
                        <style>
                            {`
                            @media print {
                                body * { visibility: hidden !important; }
                                #daily-audit-print, #daily-audit-print * { visibility: visible !important; }
                                #daily-audit-print {
                                    position: fixed !important;
                                    left: 0 !important; top: 0 !important;
                                    width: 100% !important;
                                    padding: 20px !important;
                                    background: white !important;
                                    height: 100% !important;
                                }
                                .modal-header, .modal-footer { display: none !important; }
                            }
                            `}
                        </style>

                        <div className="text-center mb-4">
                            <h4 className="fw-bold mb-1">BIÊN BẢN ĐỐI SOÁT CUỐI NGÀY</h4>
                            <p className="text-secondary small mb-0">LocalStore POS - Chi nhánh mặc định</p>
                            <p className="text-muted small mt-1">Ngày thực hiện: {new Date(workDate).toLocaleDateString('vi-VN')}</p>
                        </div>

                        {/* Audit Stats */}
                        <div className="card shadow-none border rounded-3 p-3 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-secondary fw-medium">Tình trạng ca làm:</span>
                                <span className={isReadyToClose ? "text-success fw-bold" : "text-danger fw-bold"}>
                                    {Number(auditData?.completedShifts || 0)}/{Number(auditData?.totalShifts || 0)} ca hoàn tất
                                </span>
                            </div>
                            {!isReadyToClose && (
                                <div className="alert alert-warning py-2 small mb-0 mt-2 border-0">
                                    <i className="bi bi-exclamation-triangle-fill me-2" />
                                    Còn {Number(auditData?.pendingShifts || 0)} ca đang chờ bàn giao tiền.
                                </div>
                            )}
                        </div>

                        {/* Money Stats */}
                        <div className="card shadow-none border rounded-3 overflow-hidden">
                            <div className="p-3 bg-white border-bottom d-flex justify-content-between">
                                <span className="text-secondary fw-medium">Tổng thu thực tế:</span>
                                <span className="fw-bold text-dark">{formatVND(daySummary?.totalActualCash)}</span>
                            </div>
                            <div className="p-3 bg-white border-bottom d-flex justify-content-between">
                                <span className="text-secondary fw-medium">Tổng tiền hệ thống:</span>
                                <span className="fw-bold text-dark">{formatVND(daySummary?.totalSystemCash)}</span>
                            </div>
                            <div className="p-3 d-flex justify-content-between align-items-center" style={{ background: '#f8fafc' }}>
                                <span className="fw-bold text-dark">TỔNG CHÊNH LỆCH:</span>
                                <span className={`fw-bold fs-5 ${daySummary?.totalDifference >= 0 ? "text-success" : "text-danger"}`}>
                                    {daySummary?.totalDifference > 0 ? '+' : ''}{formatVND(daySummary?.totalDifference)}
                                </span>
                            </div>
                        </div>

                        {/* Signatures for Print */}
                        <div className="row mt-5 d-none d-print-flex">
                            <div className="col-6 text-center">
                                <p className="fw-bold mb-5 small">QUẢN TRƯỞNG CA</p>
                                <p className="mb-0 small text-muted">(Ký tên)</p>
                            </div>
                            <div className="col-6 text-center">
                                <p className="fw-bold mb-5 small">QUẢN LÝ CỬA HÀNG</p>
                                <p className="mb-0 small text-muted">(Ký tên)</p>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer border-0 p-3 bg-white no-print">
                        <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={onClose}>Đóng</button>
                        <button type="button" className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={handlePrint}>
                            <i className="bi bi-printer-fill me-2" />In biên bản
                        </button>
                        {isReadyToClose ? (
                            <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold">
                                <i className="bi bi-check-circle-fill me-2" />Tổng kết thành công
                            </button>
                        ) : (
                            <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold disabled" style={{ opacity: 0.6 }}>
                                Chờ hết ca làm
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyAuditModal;
