const sql = require("mssql");
const { connectDB } = require("../config/database");

module.exports.getAllStaff = async () => {
    const pool = await connectDB();
    const result = await pool.request().query(`
        SELECT 
            s.id, s.fullName, s.phoneNumber, s.email,
            s.employmentStatus,
            u.username, u.isActive, u.roleId,
            r.name as roleName
        FROM Staff s
        LEFT JOIN Users u ON s.userId = u.id
        LEFT JOIN Roles r ON u.roleId = r.id
        ORDER BY s.id DESC
    `);
    return result.recordset;
};

module.exports.updateStatus = async (userId, status) => {
    const pool = await connectDB();
    await pool.request()
        .input('userId', sql.Int, userId)
        .input('status', sql.VarChar, status)
        .query("UPDATE Users SET isActive = @status WHERE id = @userId");
};

module.exports.updateEmploymentStatus = async (staffId, status) => {
    const pool = await connectDB();
    await pool.request()
        .input('id', sql.BigInt, staffId)
        .input('status', sql.VarChar, status)
        .query("UPDATE Staff SET employmentStatus = @status WHERE id = @id");
};

module.exports.atomicResign = async (staffId) => {
    const pool = await connectDB();
    const request = pool.request().input('staffId', sql.BigInt, parseInt(staffId));
    await request.query(`
        UPDATE Staff 
        SET employmentStatus = 'resigned' 
        WHERE id = @staffId;

        UPDATE u
        SET u.isActive = 'locked'
        FROM Users u
        INNER JOIN Staff s ON u.id = s.userId
        WHERE s.id = @staffId;
    `);
    return true;
};

module.exports.create = async (data) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        const userRes = await request
            .input('u',sql.VarChar,data.username)
            .input('ph',sql.VarChar,data.hashedPassword)
            .input('r',sql.Int,parseInt(data.roleId))
            .input('ia',sql.VarChar,data.status || 'active')
            .input('ca',sql.DateTime2,new Date(data.createdAt))
            .query(`
                INSERT INTO Users (roleId, username, passwordHash, isActive, createdAt)
                OUTPUT INSERTED.id
                VALUES (@r, @u, @ph, @ia, @ca)
            `);

        const newUserId = userRes.recordset[0].id;
        await request
            .input('uid',sql.Int,newUserId)
            .input('fn',sql.NVarChar,data.fullName)
            .input('pn',sql.VarChar,data.phoneNumber)
            .input('em',sql.VarChar,data.email)
            .input('st',sql.VarChar,data.salaryType)
            .input('bs',sql.Decimal(15,2), parseFloat(data.baseSalary) || 0)
            .input('es',sql.VarChar,'working')
            .input('ca2',sql.DateTime2,new Date(data.createdAt))
            .query(`
                INSERT INTO Staff (userId, fullName, phoneNumber, email, salaryType, baseSalary, employmentStatus, createdAt)
                VALUES (@uid, @fn, @pn, @em, @st, @bs, @es, @ca2)
            `);

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
        .input('id', sql.BigInt, parseInt(id))
        .query(`
            SELECT 
                s.*, 
                u.isActive, u.roleId, u.username,
                u.passwordHash as oldPassword,
                r.name as roleName
            FROM Staff s 
            JOIN Users u ON s.userId = u.id
            JOIN Roles r ON u.roleId = r.id
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
            .input('id', sql.BigInt, parseInt(id))
            .input('fn', sql.NVarChar,data.fullName)
            .input('pn', sql.VarChar,data.phoneNumber)
            .input('em', sql.VarChar,data.email || '')
            .input('st', sql.VarChar,data.salaryType)
            .input('bs', sql.Decimal(15,2), parseFloat(data.baseSalary) || 0)
            .query(`
                UPDATE Staff SET 
                    fullName= @fn,phoneNumber= @pn,email= @em,salaryType= @st,baseSalary= @bs WHERE id = @id
            `);

        const staffRes = await request
            .input('sid', sql.BigInt, parseInt(id))
            .query("SELECT userId FROM Staff WHERE id = @sid");
        const userId = staffRes.recordset[0].userId;
        let passwordUpdateSQL = "";
        if (data.newPassword && data.newPassword.trim() !== "") {
            const bcrypt = require("bcryptjs");
            const hashedPassword = await bcrypt.hash(data.newPassword, 10);
            request.input('ph', sql.VarChar, hashedPassword);
            passwordUpdateSQL = ", passwordHash = @ph";
        }

        await request
            .input('uid',sql.Int,userId)
            .input('r',sql.Int, parseInt(data.roleId))
            .input('ia',sql.VarChar,data.isActive || 'active')
            .input('un',sql.VarChar,data.username)
            .query(`
                UPDATE Users SET roleId = @r,isActive= @ia,username= @un ${passwordUpdateSQL} WHERE id = @uid
            `);
        await transaction.commit();
        return true;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

module.exports.getUserByUsername = async (username) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('un', sql.VarChar, username)
        .query("SELECT id FROM Users WHERE username = @un");
    return result.recordset[0];
};

module.exports.getStaffByPhone = async (phone) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('p', sql.VarChar, phone)
        .query("SELECT id FROM Staff WHERE phoneNumber = @p");
    return result.recordset[0];
};

module.exports.getStaffByFullName = async (fullName) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('fn', sql.NVarChar, fullName)
        .query("SELECT id FROM Staff WHERE fullName = @fn");
    return result.recordset[0];
};

module.exports.getStaffByEmail = async (email) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('em', sql.VarChar, email)
        .query("SELECT id FROM Staff WHERE email = @em");
    return result.recordset[0];
};
module.exports.getStaffByUsername = async (username) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('un', sql.VarChar, username)
        .query(`
            SELECT s.id 
            FROM Staff s 
            JOIN Users u ON s.userId = u.id 
            WHERE u.username = @un
        `);
    return result.recordset[0];
};
module.exports.getStaffByEmailForUpdate = async (email) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('em', sql.VarChar, email)
        .query("SELECT id FROM Staff WHERE email = @em");
    return result.recordset[0];
};

module.exports.getStaffByUserId = async (userId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query("SELECT s.* FROM Staff s WHERE s.userId = @userId");
    return result.recordset[0];
};
