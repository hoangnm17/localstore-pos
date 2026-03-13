import React from 'react';

const ScheduleFilter = ({
    searchText, setSearchText,
    filterMode, setFilterMode,
    roleFilter, setRoleFilter,
    totalCount,
}) => {
    return (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div className="row g-3 align-items-end">
                <div className="col-md-4">
                    <label className="small fw-bold text-secondary mb-1">Tìm kiếm</label>
                    <div className="position-relative">
                        <i className="bi bi-search position-absolute"
                            style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input type="text" className="form-control ps-5 border-0 bg-light"
                            style={{ borderRadius: '12px' }}
                            placeholder="Tìm tên nhân viên..."
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)} />
                    </div>
                </div>
                <div className="col-md-3">
                    <label className="small fw-bold text-secondary mb-1">Xem theo</label>
                    <select className="form-select border-0 bg-light" style={{ borderRadius: '12px' }}
                        value={filterMode} onChange={e => setFilterMode(e.target.value)}>
                        <option value="staff">Nhân Viên</option>
                        <option value="shift">Ca Làm Việc</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <label className="small fw-bold text-secondary mb-1">Lọc vai trò</label>
                    <select className="form-select border-0 bg-light" style={{ borderRadius: '12px' }}
                        value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="Cashier">Thu Ngân</option>
                        <option value="Warehouse">Nhân Viên Kho</option>
                    </select>
                </div>
                <div className="col-md-2 text-end">
                    <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">
                        {totalCount}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ScheduleFilter;
