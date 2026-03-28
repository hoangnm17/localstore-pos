import React, { useState, useEffect, useRef } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import AlertMessage from '../../../components/common/AlertMessage';
import { useNotification } from '../../../components/global/Notification/NotificationContext';
import { assignShift, clearSchedule } from '../../../services/Roster/roster.service.js';
import ConfirmClearModal from './ConfirmClearModal';
const roleClass = {
    Cashier: 'bg-primary',
    Warehouse: 'bg-success',
    Manager: 'bg-warning'
};
const shiftColors = [
    { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
    { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
    { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
    { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' },
    { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' },
];
const getShiftStyle = (id) => shiftColors[(id - 1) % shiftColors.length];

const AssignShiftModal = ({ cell, shifts, onClose, onSuccess }) => {
    const { showNotification } = useNotification();
    const [selectedShiftIds, setSelectedShiftIds] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const alertRef = useRef(null);

    const [startDate, setStartDate] = useState(cell.workDate);
    const [endDate, setEndDate] = useState(cell.workDate);
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    useEffect(() => {
        if (errorMsg && alertRef.current) {
            alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [errorMsg]);

    const toggleShift = (id) => {
        setErrorMsg('');
        setSelectedShiftIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const getDatesInRange = (startStr, endStr) => {
        const dates = [];
        let currDate = new Date(startStr);
        const lastDate = new Date(endStr);
        while (currDate <= lastDate) {
            dates.push(new Date(currDate).toISOString().split('T')[0]);
            currDate.setDate(currDate.getDate() + 1);
        }
        return dates;
    };

    const handleSubmit = async () => {
        if (!startDate || !endDate) {
            setErrorMsg('Vui lòng chọn Từ ngày và Đến ngày!');
            return;
        }
        if (startDate > endDate) {
            setErrorMsg('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!');
            return;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        if (startDate < todayStr) {
            setErrorMsg('Ngày bắt đầu không được nằm trong quá khứ!');
            return;
        }

        if (selectedShiftIds.length === 0) {
            setErrorMsg('Vui lòng chọn ít nhất một ca!');
            return;
        }

        setLoading(true);
        setErrorMsg('');

        try {
            const dates = getDatesInRange(startDate, endDate);
            let hasError = false;
            let errorDetails = '';
            for (const d of dates) {
                for (const shiftId of selectedShiftIds) {
                    try {
                        const res = await assignShift({
                            staffId: cell.staffId,
                            shiftId,
                            workDate: d,
                        });
                        const isSuccess = res?.success ?? res; 
                        if (!isSuccess) {
                            hasError = true;
                            errorDetails += `[Ngày ${d}] ${res?.message || 'Lỗi không xác định'}\n`;
                        }
                    } catch (err) {
                        hasError = true;
                        const serverMsg = err.response?.data?.message || err.message;
                        errorDetails += `[Ngày ${d}] ${serverMsg}\n`;
                    }
                }
            }

            if (hasError) {
                setErrorMsg(errorDetails);
                // onSuccess();
            } else {
                showNotification('Phân công ca thành công!', 'success');
                onSuccess();
            }
        } catch (err) {
            setErrorMsg('Lỗi phân công: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClearSchedule = async () => {
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
                endDate
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
                <div style={{
                    background: '#fff', borderRadius: '20px', overflow: 'hidden',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                    display: 'flex', flexDirection: 'column', maxHeight: '92vh',
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                        padding: '18px 28px', color: '#fff', flexShrink: 0,
                    }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="fw-bold m-0" style={{ fontSize: '1rem' }}>
                                    <i className="bi bi-calendar-plus-fill me-2" />Phân Công / Chỉnh Sửa
                                </h5>
                                <small className="opacity-75">Chọn ngày và ca phù hợp</small>
                            </div>
                            <button onClick={onClose} disabled={loading}
                                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}>
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>
                    </div>


                    <div style={{ padding: '20px 28px', overflowY: 'auto', flex: 1 }}>


                        {errorMsg && (
                            <div ref={alertRef} className="mb-3">
                                <AlertMessage type="danger" message={<span style={{ whiteSpace: 'pre-line' }}>{errorMsg}</span>} />
                            </div>
                        )}


                        <div style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: '14px', padding: '14px 18px', marginBottom: '18px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
                        }}>
                            <div>
                                <div className="small fw-bold text-secondary text-uppercase"
                                    style={{ letterSpacing: '0.7px', fontSize: '0.72rem' }}>
                                    Nhân viên
                                </div>
                                <div className="fw-bold" style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                                    {cell.fullName}
                                </div>
                                <span
                                    className={`badge rounded-pill mt-1 ${roleClass[cell.roleName] || 'bg-secondary'}`}
                                    style={{ fontSize: '0.7rem' }}
                                >
                                    {cell.roleName === 'Cashier' ? 'Thu ngân' : cell.roleName === 'Warehouse' ? 'Nhân viên kho' : 'Quản lý'}
                                </span>
                            </div>

                            {/* chọn ngày làm*/}
                            <div className="d-flex gap-3 align-items-center" style={{ flexGrow: 1, justifyContent: 'flex-end' }}>
                                <div>
                                    <label className="small fw-bold text-secondary text-uppercase d-block mb-1"
                                        style={{ letterSpacing: '0.7px', fontSize: '0.72rem' }}>
                                        Từ ngày
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={{ borderRadius: '8px', border: '1px solid #cbd5e1', color: '#2563eb', fontWeight: 'bold' }}
                                    />
                                </div>
                                <div>
                                    <label className="small fw-bold text-secondary text-uppercase d-block mb-1"
                                        style={{ letterSpacing: '0.7px', fontSize: '0.72rem' }}>
                                        Đến ngày
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={{ borderRadius: '8px', border: '1px solid #cbd5e1', color: '#2563eb', fontWeight: 'bold' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Chọn ca */}
                        <div className="mb-3">
                            <div className="fw-bold text-secondary mb-2" style={{ fontSize: '0.85rem' }}>
                                <i className="bi bi-clock-fill me-2 text-primary" />
                                Chọn ca làm việc để thêm mới
                                {selectedShiftIds.length > 0 && (
                                    <span className="badge bg-primary rounded-pill ms-2">{selectedShiftIds.length} đã chọn</span>
                                )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.6rem' }}>
                                {shifts.map(s => {
                                    const isSelected = selectedShiftIds.includes(s.id);
                                    const sStyle = getShiftStyle(s.id);
                                    return (
                                        <div
                                            key={s.id}
                                            onClick={() => toggleShift(s.id)}
                                            style={{
                                                borderRadius: '12px', padding: '12px 14px',
                                                cursor: 'pointer', transition: 'all 0.15s',
                                                border: `2px solid ${isSelected ? sStyle.border : '#e2e8f0'}`,
                                                backgroundColor: isSelected ? sStyle.bg : '#f8fafc',
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div className="fw-bold" style={{
                                                    fontSize: '0.88rem',
                                                    color: isSelected ? sStyle.text : '#0f172a',
                                                }}>
                                                    {s.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.76rem', opacity: 0.8,
                                                    color: isSelected ? sStyle.text : '#64748b',
                                                }}>
                                                    {s.startTime} – {s.endTime}
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

                    {/* Footer */}
                    <div style={{
                        padding: '14px 28px', borderTop: '1px solid #f0f0f0',
                        background: '#fafafa', display: 'flex',
                        alignItems: 'center', gap: '10px', flexShrink: 0,
                    }}>
                        <button type="button"
                            className="btn btn-outline-danger btn-sm fw-bold me-auto d-flex align-items-center gap-1"
                            style={{ borderRadius: '8px' }}
                            onClick={handleClearSchedule} disabled={loading}>
                            <i className="bi bi-trash3-fill" /> Xóa các ca đã phân công hợp lệ
                        </button>

                        <button type="button" className="btn btn-light border px-4 fw-bold"
                            style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                            onClick={onClose} disabled={loading}>
                            Hủy
                        </button>
                        <button type="button" className="btn text-white px-4 fw-bold"
                            style={{
                                background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                                border: 'none', borderRadius: '10px', fontSize: '0.9rem',
                            }}
                            onClick={handleSubmit} disabled={loading}>
                            {loading
                                ? <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</>
                                : <><i className="bi bi-check-circle-fill me-2" />Xác Nhận Phân Công</>}
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
