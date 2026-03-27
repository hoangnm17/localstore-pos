const sql = require("mssql");
const { connectDB } = require("../config/database");

module.exports.getPendingSchedule = async (staffId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .query(`
            SELECT TOP 1
                ws.id as scheduleId,
                sh.name as shiftName,
                CONVERT(VARCHAR(5), sh.startTime, 108) as startTime,
                CONVERT(VARCHAR(5), sh.endTime,   108) as endTime,
                CONVERT(VARCHAR(5), sh.checkInEnd,108) as checkInEnd,
                r.name as roleName
            FROM WorkSchedules ws
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            JOIN Staff s ON ws.staffId = s.id
            JOIN Users u ON s.userId   = u.id
            JOIN Roles r ON u.roleId   = r.id
            WHERE ws.staffId = @staffId
              AND ws.workDate = CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE)
              AND ws.status = 'assigned'
              AND (
                  r.name IN ('Manager', 'Warehouse')
                  OR (
                      CAST(DATEADD(hour, 7, GETUTCDATE()) AS TIME)
                          >= ISNULL(sh.checkInStart, sh.startTime)
                      AND CAST(DATEADD(hour, 7, GETUTCDATE()) AS TIME)
                          <= sh.endTime
                  )
              )
            ORDER BY sh.startTime ASC
        `);
    return result.recordset[0];
};

module.exports.processCheckIn = async (scheduleId, openingCash, isCashierOrManager, record, penalty) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        await request
            .input('id', sql.Int, scheduleId)
            .input('record', sql.VarChar, record)
            .input('penalty', sql.Decimal, penalty)
            .query(`
                UPDATE WorkSchedules
                SET checkInTime = DATEADD(hour, 7, GETUTCDATE()),
                    status = 'working',
                    attendanceRecord = CASE
                        WHEN @record = 'OnTime' THEN ISNULL(attendanceRecord, 'OnTime')
                        WHEN ISNULL(attendanceRecord, '') = '' THEN @record
                        ELSE CONCAT(attendanceRecord, ', ', @record)
                    END,
                    penaltyAmount = ISNULL(penaltyAmount, 0) + @penalty
                WHERE id = @id
            `);

        if (isCashierOrManager && openingCash !== undefined && openingCash !== null) {
            await request
                .input('schedId', sql.Int, scheduleId)
                .input('openCash', sql.Decimal, openingCash || 0)
                .query(`
                    INSERT INTO CashHandovers (scheduleId, openingCash, systemCash, actualCash)
                    VALUES (@schedId, @openCash, 0, 0)
                `);
        }

        await transaction.commit();
        return true;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};


module.exports.processSimpleCheckOut = async (scheduleId, record, penalty) => {
    const pool = await connectDB();
    await pool.request()
        .input('id', sql.Int, scheduleId)
        .input('record', sql.VarChar, record)
        .input('penalty', sql.Decimal, penalty)
        .query(`
            UPDATE WorkSchedules 
SET checkOutTime = DATEADD(hour, 7, GETUTCDATE()), 
    status = 'completed', 
    attendanceRecord = CASE 
        WHEN @record = 'OnTime' THEN attendanceRecord
        WHEN ISNULL(attendanceRecord, '') = '' THEN @record 
        ELSE CONCAT(attendanceRecord, ', ', @record) 
    END,
    penaltyAmount = penaltyAmount + @penalty 
WHERE id = @id

        `);
    return true;
};

module.exports.getWorkingScheduleById = async (scheduleId, staffId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.Int, scheduleId)
        .input('staffId', sql.BigInt, staffId)
        .query(`
            SELECT 
                ws.id as scheduleId,
                ws.status,
                CONVERT(VARCHAR(5), sh.endTime, 108) as endTime,
                r.name as roleName
            FROM WorkSchedules ws
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            JOIN Staff s ON ws.staffId = s.id
            JOIN Users u ON s.userId = u.id
            JOIN Roles r ON u.roleId = r.id
            WHERE ws.id = @id 
              AND ws.staffId = @staffId
              AND ws.status = 'working'
        `);
    return result.recordset[0];
};

module.exports.getStaffRoleName = async (staffId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .query(`
            SELECT r.name as roleName 
            FROM Staff s 
            JOIN Users u ON s.userId = u.id 
            JOIN Roles r ON u.roleId = r.id 
            WHERE s.id = @staffId
        `);
    return result.recordset[0]?.roleName || '';
};

module.exports.autoAssignWarehouse = async (staffId) => {
    const pool = await connectDB();
    await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .query(`
            DECLARE @shiftId INT = (SELECT TOP 1 id FROM Shifts WHERE isActive = 1 AND name LIKE N'%Hành Chính%' ORDER BY id ASC);
            IF @shiftId IS NOT NULL 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM WorkSchedules 
                    WHERE staffId = @staffId AND workDate = CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE)
                )
                BEGIN
                    INSERT INTO WorkSchedules (staffId, shiftId, workDate, status)
                    VALUES (@staffId, @shiftId, CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE), 'assigned');
                END
            END
        `);
    return true;
};

module.exports.checkWorking = async (staffId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .query(`
            SELECT TOP 1 ws.id, CONVERT(VARCHAR(5), sh.endTime, 108) as endTime 
            FROM WorkSchedules ws 
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.staffId = @staffId 
              AND ws.workDate = CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE)
              AND ws.status = 'working'
        `);
    return result.recordset.length > 0 ? result.recordset[0] : null;
};
