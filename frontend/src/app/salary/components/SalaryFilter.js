import React from 'react';

const SalaryFilter = ({
    month, setMonth,
    year, setYear,
    role, setRole, roleList,
    searchInput, setSearchInput,
    totalCount, years
}) => {
    return (
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
            <div className="row g-3 align-items-end">
                <div className="col-md-3">
                    <label className="small fw-bold text-secondary mb-1">Tháng / Năm</label>
                    <div className="d-flex gap-2">
                        <select className="form-select border-0 bg-light fw-bold" style={{ borderRadius: '12px' }}
                            value={month} onChange={e => setMonth(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                            ))}
                        </select>
                        <select className="form-select border-0 bg-light fw-bold" style={{ borderRadius: '12px' }}
                            value={year} onChange={e => setYear(Number(e.target.value))}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                <div className="col-md-4">
                    <label className="small fw-bold text-secondary mb-1">Tìm kiếm nhân viên</label>
                    <div className="position-relative">
                        <i className="bi bi-search position-absolute"
                            style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input type="text" className="form-control ps-5 border-0 bg-light"
                            style={{ borderRadius: '12px' }}
                            placeholder="Nhập tên nhân viên..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)} />
                    </div>
                </div>

                <div className="col-md-3">
                    <label className="small fw-bold text-secondary mb-1">Lọc vai trò</label>
                    <select className="form-select border-0 bg-light" style={{ borderRadius: '12px' }}
                        value={role} onChange={e => setRole(e.target.value)}>
                        <option value="">Tất cả vai trò</option>
                        {roleList.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-2 text-end">
                    <span className="badge bg-primary rounded-pill px-3 py-2 fs-6" title="Số lượng kết quả">
                        {totalCount} NV
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SalaryFilter;