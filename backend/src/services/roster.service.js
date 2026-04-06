const rosterModel = require("../models/roster.model");
const shiftModel = require("../models/shift.model");
const staffModel = require("../models/staff.model");

class RosterService {
    async getWeekSchedule(startDate, endDate) {
        const rows = await rosterModel.getWeekRows(startDate, endDate);
        return this.groupWeekRows(rows);
    }

    async assignShift({ staffId, shiftId, workDate }) {
        const [shift, staff] = await Promise.all([
            shiftModel.getShiftById(shiftId),
            staffModel.getStaffById(staffId),
        ]);

        if (!shift) throw new Error("Không tìm thấy ca làm việc!");
        if (!staff) throw new Error("Không tìm thấy nhân viên!");
        const isActive = shift.isActive === true || shift.isActive === 1;
        if (!isActive) {
            throw new Error("Ca làm việc đã bị vô hiệu hóa, không thể phân công!");
        }
        if (staff.employmentStatus !== 'working') {
            throw new Error("Nhân viên đã nghỉ việc, không thể phân công!");
        }

        await this.checkAddShift({ staffId, shift, workDate });

        await rosterModel.create(staffId, shiftId, workDate);
        return true;
    }

    async deleteShift(scheduleId) {
        const schedule = await rosterModel.findById(scheduleId);
        if (!schedule) throw new Error("Không tìm thấy lịch làm việc!");

        if (schedule.status !== 'assigned') {
            throw new Error("Chỉ có thể xóa ca chưa bắt đầu !");
        }
        const now = this.getNowVN();
        const workDate = this.toDateStr(schedule.workDate);
        const shiftStart = this.toTimeStr(schedule.startTime);

        if (workDate < now.today) {
            throw new Error("Không được xóa ca trong quá khứ!");
        }

        if (workDate === now.today && now.time >= shiftStart) {
            throw new Error("Ca làm việc đã tới lúc bắt đầu, không thể xóa!");
        }

        await rosterModel.remove(scheduleId);
        return true;
    }

    async clearShifts({ staffId, startDate, endDate }) {
        if (!staffId || !startDate || !endDate) {
            throw new Error("Thiếu thông tin để xóa lịch!");
        }

        const now = this.getNowVN();

        const deletedCount = await rosterModel.clearRange({
            staffId,
            startDate,
            endDate,
            today: now.today,
            currentTime: now.fullTime,
        });

        return { deletedCount };
    }

    async checkAddShift({ staffId, shift, workDate }) {
        const now = this.getNowVN();
        const shiftName = shift.name;
        const shiftStart = this.toTimeStr(shift.startTime);

        if (workDate < now.today) {
            throw new Error(`Ngày ${workDate} đã quá hạn phân công (quá khứ)!`);
        }

        if (workDate === now.today && now.time >= shiftStart) {
            throw new Error(`"${shiftName}" đã quá giờ bắt đầu hôm nay, không thể phân công!`);
        }

        const sameShift = await rosterModel.findSameShift(staffId, shift.id, workDate);
        if (sameShift) {
            throw new Error(`Nhân viên này đã được gán ca "${shiftName}" trong ngày!`);
        }

        const dayShifts = await rosterModel.getDayShifts(staffId, workDate);
        const newRange = this.getShiftRange(shift.startTime, shift.endTime);

        for (const item of dayShifts) {
            const oldRange = this.getShiftRange(item.startTime, item.endTime);

            if (this.isOverlap(newRange, oldRange)) {
                throw new Error(`Ca mới "${shiftName}" trùng thời gian với ca đã gán ${item.shiftName}!`);
            }
        }
    }

    groupWeekRows(rows) {
        const map = {};

        for (const row of rows) {
            if (!map[row.staffId]) {
                map[row.staffId] = {
                    staffId: row.staffId,
                    fullName: row.fullName,
                    roleName: row.roleName,
                    totalHours: 0,
                    schedules: {},
                };
            }

            if (!row.scheduleId) continue;

            const dateKey = this.toDateStr(row.workDate);

            if (!map[row.staffId].schedules[dateKey]) {
                map[row.staffId].schedules[dateKey] = [];
            }

            map[row.staffId].schedules[dateKey].push({
                scheduleId: row.scheduleId,
                shiftId: row.shiftId,
                shiftName: row.shiftName,
                startTime: this.toTimeStr(row.startTime),
                endTime: this.toTimeStr(row.endTime),
                status: row.status,
            });

            map[row.staffId].totalHours += this.calcShiftHours(row.startTime, row.endTime);
        }

        return Object.values(map);
    }

    getNowVN() {
        const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
        const iso = now.toISOString();

        return {
            today: iso.split("T")[0],
            time: iso.split("T")[1].substring(0, 5),
            fullTime: iso.split("T")[1].substring(0, 8),
        };
    }

    getShiftRange(startTime, endTime) {
        const start = this.toTimeObj(startTime);
        let end = this.toTimeObj(endTime);

        if (end < start) {
            end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
        }

        return { start, end };
    }

    isOverlap(a, b) {
        return a.start < b.end && a.end > b.start;
    }

    calcShiftHours(startTime, endTime) {
        const range = this.getShiftRange(startTime, endTime);
        return (range.end - range.start) / (1000 * 60 * 60);
    }

    toTimeStr(value) {
        if (!value) return "00:00";

        if (value instanceof Date) {
            return value.toISOString().split("T")[1].substring(0, 5);
        }

        if (typeof value === "string") {
            const match = value.match(/(\d{2}:\d{2})/);
            return match ? match[1] : "00:00";
        }

        return "00:00";
    }

    toDateStr(value) {
        if (!value) return "";

        if (value instanceof Date) {
            return value.toISOString().split("T")[0];
        }

        if (typeof value === "string" && value.includes("T")) {
            return value.split("T")[0];
        }

        return String(value);
    }

    toTimeObj(value) {
        const time = this.toTimeStr(value);
        const [hour, minute] = time.split(":").map(Number);
        return new Date(1970, 0, 1, hour, minute, 0);
    }
}

module.exports = new RosterService();