const sql = require("mssql");
const { connectDB } = require("../config/database");

// Lấy lịch cá nhân
module.exports.getMySchedule = async (staffId, startDate, endDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .query(`
            SELECT
                ws.id as scheduleId, ws.workDate,
                ws.status as scheduleStatus,
                sh.id as shiftId, sh.name as shiftName,
                CONVERT(VARCHAR(5), sh.startTime, 108) as startTime,
                CONVERT(VARCHAR(5), sh.endTime, 108) as endTime,
                ch.id as handoverId
            FROM WorkSchedules ws
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            LEFT JOIN CashHandovers ch ON ws.id = ch.scheduleId
            WHERE ws.staffId = @staffId
              AND ws.workDate BETWEEN @startDate AND @endDate
            ORDER BY ws.workDate ASC, sh.startTime ASC
        `);
    return result.recordset;
};


// Lấy danh sách các ca CẦN KẾT CA trong ngày 
module.exports.getPendingHandovers = async (staffId, workDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('workDate', sql.Date, workDate)
        .query(`
            SELECT
                ws.id as scheduleId,
                sh.name as shiftName,
                CONVERT(VARCHAR(5), sh.startTime, 108) as startTime,
                CONVERT(VARCHAR(5), sh.endTime, 108) as endTime,
                ISNULL(ch.openingCash, 0) as openingCash
            FROM WorkSchedules ws
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            LEFT JOIN CashHandovers ch ON ws.id = ch.scheduleId
            WHERE ws.staffId = @staffId
              AND ws.workDate = @workDate
              AND ws.status = 'working'
            ORDER BY sh.startTime ASC
        `);
    return result.recordset;
};

module.exports.getSystemCash = async (staffId, scheduleId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.Int, scheduleId)
        .input('staffId', sql.BigInt, staffId)
        .query(`
            DECLARE @startDT DATETIME, @endDT DATETIME;
            DECLARE @workDate DATE, @startTime VARCHAR(10), @endTime VARCHAR(10);

            SELECT
                @workDate  = ws.workDate,
                @startTime = CAST(sh.startTime AS VARCHAR(10)),
                @endTime   = CAST(sh.endTime   AS VARCHAR(10))
            FROM WorkSchedules ws
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.id = @id AND ws.staffId = @staffId;

            SET @startDT = CAST(CONCAT(@workDate, ' ', @startTime) AS DATETIME);
            SET @endDT   = CAST(CONCAT(@workDate, ' ', @endTime)   AS DATETIME);

            IF @endDT < @startDT
                SET @endDT = DATEADD(day, 1, @endDT);

            -- Tính tiền mặt của nhân viên này trong ca (không cần counterId)
            SELECT ISNULL(SUM(p.amount), 0) as systemCash
            FROM Invoices i
            JOIN Payments p ON i.id = p.invoiceId
            WHERE i.staffId = @staffId
              AND i.createdAt >= DATEADD(hour, -1, @startDT)
              AND i.createdAt <= DATEADD(hour,  2, @endDT)
              AND p.paymentMethod = 'CASH'
              AND p.status = 'SUCCESS';
        `);
    return result.recordset[0]?.systemCash || 0;
};

module.exports.createHandover = async (data) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        await request
            .input('scheduleId', sql.Int, data.scheduleId)
            .input('openingCash', sql.Decimal(15, 2), data.openingCash)
            .input('systemCash', sql.Decimal(15, 2), data.systemCash)
            .input('actualCash', sql.Decimal(15, 2), data.actualCash)
            .input('note', sql.NVarChar(sql.MAX), data.note || '')
            .query(`
                UPDATE CashHandovers
                SET openingCash = @openingCash,
                    systemCash = @systemCash,
                    actualCash = @actualCash,
                    note = @note,
                    handoverTime = DATEADD(hour, 7, GETUTCDATE())
                WHERE scheduleId = @scheduleId
            `);

        const penaltyResult = await request
            .input('schedId', sql.Int, data.scheduleId)
            .query(`
                DECLARE @now DATETIME = DATEADD(hour, 7, GETUTCDATE());
                DECLARE @endTime TIME;
                DECLARE @deadline TIME;
                DECLARE @penalty DECIMAL(15,2) = 0;
                DECLARE @newRecord VARCHAR(100) = 'OnTime';
                DECLARE @currentRecord NVARCHAR(255);

                SELECT 
                    @endTime         = CAST(sh.endTime AS TIME),
                    @deadline        = CAST(ISNULL(sh.checkOutDeadline, sh.endTime) AS TIME),
                    @currentRecord   = ws.attendanceRecord
                FROM WorkSchedules ws
                LEFT JOIN Shifts sh ON ws.shiftId = sh.id
                WHERE ws.id = @schedId;

                -- PHẠT: Về Sớm (chốt trước giờ kết ca)
                IF CAST(@now AS TIME) < @endTime
                BEGIN
                    SET @newRecord = CONCAT('EarlyOut[', CONVERT(VARCHAR(5), @now, 108), ']');
                    SET @penalty = 50000;
                END
                -- PHẠT: Bàn Giao Trễ (chốt sau deadline)
                ELSE IF CAST(@now AS TIME) > @deadline
                BEGIN
                    SET @newRecord = CONCAT('LateHandover[', CONVERT(VARCHAR(5), @now, 108), ']');
                    SET @penalty = 10000;
                END

                UPDATE WorkSchedules 
                SET status = 'completed', 
                    checkOutTime = @now,
                    attendanceRecord = CASE 
                        WHEN @newRecord = 'OnTime' THEN ISNULL(@currentRecord, 'OnTime')
                        WHEN ISNULL(@currentRecord, '') = '' THEN @newRecord 
                        ELSE CONCAT(@currentRecord, ', ', @newRecord) 
                    END,
                    penaltyAmount = ISNULL(penaltyAmount, 0) + @penalty 
                WHERE id = @schedId;
            `);

        await transaction.commit();

        const scheduleTimes = await module.exports.getScheduleTimes(data.scheduleId);
        const { dateStr, endStr, deadlineStr } = scheduleTimes;
        const now = new Date();
        const endDT = new Date(`${dateStr}T${endStr}:00`);
        const deadlineDT = new Date(`${dateStr}T${deadlineStr}:00`);
        if (endDT < new Date(`${dateStr}T00:00:00`)) endDT.setDate(endDT.getDate() + 1);
        if (deadlineDT < new Date(`${dateStr}T00:00:00`)) deadlineDT.setDate(deadlineDT.getDate() + 1);

        let finalPenalty = 0;
        if (now < endDT) {
            finalPenalty = 50000;
        } else if (now > deadlineDT) {
            finalPenalty = 50000;
        }

        return { penalty: finalPenalty };
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};


module.exports.getHandoverReport = async ({ fromDate, toDate, staffId, page, pageSize, role, staffName, shiftName }) => {
    const pool = await connectDB();
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE 1=1';
    const request = pool.request();

    if (fromDate) {
        whereClause += ' AND CAST(ch.handoverTime AS DATE) >= @fromDate';
        request.input('fromDate', sql.Date, fromDate);
    }
    if (toDate) {
        whereClause += ' AND CAST(ch.handoverTime AS DATE) <= @toDate';
        request.input('toDate', sql.Date, toDate);
    }
    if (staffId) {
        whereClause += ' AND ws.staffId = @staffId';
        request.input('staffId', sql.BigInt, staffId);
    }
    if (role) {
        whereClause += ' AND r.name = @roleName';
        request.input('roleName', sql.NVarChar(50), role);
    }
    if (staffName) {
        whereClause += ' AND s.fullName LIKE @staffName';
        request.input('staffName', sql.NVarChar(100), `%${staffName}%`);
    }
    if (shiftName) {
        whereClause += ' AND sh.name LIKE @shiftName';
        request.input('shiftName', sql.NVarChar(100), `%${shiftName}%`);
    }

    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const batchQuery = `
        SELECT
            ch.id AS handoverId, ch.handoverTime,
            ch.openingCash, ch.systemCash, ch.actualCash, ch.difference, ch.note,
            s.id AS staffId, s.fullName AS cashierName,
            r.name AS roleName,
            ws.workDate, ws.id AS scheduleId,
            CONVERT(VARCHAR(5), sh.startTime, 108) AS shiftStart,
            CONVERT(VARCHAR(5), sh.endTime,   108) AS shiftEnd,
            sh.name AS shiftName
        FROM CashHandovers ch
        JOIN WorkSchedules ws ON ch.scheduleId = ws.id
        JOIN Staff s   ON ws.staffId  = s.id
        JOIN Users u   ON s.userId    = u.id
        JOIN Roles r   ON u.roleId    = r.id
        LEFT JOIN Shifts sh ON ws.shiftId = sh.id
        ${whereClause}
        ORDER BY ch.handoverTime DESC
        OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

        SELECT COUNT(*) AS total
        FROM CashHandovers ch
        JOIN WorkSchedules ws ON ch.scheduleId = ws.id
        JOIN Staff s ON ws.staffId = s.id
        JOIN Users u ON s.userId   = u.id
        JOIN Roles r ON u.roleId   = r.id
        LEFT JOIN Shifts sh ON ws.shiftId = sh.id
        ${whereClause};

        SELECT
            COUNT(*) AS totalSessions,
            ISNULL(SUM(ch.systemCash), 0) AS totalSystemCash,
            ISNULL(SUM(ch.actualCash), 0) AS totalActualCash,
            ISNULL(SUM(ch.difference), 0) AS totalDifference
        FROM CashHandovers ch
        JOIN WorkSchedules ws ON ch.scheduleId = ws.id
        JOIN Staff s ON ws.staffId = s.id
        JOIN Users u ON s.userId   = u.id
        JOIN Roles r ON u.roleId   = r.id
        LEFT JOIN Shifts sh ON ws.shiftId = sh.id
        ${whereClause};
    `;

    const result = await request.query(batchQuery);
    return {
        data: result.recordsets[0],
        total: result.recordsets[1][0].total,
        summary: result.recordsets[2][0],
    };
};

module.exports.getScheduleTimes = async (scheduleId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('scheduleId', sql.Int, scheduleId)
        .query(`
            SELECT 
                CONVERT(VARCHAR(10), ws.workDate, 120) as dateStr,
                CONVERT(VARCHAR(5), sh.startTime, 108) as startStr,
                CONVERT(VARCHAR(5), sh.endTime, 108) as endStr,
                CONVERT(VARCHAR(5), ISNULL(sh.checkOutDeadline, sh.endTime), 108) as deadlineStr
            FROM WorkSchedules ws
            JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.id = @scheduleId
        `);

    return result.recordset[0] || null;
};
