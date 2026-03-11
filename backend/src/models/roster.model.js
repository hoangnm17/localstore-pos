const sql = require("mssql");
const { connectDB } = require("../config/database");

module.exports.getWeeklySchedule = async (startDate, endDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .query(`
            SELECT
                s.id AS staffId,
                s.fullName,
                r.name AS roleName, -- Lấy thêm role để phân loại ở frontend
                ws.id AS scheduleId,
                ws.workDate,
                ws.shiftId,
                ws.status,
                ISNULL(sh.name, N'Hành chính') AS shiftName, -- Nếu NULL thì hiện 'Hành chính'
                CONVERT(VARCHAR(5), ISNULL(sh.startTime, '08:00:00'), 108) AS startTime,
                CONVERT(VARCHAR(5), ISNULL(sh.endTime, '17:00:00'), 108) AS endTime,
                -- Nếu có ca thì tính theo ca, nếu không (Warehouse) mặc định 8 tiếng/ngày
                CASE 
                    WHEN ws.shiftId IS NOT NULL THEN DATEDIFF(MINUTE, sh.startTime, sh.endTime) / 60.0 
                    ELSE 8.0 
                END AS shiftHours
            FROM Staff s
            LEFT JOIN Users u ON s.userId = u.id -- Dùng LEFT JOIN để không mất nhân viên
            LEFT JOIN Roles r ON u.roleId = r.id
            LEFT JOIN WorkSchedules ws ON s.id = ws.staffId
                AND ws.workDate BETWEEN @startDate AND @endDate
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE s.employmentStatus = 'working' -- Chỉ hiện người đang làm
            ORDER BY r.name, s.fullName, ws.workDate
        `);
    return result.recordset;
};

// Phân công ca
module.exports.assignShift = async (staffId, shiftId, workDate) => {
    const pool = await connectDB();
    const shiftInfo = await pool.request()
        .input('shiftId', sql.Int, shiftId)
        .query(`SELECT name, startTime, endTime FROM Shifts WHERE id = @shiftId`);
    const shift = shiftInfo.recordset[0];
    await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('shiftId', sql.Int, shiftId || null)
        .input('workDate', sql.Date, workDate)
        .input('snapStart', sql.Time, shift ? shift.startTime : null)
        .input('snapEnd', sql.Time, shift ? shift.endTime : null)
        .input('snapName', sql.NVarChar(50), shift ? shift.name : null)
        .query(`
            INSERT INTO WorkSchedules 
              (staffId, shiftId, workDate, status, snapshotStartTime, snapshotEndTime, snapshotShiftName)
            VALUES 
              (@staffId, @shiftId, @workDate, 'assigned', @snapStart, @snapEnd, @snapName)
        `);
    return true;
};

// Kiểm tra đã phân công chưa 
module.exports.checkExisting = async (staffId, shiftId, workDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('shiftId', sql.Int, shiftId)
        .input('workDate', sql.Date, workDate)
        .query(`
            SELECT id FROM WorkSchedules
            WHERE staffId = @staffId AND shiftId = @shiftId AND workDate = @workDate
        `);
    return result.recordset[0];
};

// Xóa phân công ca
module.exports.removeShift = async (scheduleId) => {
    const pool = await connectDB();
    await pool.request()
        .input('id', sql.Int, scheduleId)
        .query(`DELETE FROM WorkSchedules WHERE id = @id`);
    return true;
};
