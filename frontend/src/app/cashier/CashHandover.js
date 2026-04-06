import React, { useState, useEffect, useMemo } from 'react';
import BaseModal from '../../components/common/BaseModal';
import AlertMessage from '../../components/common/AlertMessage';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import {
    getPendingShifts,
    getSystemCash,
    submitHandover,
} from '../../services/Cashier/cashier.service';
import {
    formatVND,
    parseVND,
    formatDisplayDate,
} from './utils/cashier.utils';

const CashHandover = ({ staffInfo, todayStr, onClose, onSuccess }) => {
    const { showNotification } = useNotification();

    const [loading, setLoading] = useState(false);
    const [loadingCashInfo, setLoadingCashInfo] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [pendingShifts, setPendingShifts] = useState([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');

    const [openingCash, setOpeningCash] = useState(0);
    const [systemCash, setSystemCash] = useState(0);
    const [salesCash, setSalesCash] = useState(0);
    const [returnCash, setReturnCash] = useState(0);

    const [actualCash, setActualCash] = useState('');
    const [note, setNote] = useState('');

    const selectedShift = useMemo(() => {
        return pendingShifts.find(
            (shift) => String(shift.scheduleId) === String(selectedScheduleId)
        );
    }, [pendingShifts, selectedScheduleId]);

    const actualCashNum = actualCash === '' ? 0 : actualCash;
    const expectedCash = openingCash + systemCash;
    const cashDiff = actualCashNum - expectedCash;

    useEffect(() => {
        const fetchPendingShifts = async () => {
            try {
                const res = await getPendingShifts(todayStr);

                if (res?.success) {
                    const shifts = res.data || [];
                    setPendingShifts(shifts);

                    if (shifts.length > 0) {
                        setSelectedScheduleId(shifts[0].scheduleId);
                    }
                }
            } catch (err) {
                setErrorMsg(err.message || 'Không thể tải danh sách ca cần bàn giao!');
            }
        };

        fetchPendingShifts();
    }, [todayStr]);

    useEffect(() => {
        const fetchCashInfo = async () => {
            if (!selectedScheduleId) {
                setOpeningCash(0);
                setSalesCash(0);
                setReturnCash(0);
                setSystemCash(0);
                return;
            }

            if (selectedShift) {
                setOpeningCash(selectedShift.openingCash || 0);
            }

            setLoadingCashInfo(true);
            setErrorMsg('');

            try {
                const res = await getSystemCash(selectedScheduleId);

                if (res?.success) {
                    const cashInfo = res.data?.systemCash || {};

                    setSalesCash(cashInfo.salesCash || 0);
                    setReturnCash(cashInfo.returnCash || 0);
                    setSystemCash(cashInfo.netSystemCash || 0);

                    if (cashInfo.openingCash !== undefined) {
                        setOpeningCash(cashInfo.openingCash);
                    }
                }
            } catch (err) {
                setErrorMsg(err.message || 'Lỗi tính toán doanh thu hệ thống!');
            } finally {
                setLoadingCashInfo(false);
            }
        };

        fetchCashInfo();
    }, [selectedScheduleId, selectedShift]);

    const handleActualCashChange = (e) => {
        const value = e.target.value;

        if (value === '') {
            setActualCash('');
        } else {
            setActualCash(parseVND(value));
        }

        setErrorMsg('');
    };

    const validateForm = () => {
        if (!selectedScheduleId) {
            return 'Vui lòng chọn ca cần kết!';
        }

        if (actualCash === '') {
            return 'Vui lòng nhập số tiền thực đếm trong két!';
        }

        if (cashDiff < 0 && !note.trim()) {
            return 'Vui lòng ghi lý do thất thoát!';
        }

        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setErrorMsg(validationError);
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            const res = await submitHandover({
                scheduleId: selectedScheduleId,
                openingCash,
                systemCash,
                actualCash: actualCashNum,
                note,
            });

            if (res?.success) {
                showNotification('Kết ca và bàn giao thành công!', 'success');

                const penalty = res.data?.penalty || 0;
                if (penalty > 0) {
                    showNotification(
                        `Cảnh báo: Bạn bị phạt ${penalty.toLocaleString('vi-VN')}đ do không tuân thủ giờ kết ca!`,
                        'warning'
                    );
                }

                onSuccess();
                return;
            }

            setErrorMsg(res?.message || 'Lỗi kết ca!');
        } catch (err) {
            setErrorMsg(err.message || 'Lỗi kết nối server!');
        } finally {
            setLoading(false);
        }
    };

    const leftStyle = {
        background: '#f8faff',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e0eaff',
        height: '100%',
    };

    const rightStyle = {
        background: '#f0fdf4',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #bbf7d0',
        height: '100%',
    };

    return (
        <BaseModal onClose={onClose} maxWidth="850px" disableClose={loading}>
            <div
                style={{
                    background: '#fff',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                }}
            >
                <div
                    style={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                        padding: '24px 32px',
                        color: '#fff',
                    }}
                >
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="fw-bold m-0">
                                <i className="bi bi-wallet2 me-2" />
                                Kết Ca & Bàn Giao Tiền Mặt
                            </h5>
                            <small className="opacity-75">
                                Vui lòng kiểm kê két tiền cẩn thận trước khi xác nhận
                            </small>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                            }}
                        >
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>

                {errorMsg && (
                    <div style={{ padding: '16px 32px 0 32px' }}>
                        <AlertMessage type="danger" message={errorMsg} />
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '24px 32px' }}>
                        <div className="row g-4">
                            <div className="col-md-5">
                                <div style={leftStyle}>
                                    <h6 className="fw-bold text-primary mb-3">
                                        Thông Tin Ca Làm
                                    </h6>

                                    <div className="mb-3">
                                        <label className="small fw-bold text-secondary mb-1">
                                            Ngày làm việc
                                        </label>
                                        <div className="form-control bg-white fw-bold">
                                            {formatDisplayDate(todayStr)}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="small fw-bold text-secondary mb-1">
                                            Thu ngân
                                        </label>
                                        <div className="form-control bg-white text-primary fw-bold">
                                            {staffInfo?.fullName || '---'}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="small fw-bold text-secondary mb-1">
                                            Ca cần bàn giao <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select border-primary fw-bold"
                                            value={selectedScheduleId}
                                            onChange={(e) => setSelectedScheduleId(e.target.value)}
                                        >
                                            {pendingShifts.length === 0 && (
                                                <option value="">-- Hết ca cần bàn giao --</option>
                                            )}

                                            {pendingShifts.map((shift) => (
                                                <option key={shift.scheduleId} value={shift.scheduleId}>
                                                    {shift.shiftName} ({shift.startTime} - {shift.endTime})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedScheduleId && (
                                        <div className="alert alert-info py-2 small mb-0 mt-3 border-0">
                                            <i className="bi bi-clock me-2" />
                                            Ca: <strong>{selectedShift?.shiftName}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-7">
                                <div style={rightStyle}>
                                    <h6 className="fw-bold text-success mb-3">
                                        Kiểm Kê Tiền Mặt
                                    </h6>

                                    {loadingCashInfo && (
                                        <div className="mb-3 text-secondary small">
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Đang tính tiền hệ thống...
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold text-secondary small">
                                            1. Tiền lẻ đầu ca
                                        </span>
                                        <div className="input-group input-group-sm" style={{ width: '180px' }}>
                                            <input
                                                type="text"
                                                className="form-control text-end fw-bold"
                                                value={formatVND(openingCash)}
                                                disabled
                                            />
                                            <span className="input-group-text bg-white text-muted">VNĐ</span>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold text-secondary small">
                                            2. Doanh thu bán hàng
                                        </span>
                                        <div className="input-group input-group-sm" style={{ width: '180px' }}>
                                            <input
                                                type="text"
                                                className="form-control text-end fw-bold bg-white text-primary"
                                                value={formatVND(salesCash)}
                                                disabled
                                            />
                                            <span className="input-group-text bg-white text-muted">VNĐ</span>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold text-secondary small">
                                            3. Tiền hoàn trả khách
                                        </span>
                                        <div className="input-group input-group-sm" style={{ width: '180px' }}>
                                            <input
                                                type="text"
                                                className="form-control text-end fw-bold bg-white text-danger"
                                                value={`-${formatVND(returnCash)}`}
                                                disabled
                                            />
                                            <span className="input-group-text bg-white text-muted">VNĐ</span>
                                        </div>
                                    </div>

                                    <hr className="my-3 border-success" style={{ opacity: 0.2 }} />

                                    <div className="d-flex justify-content-between align-items-center mb-4 p-2 bg-success-subtle rounded-3 border border-success border-opacity-25">
                                        <span className="fw-bold text-success ms-1">TỔNG</span>
                                        <span className="fw-bold text-success fs-5 me-1">
                                            {formatVND(expectedCash)} VNĐ
                                        </span>
                                    </div>

                                    <div className="row g-2 mb-3">
                                        <div className="col-7">
                                            <label className="small fw-bold mb-1">
                                                Tiền thực đếm trong két <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control text-end fw-bold text-primary fs-6"
                                                    placeholder="0"
                                                    value={actualCash === '' ? '' : formatVND(actualCash)}
                                                    onChange={handleActualCashChange}
                                                />
                                                <span className="input-group-text bg-white">VNĐ</span>
                                            </div>
                                        </div>

                                        <div className="col-5">
                                            <label className="small fw-bold mb-1">Chênh lệch</label>
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className={`form-control text-end fw-bold fs-6 bg-white ${
                                                        cashDiff < 0
                                                            ? 'text-danger'
                                                            : cashDiff > 0
                                                            ? 'text-warning'
                                                            : 'text-success'
                                                    }`}
                                                    value={`${cashDiff > 0 ? '+' : ''}${formatVND(cashDiff)}`}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Ghi chú lý do"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '20px 32px',
                            borderTop: '1px solid #f0f0f0',
                            background: '#fafafa',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px',
                        }}
                    >
                        <button
                            type="button"
                            className="btn btn-light border px-4 fw-bold"
                            style={{ borderRadius: '12px' }}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy Bỏ
                        </button>

                        <button
                            type="submit"
                            className="btn text-white px-4 fw-bold"
                            style={{
                                background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                                border: 'none',
                                borderRadius: '12px',
                            }}
                            disabled={loading || pendingShifts.length === 0}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle-fill me-2" />
                                    Hoàn Tất Bàn Giao
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </BaseModal>
    );
};

export default CashHandover;