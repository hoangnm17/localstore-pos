const sql = require("mssql");
const { connectDB } = require("../config/database");

const formatTimeToSQL = (timeStr) => {
  if (!timeStr) return null;
  if (timeStr.length === 5) return `${timeStr}:00`;
  return timeStr;
};

module.exports.getAllShifts = async () => {
  const pool = await connectDB();
  const result = await pool.request().query(`
    SELECT 
      id, name,
      CONVERT(VARCHAR(5), startTime, 108) as startTime,
      CONVERT(VARCHAR(5), endTime, 108) as endTime,
      CONVERT(VARCHAR(5), checkInStart, 108) as checkInStart,
      CONVERT(VARCHAR(5), checkInEnd, 108) as checkInEnd,
      CONVERT(VARCHAR(5), checkOutDeadline, 108) as checkOutDeadline,
      isActive
    FROM Shifts
    ORDER BY isActive DESC, startTime ASC
  `);
  return result.recordset;
};

module.exports.getShiftById = async (id) => {
  const pool = await connectDB();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT 
        id, name,
        CONVERT(VARCHAR(5), startTime, 108) as startTime,
        CONVERT(VARCHAR(5), endTime, 108) as endTime,
        CONVERT(VARCHAR(5), checkInStart, 108) as checkInStart,
        CONVERT(VARCHAR(5), checkInEnd, 108) as checkInEnd,
        CONVERT(VARCHAR(5), checkOutDeadline, 108) as checkOutDeadline,
        isActive
      FROM Shifts 
      WHERE id = @id
    `);
  return result.recordset[0];
};

module.exports.createShift = async (data) => {
  const pool = await connectDB();
  const result = await pool.request()
    .input('name', sql.NVarChar, data.name)
    .input('startTime', sql.VarChar, formatTimeToSQL(data.startTime))
    .input('endTime', sql.VarChar, formatTimeToSQL(data.endTime))
    .input('checkInStart', sql.VarChar, data.checkInStart ? formatTimeToSQL(data.checkInStart) : null)
    .input('checkInEnd', sql.VarChar, data.checkInEnd ? formatTimeToSQL(data.checkInEnd) : null)
    .input('checkOutDeadline', sql.VarChar, data.checkOutDeadline ? formatTimeToSQL(data.checkOutDeadline) : null)
    .query(`
      INSERT INTO Shifts (name, startTime, endTime, checkInStart, checkInEnd, checkOutDeadline, isActive)
      OUTPUT INSERTED.id
      VALUES (@name, @startTime, @endTime, @checkInStart, @checkInEnd, @checkOutDeadline, 1)
    `);
  return result.recordset[0].id;
};

module.exports.updateShift = async (id, data) => {
  const pool = await connectDB();
  await pool.request()
    .input('id', sql.Int, id)
    .input('name', sql.NVarChar, data.name)
    .input('startTime', sql.VarChar, formatTimeToSQL(data.startTime))
    .input('endTime', sql.VarChar, formatTimeToSQL(data.endTime))
    .input('checkInStart', sql.VarChar, data.checkInStart ? formatTimeToSQL(data.checkInStart) : null)
    .input('checkInEnd', sql.VarChar, data.checkInEnd ? formatTimeToSQL(data.checkInEnd) : null)
    .input('checkOutDeadline', sql.VarChar, data.checkOutDeadline ? formatTimeToSQL(data.checkOutDeadline) : null)
    .query(`
      UPDATE Shifts 
      SET name = @name, 
          startTime = @startTime, 
          endTime = @endTime,
          checkInStart = @checkInStart,
          checkInEnd = @checkInEnd,
          checkOutDeadline = @checkOutDeadline
      WHERE id = @id
    `);
  return true;
};

module.exports.toggleShift = async (id) => {
  const pool = await connectDB();
  const current = await pool.request()
    .input('id', sql.Int, id)
    .query(`SELECT isActive FROM Shifts WHERE id = @id`);

  if (!current.recordset[0]) {
    throw new Error("Không tìm thấy ca làm việc!");
  }

  const currentActive = current.recordset[0].isActive;

  // Nếu đang active → sắp deactivate → kiểm tra lịch tương lai
  if (currentActive === 1) {
    const futureCheck = await pool.request()
      .input('shiftId', sql.Int, id)
      .input('today', sql.Date, new Date())
      .query(`
        SELECT COUNT(*) as count 
        FROM WorkSchedules 
        WHERE shiftId = @shiftId AND workDate >= @today
      `);

    const count = futureCheck.recordset[0].count;
    if (count > 0) {
      throw new Error(
        `Ca này còn ${count} lịch phân công trong tương lai. Hãy xóa các lịch đó trước khi ngừng sử dụng!`
      );
    }
  }

  const newActive = currentActive === 1 ? 0 : 1;
  await pool.request()
    .input('id', sql.Int, id)
    .input('isActive', sql.Bit, newActive)
    .query(`UPDATE Shifts SET isActive = @isActive WHERE id = @id`);

  return { newActive };
};

module.exports.checkDuplicateName = async (name, excludeId = null) => {
  const pool = await connectDB();
  let query = `SELECT id FROM Shifts WHERE name = @name AND isActive = 1`;
  if (excludeId) query += ` AND id != @excludeId`;
  const request = pool.request().input('name', sql.NVarChar, name);
  if (excludeId) request.input('excludeId', sql.Int, excludeId);
  const result = await request.query(query);
  return result.recordset[0];
};

module.exports.checkTimeConflict = async (startTime, endTime, excludeId = null) => {
  const pool = await connectDB();
  let query = `
    SELECT id, name,
           CONVERT(VARCHAR(5), startTime, 108) as startTime,
           CONVERT(VARCHAR(5), endTime, 108) as endTime
    FROM Shifts 
    WHERE (startTime < @endTime AND endTime > @startTime)
      AND isActive = 1
  `;
  if (excludeId) query += ` AND id != @excludeId`;
  const request = pool.request()
    .input('startTime', sql.VarChar, formatTimeToSQL(startTime))
    .input('endTime', sql.VarChar, formatTimeToSQL(endTime));
  if (excludeId) request.input('excludeId', sql.Int, excludeId);
  const result = await request.query(query);
  return result.recordset;
};
