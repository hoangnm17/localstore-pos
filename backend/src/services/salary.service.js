const salaryModel = require("../models/salary.model");

class SalaryService {
    STANDARD_WORK_DAYS = 26;
    MONTHLY_ROLES = ['Manager', 'Warehouse'];

    // Lấy báo cáo lương
    async getSalaryReport(month, year, filter = {}) {
        // 1. Kiểm tra xem đã chốt lương chưa
        const status = await salaryModel.getPayrollStatus(month, year);

        if (status.isPaid) {
            const confirmed = await salaryModel.getConfirmedPayrolls(month, year, filter);
            return confirmed.map(row => ({
                staffId: row.staffId,
                fullName: row.fullName,
                roleName: row.roleName,
                salaryType: row.appliedSalaryType,
                baseSalary: Number(row.appliedBaseSalary),
                totalHours: row.appliedSalaryType === 'hourly' ? row.totalWorkUnit : 0,
                workingDays: row.appliedSalaryType === 'monthly' ? row.totalWorkUnit : 0,
                grossSalary: Number(row.provisionalSalary),
                deductions: Number(row.deductions),
                netSalary: Number(row.finalAmount),
                note: 'Đã chốt lương',
                penaltyDetails: this.translatePenalty(row.note),
                isConfirmed: true
            }));
        }

        // 2. Nếu chưa chốt -> Tính toán nháp
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

        const staffs = await salaryModel.getStaffSalaryInfo(filter);
        const rawSchedules = await salaryModel.getRawWorkSchedules(startDate, endDate);

        return staffs.map(st => {
            const mySchedules = rawSchedules.filter(s => s.staffId === st.staffId);
            const isMonthlyRole = this.MONTHLY_ROLES.includes(st.roleName);
            const salaryType = isMonthlyRole ? 'monthly' : st.salaryType;

            let totalHours = 0;
            let workingDays = 0;
            let deductions = 0;
            let penaltyNotes = [];

            mySchedules.forEach(sc => {
                if (sc.status === 'completed') {
                    workingDays++;
                    if (salaryType === 'hourly') {
                        let h = (new Date(sc.endTime) - new Date(sc.startTime)) / (1000 * 60 * 60);
                        if (h < 0) h += 24;
                        totalHours += h;
                    }
                }
                if (sc.penaltyAmount > 0) {
                    deductions += sc.penaltyAmount;
                    penaltyNotes.push(`Ngày ${new Date(sc.workDate).toLocaleDateString('vi-VN')} (${sc.shiftName}): ${this.translatePenalty(sc.attendanceRecord)}`);
                }
            });

            // Logic đặc biệt cho Manager
            if (st.roleName === 'Manager') {
                workingDays = this.STANDARD_WORK_DAYS;
                deductions = 0;
            }

            const gross = salaryType === 'hourly'
                ? st.baseSalary * totalHours
                : (st.baseSalary / this.STANDARD_WORK_DAYS) * workingDays;

            return {
                staffId: st.staffId,
                fullName: st.fullName,
                roleName: st.roleName,
                salaryType,
                baseSalary: st.baseSalary,
                totalHours: Math.round(totalHours * 100) / 100,
                workingDays,
                grossSalary: gross,
                deductions,
                netSalary: Math.max(0, gross - deductions),
                note: st.roleName === 'Manager' ? 'Cố định' : (salaryType === 'monthly' ? 'Theo ngày' : 'Theo giờ'),
                penaltyDetails: penaltyNotes.join('; ') || 'Không có vi phạm',
                isConfirmed: false
            };
        });
    }

    async confirmPayroll(month, year) {
        const report = await this.getSalaryReport(month, year);
        if (!report.length) throw new Error("Không có dữ liệu để chốt!");

        for (const row of report) {
            await salaryModel.savePayroll({
                staffId: row.staffId,
                month, year,
                baseSalary: row.baseSalary,
                salaryType: row.salaryType,
                workUnit: row.salaryType === 'hourly' ? row.totalHours : row.workingDays,
                gross: row.grossSalary,
                deductions: row.deductions,
                net: row.netSalary,
                note: row.penaltyDetails
            });
        }
        return { confirmed: report.length };
    }

    translatePenalty(raw) {
        if (!raw) return 'Không có vi phạm';
        return raw.replace(/LateIn/g, 'Vào muộn')
            .replace(/EarlyOut/g, 'Về sớm')
            .replace(/LateHandover/g, 'Bàn giao muộn')
            .replace(/OnTime/g, 'Đúng giờ');
    }
}

module.exports = new SalaryService();
