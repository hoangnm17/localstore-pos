const sql = require("mssql");
const { connectDB } = require("../config/database");

module.exports.getAllShifts = async () => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT 
        id, 
        name, 
        CONVERT(VARCHAR(5), startTime, 108) as startTime,
        CONVERT(VARCHAR(5), endTime, 108) as endTime
      FROM Shifts
      ORDER BY startTime ASC
    `);
    return result.recordset;
  } catch (err) {
    throw err;
  }
};

module.exports.getShiftById = async (id) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          id, 
          name, 
          CONVERT(VARCHAR(5), startTime, 108) as startTime,
          CONVERT(VARCHAR(5), endTime, 108) as endTime
        FROM Shifts 
        WHERE id = @id
      `);
    return result.recordset[0];
  } catch (err) {
    throw err;
  }
};


module.exports.createShift = async (data) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input('name', sql.NVarChar, data.name)
      // ĐỔI sql.Time THÀNH sql.VarChar
      .input('startTime', sql.VarChar, formatTimeToSQL(data.startTime))
      .input('endTime', sql.VarChar, formatTimeToSQL(data.endTime))
      .query(`
        INSERT INTO Shifts (name, startTime, endTime)
        OUTPUT INSERTED.id
        VALUES (@name, @startTime, @endTime)
      `);
    return result.recordset[0].id;
  } catch (err) {
    throw err;
  }
};

module.exports.updateShift = async (id, data) => {
  try {
    const pool = await connectDB();
    await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, data.name)
      .input('startTime', sql.VarChar, formatTimeToSQL(data.startTime))
      .input('endTime', sql.VarChar, formatTimeToSQL(data.endTime))
      .query(`
        UPDATE Shifts 
        SET name = @name, 
            startTime = @startTime, 
            endTime = @endTime
        WHERE id = @id
      `);
    return true;
  } catch (err) {
    throw err;
  }
};

module.exports.deleteShift = async (id) => {
  try {
    const pool = await connectDB();

    const checkResult = await pool.request()
      .input('shiftId', sql.Int, id)
      .query(`SELECT COUNT(*) as count FROM WorkSchedules WHERE shiftId = @shiftId`);

    if (checkResult.recordset[0].count > 0) {
      throw new Error("Không thể xóa ca đã được phân công cho nhân viên!");
    }

    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Shifts WHERE id = @id`);

    return true;
  } catch (err) {
    throw err;
  }
};

// Kiểm tra trùng tên ca
module.exports.checkDuplicateName = async (name, excludeId = null) => {
  try {
    const pool = await connectDB();
    let query = `SELECT id FROM Shifts WHERE name = @name`;
    if (excludeId) {
      query += ` AND id != @excludeId`;
    }

    const request = pool.request()
      .input('name', sql.NVarChar, name);

    if (excludeId) {
      request.input('excludeId', sql.Int, excludeId);
    }

    const result = await request.query(query);
    return result.recordset[0];
  } catch (err) {
    throw err;
  }
};

// Kiểm tra thời gian trùng
module.exports.checkTimeConflict = async (startTime, endTime, excludeId = null) => {
  try {
    const pool = await connectDB();
    let query = `
      SELECT id, name, startTime, endTime 
      FROM Shifts 
      WHERE (startTime < @endTime AND endTime > @startTime)
    `;
    if (excludeId) query += ` AND id != @excludeId`;
    
    const request = pool.request()
      // ĐỔI sql.Time THÀNH sql.VarChar
      .input('startTime', sql.VarChar, formatTimeToSQL(startTime))
      .input('endTime', sql.VarChar, formatTimeToSQL(endTime));
    
    if (excludeId) request.input('excludeId', sql.Int, excludeId);
    
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    throw err;
  }
};
const formatTimeToSQL = (timeStr) => {
  if (!timeStr) return null;
  if (timeStr.length === 5) return `${timeStr}:00`;
  return timeStr;
};
