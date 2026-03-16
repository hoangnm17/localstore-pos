const sql = require("mssql");
const { connectDB } = require("../config/database");

module.exports.getCounters = async () => {
    const pool = await connectDB();
    const result = await pool.request().query(`
        SELECT id, counterCode, counterName, status
        FROM Counters
        WHERE status = 'ACTIVE'
        ORDER BY counterCode
    `);
    return result.recordset;
};

// Phân công ca 
module.exports.assignShift = async (staffId, shiftId, workDate, counterId) => {
    const pool = await connectDB();
    const shiftInfo = await pool.request()
        .input('shiftId', sql.Int, shiftId)
        .query(`SELECT name, startTime, endTime FROM Shifts WHERE id = @shiftId`);
    const shift = shiftInfo.recordset[0];

    const counterIdValue = counterId != null ? counterId : null;

    await pool.request()
        .input('staffId',sql.BigInt, staffId)
        .input('shiftId',sql.Int, shiftId || null)
        .input('workDate',sql.Date,workDate)
        .input('counterId',sql.BigInt, counterIdValue)
        .input('snapStart',sql.Time, shift ? shift.startTime : null)
        .input('snapEnd',sql.Time, shift ? shift.endTime : null)
        .input('snapName',sql.NVarChar(50), shift ? shift.name : null)
        .query(`
            INSERT INTO WorkSchedules
              (staffId, shiftId, workDate, counterId, status,
               snapshotStartTime, snapshotEndTime, snapshotShiftName)
            VALUES
              (@staffId, @shiftId, @workDate, @counterId, 'assigned',
               @snapStart, @snapEnd, @snapName)
        `);
    return true;
};

// Kiểm tra nhân viên đã có ca này trong ngày chưa
module.exports.checkExisting = async (staffId, shiftId, workDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId',sql.BigInt,staffId)
        .input('shiftId',sql.Int,shiftId)
        .input('workDate',sql.Date,workDate)
        .query(`
            SELECT id FROM WorkSchedules
            WHERE staffId = @staffId
              AND shiftId = @shiftId
              AND workDate = @workDate
        `);
    return result.recordset[0];
};

// Kiểm tra quầy đã bị gán trong ca+ngày này chưa
module.exports.checkCounterConflict = async (counterId, shiftId, workDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('counterId',sql.BigInt, counterId)
        .input('shiftId',sql.Int,shiftId)
        .input('workDate',sql.Date,workDate)
        .query(`
            SELECT ws.id, s.fullName
            FROM WorkSchedules ws
            JOIN Staff s ON ws.staffId = s.id
            WHERE ws.counterId = @counterId
              AND ws.shiftId = @shiftId
              AND ws.workDate = @workDate
        `);
    return result.recordset[0];
};

// Tính tổng giờ trong ngày 
module.exports.getDailyHours = async (staffId, workDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId',  sql.BigInt, staffId)
        .input('workDate', sql.Date, workDate)
        .query(`
            SELECT ISNULL(SUM(
                CASE WHEN Eff.effEnd < Eff.effStart 
                     THEN (DATEDIFF(MINUTE, Eff.effStart, Eff.effEnd) + 1440) / 60.0
                     ELSE DATEDIFF(MINUTE, Eff.effStart, Eff.effEnd) / 60.0
                END
            ), 0) AS totalHours
            FROM WorkSchedules ws
            JOIN Shifts sh ON ws.shiftId = sh.id
            CROSS APPLY (
                SELECT 
                    effStart = CASE WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) AND ws.snapshotStartTime IS NOT NULL THEN ws.snapshotStartTime ELSE ISNULL(sh.startTime, ws.snapshotStartTime) END,
                    effEnd = CASE WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) AND ws.snapshotEndTime IS NOT NULL THEN ws.snapshotEndTime ELSE ISNULL(sh.endTime, ws.snapshotEndTime) END
            ) AS Eff
            WHERE ws.staffId  = @staffId
              AND ws.workDate = @workDate
        `);
    return result.recordset[0]?.totalHours || 0;
};

// Tính tổng giờ trong tuần 
module.exports.getWeeklyHours = async (staffId, weekStart, weekEnd) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId',sql.BigInt, staffId)
        .input('weekStart',sql.Date,   weekStart)
        .input('weekEnd',sql.Date,   weekEnd)
        .query(`
            SELECT ISNULL(SUM(
                CASE WHEN Eff.effEnd < Eff.effStart 
                     THEN (DATEDIFF(MINUTE, Eff.effStart, Eff.effEnd) + 1440) / 60.0
                     ELSE DATEDIFF(MINUTE, Eff.effStart, Eff.effEnd) / 60.0
                END
            ), 0) AS totalHours
            FROM WorkSchedules ws
            JOIN Shifts sh ON ws.shiftId = sh.id
            CROSS APPLY (
                SELECT 
                    effStart = CASE WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) AND ws.snapshotStartTime IS NOT NULL THEN ws.snapshotStartTime ELSE ISNULL(sh.startTime, ws.snapshotStartTime) END,
                    effEnd = CASE WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) AND ws.snapshotEndTime IS NOT NULL THEN ws.snapshotEndTime ELSE ISNULL(sh.endTime, ws.snapshotEndTime) END
            ) AS Eff
            WHERE ws.staffId  = @staffId
              AND ws.workDate BETWEEN @weekStart AND @weekEnd
        `);
    return result.recordset[0]?.totalHours || 0;
};

// Xóa phân công ca
module.exports.removeShift = async (scheduleId) => {
    const pool = await connectDB();
    await pool.request()
        .input('id', sql.Int, scheduleId)
        .query(`DELETE FROM WorkSchedules WHERE id = @id`);
    return true;
};

// Lấy lịch tuần tổng hợp 
module.exports.getWeeklySchedule = async (startDate, endDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .query(`
            SELECT
                s.id AS staffId,
                s.fullName,
                r.name AS roleName,
                ws.id AS scheduleId,
                ws.workDate,
                ws.shiftId,
                ws.status,
                ws.counterId,
                co.counterName,
                co.counterCode,
                
                -- CROSS APPLY xử lý logic thời gian
                Eff.effName AS shiftName,
                CONVERT(VARCHAR(5), Eff.effStart, 108) AS startTime,
                CONVERT(VARCHAR(5), Eff.effEnd, 108) AS endTime,
                
                CASE
                    WHEN ws.shiftId IS NOT NULL THEN
                        CASE WHEN Eff.effEnd < Eff.effStart 
                             THEN (DATEDIFF(MINUTE, Eff.effStart, Eff.effEnd) + 1440) / 60.0
                             ELSE DATEDIFF(MINUTE, Eff.effStart, Eff.effEnd) / 60.0
                        END
                    ELSE 8.0
                END AS shiftHours
                
            FROM Staff s
            LEFT JOIN Users u  ON s.userId = u.id
            LEFT JOIN Roles r  ON u.roleId = r.id
            LEFT JOIN WorkSchedules ws ON s.id = ws.staffId AND ws.workDate BETWEEN @startDate AND @endDate
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            LEFT JOIN Counters co ON ws.counterId = co.id
            
            -- LOGIC: Nếu <= Hôm nay thì giữ giờ cũ (snapshot). Nếu tương lai thì lấy giờ mới (bảng Shifts)
            CROSS APPLY (
                SELECT 
                    effName = CASE WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) THEN ISNULL(ws.snapshotShiftName, sh.name) ELSE ISNULL(sh.name, ws.snapshotShiftName) END,
                    effStart = CASE WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) THEN ISNULL(ws.snapshotStartTime, sh.startTime) ELSE ISNULL(sh.startTime, ws.snapshotStartTime) END,
                    effEnd = CASE WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) THEN ISNULL(ws.snapshotEndTime, sh.endTime) ELSE ISNULL(sh.endTime, ws.snapshotEndTime) END
            ) AS Eff
            
            WHERE s.employmentStatus = 'working'
            ORDER BY r.name, s.fullName, ws.workDate
        `);
    return result.recordset;
};