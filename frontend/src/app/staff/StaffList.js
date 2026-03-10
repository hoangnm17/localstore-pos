import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../../services/axiosInstance';
import Sidebar from '../../components/Sidebar/Sidebar';
import Pagination from '../../components/Pagination/Pagination';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import useDebounce from '../../hooks/common/useDebounce';
import StaffCreateModal from './modals/StaffCreateModal';
import StaffUpdateModal from './modals/StaffUpdateModal';
import StaffDetailModal from './modals/StaffDetailModal';
import StaffToggleModal from './modals/StaffToggleModal';

const StaffList = () => {
    const [staffs, setStaffs] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);

    const [searchInput, setSearchInput] = useState('');
    const searchTerm = useDebounce(searchInput, 400);
    const [roleFilter, setRoleFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('asc');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [modalType, setModalType] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);

    const { showNotification } = useNotification();
    const fetchData = useCallback(async () => {
        try {
            const response = await api.get('/staff');
            if (response.data?.success) {
                setStaffs(response.data.data);
            } else {
                setStaffs([]);
            }
        } catch (err) {
            console.error('Lỗi fetch:', err);
            showNotification('Không thể tải danh sách nhân viên!', 'error');
            setStaffs([]);
        } finally {
            setFetchLoading(false);
        }
    }, [showNotification]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);
    
    const openCreate = () => setModalType('create');
    const openUpdate = (staff) => { setSelectedStaff(staff); setModalType('update'); };
    const openDetail = (staff) => { setSelectedStaff(staff); setModalType('detail'); };
    const openToggle = (staff) => { setSelectedStaff(staff); setModalType('toggle'); };
    const closeModal = () => { setModalType(null); setSelectedStaff(null); };

    const handleSuccess = useCallback(() => {
        closeModal();
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() => {
        let data = staffs.filter(s =>
            (s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phoneNumber.includes(searchTerm)) &&
            (roleFilter === 'All' || s.roleName === roleFilter)
        );
        data.sort((a, b) => {
            const nameA = a.fullName.toLowerCase();
            const nameB = b.fullName.toLowerCase();
            return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
        return data;
    }, [staffs, searchTerm, roleFilter, sortOrder]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const stats = useMemo(() => ({
        total: staffs.length,
        active: staffs.filter(s => s.isActive === 'active').length,
        locked: staffs.filter(s => s.isActive === 'locked').length,
        manager: staffs.filter(s => s.roleName === 'Manager').length,
    }), [staffs]);

    const roleBadgeClass = (roleName) => {
        if (roleName === 'Manager') return 'bg-primary';
        if (roleName === 'Cashier') return 'bg-success';
        return 'bg-warning text-dark';
    };

    return (
        <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar />
            <div className="flex-grow-1 p-4">
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '20px',
                    padding: '28px 32px',
                    marginBottom: '24px',
                    color: '#fff'
                }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h3 className="fw-bold m-0">Quản Lý Nhân Viên</h3>
                            <p className="m-0 mt-1 opacity-75 small">Quản lý toàn bộ nhân sự của cửa hàng</p>
                        </div>
                        <button
                            className="btn btn-light fw-bold px-4 shadow-sm"
                            style={{ borderRadius: '12px' }}
                            onClick={openCreate}
                        >
                            <i className="bi bi-person-plus-fill me-2" />
                            Thêm Mới
                        </button>
                    </div>
                    <div className="row g-3">
                        {[
                            { label: 'Tổng nhân viên', value: stats.total, icon: 'bi-people-fill' },
                            { label: 'Đang hoạt động', value: stats.active, icon: 'bi-check-circle-fill' },
                            { label: 'Đã khóa', value: stats.locked, icon: 'bi-x-circle-fill' },
                            { label: 'Quản lý', value: stats.manager, icon: 'bi-shield-check' },
                        ].map(({ label, value, icon }) => (
                            <div key={label} className="col-6 col-md-3">
                                <div style={{
                                    background: 'rgba(255,255,255,0.15)',
                                    borderRadius: '12px',
                                    padding: '14px 16px',
                                    backdropFilter: 'blur(10px)'
                                }}>
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
                <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-5">
                            <label className="small fw-bold text-secondary mb-1">Tìm kiếm</label>
                            <div className="position-relative">
                                <i className="bi bi-search position-absolute"
                                    style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    className="form-control ps-5 border-0 bg-light"
                                    style={{ borderRadius: '12px' }}
                                    placeholder="Tìm tên, email hoặc SĐT..."
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <label className="small fw-bold text-secondary mb-1">Lọc vai trò</label>
                            <select
                                className="form-select border-0 bg-light"
                                style={{ borderRadius: '12px' }}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="All">Tất cả vai trò</option>
                                <option value="Manager">Quản lý</option>
                                <option value="Cashier">Thu Ngân</option>
                                <option value="Warehouse">Thủ Kho</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="small fw-bold text-secondary mb-1">Sắp xếp</label>
                            <select
                                className="form-select border-0 bg-light"
                                style={{ borderRadius: '12px' }}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="asc">Tên A → Z</option>
                                <option value="desc">Tên Z → A</option>
                            </select>
                        </div>
                        <div className="col-md-1 text-end">
                            <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">
                                {filteredData.length}
                            </span>
                        </div>
                    </div>
                </div>
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
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((s, index) => (
                                        <tr key={s.id} className="border-top">
                                            <td className="text-center text-secondary small">
                                                {indexOfFirstItem + index + 1}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div style={{
                                                        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
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

                                            <td className="text-center text-secondary small">{s.username}</td>
                                            <td className="text-center text-secondary small">{s.phoneNumber}</td>

                                            <td className="text-center">
                                                <span className={`badge px-3 py-1 rounded-pill ${roleBadgeClass(s.roleName)}`}>
                                                    {s.roleName}
                                                </span>
                                            </td>

                                            <td className="text-center">
                                                <span className={`badge px-3 py-1 rounded-pill ${s.isActive === 'active'
                                                        ? 'bg-success-subtle text-success border border-success'
                                                        : 'bg-danger-subtle text-danger border border-danger'
                                                    }`}>
                                                    <i className={`bi ${s.isActive === 'active' ? 'bi-circle-fill' : 'bi-dash-circle-fill'} me-1`}
                                                        style={{ fontSize: '0.5rem', verticalAlign: 'middle' }} />
                                                    {s.isActive === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="d-flex justify-content-center align-items-center gap-2">
                                                    <button
                                                        className="btn btn-sm btn-outline-info"
                                                        style={{ borderRadius: '8px', width: '34px' }}
                                                        title="Xem chi tiết"
                                                        onClick={() => openDetail(s)}
                                                    >
                                                        <i className="bi bi-eye-fill" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        style={{ borderRadius: '8px', width: '34px' }}
                                                        title="Chỉnh sửa"
                                                        onClick={() => openUpdate(s)}
                                                    >
                                                        <i className="bi bi-pencil-fill" />
                                                    </button>

                                                    <div className="form-check form-switch m-0" title={s.isActive === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            role="switch"
                                                            checked={s.isActive === 'active'}
                                                            onChange={() => openToggle(s)}
                                                            style={{ cursor: 'pointer', width: '2.2rem', height: '1.15rem' }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}

                                    {currentItems.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-secondary">
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
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {modalType === 'create' && (
                <StaffCreateModal
                    onClose={closeModal}
                    onSuccess={handleSuccess}
                />
            )}
            {modalType === 'update' && selectedStaff && (
                <StaffUpdateModal
                    staffId={selectedStaff.id}
                    onClose={closeModal}
                    onSuccess={handleSuccess}
                />
            )}
            {modalType === 'detail' && selectedStaff && (
                <StaffDetailModal
                    staffId={selectedStaff.id}
                    onClose={closeModal}
                    onEdit={(id) => {
                        setModalType('update');
                    }}
                />
            )}
            {modalType === 'toggle' && selectedStaff && (
                <StaffToggleModal
                    staff={selectedStaff}
                    onClose={closeModal}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};
export default StaffList;
