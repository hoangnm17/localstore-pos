const sql = require("mssql");
const { connectDB } = require("../config/database");

module.exports.create = async (staffId, shiftId, workDate) => {
    const pool = await connectDB();

    await pool.request()
        .input("staffId", sql.BigInt, staffId)
        .input("shiftId", sql.Int, shiftId)
        .input("workDate", sql.Date, workDate)
        .query(`
            INSERT INTO WorkSchedules (staffId, shiftId, workDate, status)
            VALUES (@staffId, @shiftId, @workDate, 'assigned')
        `);

    return true;
};

module.exports.findSameShift = async (staffId, shiftId, workDate) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("staffId", sql.BigInt, staffId)
        .input("shiftId", sql.Int, shiftId)
        .input("workDate", sql.Date, workDate)
        .query(`
            SELECT id
            FROM WorkSchedules
            WHERE staffId = @staffId
              AND shiftId = @shiftId
              AND workDate = @workDate
        `);

    return result.recordset[0] || null;
};

module.exports.getDayShifts = async (staffId, workDate) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("staffId", sql.BigInt, staffId)
        .input("workDate", sql.Date, workDate)
        .query(`
            SELECT
                ws.id,
                sh.name AS shiftName,
                sh.startTime,
                sh.endTime
            FROM WorkSchedules ws
            JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.staffId = @staffId
              AND ws.workDate = @workDate
              AND ws.status != 'absent'
        `);

    return result.recordset;
};

module.exports.remove = async (scheduleId) => {
    const pool = await connectDB();

    await pool.request()
        .input("id", sql.Int, scheduleId)
        .query(`
            DELETE FROM WorkSchedules
            WHERE id = @id
        `);

    return true;
};

module.exports.getWeekRows = async (startDate, endDate) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("startDate", sql.Date, startDate)
        .input("endDate", sql.Date, endDate)
        .query(`
            SELECT
                s.id AS staffId,
                s.fullName,
                r.name AS roleName,
                ws.id AS scheduleId,
                ws.workDate,
                sh.id AS shiftId,
                sh.name AS shiftName,
                sh.startTime,
                sh.endTime,
                ws.status
            FROM Staff s
            LEFT JOIN Users u
                ON s.userId = u.id
            LEFT JOIN Roles r
                ON u.roleId = r.id
            LEFT JOIN WorkSchedules ws
                ON s.id = ws.staffId
               AND ws.workDate BETWEEN @startDate AND @endDate
            LEFT JOIN Shifts sh
                ON ws.shiftId = sh.id
            WHERE s.employmentStatus = 'working'
              AND r.name = 'Cashier'
            ORDER BY s.fullName, ws.workDate
        `);

    return result.recordset;
};

module.exports.findById = async (scheduleId) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("id", sql.Int, scheduleId)
        .query(`
            SELECT
                ws.*,
                sh.name AS shiftName,
                sh.startTime,
                sh.endTime
            FROM WorkSchedules ws
            JOIN Shifts sh
                ON ws.shiftId = sh.id
            WHERE ws.id = @id
        `);

    return result.recordset[0] || null;
};

module.exports.clearRange = async ({ staffId, startDate, endDate, today, currentTime }) => {
    const pool = await connectDB();

    const result = await pool.request()
        .input("staffId", sql.BigInt, staffId)
        .input("startDate", sql.Date, startDate)
        .input("endDate", sql.Date, endDate)
        .input("todayStr", sql.VarChar(10), today)
        .input("currentTimeStr", sql.VarChar(8), currentTime)
        .query(`
            DELETE ws
            FROM WorkSchedules ws
            JOIN Shifts sh
                ON ws.shiftId = sh.id
            WHERE ws.staffId = @staffId
              AND ws.workDate BETWEEN @startDate AND @endDate
              AND ws.status = 'assigned'
              AND (
                    ws.workDate > CAST(@todayStr AS DATE)
                    OR (
                        ws.workDate = CAST(@todayStr AS DATE)
                        AND sh.startTime > CAST(@currentTimeStr AS TIME)
                    )
              )
        `);

    return result.rowsAffected[0];
};