const sql = require("mssql");
const { connectDB } = require("../config/database");

module.exports.getMySchedule = async (staffId, startDate, endDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('startDate', sql.Date, startDate)
        .input('endDate', sql.Date, endDate)
        .query(`
            SELECT
                ws.id as scheduleId, 
                CONVERT(VARCHAR(10), ws.workDate, 120) as workDate,
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
        .input('scheduleId', sql.Int, scheduleId)
        .input('staffId', sql.BigInt, staffId)
        .query(`
            -- 1. Xác định khung giờ làm việc thực tế (từ lúc Check-in đến lúc kết ca)
            DECLARE @startTime DATETIME, @endTime DATETIME;
            SELECT
                @startTime = ISNULL(checkInTime, CAST(workDate AS DATETIME)), 
                @endTime   = ISNULL(checkOutTime, DATEADD(hour, 7, GETUTCDATE()))
            FROM WorkSchedules WHERE id = @scheduleId;

            -- 2. Tính tổng hợp các loại tiền mặt
            DECLARE @opening DECIMAL(15,2) = ISNULL((SELECT openingCash FROM CashHandovers WHERE scheduleId = @scheduleId), 0);
            
            DECLARE @sales   DECIMAL(15,2) = ISNULL((
                SELECT SUM(p.amount) FROM Invoices i JOIN Payments p ON i.id = p.invoiceId
                WHERE i.staffId = @staffId AND p.paymentMethod = 'CASH' AND p.status = 'SUCCESS'
                  AND i.createdAt >= @startTime AND i.createdAt <= @endTime
            ), 0);

            DECLARE @refund  DECIMAL(15,2) = ISNULL((
                SELECT SUM(r.totalRefundAmount) 
                FROM Returns r
                LEFT JOIN Invoices i ON r.invoiceId = i.id
                WHERE (r.staffId = @staffId OR i.staffId = @staffId)
                  AND r.refundMethod = 'CASH' 
                  AND r.status IN ('Approve', 'APPROVED')
                  AND r.createdAt >= @startTime AND r.createdAt <= @endTime
            ), 0);

            -- 3. Trả về kết quả tổng hợp
            SELECT 
                @opening AS openingCash, 
                @sales   AS salesCash, 
                @refund  AS returnCash, 
                (@opening + @sales - @refund) AS netSystemCash;
        `);

    const row = result.recordset[0];
    return {
        openingCash: row?.openingCash || 0,
        salesCash: row?.salesCash || 0,
        returnCash: row?.returnCash || 0,
        netSystemCash: row?.netSystemCash || 0
    };
};

module.exports.createHandoverSimple = async (data) => {
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

        await request
            .input('updatedRecord', sql.NVarChar(255), data.updatedRecord)
            .input('updatedPenalty', sql.Decimal(15, 2), data.updatedPenalty)
            .query(`
                UPDATE WorkSchedules 
                SET status = 'completed', 
                    checkOutTime = DATEADD(hour, 7, GETUTCDATE()),
                    attendanceRecord = @updatedRecord,
                    penaltyAmount = @updatedPenalty 
                WHERE id = @scheduleId;
            `);

        await transaction.commit();
        return true;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

function buildHandoverFilter(pool, filters) {
    const { fromDate, toDate, staffId, role, staffName, shiftName } = filters;
    const request = pool.request();

    let where = "WHERE ws.status = 'completed'";

    if (fromDate) {
        where += ' AND CAST(ch.handoverTime AS DATE) >= @fromDate';
        request.input('fromDate', sql.Date, fromDate);
    }
    if (toDate) {
        where += ' AND CAST(ch.handoverTime AS DATE) <= @toDate';
        request.input('toDate', sql.Date, toDate);
    }
    if (staffId) {
        where += ' AND ws.staffId = @staffId';
        request.input('staffId', sql.BigInt, staffId);
    }
    if (role) {
        where += ' AND r.name = @roleName';
        request.input('roleName', sql.NVarChar(50), role);
    }
    if (staffName) {
        where += ' AND s.fullName LIKE @staffName';
        request.input('staffName', sql.NVarChar(100), `%${staffName}%`);
    }
    if (shiftName) {
        where += ' AND sh.name LIKE @shiftName';
        request.input('shiftName', sql.NVarChar(100), `%${shiftName}%`);
    }

    return { request, where };
}

module.exports.getHandoverReport = async ({ fromDate, toDate, staffId, page, pageSize, role, staffName, shiftName }) => {
    const pool = await connectDB();
    const offset = (page - 1) * pageSize;
    const filters = { fromDate, toDate, staffId, role, staffName, shiftName };
    // Lấy danh sách bàn giao
    const q1 = buildHandoverFilter(pool, filters);
    q1.request.input('offset', sql.Int, offset);
    q1.request.input('pageSize', sql.Int, pageSize);

    const listResult = await q1.request.query(`
        SELECT
            ch.id AS handoverId,
            ch.handoverTime,
            ch.openingCash,
            ch.systemCash,
            ch.actualCash,
            ch.difference,
            ch.note,
            (SELECT ISNULL(SUM(ret.totalRefundAmount), 0)
             FROM Returns ret
             INNER JOIN Invoices inv ON ret.invoiceId = inv.id
             WHERE (ret.staffId = s.id OR inv.staffId = s.id)
               AND ret.refundMethod = 'CASH' 
               AND ret.status IN ('Approve', 'APPROVED')
               AND ret.createdAt >= ws.checkInTime 
               AND ret.createdAt <= ISNULL(ws.checkOutTime, ch.handoverTime)
            ) AS returnCash,
            s.id AS staffId,
            s.fullName AS cashierName,
            r.name AS roleName,
            ws.workDate,
            ws.id AS scheduleId,
            CONVERT(VARCHAR(5), sh.startTime, 108) AS shiftStart,
            CONVERT(VARCHAR(5), sh.endTime, 108) AS shiftEnd,
            sh.name AS shiftName
        FROM CashHandovers ch
        JOIN WorkSchedules ws ON ch.scheduleId = ws.id
        JOIN Staff s ON ws.staffId  = s.id
        JOIN Users u ON s.userId = u.id
        JOIN Roles r ON u.roleId = r.id
        LEFT JOIN Shifts sh ON ws.shiftId = sh.id
        ${q1.where}
        ORDER BY ch.handoverTime DESC
        OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);

    //  Đếm tổng số dòng (dùng để tính số trang)
    const q2 = buildHandoverFilter(pool, filters);
    const countResult = await q2.request.query(`
        SELECT COUNT(*) AS total
        FROM CashHandovers ch
        JOIN WorkSchedules ws ON ch.scheduleId = ws.id
        JOIN Staff s ON ws.staffId = s.id
        JOIN Users u ON s.userId = u.id
        JOIN Roles r ON u.roleId = r.id
        LEFT JOIN Shifts sh ON ws.shiftId = sh.id
        ${q2.where}
    `);

    //  Tính tổng hợp (số ca, tổng tiền, chênh lệch) 
    const q3 = buildHandoverFilter(pool, filters);
    const summaryResult = await q3.request.query(`
        SELECT
            COUNT(*) AS totalSessions,
            ISNULL(SUM(ch.systemCash), 0) AS totalSystemCash,
            ISNULL(SUM(ch.actualCash), 0) AS totalActualCash,
            ISNULL(SUM(ch.difference), 0) AS totalDifference
        FROM CashHandovers ch
        JOIN WorkSchedules ws ON ch.scheduleId = ws.id
        JOIN Staff s ON ws.staffId = s.id
        JOIN Users u ON s.userId = u.id
        JOIN Roles r ON u.roleId  = r.id
        LEFT JOIN Shifts sh ON ws.shiftId = sh.id
        ${q3.where}
    `);

    return {
        data: listResult.recordset,
        total: countResult.recordset[0].total,
        summary: summaryResult.recordset[0],
    };
};

module.exports.getDailyAuditStatus = async (workDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('workDate', sql.Date, workDate)
        .query(`
            SELECT 
                COUNT(*) as totalShifts,
                ISNULL(SUM(CASE WHEN ws.status = 'completed' THEN 1 ELSE 0 END), 0) as completedShifts,
                ISNULL(SUM(CASE WHEN ws.status IN ('assigned', 'working') THEN 1 ELSE 0 END), 0) as pendingShifts
            FROM WorkSchedules ws
            JOIN Staff s ON ws.staffId = s.id
            JOIN Users u ON s.userId = u.id
            JOIN Roles r ON u.roleId = r.id
            WHERE ws.workDate = @workDate
              AND r.name = 'Cashier'
        `);
    return result.recordset[0];
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
                CONVERT(VARCHAR(5), ISNULL(sh.checkOutDeadline, sh.endTime), 108) as deadlineStr,
                ws.attendanceRecord,
                ISNULL(ws.penaltyAmount, 0) as penaltyAmount
            FROM WorkSchedules ws
            JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.id = @scheduleId
        `);

    return result.recordset[0] || null;
};
