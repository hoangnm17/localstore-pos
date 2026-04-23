import React from 'react';

const ScheduleFilter = ({
    searchText,
    setSearchText,
    filterMode,
    setFilterMode,
    onRefresh,
}) => {
    const handleRefresh = () => {
        setSearchText('');
        setFilterMode('staff');
        if (onRefresh) onRefresh();
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div className="row g-3 align-items-end">
                <div className="col-md-6">
                    <label className="small fw-bold text-secondary mb-1">Tìm kiếm</label>
                    <div className="position-relative">
                        <i
                            className="bi bi-search position-absolute text-secondary"
                            style={{ left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <input
                            type="text"
                            className="form-control ps-5 border-0 bg-light rounded-3"
                            placeholder="Tìm tên nhân viên..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>

                <div className="col-md-3">
                    <label className="small fw-bold text-secondary mb-1">Xem theo</label>
                    <select
                        className="form-select border-0 bg-light rounded-3"
                        value={filterMode}
                        onChange={(e) => setFilterMode(e.target.value)}
                    >
                        <option value="staff">Nhân viên</option>
                        <option value="shift">Ca làm việc</option>
                    </select>
                </div>

                <div className="col-md-2 d-flex align-items-end justify-content-end">
                    <div className="d-flex gap-2 ">
                        <button
                            type="button"
                            className="btn btn-outline-secondary fw-bold w-100"
                            onClick={handleRefresh}>
                            Làm mới
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleFilter;