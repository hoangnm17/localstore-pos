import React from 'react';

const ScheduleFilter = ({
    searchText, setSearchText,
    filterMode, setFilterMode,
    totalCount,
    onRefresh
}) => {
    return (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div className="row g-3 align-items-end">
                <div className="col-md-5">
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
                <div className="col-md-4">
                    <label className="small fw-bold text-secondary mb-1">Xem theo</label>
                    <select className="form-select border-0 bg-light" style={{ borderRadius: '12px' }}
                        value={filterMode} onChange={e => setFilterMode(e.target.value)}>
                        <option value="staff">Nhân Viên</option>
                        <option value="shift">Ca Làm Việc</option>
                        <option value="date">Ngày Làm Việc</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <div className="d-flex align-items-end h-100">
                        <div className="d-flex gap-2 w-100 align-items-center">
                            <button className="btn btn-outline-secondary fw-bold d-flex align-items-center justify-content-center gap-2 px-3"
                                style={{ borderRadius: '12px', height: '38px', minWidth: '110px' }}
                                onClick={() => {
                                    setSearchText('');
                                    setFilterMode('staff');
                                    if (onRefresh) onRefresh();
                                }}>
                                <i className="bi bi-arrow-counterclockwise" /> Làm mới
                            </button>
                            <div className="badge bg-primary rounded-pill px-3 py-2 fs-6 d-flex align-items-center justify-content-center" style={{ minWidth: '45px', height: '38px' }}>
                                {totalCount}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleFilter;
