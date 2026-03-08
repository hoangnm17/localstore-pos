const sql = require("mssql");
const { connectDB } = require("../config/database");

module.exports.getSalaryReport = async (month, year, staffId = null, roleName = null) => {
    const pool = await connectDB();

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    const totalDaysInMonth = new Date(year, month, 0).getDate();


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
            s.id                    AS staffId,
            s.fullName,
            s.salaryType,
            s.baseSalary,
            r.name                  AS roleName,

            ISNULL(SUM(
                CASE
                    WHEN s.salaryType = 'hourly' AND ws.shiftId IS NOT NULL
                    THEN DATEDIFF(MINUTE, sh.startTime, sh.endTime) / 60.0
                    ELSE 0
                END
            ), 0)                   AS totalHours,

            COUNT(DISTINCT
                CASE WHEN ws.id IS NOT NULL THEN CAST(ws.workDate AS DATE) END
            )                       AS workingDays,

            ${totalDaysInMonth}     AS totalDaysInMonth

        FROM Staff s
        LEFT JOIN Users u  ON s.userId  = u.id
        LEFT JOIN Roles r  ON u.roleId  = r.id
        LEFT JOIN WorkSchedules ws
            ON s.id = ws.staffId
            AND ws.workDate BETWEEN @startDate AND @endDate
        LEFT JOIN Shifts sh ON ws.shiftId = sh.id
        WHERE
            s.employmentStatus = 'working'
            ${staffFilter}
        GROUP BY
            s.id, s.fullName, s.salaryType, s.baseSalary, r.name
        ORDER BY r.name, s.fullName
    `);

    return result.recordset.map(row => {
        let grossSalary = 0;
        if (row.salaryType === 'hourly') {
            grossSalary = Number(row.baseSalary) * Number(row.totalHours);
        } else {
            grossSalary = Number(row.baseSalary);
        }

        return {
            staffId: row.staffId,
            fullName: row.fullName,
            salaryType: row.salaryType,
            baseSalary: Number(row.baseSalary),
            roleName: row.roleName,
            totalHours: Number(row.totalHours),
            workingDays: Number(row.workingDays),
            totalDaysInMonth: row.totalDaysInMonth,
            deductions: 0,
            grossSalary,
            netSalary: grossSalary - 0,
            note: '',
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
