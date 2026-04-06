import React, { useState, useRef, useEffect } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import AlertMessage from '../../../components/common/AlertMessage';
import { useNotification } from '../../../components/global/Notification/NotificationContext';
import { updateShift } from '../../../services/Shift/shift.service';
import { getDuration, getDiff, toMin, toTime } from '../utils/time';

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
      alertRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [errorMsg]);

  const validate = () => {
    const e = {};

    const hasCheckIn = form.checkInStart || form.checkInEnd;

    if (hasCheckIn) {
      if (!form.checkInStart) {
        e.checkInStart = 'Nhập giờ bắt đầu nhận chấm công!';
      }

      if (!form.checkInEnd) {
        e.checkInEnd = 'Nhập hạn chót chấm công!';
      }

      if (form.checkInStart && form.checkInEnd && form.startTime) {
        const checkInRange = getDuration(form.checkInStart, form.checkInEnd);

        if (checkInRange === 0) {
          e.checkInEnd = 'Hạn chót phải sau giờ bắt đầu nhận chấm công!';
        }

        const earlyMinutes = getDiff(form.startTime, form.checkInStart);
        if (earlyMinutes > 30) {
          e.checkInStart = 'Không được sớm hơn giờ bắt đầu ca quá 30 phút!';
        }

        const lateMinutes = getDiff(form.checkInEnd, form.startTime);
        if (lateMinutes < 0) {
          e.checkInEnd = 'Hạn chót chấm công không được sớm hơn giờ bắt đầu ca!';
        }
        if (lateMinutes > 30) {
          e.checkInEnd = 'Hạn chót không được trễ hơn giờ bắt đầu ca quá 30 phút!';
        }
      }
    }

    if (form.checkOutDeadline && form.endTime) {
      const outDiff = getDiff(form.checkOutDeadline, form.endTime);

      if (outDiff <= 0) {
        e.checkOutDeadline = 'Giờ kết ca phải sau giờ kết thúc ca!';
      } else if (outDiff > 30) {
        e.checkOutDeadline = 'Không được trễ hơn giờ kết thúc ca quá 30 phút!';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'checkInStart' && value) {
        const checkInStartMin = toMin(value);
        updated.checkInEnd = toTime(checkInStartMin + 2);
      }

      return updated;
    });

    setErrors((prev) => ({ ...prev, [name]: '' }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isChanged =
      form.checkInStart !== (shift.checkInStart || '') ||
      form.checkInEnd !== (shift.checkInEnd || '') ||
      form.checkOutDeadline !== (shift.checkOutDeadline || '');

    if (!isChanged) {
      setErrorMsg('Bạn chưa chỉnh sửa thông tin nào!');
      return;
    }

    if (!validate()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        checkInStart: form.checkInStart || null,
        checkInEnd: form.checkInEnd || null,
        checkOutDeadline: form.checkOutDeadline || null,
      };

      const res = await updateShift(shift.id, payload);
      const isSuccess = res.data?.success ?? res.success;

      if (isSuccess) {
        showNotification('Cập nhật thành công!', 'success');
        onSuccess();
        return;
      }

      const msg = res.data?.message || res.message || 'Có lỗi xảy ra!';

      if (msg.includes('tồn tại')) {
        setErrors((prev) => ({ ...prev, name: msg }));
      } else {
        setErrorMsg(msg);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra!';

      if (msg.includes('tồn tại')) {
        setErrors((prev) => ({ ...prev, name: msg }));
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} maxWidth="580px" disableClose={loading}>
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '95vh',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            padding: '18px 28px',
            color: '#fff',
            flexShrink: 0
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold m-0" style={{ fontSize: '1rem' }}>
                Chỉnh Sửa Ca Làm
              </h5>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.4rem',
                cursor: 'pointer',
                lineHeight: 1
              }}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
        >
          <div style={{ padding: '20px 28px', overflowY: 'auto', flex: 1 }}>
            {errorMsg && (
              <div ref={alertRef} style={{ marginBottom: '14px' }}>
                <AlertMessage type="danger" message={errorMsg} />
              </div>
            )}

            <div className="mb-3">
              <label className="small fw-bold">
                Tên ca <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-control form-control-sm bg-light text-muted"
                value={form.name}
                disabled
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div
              style={{
                background: '#f8faff',
                borderRadius: '10px',
                padding: '14px 16px',
                border: '1px solid #e0eaff',
                marginBottom: '12px'
              }}
            >
              <div className="fw-bold text-primary mb-2" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-clock-fill me-2" />
                Thời Gian Ca
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="small fw-bold">
                    Giờ bắt đầu <span className="text-danger">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    className="form-control form-control-sm bg-light text-muted"
                    value={form.startTime}
                    disabled
                  />
                </div>

                <div className="col-6">
                  <label className="small fw-bold">
                    Giờ kết thúc <span className="text-danger">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    className="form-control form-control-sm bg-light text-muted"
                    value={form.endTime}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#f0fdf4',
                borderRadius: '10px',
                padding: '14px 16px',
                border: '1px solid #bbf7d0',
                marginBottom: '12px'
              }}
            >
              <div className="fw-bold text-success mb-1" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-clock-history me-2" />
                Giới Hạn Chấm Công
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="small fw-bold">Bắt đầu nhận chấm công</label>
                  <input
                    type="time"
                    name="checkInStart"
                    className={`form-control form-control-sm ${errors.checkInStart ? 'is-invalid' : ''}`}
                    value={form.checkInStart}
                    onChange={handleChange}
                  />
                  {errors.checkInStart && (
                    <div className="invalid-feedback" style={{ fontSize: '.76rem' }}>
                      {errors.checkInStart}
                    </div>
                  )}
                </div>

                <div className="col-6">
                  <label className="small fw-bold">Hạn chót chấm công</label>
                  <input
                    type="time"
                    name="checkInEnd"
                    className={`form-control form-control-sm ${errors.checkInEnd ? 'is-invalid' : ''}`}
                    value={form.checkInEnd}
                    onChange={handleChange}
                  />
                  {errors.checkInEnd && (
                    <div className="invalid-feedback" style={{ fontSize: '.76rem' }}>
                      {errors.checkInEnd}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#fff7ed',
                borderRadius: '10px',
                padding: '14px 16px',
                border: '1px solid #fed7aa'
              }}
            >
              <div className="fw-bold mb-1" style={{ color: '#ea580c', fontSize: '0.85rem' }}>
                Thời Gian Kết Ca
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <label className="small fw-bold">Giờ kết ca</label>
                  <input
                    type="time"
                    name="checkOutDeadline"
                    className={`form-control form-control-sm ${errors.checkOutDeadline ? 'is-invalid' : ''}`}
                    value={form.checkOutDeadline}
                    onChange={handleChange}
                  />
                  {errors.checkOutDeadline && (
                    <div className="invalid-feedback" style={{ fontSize: '.76rem' }}>
                      {errors.checkOutDeadline}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '14px 28px',
              borderTop: '1px solid #f0f0f0',
              background: '#fafafa',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              flexShrink: 0,
            }}
          >
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
              type="submit"
              className="btn text-white px-4 fw-bold"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem'
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Đang lưu...
                </>
              ) : (
                <>Cập Nhật</>
              )}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
};

export default ShiftUpdateModal;