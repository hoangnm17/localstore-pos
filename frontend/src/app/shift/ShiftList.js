import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Pagination from '../../components/Pagination/Pagination';
import api from '../../services/axiosInstance';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import useDebounce from '../../hooks/common/useDebounce';

import ShiftCreateModal from './modals/ShiftCreateModal';
import ShiftUpdateModal from './modals/ShiftUpdateModal';
import ShiftToggleModal from './modals/ShiftToggleModal';

const PAGE_SIZE = 5;

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebounce(searchInput, 400);
  const [filterStatus, setFilterStatus] = useState('all'); // all | active | inactive

  const [modalType, setModalType] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const { showNotification } = useNotification();

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/shifts');
      const isSuccess = res.data?.success ?? res.success;
      if (isSuccess) setShifts(res.data.data);
    } catch {
      showNotification('Không thể tải danh sách ca làm việc!', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);
  useEffect(() => { setPage(1); }, [searchTerm, filterStatus]);

  const openCreate  = () => setModalType('create');
  const openUpdate  = (s) => { setSelectedShift(s); setModalType('update'); };
  const openToggle  = (s) => { setSelectedShift(s); setModalType('toggle'); };
  const closeModal  = () => { setModalType(null); setSelectedShift(null); };
  const handleSuccess = useCallback(() => { closeModal(); fetchShifts(); }, [fetchShifts]);

  const filteredShifts = useMemo(() => {
    return shifts.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        filterStatus === 'all'      ? true :
        filterStatus === 'active'   ? (s.isActive === 1 || s.isActive === true) :
        !(s.isActive === 1 || s.isActive === true);
      return matchSearch && matchStatus;
    });
  }, [shifts, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredShifts.length / PAGE_SIZE);
  const paginated  = filteredShifts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total:    shifts.length,
    active:   shifts.filter(s => s.isActive === 1 || s.isActive === true).length,
    inactive: shifts.filter(s => !(s.isActive === 1 || s.isActive === true)).length,
  }), [shifts]);

  const shiftColors = [
    { bg: '#dbeafe', text: '#1d4ed8' },
    { bg: '#dcfce7', text: '#15803d' },
    { bg: '#fef3c7', text: '#b45309' },
    { bg: '#fee2e2', text: '#b91c1c' },
    { bg: '#f3e8ff', text: '#6b21a8' },
  ];
  const getColor = (idx) => shiftColors[idx % shiftColors.length];

  const getDuration = (start, end) => {
    if (!start || !end) return '—';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  };

  return (
    <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <Sidebar />
      <div className="flex-grow-1 p-4">

        {/* HEADER BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
          borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', color: '#fff'
        }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h3 className="fw-bold m-0">Quản Lý Ca Làm Việc</h3>
              <p className="m-0 mt-1 opacity-75 small">Quản lý và kích hoạt / ngừng sử dụng ca làm việc</p>
            </div>
            <button className="btn btn-light fw-bold px-4 shadow-sm"
              style={{ borderRadius: '12px' }} onClick={openCreate}>
              <i className="bi bi-plus-circle-fill me-2" />Tạo Ca Mới
            </button>
          </div>

          <div className="row g-3">
            {[
              { label: 'Tổng số ca', value: stats.total, icon: 'bi-clock-fill', color: 'rgba(255,255,255,0.15)' },
              { label: 'Đang sử dụng', value: stats.active, icon: 'bi-check-circle-fill', color: 'rgba(255,255,255,0.15)' },
              { label: 'Ngừng sử dụng', value: stats.inactive, icon: 'bi-x-circle-fill', color: 'rgba(255,255,255,0.15)' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="col-6 col-md-4">
                <div style={{ background: color, borderRadius: '12px', padding: '14px 16px', backdropFilter: 'blur(10px)' }}>
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${icon} fs-5 opacity-75`} />
                    <div>
                      <div className="fw-bold fs-5 lh-1">{value}</div>
                      <small className="opacity-75" style={{ fontSize: '0.75rem' }}>{label}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH & FILTER */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="small fw-bold text-secondary mb-1">Tìm kiếm</label>
              <div className="position-relative">
                <i className="bi bi-search position-absolute"
                  style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input type="text" className="form-control ps-5 border-0 bg-light"
                  style={{ borderRadius: '12px' }}
                  placeholder="Tìm tên ca làm việc..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-secondary mb-1">Trạng thái</label>
              <select className="form-select border-0 bg-light" style={{ borderRadius: '12px' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Tất cả</option>
                <option value="active">Đang sử dụng</option>
                <option value="inactive">Ngừng sử dụng</option>
              </select>
            </div>
            <div className="col-md-2 text-end">
              <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">
                {filteredShifts.length}
              </span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-3 text-secondary">Đang tải danh sách...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: '#f8faff' }}>
                  <tr className="text-center small fw-bold text-secondary text-uppercase"
                    style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    <th className="py-3" style={{ width: 55 }}>#</th>
                    <th className="text-start py-3">Ca làm việc</th>
                    <th className="py-3">Bắt đầu</th>
                    <th className="py-3">Kết thúc</th>
                    <th className="py-3">Thời lượng</th>
                    <th className="py-3">Trạng thái</th>
                    <th className="py-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5">
                        <i className="bi bi-inbox fs-2 d-block mb-2 text-muted" />
                        Không tìm thấy ca làm việc phù hợp
                      </td>
                    </tr>
                  ) : paginated.map((shift, idx) => {
                    const realIdx = (page - 1) * PAGE_SIZE + idx;
                    const color = getColor(realIdx);
                    const isActive = shift.isActive === 1 || shift.isActive === true;

                    return (
                      <tr key={shift.id} className="border-top"
                        style={{ opacity: isActive ? 1 : 0.6 }}>
                        <td className="text-center text-secondary" style={{ fontSize: '.88rem' }}>
                          {realIdx + 1}
                        </td>
                        <td>
                          <span className="badge px-3 py-2 rounded-pill fw-bold"
                            style={{ background: color.bg, color: color.text, fontSize: '.85rem' }}>
                            {shift.name}
                          </span>
                        </td>
                        <td className="text-center fw-semibold" style={{ color: '#0f172a' }}>
                          {shift.startTime}
                        </td>
                        <td className="text-center fw-semibold" style={{ color: '#0f172a' }}>
                          {shift.endTime}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-light text-secondary border">
                            {getDuration(shift.startTime, shift.endTime)}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge px-3 py-1 rounded-pill ${isActive
                            ? 'bg-success-subtle text-success border border-success'
                            : 'bg-danger-subtle text-danger border border-danger'}`}>
                            <i className={`bi ${isActive ? 'bi-circle-fill' : 'bi-dash-circle-fill'} me-1`}
                              style={{ fontSize: '0.5rem', verticalAlign: 'middle' }} />
                            {isActive ? 'Đang sử dụng' : 'Ngừng sử dụng'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center align-items-center gap-1">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              style={{ borderRadius: '8px', width: '34px' }}
                              title="Chỉnh sửa"
                              disabled={!isActive}
                              onClick={() => openUpdate(shift)}
                            >
                              <i className="bi bi-pencil-fill" />
                            </button>

                            <div className="form-check form-switch m-0"
                              title={isActive ? 'Ngừng sử dụng' : 'Kích hoạt'}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                checked={isActive}
                                onChange={() => openToggle(shift)}
                                style={{ cursor: 'pointer', width: '2.2rem', height: '1.15rem' }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredShifts.length > 0 && (
            <div className="px-4 py-3 border-top">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {modalType === 'create' && <ShiftCreateModal onClose={closeModal} onSuccess={handleSuccess} />}
      {modalType === 'update' && selectedShift && <ShiftUpdateModal shift={selectedShift} onClose={closeModal} onSuccess={handleSuccess} />}
      {modalType === 'toggle' && selectedShift && <ShiftToggleModal shift={selectedShift} onClose={closeModal} onSuccess={handleSuccess} />}
    </div>
  );
};

export default ShiftList;