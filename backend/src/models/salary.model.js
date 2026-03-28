const sql = require("mssql");
const { connectDB } = require("../config/database");

/**
 * Model Lương - Chỉ tập trung vào truy vấn dữ liệu thô
 */

// Lấy danh sách nhân viên và lương cơ bản
module.exports.getStaffSalaryInfo = async (filter = {}) => {
    const pool = await connectDB();
    let query = `
        SELECT s.id AS staffId, s.fullName, s.salaryType, s.baseSalary, r.name AS roleName
        FROM Staff s
        LEFT JOIN Users u ON s.userId = u.id
        LEFT JOIN Roles r ON u.roleId = r.id
        WHERE s.employmentStatus = 'working'
    `;
    const request = pool.request();
    if (filter.staffId) {
        query += " AND s.id = @staffId";
        request.input('staffId', sql.BigInt, filter.staffId);
    }
    if (filter.roleName) {
        query += " AND r.name = @roleName";
        request.input('roleName', sql.NVarChar(50), filter.roleName);
    }
    const result = await request.query(query);
    return result.recordset;
};

// Lấy dữ liệu chấm công thô trong tháng
module.exports.getRawWorkSchedules = async (startDate, endDate) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('start', sql.Date, startDate)
        .input('end', sql.Date, endDate)
        .query(`
            SELECT ws.staffId, ws.workDate, ws.status, ws.penaltyAmount, ws.attendanceRecord,
                   sh.name as shiftName, sh.startTime, sh.endTime
            FROM WorkSchedules ws
            LEFT JOIN Shifts sh ON ws.shiftId = sh.id
            WHERE ws.workDate BETWEEN @start AND @end
              AND ws.status IN ('completed', 'absent')
        `);
    return result.recordset;
};

// Lấy dữ liệu lương đã chốt
module.exports.getConfirmedPayrolls = async (month, year, filter = {}) => {
    const pool = await connectDB();
    let query = `
        SELECT p.*, s.fullName, r.name AS roleName
        FROM Payrolls p
        JOIN Staff s ON p.staffId = s.id
        JOIN Users u ON s.userId = u.id
        JOIN Roles r ON u.roleId = r.id
        WHERE p.month = @month AND p.year = @year
    `;
    const request = pool.request().input('month', sql.Int, month).input('year', sql.Int, year);
    if (filter.staffId) {
        query += " AND s.id = @staffId";
        request.input('staffId', sql.BigInt, filter.staffId);
    }
    if (filter.roleName) {
        query += " AND r.name = @roleName";
        request.input('roleName', sql.NVarChar(50), filter.roleName);
    }
    const result = await request.query(query);
    return result.recordset;
};

module.exports.getRoleList = async () => {
    const pool = await connectDB();
    const result = await pool.request().query("SELECT DISTINCT r.name FROM Roles r JOIN Users u ON r.id = u.roleId JOIN Staff s ON u.id = s.userId WHERE s.employmentStatus = 'working'");
    return result.recordset.map(r => r.name);
};

module.exports.getPayrollStatus = async (month, year) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('m', sql.Int, month).input('y', sql.Int, year)
        .query("SELECT COUNT(*) as cnt FROM Payrolls WHERE month = @m AND year = @y AND status = 'paid'");
    return { isPaid: result.recordset[0].cnt > 0 };
};

module.exports.savePayroll = async (payrollData) => {
    const pool = await connectDB();
    const { staffId, month, year, baseSalary, salaryType, workUnit, gross, deductions, net, note } = payrollData;
    await pool.request()
        .input('staffId', sql.BigInt, staffId)
        .input('month', sql.Int, month)
        .input('year', sql.Int, year)
        .input('base', sql.Decimal(15, 2), baseSalary)
        .input('type', sql.NVarChar(20), salaryType)
        .input('unit', sql.Float, workUnit)
        .input('gross', sql.Decimal(15, 2), gross)
        .input('deduct', sql.Decimal(15, 2), deductions)
        .input('net', sql.Decimal(15, 2), net)
        .input('note', sql.NVarChar(1000), note)
        .query(`
            IF EXISTS (SELECT 1 FROM Payrolls WHERE staffId = @staffId AND month = @month AND year = @year)
                UPDATE Payrolls SET appliedBaseSalary = @base, appliedSalaryType = @type, totalWorkUnit = @unit,
                                   provisionalSalary = @gross, deductions = @deduct, finalAmount = @net, note = @note, status = 'paid', createdAt = GETDATE()
                WHERE staffId = @staffId AND month = @month AND year = @year
            ELSE
                INSERT INTO Payrolls (staffId, month, year, appliedBaseSalary, appliedSalaryType, totalWorkUnit, provisionalSalary, deductions, finalAmount, note, status)
                VALUES (@staffId, @month, @year, @base, @type, @unit, @gross, @deduct, @net, @note, 'paid')
        `);
};