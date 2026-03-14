const sql = require("mssql");
const { connectDB } = require("../config/database");

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
            s.id AS staffId, s.fullName, s.salaryType, s.baseSalary, r.name AS roleName,
            
            -- TÍNH TỔNG GIỜ LÀM: Sử dụng Eff.effStart và Eff.effEnd để đồng bộ logic với bảng lịch
            ISNULL(SUM(
                CASE
                    WHEN s.salaryType = 'hourly' AND ws.id IS NOT NULL THEN
                        CASE
                            -- Xử lý ca qua đêm (Giờ kết thúc < Giờ bắt đầu) -> Cộng 1440 phút (24h)
                            WHEN Eff.effEnd < Eff.effStart
                            THEN (DATEDIFF(MINUTE, Eff.effStart, Eff.effEnd) + 1440) / 60.0
                            
                            -- Ca bình thường trong ngày
                            ELSE DATEDIFF(MINUTE, Eff.effStart, Eff.effEnd) / 60.0
                        END
                    ELSE 0
                END
            ), 0) AS totalHours,
            
            -- Tính số ngày làm việc (Đếm các ngày duy nhất có xếp lịch)
            COUNT(DISTINCT
                CASE WHEN ws.id IS NOT NULL THEN CAST(ws.workDate AS DATE) END
            ) AS workingDays, 
            ${totalDaysInMonth} AS totalDaysInMonth
            
        FROM Staff s
        LEFT JOIN Users u  ON s.userId  = u.id
        LEFT JOIN Roles r  ON u.roleId  = r.id
        
        -- LẤY LỊCH LÀM VIỆC
        LEFT JOIN WorkSchedules ws
            ON s.id = ws.staffId
            AND ws.workDate BETWEEN @startDate AND @endDate
            AND ISNULL(ws.status, '') != 'absent'
            
        LEFT JOIN Shifts sh ON ws.shiftId = sh.id


        CROSS APPLY (
            SELECT 
                effStart = CASE WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) AND ws.snapshotStartTime IS NOT NULL THEN ws.snapshotStartTime ELSE ISNULL(sh.startTime, ws.snapshotStartTime) END,
                effEnd = CASE WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) AND ws.snapshotEndTime IS NOT NULL THEN ws.snapshotEndTime ELSE ISNULL(sh.endTime, ws.snapshotEndTime) END
        ) AS Eff

        WHERE s.employmentStatus = 'working'
            ${staffFilter}
        GROUP BY s.id, s.fullName, s.salaryType, s.baseSalary, r.name
        ORDER BY r.name, s.fullName
    `);

    return result.recordset.map(row => {
        const totalHours = Number(row.totalHours) || 0;
        const baseSalary = Number(row.baseSalary) || 0;
        
        const grossSalary = row.salaryType === 'hourly'
            ? baseSalary * totalHours
            : baseSalary; 

        return {
            staffId: row.staffId,
            fullName: row.fullName,
            salaryType: row.salaryType,
            baseSalary: baseSalary,
            roleName: row.roleName,
            totalHours: parseFloat(totalHours.toFixed(2)), 
            workingDays: Number(row.workingDays),
            totalDaysInMonth: row.totalDaysInMonth,
            deductions: 0, 
            grossSalary,
            netSalary: grossSalary, 
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