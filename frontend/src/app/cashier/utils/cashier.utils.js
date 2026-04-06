export const getMonday = (inputDate) => {
    const date = new Date(inputDate);
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    date.setDate(date.getDate() + diffToMonday);
    date.setHours(0, 0, 0, 0);

    return date;
};

export const formatDate = (inputDate) => {
    const date = new Date(inputDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const getWeekDates = (monday) => {
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday);
        date.setDate(date.getDate() + index);
        return date;
    });
};

export const formatHours = (hoursValue) => {
    if (!hoursValue) return '0h 00m';

    const hours = Math.floor(hoursValue);
    const minutes = Math.round((hoursValue - hours) * 60);

    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
};

export const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value || 0);
};

export const formatDisplayDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const formatDisplayTime = (value) => {
    if (!value) return '—';

    if (typeof value === 'string') {
        const match = value.match(/^(\d{2}):(\d{2})/);
        if (match) return `${match[1]}:${match[2]}`;

        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');
            return `${hour}:${minute}`;
        }
    }

    if (value instanceof Date) {
        const hour = String(value.getHours()).padStart(2, '0');
        const minute = String(value.getMinutes()).padStart(2, '0');
        return `${hour}:${minute}`;
    }

    return '—';
};

export const groupSchedulesByDate = (schedules, getDuration) => {
    const scheduleMap = {};
    let totalWeekHours = 0;

    (schedules || []).forEach((schedule) => {
        const dateKey = String(schedule.workDate).split('T')[0];

        if (!scheduleMap[dateKey]) {
            scheduleMap[dateKey] = [];
        }

        scheduleMap[dateKey].push(schedule);

        const shiftMinutes = getDuration(schedule.startTime, schedule.endTime) || 0;
        totalWeekHours += shiftMinutes / 60;
    });

    return {
        scheduleMap,
        totalWeekHours,
    };
};

export const getScheduleCardStyle = (status, hasHandover) => {
    if (status === 'absent') {
        return {
            bg: '#fef2f2',
            text: '#b91c1c',
            border: '#fecaca',
        };
    }

    if (status === 'completed' || hasHandover) {
        return {
            bg: '#f1f5f9',
            text: '#64748b',
            border: '#cbd5e1',
        };
    }

    return {
        bg: '#f8fafc',
        text: '#334155',
        border: '#e2e8f0',
    };
};
export const parseVND = (value) => {
    if (value === '' || value === null || value === undefined) return 0;
    return Number(String(value).replace(/[^0-9]/g, ''));
};