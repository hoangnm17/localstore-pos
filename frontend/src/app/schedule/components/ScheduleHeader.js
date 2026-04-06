import React from 'react';

const formatDisplayDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const ScheduleHeader = ({ weekDates, onPrevWeek, onNextWeek }) => {
    const startOfWeek = formatDisplayDate(weekDates[0]);
    const endOfWeek = formatDisplayDate(weekDates[6]);

    return (
        <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold m-0 text-dark">Lịch Làm Việc</h3>
                    <p className="m-0 mt-2 text-secondary">
                        Quản lý và phân công ca cho nhân viên
                    </p>
                </div>

                <div className="d-flex align-items-center gap-2 p-1 bg-white rounded-pill shadow-sm border border-light">
                    <button
                        type="button"
                        className="btn btn-sm btn-light rounded-pill fw-bold px-3 text-secondary"
                        onClick={onPrevWeek}
                    >
                        <i className="bi bi-chevron-left me-1"></i>
                        Trước
                    </button>

                    <span className="fw-bold text-dark px-2" style={{ fontSize: '0.88rem' }}>
                        {startOfWeek} — {endOfWeek}
                    </span>

                    <button
                        type="button"
                        className="btn btn-sm btn-light rounded-pill fw-bold px-3 text-secondary"
                        onClick={onNextWeek}
                    >
                        Sau
                        <i className="bi bi-chevron-right ms-1"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleHeader;