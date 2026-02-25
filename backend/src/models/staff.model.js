const sql = require("mssql");
const { connectDB } = require("../config/database");

module.exports.getAllStaff = async () => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`
            SELECT 
                s.id, s.fullName, s.phoneNumber, s.email,
                u.username, u.isActive, u.roleId,
                r.name as roleName
            FROM Staff s
            LEFT JOIN Users u ON s.userId = u.id
            LEFT JOIN Roles r ON u.roleId = r.id
            ORDER BY s.id DESC
        `);
        return result.recordset;
    } catch (err) {
        throw err;
    }
};

module.exports.updateStatus = async (userId, status) => {
    const pool = await connectDB();
    await pool.request()
        .input('userId', sql.Int, userId)
        .input('status', sql.VarChar, status)
        .query("UPDATE Users SET isActive = @status WHERE id = @userId");
};

module.exports.create = async (data) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        const userRes = await request
            .input('u', sql.VarChar, data.email)
            .input('ph', sql.VarChar, data.hashedPassword) 
            .input('r', sql.Int, data.roleId)
            .input('ia', sql.VarChar, data.status)       
            .input('ca', sql.DateTime2, data.createdAt)
            .query(`INSERT INTO Users (roleId, username, passwordHash, isActive, createdAt) 
                    OUTPUT INSERTED.id VALUES (@r, @u, @ph, @ia, @ca)`);

        const newUserId = userRes.recordset[0].id;

        await request
            .input('uid', sql.Int, newUserId)
            .input('fn', sql.NVarChar, data.fullName)
            .input('pn', sql.VarChar, data.phoneNumber)
            .input('em', sql.VarChar, data.email)
            .input('st', sql.VarChar, data.salaryType)
            .input('bs', sql.Decimal(15, 2), data.baseSalary)
            .input('es', sql.VarChar, 'working')
            .input('ca2', sql.DateTime2, data.createdAt)
            .query(`INSERT INTO Staff (userId, fullName, phoneNumber, email, salaryType, baseSalary, employmentStatus, createdAt) 
                    VALUES (@uid, @fn, @pn, @em, @st, @bs, @es, @ca2)`);

        await transaction.commit();
        return true;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

module.exports.getStaffById = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
            SELECT s.*, u.isActive, u.roleId, u.passwordHash as oldPassword 
            FROM Staff s 
            JOIN Users u ON s.userId = u.id 
            WHERE s.id = @id
        `);
    return result.recordset[0];
};
module.exports.update = async (id, data) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        await request
            .input('id', sql.BigInt, id)
            .input('fn', sql.NVarChar, data.fullName)
            .input('pn', sql.VarChar, data.phoneNumber)
            .input('st', sql.VarChar, data.salaryType)
            .input('bs', sql.Decimal(15, 2), data.baseSalary)
            .query(`
                UPDATE Staff SET 
                fullName = @fn, phoneNumber = @pn,
                 salaryType = @st, baseSalary = @bs 
                WHERE id = @id
            `);

        const staffRes = await request.input('sid', sql.BigInt, id).query("SELECT userId FROM Staff WHERE id = @sid");
        const userId = staffRes.recordset[0].userId;


        let passwordUpdateSQL = "";
        if (data.newPassword && data.newPassword.trim() !== "") {
            const bcrypt = require("bcryptjs");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.newPassword, salt);
            request.input('ph', sql.VarChar, hashedPassword);
            passwordUpdateSQL = ", passwordHash = @ph";
        }

        await request
            .input('uid', sql.Int, userId)
            .input('r', sql.Int, data.roleId)
            .input('ia', sql.VarChar, data.isActive)
            .query(`UPDATE Users SET roleId = @r, isActive = @ia ${passwordUpdateSQL} WHERE id = @uid`);

        await transaction.commit();
        return true;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};
// Hàm check trùng Username
module.exports.getUserByUsername = async (username) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('un', sql.VarChar, username)
        .query("SELECT id, passwordHash, isActive, roleId FROM Users WHERE username = @un");
    return result.recordset[0];
};

// Hàm check trùng SĐT
module.exports.getStaffByPhone = async (phone) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('p', sql.VarChar, phone)
        .query("SELECT id FROM Staff WHERE phoneNumber = @p");
    return result.recordset[0];
};
