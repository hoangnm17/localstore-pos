const rosterModel = require("../models/roster.model");
const shiftModel = require("../models/shift.model");

class RosterService {

    async getWeeklySchedule(startDate, endDate) {
        const records = await rosterModel.getWeeklySchedule(startDate, endDate);

        const staffMap = {};
        for (const row of records) {
            if (!staffMap[row.staffId]) {
                staffMap[row.staffId] = {
                    staffId: row.staffId,
                    fullName: row.fullName,
                    roleName: row.roleName,
                    totalHours: 0,
                    schedules: {}
                };
            }

            if (row.scheduleId) {
                const dateKey = this.formatDate(row.workDate);

                if (!staffMap[row.staffId].schedules[dateKey]) {
                    staffMap[row.staffId].schedules[dateKey] = [];
                }

                const startTimeObj = this.toComparableTime(row.startTime);
                let endTimeObj = this.toComparableTime(row.endTime);
                if (endTimeObj < startTimeObj) endTimeObj.setDate(endTimeObj.getDate() + 1);
                const hours = (endTimeObj - startTimeObj) / (1000 * 60 * 60);

                staffMap[row.staffId].schedules[dateKey].push({
                    scheduleId: row.scheduleId,
                    shiftId: row.shiftId,
                    shiftName: row.shiftName,
                    startTime: this.formatTime(row.startTime),
                    endTime: this.formatTime(row.endTime),
                    status: row.status
                });

                staffMap[row.staffId].totalHours += hours;
            }
        }
        return Object.values(staffMap);
    }

    // Phân công ca làm việc
    async assignShift({ staffId, shiftId, workDate }) {
        const today = new Date(Date.now() + 7 * 3600 * 1000).toISOString().split('T')[0];
        if (workDate < today) throw new Error(`Ngày ${workDate} đã quá hạn phân công (quá khứ)!`);

        const [shift, staff] = await Promise.all([
            shiftModel.getShiftById(shiftId),
            require("../models/staff.model").getStaffById(staffId)
        ]);

        if (!shift) throw new Error("Không tìm thấy ca làm việc!");
        if (!staff) throw new Error("Không tìm thấy nhân viên!");

        const shiftDisplay = `${shift.name}`;

        const currentTime = new Date(Date.now() + 7 * 3600 * 1000).toISOString().split('T')[1].substring(0, 5);
        const shiftStartStr = this.formatTime(shift.startTime);

        if (workDate === today && currentTime >= shiftStartStr) {
            throw new Error(`"${shiftDisplay}" đã quá giờ bắt đầu hôm nay, không thể phân công!`);
        }

        const existing = await rosterModel.checkExisting(staffId, shiftId, workDate);
        if (existing) {
            throw new Error(`Nhân viên này đã được gán ca "${shiftDisplay}" trong ngày!`);
        }

        const daySchedules = await rosterModel.getStaffSchedulesInDay(staffId, workDate);

        const newStart = this.toComparableTime(shift.startTime);
        let newEnd = this.toComparableTime(shift.endTime);
        if (newEnd < newStart) newEnd = new Date(newEnd.getTime() + 24 * 60 * 60 * 1000);

        for (const assigned of daySchedules) {
            let aStart = this.toComparableTime(assigned.startTime);
            let aEnd = this.toComparableTime(assigned.endTime);
            if (aEnd < aStart) aEnd = new Date(aEnd.getTime() + 24 * 60 * 60 * 1000);

            if (newStart < aEnd && newEnd > aStart) {
                const assignedDisplay = `${assigned.shiftName}`;
                throw new Error(`Ca mới "${shiftDisplay}" trùng thời gian với ca đã gán ${assignedDisplay}!`);
            }
        }

        return await rosterModel.assignShift(staffId, shiftId, workDate);
    }

    // Xóa phân công
    async removeShift(scheduleId) {
        const schedule = await rosterModel.getScheduleById(scheduleId);
        if (!schedule) throw new Error("Không tìm thấy lịch làm việc!");

        const nowVN = new Date(Date.now() + 7 * 3600 * 1000);
        const todayStr = nowVN.toISOString().split('T')[0];
        const currentTime = nowVN.toISOString().split('T')[1].substring(0, 5);

        const workDateStr = this.formatDate(schedule.workDate);
        const shiftStartStr = this.formatTime(schedule.startTime);

        if (workDateStr < todayStr) throw new Error("Không được xóa ca trong quá khứ!");
        if (workDateStr === todayStr && currentTime >= shiftStartStr) {
            throw new Error("Ca làm việc đã tới lúc bắt đầu, không thể xóa!");
        }

        return await rosterModel.removeShift(scheduleId);
    }

    // Xóa hàng loạt
    async clearSchedule({ staffId, startDate, endDate }) {
        if (!staffId || !startDate || !endDate) throw new Error("Thiếu thông tin để xóa lịch!");


        const nowVN = new Date(Date.now() + 7 * 3600 * 1000);
        const todayStr = nowVN.toISOString().split('T')[0];
        const currentTimeStr = nowVN.toISOString().split('T')[1].substring(0, 8); 

        const deletedCount = await rosterModel.clearStaffSchedulesInRange({
            staffId,
            startDate,
            endDate,
            today: todayStr,
            currentTime: currentTimeStr
        });
        return { deletedCount };
    }

    formatTime(t) {
        if (!t) return '00:00';
        if (t instanceof Date) {
            return t.toISOString().split('T')[1].substring(0, 5);
        }
        if (typeof t === 'string') {
            const match = t.match(/(\d{2}:\d{2})/);
            return match ? match[1] : '00:00';
        }
        return '00:00';
    }

    formatDate(d) {
        if (!d) return '';
        if (d instanceof Date) return d.toISOString().split('T')[0];
        if (typeof d === 'string' && d.includes('T')) return d.split('T')[0];
        return String(d);
    }

    toComparableTime(t) {
        const timeStr = this.formatTime(t);
        const [h, m] = timeStr.split(':').map(Number);
        return new Date(1970, 0, 1, h, m, 0);
    }
}

module.exports = new RosterService();
