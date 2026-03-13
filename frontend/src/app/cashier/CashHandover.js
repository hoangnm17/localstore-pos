import React, { useState, useEffect } from 'react';
import BaseModal from '../../components/common/BaseModal';
import AlertMessage from '../../components/common/AlertMessage';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import api from '../../services/axiosInstance';

const formatVND = (num) => num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";
const parseVND = (str) => Number(str.toString().replace(/[^0-9]/g, ''));

const CashHandover = ({ staffInfo, todayStr, onClose, onSuccess }) => {
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [pendingShifts, setPendingShifts] = useState([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState('');
    
    const [openingCash, setOpeningCash] = useState(0); 
    const [systemCash, setSystemCash] = useState(0);
    const [actualCash, setActualCash] = useState(''); 
    const [note, setNote] = useState('');

    const tongTien = openingCash + systemCash;
    const actualCashNum = actualCash === '' ? 0 : actualCash;
    const chenhLech = actualCashNum - tongTien;

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const res = await api.get(`/cashier/handover/pending?workDate=${todayStr}`);
                const isSuccess = res.data?.success ?? res.success;
                if (isSuccess) {
                    const shifts = res.data?.data || res.data;
                    setPendingShifts(shifts);
                    if (shifts.length > 0) setSelectedScheduleId(shifts[0].scheduleId);
                }
            } catch (err) { console.error(err); }
        };
        fetchPending();
    }, [todayStr]);

    useEffect(() => {
        if (!selectedScheduleId) { setSystemCash(0); return; }
        
        const fetchSystemCash = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/cashier/handover/system-cash?scheduleId=${selectedScheduleId}`);
                const isSuccess = res.data?.success ?? res.success;
                if (isSuccess) {
                    setSystemCash(res.data?.data?.systemCash || 0);
                }
            } catch (err) { setErrorMsg('Lỗi tính toán doanh thu hệ thống!'); }
            finally { setLoading(false); }
        };
        fetchSystemCash();
    }, [selectedScheduleId]);

    const handleInput = (e, setter) => {
        const val = e.target.value;
        if (val === '') setter('');
        else setter(parseVND(val));
        setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedScheduleId) return setErrorMsg('Vui lòng chọn ca cần kết!');
        if (actualCash === '') return setErrorMsg('Vui lòng nhập số tiền thực đếm trong két!');
        
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await api.post('/cashier/handover', {
                scheduleId: selectedScheduleId,
                openingCash, systemCash, actualCash: actualCashNum, note
            });
            const isSuccess = res.data?.success ?? res.success;
            if (isSuccess) {
                showNotification('Kết ca và bàn giao thành công!', 'success');
                onSuccess();
            } else {
                setErrorMsg(res.data?.message || res.message || 'Lỗi kết ca!');
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Lỗi kết nối server!');
        } finally { setLoading(false); }
    };

    const leftStyle  = { background: '#f8faff', borderRadius: '12px', padding: '20px', border: '1px solid #e0eaff', height: '100%' };
    const rightStyle = { background: '#f0fdf4', borderRadius: '12px', padding: '20px', border: '1px solid #bbf7d0', height: '100%' };

    return (
        <BaseModal onClose={onClose} maxWidth="850px" disableClose={loading}>
            <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                {/* Header Modal */}
                <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', padding: '24px 32px', color: '#fff' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="fw-bold m-0"><i className="bi bi-wallet2 me-2" />Kết Ca & Bàn Giao Tiền Mặt</h5>
                            <small className="opacity-75">Vui lòng kiểm kê két tiền cẩn thận trước khi xác nhận</small>
                        </div>
                        <button onClick={onClose} disabled={loading}
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>

                {errorMsg && <div style={{ padding: '16px 32px 0 32px' }}><AlertMessage type="danger" message={errorMsg} /></div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '24px 32px' }}>
                        <div className="row g-4">
                            {/* Thông tin ca */}
                            <div className="col-md-5">
                                <div style={leftStyle}>
                                    <h6 className="fw-bold text-primary mb-3">
                                        <i className="bi bi-info-circle-fill me-2" />Thông Tin Ca Làm
                                    </h6>
                                    
                                    <div className="mb-3">
                                        <label className="small fw-bold text-secondary mb-1">Ngày làm việc</label>
                                        <div className="form-control bg-white fw-bold">
                                            {new Date(todayStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="small fw-bold text-secondary mb-1">Thu ngân</label>
                                        <div className="form-control bg-white text-primary fw-bold">
                                            {staffInfo?.fullName || '---'}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="small fw-bold text-secondary mb-1">Ca cần bàn giao <span className="text-danger">*</span></label>
                                        <select className="form-select border-primary fw-bold" 
                                            value={selectedScheduleId} onChange={e => setSelectedScheduleId(e.target.value)}>
                                            {pendingShifts.length === 0 && <option value="">-- Hết ca cần bàn giao --</option>}
                                            {pendingShifts.map(s => (
                                                <option key={s.scheduleId} value={s.scheduleId}>
                                                    {s.shiftName} ({s.startTime} - {s.endTime})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {selectedScheduleId && (
                                        <div className="alert alert-info py-2 small mb-0 mt-3 border-0">
                                            <i className="bi bi-shop me-2" />
                                            Quầy: <strong>{pendingShifts.find(s => s.scheduleId === selectedScheduleId)?.counterName}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tính toán tiền */}
                            <div className="col-md-7">
                                <div style={rightStyle}>
                                    <h6 className="fw-bold text-success mb-3">
                                        <i className="bi bi-cash-stack me-2" />Kiểm Kê Tiền Mặt
                                    </h6>

                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold text-secondary small">1. Tiền lẻ đầu ca</span>
                                        <div className="input-group input-group-sm" style={{ width: '180px' }}>
                                            <input type="text" className="form-control text-end fw-bold" 
                                                value={formatVND(openingCash)} onChange={e => handleInput(e, setOpeningCash)} />
                                            <span className="input-group-text bg-white text-muted">VNĐ</span>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold text-secondary small">2. Hệ thống thu (Tiền mặt)</span>
                                        <div className="input-group input-group-sm" style={{ width: '180px' }}>
                                            <input type="text" className="form-control text-end fw-bold bg-white text-primary" 
                                                value={formatVND(systemCash)} disabled />
                                            <span className="input-group-text bg-white text-muted">VNĐ</span>
                                        </div>
                                    </div>

                                    <hr className="my-3 border-success" style={{ opacity: 0.2 }} />

                                    <div className="d-flex justify-content-between align-items-center mb-4 p-2 bg-success-subtle rounded-3 border border-success border-opacity-25">
                                        <span className="fw-bold text-success ms-1">TỔNG CẦN CÓ (1+2)</span>
                                        <span className="fw-bold text-success fs-5 me-1">{formatVND(tongTien)} VNĐ</span>
                                    </div>

                                    <div className="row g-2 mb-3">
                                        <div className="col-7">
                                            <label className="small fw-bold mb-1">Tiền thực đếm trong két <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <input type="text" className="form-control text-end fw-bold text-primary fs-6" 
                                                    placeholder="0" value={formatVND(actualCash)} onChange={e => handleInput(e, setActualCash)} />
                                                <span className="input-group-text bg-white">VNĐ</span>
                                            </div>
                                        </div>
                                        <div className="col-5">
                                            <label className="small fw-bold mb-1">Chênh lệch</label>
                                            <div className="input-group">
                                                <input type="text" className={`form-control text-end fw-bold fs-6 bg-white ${chenhLech < 0 ? 'text-danger' : chenhLech > 0 ? 'text-warning' : 'text-success'}`} 
                                                    value={(chenhLech > 0 ? '+' : '') + formatVND(chenhLech)} disabled />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <input type="text" className="form-control form-control-sm" placeholder="Ghi chú lý do (Bắt buộc nếu có chênh lệch)..." 
                                            value={note} onChange={e => setNote(e.target.value)} />
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Modal */}
                    <div style={{ padding: '20px 32px', borderTop: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn btn-light border px-4 fw-bold" style={{ borderRadius: '12px' }} onClick={onClose} disabled={loading}>
                            Hủy Bỏ
                        </button>
                        <button type="submit" className="btn text-white px-4 fw-bold"
                            style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', border: 'none', borderRadius: '12px' }}
                            disabled={loading || pendingShifts.length === 0}>
                            {loading 
                                ? <><span className="spinner-border spinner-border-sm me-2"/> Đang lưu...</> 
                                : <><i className="bi bi-check-circle-fill me-2" /> Hoàn Tất Bàn Giao</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </BaseModal>
    );
};

export default CashHandover;