import React, { useState, useRef, useEffect } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import AlertMessage from '../../../components/common/AlertMessage';
import { useNotification } from '../../../components/global/Notification/NotificationContext';
import api from '../../../services/axiosInstance';

const toMins = (t) => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; };

const fromMins = (mins) => {
  const safe = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const ShiftUpdateModal = ({ shift, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: shift.name,
    startTime: shift.startTime,
    endTime: shift.endTime,
    checkInStart: shift.checkInStart || '',
    checkInEnd: shift.checkInEnd || '',
    checkOutDeadline: shift.checkOutDeadline || '',
  });
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const alertRef = useRef(null);

  useEffect(() => {
    if (errorMsg && alertRef.current) {
      alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [errorMsg]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Tên ca không được để trống!';
    else if (form.name.trim().length < 3) e.name = 'Tên ca phải có ít nhất 3 ký tự!';

    if (!form.startTime) e.startTime = 'Chọn giờ bắt đầu!';
    if (!form.endTime) e.endTime = 'Chọn giờ kết thúc!';

    if (form.startTime && form.endTime) {
      const diff = toMins(form.endTime) - toMins(form.startTime);
      if (diff <= 0) e.endTime = 'Giờ kết thúc phải sau giờ bắt đầu!';
      else if (diff < 30) e.endTime = 'Ca làm tối thiểu 30 phút!';
      else if (diff > 720) e.endTime = 'Ca làm tối đa 12 giờ!';
    }

    const hasCheckIn = form.checkInStart || form.checkInEnd;
    if (hasCheckIn) {
      if (!form.checkInStart) e.checkInStart = 'Nhập giờ bắt đầu nhận chấm công!';
      if (!form.checkInEnd) e.checkInEnd = 'Nhập deadline chấm công!';

      if (form.checkInStart && form.checkInEnd && form.startTime && form.endTime) {
        const startM    = toMins(form.startTime);
        const endM      = toMins(form.endTime);
        const checkInSM = toMins(form.checkInStart);
        const checkInEM = toMins(form.checkInEnd);

        if (checkInSM >= checkInEM)
          e.checkInEnd = 'Deadline phải sau giờ bắt đầu nhận chấm công!';
        if (checkInSM < startM - 30)
          e.checkInStart = 'Không được sớm hơn giờ bắt đầu ca quá 30 phút!';
        if (checkInEM > endM + 30)
          e.checkInEnd = 'Không được muộn hơn giờ kết thúc ca quá 30 phút!';
      }
    }

    if (form.checkOutDeadline && form.startTime && form.endTime) {
      const checkOutM = toMins(form.checkOutDeadline);
      const startM    = toMins(form.startTime);
      const endM      = toMins(form.endTime);
      if (checkOutM <= startM)
        e.checkOutDeadline = 'Thời gian kết ca phải sau giờ bắt đầu ca!';
      if (checkOutM > endM + 120)
        e.checkOutDeadline = 'Thời gian kết ca không được trễ hơn giờ kết thúc quá 2 giờ!';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => {
      const updated = { ...prev, [name]: value };

      if (name === 'startTime' && value) {
        const startMins = toMins(value);
        updated.checkInStart = fromMins(startMins - 5);
        updated.checkInEnd   = fromMins(startMins - 5 + 10);
      }

      if (name === 'checkInStart' && value) {
        updated.checkInEnd = fromMins(toMins(value) + 10);
      }

      return updated;
    });

    setErrors(p => ({ ...p, [name]: '' }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        ...form,
        checkInStart:     form.checkInStart     || null,
        checkInEnd:       form.checkInEnd       || null,
        checkOutDeadline: form.checkOutDeadline || null,
      };
      const res = await api.put(`/shifts/${shift.id}`, payload);

      const isSuccess = res.data?.success ?? res.success;
      if (isSuccess) {
        showNotification('Cập nhật ca làm việc thành công!', 'success');
        onSuccess();
        return;
      }
      const msg = res.data?.message || res.message || 'Có lỗi xảy ra!';
      if (msg.includes('tồn tại')) setErrors(p => ({ ...p, name: msg }));
      else setErrorMsg(msg);

    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra!';
      if (msg.includes('tồn tại')) setErrors(p => ({ ...p, name: msg }));
      else setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} maxWidth="580px" disableClose={loading}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '95vh',
      }}>
        {/* Header - cố định */}
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '18px 28px', color: '#fff', flexShrink: 0 }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold m-0" style={{ fontSize: '1rem' }}>
                <i className="bi bi-pencil-square me-2" />Chỉnh Sửa Ca Làm
              </h5>
              <small className="opacity-75">Sửa giờ ca không ảnh hưởng đến lịch sử lương đã chốt</small>
            </div>
            <button onClick={onClose} disabled={loading}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Body */}
          <div style={{ padding: '20px 28px', overflowY: 'auto', flex: 1 }}>

            {/* Alert  */}
            {errorMsg && (
              <div ref={alertRef} style={{ marginBottom: '14px' }}>
                <AlertMessage type="danger" message={errorMsg} />
              </div>
            )}

            {/* Tên ca */}
            <div className="mb-3">
              <label className="small fw-bold">Tên ca <span className="text-danger">*</span></label>
              <input type="text" name="name"
                className={`form-control form-control-sm ${errors.name ? 'is-invalid' : ''}`}
                value={form.name} onChange={handleChange} />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            {/* Thời gian ca */}
            <div style={{ background: '#f8faff', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e0eaff', marginBottom: '12px' }}>
              <div className="fw-bold text-primary mb-2" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-clock-fill me-2" />Thời Gian Ca
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <label className="small fw-bold">Giờ bắt đầu <span className="text-danger">*</span></label>
                  <input type="time" name="startTime"
                    className={`form-control form-control-sm ${errors.startTime ? 'is-invalid' : ''}`}
                    value={form.startTime} onChange={handleChange} />
                  {errors.startTime && <div className="invalid-feedback">{errors.startTime}</div>}
                </div>
                <div className="col-6">
                  <label className="small fw-bold">Giờ kết thúc <span className="text-danger">*</span></label>
                  <input type="time" name="endTime"
                    className={`form-control form-control-sm ${errors.endTime ? 'is-invalid' : ''}`}
                    value={form.endTime} onChange={handleChange} />
                  {errors.endTime && <div className="invalid-feedback">{errors.endTime}</div>}
                </div>
              </div>
            </div>

            {/* Giới hạn chấm công */}
            <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '14px 16px', border: '1px solid #bbf7d0', marginBottom: '12px' }}>
              <div className="fw-bold text-success mb-1" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-clock-history me-2" />Giới Hạn Chấm Công
              </div>
              <small className="text-muted d-block mb-2" style={{ fontSize: '0.76rem' }}>
                <i className="bi bi-info-circle me-1" />
                Tự động cập nhật khi sửa giờ bắt đầu ca. Xóa cả hai ô để bỏ giới hạn.
              </small>
              <div className="row g-2">
                <div className="col-6">
                  <label className="small fw-bold">Bắt đầu nhận chấm công</label>
                  <input type="time" name="checkInStart"
                    className={`form-control form-control-sm ${errors.checkInStart ? 'is-invalid' : ''}`}
                    value={form.checkInStart} onChange={handleChange} />
                  {errors.checkInStart && <div className="invalid-feedback" style={{ fontSize: '.76rem' }}>{errors.checkInStart}</div>}
                </div>
                <div className="col-6">
                  <label className="small fw-bold">Deadline chấm công</label>
                  <input type="time" name="checkInEnd"
                    className={`form-control form-control-sm ${errors.checkInEnd ? 'is-invalid' : ''}`}
                    value={form.checkInEnd} onChange={handleChange} />
                  {errors.checkInEnd && <div className="invalid-feedback" style={{ fontSize: '.76rem' }}>{errors.checkInEnd}</div>}
                </div>
              </div>
            </div>

            {/* Thời gian kết ca (logout) */}
            <div style={{ background: '#fff7ed', borderRadius: '10px', padding: '14px 16px', border: '1px solid #fed7aa' }}>
              <div className="fw-bold mb-1" style={{ color: '#ea580c', fontSize: '0.85rem' }}>
                <i className="bi bi-box-arrow-right me-2" />Thời Gian Kết Ca
              </div>
              <small className="text-muted d-block mb-2" style={{ fontSize: '0.76rem' }}>
                <i className="bi bi-info-circle me-1" />
                Thời điểm cashier phải bàn giao tiền mặt và logout khỏi hệ thống.
              </small>
              <div className="row g-2">
                <div className="col-6">
                  <label className="small fw-bold">Giờ phải logout</label>
                  <input type="time" name="checkOutDeadline"
                    className={`form-control form-control-sm ${errors.checkOutDeadline ? 'is-invalid' : ''}`}
                    value={form.checkOutDeadline} onChange={handleChange} />
                  {errors.checkOutDeadline && <div className="invalid-feedback" style={{ fontSize: '.76rem' }}>{errors.checkOutDeadline}</div>}
                </div>
              </div>
            </div>

          </div>

          {/* Footer  */}
          <div style={{
            padding: '14px 28px',
            borderTop: '1px solid #f0f0f0',
            background: '#fafafa',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            flexShrink: 0,
          }}>
            <button type="button" className="btn btn-light border px-4 fw-bold"
              style={{ borderRadius: '10px', fontSize: '0.9rem' }}
              onClick={onClose} disabled={loading}>Hủy</button>
            <button type="submit" className="btn text-white px-4 fw-bold"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: '10px', fontSize: '0.9rem' }}
              disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Đang lưu...</>
                : <><i className="bi bi-check-lg me-2" />Cập Nhật</>}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
};

export default ShiftUpdateModal;
