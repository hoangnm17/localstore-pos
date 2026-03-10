import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../../services/axiosInstance';
import Sidebar from '../../components/Sidebar/Sidebar';
import Pagination from '../../components/Pagination/Pagination';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import useDebounce from '../../hooks/common/useDebounce';
import StaffCreateModal  from './modals/StaffCreateModal';
import StaffUpdateModal  from './modals/StaffUpdateModal';
import StaffDetailModal  from './modals/StaffDetailModal';
import StaffToggleModal  from './modals/StaffToggleModal';
import StaffResignModal  from './modals/StaffResignModal'; 

const StaffList = () => {
    const [staffs, setStaffs] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);

    const [searchInput, setSearchInput] = useState('');
    const searchTerm = useDebounce(searchInput, 400);
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('asc');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [modalType, setModalType] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const { showNotification } = useNotification();

    const fetchData = useCallback(async () => {
        try {
            const response = await api.get('/staff');
            if (response.data?.success) {
                setStaffs(response.data.data);
            } else { setStaffs([]); }
        } catch {
            showNotification('Không thể tải danh sách nhân viên!', 'error');
            setStaffs([]);
        } finally { setFetchLoading(false); }
    }, [showNotification]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter, statusFilter]);

    const openCreate  = () => setModalType('create');
    const openUpdate  = (s) => { setSelectedStaff(s); setModalType('update'); };
    const openDetail  = (s) => { setSelectedStaff(s); setModalType('detail'); };
    const openToggle  = (s) => { setSelectedStaff(s); setModalType('toggle'); };
    const openResign  = (s) => { setSelectedStaff(s); setModalType('resign'); }; 
    const closeModal  = () => { setModalType(null); setSelectedStaff(null); };
    const handleSuccess = useCallback(() => { closeModal(); fetchData(); }, [fetchData]);

    const filteredData = useMemo(() => {
        let data = staffs.filter(s => {
            const matchSearch =
                s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phoneNumber.includes(searchTerm);
            const matchRole   = roleFilter === 'All' || s.roleName === roleFilter;
            const matchStatus = statusFilter === 'All' || s.employmentStatus === statusFilter;
            return matchSearch && matchRole && matchStatus;
        });
        data.sort((a, b) =>
            sortOrder === 'asc'
                ? a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase())
                : b.fullName.toLowerCase().localeCompare(a.fullName.toLowerCase())
        );
        return data;
    }, [staffs, searchTerm, roleFilter, statusFilter, sortOrder]);

    const indexOfLastItem  = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems     = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages       = Math.ceil(filteredData.length / itemsPerPage);

    const stats = useMemo(() => ({
        total:    staffs.length,
        active:   staffs.filter(s => s.isActive === 'active').length,
        locked:   staffs.filter(s => s.isActive === 'locked').length,
        resigned: staffs.filter(s => s.employmentStatus === 'resigned').length,
    }), [staffs]);

    const roleBadgeClass = (r) =>
        r === 'Manager' ? 'bg-primary' : r === 'Cashier' ? 'bg-success' : 'bg-warning text-dark';

    return (
        <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar />
            <div className="flex-grow-1 p-4">
                {/* HEADER STATS */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', color: '#fff'
                }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h3 className="fw-bold m-0">Quản Lý Nhân Viên</h3>
                            <p className="m-0 mt-1 opacity-75 small">Quản lý toàn bộ nhân sự của cửa hàng</p>
                        </div>
                        <button className="btn btn-light fw-bold px-4 shadow-sm"
                            style={{ borderRadius: '12px' }} onClick={openCreate}>
                            <i className="bi bi-person-plus-fill me-2" />Thêm Mới
                        </button>
                    </div>
                    <div className="row g-3">
                        {[
                            { label: 'Tổng nhân viên',  value: stats.total,    icon: 'bi-people-fill' },
                            { label: 'Đang hoạt động',  value: stats.active,   icon: 'bi-check-circle-fill' },
                            { label: 'Tài khoản khóa',  value: stats.locked,   icon: 'bi-x-circle-fill' },
                            { label: 'Đã nghỉ việc',    value: stats.resigned, icon: 'bi-person-dash-fill' }, 
                        ].map(({ label, value, icon }) => (
                            <div key={label} className="col-6 col-md-3">
                                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px 16px', backdropFilter: 'blur(10px)' }}>
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
                        <div className="col-md-4">
                            <label className="small fw-bold text-secondary mb-1">Tìm kiếm</label>
                            <div className="position-relative">
                                <i className="bi bi-search position-absolute"
                                    style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input type="text" className="form-control ps-5 border-0 bg-light"
                                    style={{ borderRadius: '12px' }}
                                    placeholder="Tìm tên, SĐT, email..."
                                    onChange={(e) => setSearchInput(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-2">
                            <label className="small fw-bold text-secondary mb-1">Vai trò</label>
                            <select className="form-select border-0 bg-light" style={{ borderRadius: '12px' }}
                                onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="All">Tất cả</option>
                                <option value="Manager">Quản lý</option>
                                <option value="Cashier">Thu Ngân</option>
                                <option value="Warehouse">Thủ Kho</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="small fw-bold text-secondary mb-1">Nhân sự</label>
                            <select className="form-select border-0 bg-light" style={{ borderRadius: '12px' }}
                                onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="All">Tất cả</option>
                                <option value="working">Đang làm</option>
                                <option value="resigned">Đã nghỉ</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="small fw-bold text-secondary mb-1">Sắp xếp</label>
                            <select className="form-select border-0 bg-light" style={{ borderRadius: '12px' }}
                                onChange={(e) => setSortOrder(e.target.value)}>
                                <option value="asc">Tên A → Z</option>
                                <option value="desc">Tên Z → A</option>
                            </select>
                        </div>
                        <div className="col-md-2 text-end">
                            <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">
                                {filteredData.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    {fetchLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
                            <p className="mt-3 text-secondary">Đang tải danh sách...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead style={{ background: '#f8faff' }}>
                                    <tr className="text-center small fw-bold text-secondary">
                                        <th className="py-3">#</th>
                                        <th className="text-start py-3">Nhân viên</th>
                                        <th>Email</th>
                                        <th>Số điện thoại</th>
                                        <th>Vai trò</th>
                                        <th>Trạng thái</th>
                                        <th>Nhân sự</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((s, index) => (
                                        <tr key={s.id} className="border-top"
                                            style={{ opacity: s.employmentStatus === 'resigned' ? 0.65 : 1 }}>
                                            <td className="text-center text-secondary small">
                                                {indexOfFirstItem + index + 1}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{
                                                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                                                        background: s.employmentStatus === 'resigned'
                                                            ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                                                            : 'linear-gradient(135deg, #667eea, #764ba2)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: '#fff', fontWeight: 'bold', fontSize: '0.9rem'
                                                    }}>
                                                        {s.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold" style={{ color: '#1e293b' }}>{s.fullName}</div>
                                                        <small className="text-muted">{s.username}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center text-secondary small">{s.email}</td>
                                            <td className="text-center text-secondary small">{s.phoneNumber}</td>
                                            <td className="text-center">
                                                <span className={`badge px-3 py-1 rounded-pill ${roleBadgeClass(s.roleName)}`}>
                                                    {s.roleName}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge px-3 py-1 rounded-pill ${s.isActive === 'active'
                                                    ? 'bg-success-subtle text-success border border-success'
                                                    : 'bg-danger-subtle text-danger border border-danger'}`}>
                                                    <i className={`bi ${s.isActive === 'active' ? 'bi-circle-fill' : 'bi-dash-circle-fill'} me-1`}
                                                        style={{ fontSize: '0.5rem', verticalAlign: 'middle' }} />
                                                    {s.isActive === 'active' ? 'Hoạt động' : 'Khóa'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge px-2 py-1 rounded-pill ${s.employmentStatus === 'working'
                                                    ? 'bg-primary-subtle text-primary border border-primary'
                                                    : 'bg-warning-subtle text-warning border border-warning'}`}>
                                                    <i className={`bi ${s.employmentStatus === 'working' ? 'bi-briefcase-fill' : 'bi-person-dash-fill'} me-1`}
                                                        style={{ fontSize: '0.6rem', verticalAlign: 'middle' }} />
                                                    {s.employmentStatus === 'working' ? 'Làm việc' : 'Đã nghỉ'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center align-items-center gap-1">
                                                    <button className="btn btn-sm btn-outline-info"
                                                        style={{ borderRadius: '8px', width: '34px' }}
                                                        title="Xem chi tiết" onClick={() => openDetail(s)}>
                                                        <i className="bi bi-eye-fill" />
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-primary"
                                                        style={{ borderRadius: '8px', width: '34px' }}
                                                        title="Chỉnh sửa" onClick={() => openUpdate(s)}
                                                        disabled={s.employmentStatus === 'resigned'}>
                                                        <i className="bi bi-pencil-fill" />
                                                    </button>
                                                    <div className="form-check form-switch m-0"
                                                        title={s.isActive === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                                                        <input className="form-check-input" type="checkbox"
                                                            role="switch" checked={s.isActive === 'active'}
                                                            onChange={() => openToggle(s)}
                                                            disabled={s.employmentStatus === 'resigned'}
                                                            style={{ cursor: 'pointer', width: '2.2rem', height: '1.15rem' }} />
                                                    </div>
                                                    {s.employmentStatus !== 'resigned' && (
                                                        <button className="btn btn-sm btn-outline-warning"
                                                            style={{ borderRadius: '8px', width: '34px' }}
                                                            title="Đánh dấu nghỉ việc"
                                                            onClick={() => openResign(s)}>
                                                            <i className="bi bi-person-dash-fill" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentItems.length === 0 && (
                                        <tr>
                                            <td colSpan="8" className="text-center py-5 text-secondary">
                                                <i className="bi bi-inbox fs-2 d-block mb-2" />
                                                Không tìm thấy nhân viên phù hợp
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!fetchLoading && filteredData.length > 0 && (
                        <div className="px-4 py-3 border-top">
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            {modalType === 'create'  && <StaffCreateModal onClose={closeModal} onSuccess={handleSuccess} />}
            {modalType === 'update'  && selectedStaff && <StaffUpdateModal staffId={selectedStaff.id} onClose={closeModal} onSuccess={handleSuccess} />}
            {modalType === 'detail'  && selectedStaff && <StaffDetailModal staffId={selectedStaff.id} onClose={closeModal} onEdit={() => setModalType('update')} />}
            {modalType === 'toggle'  && selectedStaff && <StaffToggleModal staff={selectedStaff} onClose={closeModal} onSuccess={handleSuccess} />}
            {modalType === 'resign'  && selectedStaff && <StaffResignModal staff={selectedStaff} onClose={closeModal} onSuccess={handleSuccess} />}
        </div>
    );
};
export default StaffList;
