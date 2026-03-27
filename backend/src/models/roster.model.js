const sql = require("mssql");
const { connectDB } = require("../config/database");

module.exports.assignShift = async (staffId, shiftId, workDate) => {
    const pool = await connectDB();
    const shiftInfo = await pool.request()
        .input('shiftId', sql.Int, shiftId)
        .query(`
            SELECT name, startTime, endTime,
                   CONVERT(VARCHAR(5), startTime, 108) AS startStr
            FROM Shifts WHERE id = @shiftId
        `);
    const shift = shiftInfo.recordset[0];

    if (shift) {
        const nowVN = new Date(Date.now() + 7 * 3600 * 1000);
        const todayStr = nowVN.toISOString().split('T')[0];
        const currentTime = nowVN.toISOString().split('T')[1].substring(0, 5);
        const wDateStr = new Date(workDate).toISOString().split('T')[0];

        if (wDateStr < todayStr) {
            throw new Error("Không được phân công ca làm việc vào ngày trong quá khứ!");
        }
        if (wDateStr === todayStr && currentTime >= shift.startStr) {
            throw new Error("Ca làm việc này đã quá giờ bắt đầu hôm nay, không thể giao ca!");
        }
    }

    await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('shiftId', sql.Int, shiftId)
        .input('workDate', sql.Date, workDate)
        .input('snapStart', sql.Time, shift ? shift.startTime : null)
        .input('snapEnd', sql.Time, shift ? shift.endTime : null)
        .input('snapName', sql.NVarChar(50), shift ? shift.name : null)
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
            WHERE staffId = @staffId
              AND shiftId = @shiftId
              AND workDate = @workDate
        `);
    return result.recordset[0];
};

// Kiểm tra nhân viên có ca nào bị trùng giờ trong ngày không
module.exports.checkTimeConflictForStaff = async (staffId, shiftId, workDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('shiftId', sql.Int, shiftId)
        .input('workDate', sql.Date, workDate)
        .query(`
            -- Lấy giờ của ca mới muốn gán
            DECLARE @newStart TIME, @newEnd TIME;
            SELECT @newStart = startTime, @newEnd = endTime
            FROM Shifts WHERE id = @shiftId;

            -- Tìm ca nào đã gán trong ngày có overlap với ca mới
            SELECT TOP 1
                sh.name AS shiftName,
                CONVERT(VARCHAR(5), sh.startTime, 108) AS startTime,
                CONVERT(VARCHAR(5), sh.endTime,   108) AS endTime
            FROM WorkSchedules ws
            JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.staffId = @staffId
              AND ws.workDate = @workDate
              AND ws.shiftId != @shiftId          -- khác ca đang check
              AND ws.status NOT IN ('absent')     -- bỏ qua ca vắng

              -- OVERLAP CHECK (xử lý cả ca thường lẫn ca qua đêm)
              AND (
                  -- TRƯỜNG HỢP 1: Ca hiện tại là ca THƯỜNG (end > start)
                  -- và Ca mới cũng THƯỜNG → dùng overlap chuẩn
                  (sh.endTime > sh.startTime AND @newEnd > @newStart
                      AND sh.startTime < @newEnd AND sh.endTime > @newStart)

                  -- TRƯỜNG HỢP 2: Ca hiện tại là THƯỜNG, ca mới QUA ĐÊM
                  OR (sh.endTime > sh.startTime AND @newEnd <= @newStart
                      AND (sh.startTime >= @newStart OR sh.endTime <= @newEnd))

                  -- TRƯỜNG HỢP 3: Ca hiện tại QUA ĐÊM, ca mới THƯỜNG
                  OR (sh.endTime <= sh.startTime AND @newEnd > @newStart
                      AND (sh.startTime <= @newStart OR sh.endTime >= @newEnd))

                  -- TRƯỜNG HỢP 4: Cả hai đều QUA ĐÊM → luôn overlap
                  OR (sh.endTime <= sh.startTime AND @newEnd <= @newStart)
              )
        `);
    return result.recordset[0] || null;
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
                s.id AS staffId, s.fullName,
                r.name AS roleName,
                ws.id AS scheduleId, ws.workDate,
                ws.shiftId, ws.status,
                sh.name AS shiftName,
                CONVERT(VARCHAR(5), sh.startTime, 108) AS startTime,
                CONVERT(VARCHAR(5), sh.endTime, 108) AS endTime,
                CASE
                    WHEN ws.shiftId IS NOT NULL THEN
                        CASE WHEN sh.endTime < sh.startTime
                             THEN (DATEDIFF(MINUTE, sh.startTime, sh.endTime) + 1440) / 60.0
                             ELSE DATEDIFF(MINUTE, sh.startTime, sh.endTime) / 60.0
                        END
                    ELSE 0
                END AS shiftHours
            FROM Staff s
            LEFT JOIN Users u  ON s.userId = u.id
            LEFT JOIN Roles r  ON u.roleId = r.id
            LEFT JOIN WorkSchedules ws ON s.id = ws.staffId
                AND ws.workDate BETWEEN @startDate AND @endDate
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE s.employmentStatus = 'working' AND r.name = 'Cashier'
            ORDER BY r.name, s.fullName, ws.workDate
        `);
    return result.recordset;
};

// Lấy thông tin lịch làm việc theo id
module.exports.getScheduleById = async (scheduleId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.Int, scheduleId)
        .query(`
            SELECT 
                ws.id, 
                ws.workDate, 
                ws.shiftId,
                CONVERT(VARCHAR(5), sh.startTime, 108) AS startTime
            FROM WorkSchedules ws
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.id = @id
        `);
    return result.recordset[0];
};

// Lấy Role của nhân viên để check Validation phân ca
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
