import React, { useEffect, useState } from 'react';
import { useNotification } from '../NotificationContext';
import { attendanceService } from 'services/Attendance/attendance.service';

const formatVND = (num) => {
    if (num === '' || num === null || num === undefined) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}; const parseVND = (str) => Number(str.toString().replace(/[^0-9]/g, ''));

const AutoCheckInModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scheduleInfo, setScheduleInfo] = useState(null);
    const [cashAmount, setCashAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await attendanceService.checkPending();
                if (res.success && res.data) {
                    // Cashier bị chặn vì ca cũ chưa bàn giao
                    if (res.data.blocked) {
                        showNotification(res.data.message, 'warning');
                        return;
                    }
                    setScheduleInfo(res.data);
                    setIsModalOpen(true);
                }
            } catch (error) {
            }
        };
        const timer = setTimeout(fetchPending, 1500);
        return () => clearTimeout(timer);
    }, [showNotification]);

    const handleCashInput = (e) => {
        const val = e.target.value;
        if (val === '') setCashAmount('');
        else setCashAmount(parseVND(val));
    };

    const handleCheckIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const amount = cashAmount !== '' ? parseFloat(cashAmount) : undefined;
            const res = await attendanceService.checkIn({ openingCash: amount });

            if (res.success) {
                showNotification('Nhận ca làm việc thành công!', 'success');

                if (res.data.penalty > 0) {
                    showNotification(`Bạn bị áp phạt ${res.data.penalty}đ do vào ca trễ!`, 'warning');
                }
                setIsModalOpen(false);
            }
        } catch (error) {
            showNotification(error.response?.data?.message || error.message || 'Lỗi nhận ca, vui lòng thử lại', 'error');
            setLoading(false);
        }
    };

    if (!isModalOpen) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>

                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', padding: '20px', color: '#fff', textAlign: 'center' }}>
                        <h4 className="fw-bold m-0"><i className="bi bi-clock-history me-2" />XÁC NHẬN VÀO CA</h4>
                    </div>

                    <div className="modal-body p-4">
                        <div className="text-center mb-4">
                            <h5 className="fw-bold text-dark">Bạn có lịch làm việc đang chờ!</h5>
                            <p className="text-secondary mb-1">Ca được giao: <span className="fw-bold">{scheduleInfo?.shiftName}</span></p>
                            <p className="text-secondary">
                                Giờ quy định: <span className="badge bg-primary fs-6">{scheduleInfo?.startTime} - {scheduleInfo?.endTime}</span>
                            </p>
                        </div>

                        <form onSubmit={handleCheckIn}>
                            {scheduleInfo?.needsCash && (
                                <div className="p-3 bg-light rounded-3 mb-4 border border-light">
                                    <label className="fw-bold text-dark mb-2">
                                        <i className="bi bi-cash-stack me-2 text-success"></i>
                                        Vui lòng đếm két và nhập tiền đầu ca (VNĐ):
                                    </label>
                                    <input
                                        type="text"
                                        value={formatVND(cashAmount)}
                                        onChange={handleCashInput}
                                        placeholder="Nhập số tiền"
                                        className="form-control  text-primary"
                                        style={{ fontSize: '1.2rem', padding: '12px' }}
                                        required
                                    />
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="btn w-100 fw-bold text-white py-3 shadow-sm"
                                style={{ background: '#0ea5e9', borderRadius: '10px', fontSize: '1.1rem' }}>
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm me-2" />
                                ) : (
                                    <i className="bi bi-check-circle-fill me-2" />
                                )}
                                {scheduleInfo?.needsCash ? "XÁC NHẬN TIỀN & BẮT ĐẦU VÀO CA" : "XÁC NHẬN BẮT ĐẦU VÀO LÀM"}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AutoCheckInModal;
