const sql = require("mssql");
const { connectDB } = require("../config/database");

const MONTHLY_ROLES = ['Manager', 'Warehouse'];
module.exports.getSalaryReport = async (month, year, staffId = null, roleName = null) => {
    const pool = await connectDB();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(totalDaysInMonth).padStart(2, '0')}`;

    let staffFilter = '';
    if (staffId) staffFilter += ' AND s.id = @staffId';
    if (roleName) staffFilter += ' AND r.name = @roleName';

    const request = pool.request()
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .input('month', sql.Int, month)
        .input('year', sql.Int, year);

    if (staffId) request.input('staffId', sql.BigInt, staffId);
    if (roleName) request.input('roleName', sql.NVarChar(50), roleName);

    const result = await request.query(`
        SELECT
            s.id AS staffId, s.fullName, s.salaryType, s.baseSalary,
            r.name AS roleName,

            -- Tổng giờ làm (chỉ Cashier, chỉ ca completed)
            ISNULL(SUM(
                CASE
                    WHEN s.salaryType = 'hourly' AND ws.status = 'completed' THEN
                        CASE WHEN sh.endTime < sh.startTime
                             THEN (DATEDIFF(MINUTE, sh.startTime, sh.endTime) + 1440) / 60.0
                             ELSE DATEDIFF(MINUTE, sh.startTime, sh.endTime) / 60.0
                        END
                    ELSE 0
                END
            ), 0) AS totalHours,

            -- Số ngày công (Manager/Warehouse: đếm ngày có check-in)
            COUNT(DISTINCT CASE
                WHEN ws.status IN ('working', 'completed')
                THEN CAST(ws.workDate AS DATE)
            END) AS workingDays,

            ${totalDaysInMonth} AS totalDaysInMonth,
            ISNULL(SUM(ws.penaltyAmount), 0) AS totalDeductions,

            STRING_AGG(
                CASE
                    WHEN ISNULL(ws.penaltyAmount, 0) > 0 AND ws.attendanceRecord IS NOT NULL THEN
                        CONCAT('Ngày ', CONVERT(VARCHAR(5), ws.workDate, 103), ': ',
                               ws.attendanceRecord, ' (-', CAST(ws.penaltyAmount AS INT), 'đ)')
                    ELSE NULL
                END,
                ' | '
            ) AS penaltyDetails

        FROM Staff s
        LEFT JOIN Users u ON s.userId = u.id
        LEFT JOIN Roles r ON u.roleId = r.id
        LEFT JOIN WorkSchedules ws
            ON s.id = ws.staffId
            AND ws.workDate BETWEEN @startDate AND @endDate
            AND ws.status IN ('working', 'completed')
        LEFT JOIN Shifts sh ON ws.shiftId = sh.id
        WHERE s.employmentStatus = 'working'
            ${staffFilter}
        GROUP BY s.id, s.fullName, s.salaryType, s.baseSalary, r.name
        ORDER BY r.name, s.fullName
    `);

    const MONTHLY_ROLES = ['Manager', 'Warehouse'];
    return result.recordset.map(row => {
        const totalHours = Number(row.totalHours) || 0;
        const baseSalary = Number(row.baseSalary) || 0;
        const isMonthlyRole = MONTHLY_ROLES.includes(row.roleName);
        const effectiveSalaryType = isMonthlyRole ? 'monthly' : row.salaryType;

        let workingDays = Number(row.workingDays);
        let deductions = Number(row.totalDeductions) || 0;
        let penaltyDetails = row.penaltyDetails;

        if (row.roleName === 'Manager') {
            workingDays = row.totalDaysInMonth;
            deductions = 0;
            penaltyDetails = 'Không áp dụng phạt';
        }

        const grossSalary = effectiveSalaryType === 'hourly'
            ? baseSalary * totalHours
            : (baseSalary / row.totalDaysInMonth) * workingDays;

        return {
            staffId: row.staffId,
            fullName: row.fullName,
            salaryType: effectiveSalaryType,
            baseSalary,
            roleName: row.roleName,
            totalHours: parseFloat(totalHours.toFixed(2)),
            workingDays: workingDays,
            totalDaysInMonth: row.totalDaysInMonth,
            deductions,
            grossSalary,
            netSalary: grossSalary - deductions,
            note: row.roleName === 'Manager' ? 'Lương cố định nguyên tháng (Chủ cửa hàng)'
                : isMonthlyRole ? 'Lương theo ngày công' : '',
            penaltyDetails: penaltyDetails || 'Không có vi phạm',
        };
    });
};



module.exports.getRoleList = async () => {
    const pool = await connectDB();
    const result = await pool.request().query(`
        SELECT DISTINCT r.name AS roleName
        FROM Staff s
        LEFT JOIN Users u ON s.userId = u.id
        LEFT JOIN Roles r ON u.roleId = r.id
        WHERE s.employmentStatus = 'working'
          AND r.name IS NOT NULL
        ORDER BY r.name
    `);
    return result.recordset.map(r => r.roleName);
};

module.exports.getStaffList = async () => {
    const pool = await connectDB();
    const result = await pool.request().query(`
        SELECT s.id, s.fullName, r.name AS roleName
        FROM Staff s
        LEFT JOIN Users u ON s.userId = u.id
        LEFT JOIN Roles r ON u.roleId = r.id
        WHERE s.employmentStatus = 'working'
        ORDER BY s.fullName
    `);
    return result.recordset;
};