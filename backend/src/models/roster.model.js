const sql = require("mssql");
const { connectDB } = require("../config/database");

// Phân công ca
module.exports.assignShift = async (staffId, shiftId, workDate) => {
    const pool = await connectDB();
    await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('shiftId', sql.Int, shiftId)
        .input('workDate', sql.Date, workDate)
        .query(`
            INSERT INTO WorkSchedules (staffId, shiftId, workDate, status)
            VALUES (@staffId, @shiftId, @workDate, 'assigned')
        `);
    return true;
};

// Kiểm tra nhân viên đã có ca này trong ngày chưa
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

// Kiểm tra trùng giờ ca làm (Đơn giản hóa: lấy danh sách ca đã có rồi về Service logic check)
module.exports.getStaffSchedulesInDay = async (staffId, workDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('workDate', sql.Date, workDate)
        .query(`
            SELECT ws.id, sh.name as shiftName, sh.startTime, sh.endTime
            FROM WorkSchedules ws
            JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.staffId = @staffId AND ws.workDate = @workDate AND ws.status != 'absent'
        `);
    return result.recordset;
};

// Xóa phân công ca
module.exports.removeShift = async (scheduleId) => {
    const pool = await connectDB();
    await pool.request()
        .input('id', sql.Int, scheduleId)
        .query(`DELETE FROM WorkSchedules WHERE id = @id`);
    return true;
};

// Lấy lịch tuần tổng hợp (Dữ liệu thô)
module.exports.getWeeklySchedule = async (startDate, endDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .query(`
            SELECT
                s.id AS staffId, s.fullName,
                r.name AS roleName,
                ws.id AS scheduleId, ws.workDate,
                sh.id AS shiftId, sh.name AS shiftName, sh.startTime, sh.endTime,
                ws.status
            FROM Staff s
            LEFT JOIN Users u ON s.userId = u.id
            LEFT JOIN Roles r ON u.roleId = r.id
            LEFT JOIN WorkSchedules ws ON s.id = ws.staffId AND ws.workDate BETWEEN @startDate AND @endDate
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE s.employmentStatus = 'working' AND r.name IN ('Cashier')
            ORDER BY r.name, s.fullName, ws.workDate
        `);
    return result.recordset;
};

// Lấy thông tin chi tiết một lịch làm
module.exports.getScheduleById = async (scheduleId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.Int, scheduleId)
        .query(`
            SELECT ws.*, sh.startTime, sh.endTime, sh.name as shiftName
            FROM WorkSchedules ws
            JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.id = @id
        `);
    return result.recordset[0];
};

// Lấy Role của nhân viên
module.exports.getStaffRole = async (staffId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .query(`
            SELECT r.name as roleName FROM Staff s 
            JOIN Users u ON s.userId = u.id 
            JOIN Roles r ON u.roleId = r.id 
            WHERE s.id = @staffId
        `);
    return result.recordset[0]?.roleName || '';
};

// Xóa hàng loạt (Bulk Clear)
module.exports.clearStaffSchedulesInRange = async ({ staffId, startDate, endDate, today, currentTime }) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .input('todayStr', sql.VarChar(10), today)
        .input('currentTimeStr', sql.VarChar(8), currentTime)
        .query(`
            DELETE ws
            FROM WorkSchedules ws
            JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.staffId = @staffId
              AND ws.workDate BETWEEN @startDate AND @endDate
              AND ws.status = 'assigned'
              AND (
                  -- Toàn bộ các ngày nằm sau hôm nay
                  ws.workDate > CAST(@todayStr AS DATE)
                  -- HOẶC: Hôm nay nhưng giờ bắt đầu phải sau giờ hiện tại
                  OR (
                      ws.workDate = CAST(@todayStr AS DATE) 
                      AND sh.startTime > CAST(@currentTimeStr AS TIME)
                  )
              )
        `);
    return result.rowsAffected[0];
};
