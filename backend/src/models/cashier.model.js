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
                ws.id as scheduleId, ws.workDate, ws.status as scheduleStatus,
                sh.id as shiftId, 
                
                -- LOGIC: Nếu <= Hôm nay thì giữ giờ cũ (snapshot). Nếu tương lai thì lấy giờ mới 
                CASE 
                    WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) 
                    THEN ISNULL(ws.snapshotShiftName, sh.name)
                    ELSE ISNULL(sh.name, ws.snapshotShiftName) 
                END as shiftName, 
                
                CONVERT(VARCHAR(5), 
                    CASE 
                        WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) 
                        THEN ISNULL(ws.snapshotStartTime, sh.startTime)
                        ELSE ISNULL(sh.startTime, ws.snapshotStartTime) 
                    END, 108) as startTime,
                    
                CONVERT(VARCHAR(5), 
                    CASE 
                        WHEN ws.workDate <= CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) 
                        THEN ISNULL(ws.snapshotEndTime, sh.endTime)
                        ELSE ISNULL(sh.endTime, ws.snapshotEndTime) 
                    END, 108) as endTime,
                    
                c.counterName, c.counterCode,
                ch.id as handoverId
            FROM WorkSchedules ws
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            LEFT JOIN Counters c ON ws.counterId = c.id
            LEFT JOIN CashHandovers ch ON ws.id = ch.scheduleId
            WHERE ws.staffId = @staffId 
              AND ws.workDate BETWEEN @startDate AND @endDate
            ORDER BY ws.workDate ASC, startTime ASC
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
                ws.id as scheduleId, ISNULL(sh.name, ws.snapshotShiftName) as shiftName, 
                CONVERT(VARCHAR(5), ISNULL(sh.startTime, ws.snapshotStartTime), 108) as startTime,
                CONVERT(VARCHAR(5), ISNULL(sh.endTime, ws.snapshotEndTime), 108) as endTime,
                c.counterName
            FROM WorkSchedules ws
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            LEFT JOIN Counters c ON ws.counterId = c.id
            LEFT JOIN CashHandovers ch ON ws.id = ch.scheduleId
            WHERE ws.staffId = @staffId 
              AND ws.workDate = @workDate 
              AND ch.id IS NULL -- Điều kiện: Ca này chưa có bản ghi bàn giao
              AND ws.counterId IS NOT NULL 
            ORDER BY startTime ASC
        `);
    return result.recordset;
};

module.exports.getSystemCash = async (staffId, scheduleId) => {
    const pool = await connectDB();

    const sched = await pool.request()
        .input('id', sql.Int, scheduleId)
        .input('staffId', sql.BigInt, staffId)
        .query(`
            SELECT ws.workDate, ws.counterId, 
                   ISNULL(sh.startTime, ws.snapshotStartTime) as startTime, 
                   ISNULL(sh.endTime, ws.snapshotEndTime) as endTime
            FROM WorkSchedules ws
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.id = @id AND ws.staffId = @staffId
        `);

    if (sched.recordset.length === 0) throw new Error("Không tìm thấy ca làm việc!");
    const { workDate, counterId, startTime, endTime } = sched.recordset[0];

    const startDT = `${workDate.toISOString().split('T')[0]}T${startTime.toISOString().split('T')[1]}`;
    const endDT = `${workDate.toISOString().split('T')[0]}T${endTime.toISOString().split('T')[1]}`;

    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('counterId', sql.BigInt, counterId)
        .input('startDT', sql.DateTime2, startDT)
        .input('endDT', sql.DateTime2, endDT)
        .query(`
            SELECT ISNULL(SUM(p.amount), 0) as systemCash
            FROM Invoices i
            JOIN Payments p ON i.id = p.invoiceId
            WHERE i.staffId = @staffId 
              AND i.counterId = @counterId
              AND i.createdAt BETWEEN @startDT AND @endDT
              AND p.paymentMethod = 'CASH' 
              AND p.status = 'SUCCESS'
        `);
    return result.recordset[0].systemCash;
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
                INSERT INTO CashHandovers (scheduleId, openingCash, systemCash, actualCash, note)
                VALUES (@scheduleId, @openingCash, @systemCash, @actualCash, @note)
            `);

        await request
            .input('schedId', sql.Int, data.scheduleId)
            .input('now', sql.DateTime2, new Date())
            .query(`
                UPDATE WorkSchedules 
                SET status = 'completed', checkOutTime = @now 
                WHERE id = @schedId
            `);

        await transaction.commit();
        return true;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};
module.exports.getHandoverReport = async (
    { fromDate, toDate, counterId, staffId, page, pageSize, role, staffName, shiftName }) => {
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
    if (counterId) {
        whereClause += ' AND ws.counterId = @counterId';
        request.input('counterId', sql.BigInt, counterId);
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
        whereClause += ' AND (ISNULL(ws.snapshotShiftName, sh.name) LIKE @shiftName)';
        request.input('shiftName', sql.NVarChar(100), `%${shiftName}%`);
    }
    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, pageSize);

    const batchQuery = `
        SELECT
            ch.id AS handoverId,
            ch.handoverTime,
            ch.openingCash,
            ch.systemCash,
            ch.actualCash,
            ch.difference,
            ch.note,
            s.id AS staffId,
            s.fullName AS cashierName,
            r.name AS roleName,
            co.id AS counterId,
            co.counterName,
            co.counterCode,
            ws.workDate,
            ws.id AS scheduleId,
            CONVERT(VARCHAR(5), ISNULL(ws.snapshotStartTime, sh.startTime), 108) AS shiftStart,
            CONVERT(VARCHAR(5), ISNULL(ws.snapshotEndTime, sh.endTime), 108) AS shiftEnd,
            ISNULL(ws.snapshotShiftName, sh.name) AS shiftName
        FROM CashHandovers ch
        JOIN WorkSchedules ws ON ch.scheduleId = ws.id
        JOIN Staff s ON ws.staffId = s.id
        JOIN Users u ON s.userId = u.id
        JOIN Roles r ON u.roleId = r.id
        LEFT JOIN Counters co ON ws.counterId = co.id
        LEFT JOIN Shifts sh ON ws.shiftId = sh.id
        ${whereClause}
        ORDER BY ch.handoverTime DESC
        OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY;

        SELECT COUNT(*) AS total
        FROM CashHandovers ch
        JOIN WorkSchedules ws ON ch.scheduleId = ws.id
        JOIN Staff s ON ws.staffId = s.id
        JOIN Users u ON s.userId = u.id     
        JOIN Roles r ON u.roleId = r.id      
        LEFT JOIN Counters co ON ws.counterId = co.id
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
        JOIN Users u ON s.userId = u.id      
        JOIN Roles r ON u.roleId = r.id      
        LEFT JOIN Counters co ON ws.counterId = co.id
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