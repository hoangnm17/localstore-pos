import React, { useState, useEffect, useRef } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import AlertMessage from '../../../components/common/AlertMessage';
import { useNotification } from '../../../components/global/Notification/NotificationContext';
import { assignShift, clearSchedule } from '../../../services/Roster/roster.service';
import ConfirmClearModal from './ConfirmClearModal';
import { getDatesInRange, getTodayString } from '../utils/schedule.utils';

const AssignShiftModal = ({ cell, shifts, onClose, onSuccess, onRefreshData }) => {
    const { showNotification } = useNotification();
    const [selectedShiftIds, setSelectedShiftIds] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(cell.workDate);
    const [endDate, setEndDate] = useState(cell.workDate);
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    const alertRef = useRef(null);

    useEffect(() => {
        if (errorMsg && alertRef.current) {
            alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [errorMsg]);

    const toggleShift = (shiftId) => {
        setErrorMsg('');

        setSelectedShiftIds((prev) => {
            if (prev.includes(shiftId)) {
                return prev.filter((id) => id !== shiftId);
            }

            return [...prev, shiftId];
        });
    };

    const validateForm = () => {
        if (!startDate || !endDate) {
            return 'Vui lòng chọn Từ ngày và Đến ngày!';
        }

        if (startDate > endDate) {
            return 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!';
        }

        const todayStr = getTodayString();
        if (startDate < todayStr) {
            return 'Ngày bắt đầu không được nằm trong quá khứ!';
        }

        if (selectedShiftIds.length === 0) {
            return 'Vui lòng chọn ít nhất một ca!';
        }

        return '';
    };

    const handleSubmit = async () => {
        const validationError = validateForm();
        if (validationError) {
            setErrorMsg(validationError);
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            const dates = getDatesInRange(startDate, endDate);
            let successCount = 0;
            const errors = [];

            for (const workDate of dates) {
                for (const shiftId of selectedShiftIds) {
                    try {
                        const res = await assignShift({
                            staffId: cell.staffId,
                            shiftId,
                            workDate,
                        });

                        if (res?.success) {
                            successCount++;
                        } else {
                            errors.push(`[Ngày ${workDate}] ${res?.message || 'Lỗi không xác định'}`);
                        }
                    } catch (err) {
                        const msg =
                            err?.response?.data?.message ||
                            err?.message ||
                            'Lỗi không xác định';

                        errors.push(`[Ngày ${workDate}] ${msg}`);
                    }
                }
            }

            // TH1: tất cả đều thành công
            if (successCount > 0 && errors.length === 0) {
                showNotification(`Đã phân công thành công ${successCount} ca.`, 'success');
                onSuccess();
                return;
            }

            // TH2: thành công một phần
            if (successCount > 0 && errors.length > 0) {
                if (onRefreshData) {
                    await onRefreshData();
                }

                setErrorMsg(
                    `Đã phân công thành công ${successCount} ca.\n` +
                    `Có ${errors.length} ca bị lỗi:\n` +
                    errors.join('\n')
                );
                return;
            }

            // TH3: lỗi toàn bộ
            if (errors.length > 0) {
                setErrorMsg(errors.join('\n'));
            }
        } catch (err) {
            setErrorMsg('Lỗi phân công: ' + (err?.message || 'Lỗi không xác định'));
        } finally {
            setLoading(false);
        }
    };

    const handleClearSchedule = () => {
        if (!startDate || !endDate) {
            setErrorMsg('Vui lòng chọn Từ ngày và Đến ngày!');
            return;
        }

        setShowConfirmClear(true);
    };

    const confirmClear = async () => {
        setShowConfirmClear(false);
        setLoading(true);
        setErrorMsg('');

        try {
            const res = await clearSchedule({
                staffId: cell.staffId,
                startDate,
                endDate,
            });

            if (res.success) {
                showNotification(res.message, 'success');
                onSuccess();
            }
        } catch (err) {
            setErrorMsg('Lỗi khi xóa lịch: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <BaseModal onClose={onClose} maxWidth="650px" disableClose={loading}>
                <div
                    style={{
                        background: '#fff',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: '92vh',
                    }}
                >
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                            padding: '18px 28px',
                            color: '#fff',
                            flexShrink: 0,
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="fw-bold m-0" style={{ fontSize: '1rem' }}>
                                    Phân Công
                                </h5>
                                <small className="opacity-75">Chọn ngày và ca phù hợp</small>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#fff',
                                    fontSize: '1.4rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: '20px 28px', overflowY: 'auto', flex: 1 }}>
                        {errorMsg && (
                            <div ref={alertRef} className="mb-3">
                                <AlertMessage
                                    type="danger"
                                    message={<span style={{ whiteSpace: 'pre-line' }}>{errorMsg}</span>}
                                />
                            </div>
                        )}

                        <div
                            style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '14px',
                                padding: '14px 18px',
                                marginBottom: '18px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '15px',
                            }}
                        >
                            <div>
                                <div
                                    className="small fw-bold text-secondary text-uppercase"
                                    style={{ letterSpacing: '0.7px', fontSize: '0.72rem' }}
                                >
                                    Nhân viên
                                </div>

                                <div className="fw-bold" style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                                    {cell.fullName}
                                </div>

                                <span className="badge rounded-pill mt-1 bg-primary" style={{ fontSize: '0.7rem' }}>
                                    Thu ngân
                                </span>
                            </div>

                            <div
                                className="d-flex gap-3 align-items-center"
                                style={{ flexGrow: 1, justifyContent: 'flex-end' }}
                            >
                                <div>
                                    <label
                                        className="small fw-bold text-secondary text-uppercase d-block mb-1"
                                        style={{ letterSpacing: '0.7px', fontSize: '0.72rem' }}
                                    >
                                        Từ ngày
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={{
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            color: '#2563eb',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label
                                        className="small fw-bold text-secondary text-uppercase d-block mb-1"
                                        style={{ letterSpacing: '0.7px', fontSize: '0.72rem' }}
                                    >
                                        Đến ngày
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={{
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            color: '#2563eb',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="fw-bold text-secondary mb-2" style={{ fontSize: '0.85rem' }}>
                                <i className="bi bi-clock-fill me-2 text-primary" />
                                Chọn ca làm việc để thêm mới
                                {selectedShiftIds.length > 0 && (
                                    <span className="badge bg-primary rounded-pill ms-2">
                                        {selectedShiftIds.length} đã chọn
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.6rem' }}>
                                {shifts.map((shift) => {
                                    const isSelected = selectedShiftIds.includes(shift.id);

                                    return (
                                        <div
                                            key={shift.id}
                                            onClick={() => toggleShift(shift.id)}
                                            style={{
                                                borderRadius: '12px',
                                                padding: '12px 14px',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                                border: `2px solid ${isSelected ? '#93c5fd' : '#e2e8f0'}`,
                                                backgroundColor: isSelected ? '#dbeafe' : '#f8fafc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    className="fw-bold"
                                                    style={{
                                                        fontSize: '0.88rem',
                                                        color: isSelected ? '#1d4ed8' : '#0f172a',
                                                    }}
                                                >
                                                    {shift.name}
                                                </div>

                                                <div
                                                    style={{
                                                        fontSize: '0.76rem',
                                                        opacity: 0.8,
                                                        color: isSelected ? '#1d4ed8' : '#64748b',
                                                    }}
                                                >
                                                    {shift.startTime} – {shift.endTime}
                                                </div>
                                            </div>

                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            padding: '14px 28px',
                            borderTop: '1px solid #f0f0f0',
                            background: '#fafafa',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            flexShrink: 0,
                        }}
                    >
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm fw-bold me-auto d-flex align-items-center gap-1"
                            style={{ borderRadius: '8px' }}
                            onClick={handleClearSchedule}
                            disabled={loading}
                        >
                            <i className="bi bi-trash3-fill" />
                            Xóa các ca đã phân công hợp lệ
                        </button>

                        <button
                            type="button"
                            className="btn btn-light border px-4 fw-bold"
                            style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>

                        <button
                            type="button"
                            className="btn text-white px-4 fw-bold"
                            style={{
                                background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '0.9rem',
                            }}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-circle-fill me-2" />
                                    Xác Nhận Phân Công
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </BaseModal>

            {showConfirmClear && (
                <ConfirmClearModal
                    staffName={cell.fullName}
                    startDate={startDate}
                    endDate={endDate}
                    onConfirm={confirmClear}
                    onClose={() => setShowConfirmClear(false)}
                    loading={loading}
                />
            )}
        </>
    );
};

export default AssignShiftModal;