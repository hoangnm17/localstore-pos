import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Pagination from '../../components/Pagination/Pagination';
import { getShifts } from '../../services/Shift/shift.service.js';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import useDebounce from '../../hooks/common/useDebounce';
import ShiftCreateModal from './modals/ShiftCreateModal';
import ShiftDetailModal from './modals/ShiftDetailModal';
import ShiftUpdateModal from './modals/ShiftUpdateModal';
import ShiftToggleModal from './modals/ShiftToggleModal';
import useTitle from "hooks/common/useTitle";

const PAGE_SIZE = 10;

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
  useTitle("Danh Sách Ca")
  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getShifts();
      if (res?.success) setShifts(res.data);
    } catch (err) {
      showNotification(err.message || 'Không thể tải danh sách ca làm việc!', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);
  useEffect(() => { setPage(1); }, [searchTerm, filterStatus]);

  const openCreate = () => setModalType('create');
  const openDetail = (s) => { setSelectedShift(s); setModalType('detail'); };
  const openUpdate = (s) => { setSelectedShift(s); setModalType('update'); };
  const openToggle = (s) => { setSelectedShift(s); setModalType('toggle'); };
  const closeModal = () => { setModalType(null); setSelectedShift(null); };
  const handleSuccess = useCallback(() => { closeModal(); fetchShifts(); }, [fetchShifts]);

  const filteredShifts = useMemo(() => {
    return shifts.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        filterStatus === 'all' ? true :
          filterStatus === 'active' ? (s.isActive === 1 || s.isActive === true) :
            !(s.isActive === 1 || s.isActive === true);
      return matchSearch && matchStatus;
    });
  }, [shifts, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredShifts.length / PAGE_SIZE);
  const paginated = filteredShifts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) {
      mins += 1440;
    }
    if (mins === 0) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <div className="flex-grow-1 p-4" style={{ background: '#f0f2f5', maxHeight: '100vh' }}>

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold m-0 text-dark">Quản Lý Ca Làm Việc</h3>
         </div>
          <button className="btn text-white fw-bold px-4 py-2 shadow-sm d-flex align-items-center gap-2"
            style={{ borderRadius: '8px', background: '#6366f1' }} onClick={openCreate}>
            <i className="bi bi-plus-circle-fill" /> Tạo Ca Mới
          </button>
        </div>

        {/* SEARCH & FILTER */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="small fw-bold text-secondary mb-1">Tìm kiếm</label>
              <div className="position-relative">
                <i className="bi bi-search position-absolute"
                  style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input type="text" className="form-control ps-5 border-0 bg-light "
                  style={{ borderRadius: '12px' }}
                  placeholder="Tìm tên ca làm việc..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-secondary mb-1">Trạng thái</label>
              <select className="form-select border-0 bg-light " style={{ borderRadius: '12px' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang sử dụng</option>
                <option value="inactive">Ngừng sử dụng</option>
              </select>
            </div>
            <div className="col-md-5 d-flex gap-2 justify-content-end align-items-end">
              <button className="btn btn-outline-secondary fw-bold d-flex align-items-center gap-2"
                style={{ borderRadius: '10px', height: '38px', fontSize: '0.85rem' }}
                onClick={() => { setSearchInput(''); setFilterStatus('all'); setPage(1); fetchShifts(); }}>
                   Làm mới
              </button>
              {/* <div className="bg-primary text-white d-flex align-items-center justify-content-center fw-bold px-3"
                style={{ borderRadius: '10px', height: '38px', minWidth: '45px', fontSize: '1rem' }}
                title="Tổng số ca tìm thấy">
                {filteredShifts.length}
              </div> */}
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
                            {isActive ? 'Đang sử dụng' : 'Ngừng sử dụng'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-info"
                              style={{ borderRadius: '8px', width: '34px', height: '34px', padding: 0 }}
                              title="Xem chi tiết"
                              onClick={() => openDetail(shift)}
                            >
                              <i className="bi bi-eye-fill" style={{ fontSize: '1rem', lineHeight: '34px' }} />
                            </button>

                            <button
                              className="btn btn-sm btn-outline-warning ms-1"
                              style={{ borderRadius: '8px', width: '34px', height: '34px', padding: 0 }}
                              title="Chỉnh sửa giới hạn ca"
                              onClick={() => openUpdate(shift)}
                            >
                              <i className="bi bi-pencil-fill" style={{ fontSize: '1rem', lineHeight: '34px' }} />
                            </button>

                            <div className="form-check form-switch m-0 ms-2"
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
      {modalType === 'detail' && selectedShift && <ShiftDetailModal shift={selectedShift} onClose={closeModal} />}
      {modalType === 'update' && selectedShift && <ShiftUpdateModal shift={selectedShift} onClose={closeModal} onSuccess={handleSuccess} />}
      {modalType === 'toggle' && selectedShift && <ShiftToggleModal shift={selectedShift} onClose={closeModal} onSuccess={handleSuccess} />}
    </div>
  );
};

export default ShiftList;