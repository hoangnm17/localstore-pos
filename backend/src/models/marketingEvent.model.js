const { connectDB, sql } = require('../config/database');

class EventModel {
    async getAll(params = {}) {
        const { page = 1, limit = 10 } = params;
        const offset = (page - 1) * limit;
        const pool = await connectDB();

        const countRes = await pool.request().query('SELECT COUNT(*) as total FROM MarketingEvents');
        const total = countRes.recordset[0].total;

        const res = await pool.request()
            .input('offset', sql.Int, offset)
            .input('limit', sql.Int, limit)
            .query(`
                SELECT * FROM MarketingEvents 
                ORDER BY createdAt DESC 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);

        return { data: res.recordset, total };
    }

    async getById(id) {
        const pool = await connectDB();
        const res = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM MarketingEvents WHERE id = @id');
        return res.recordset[0];
    }

    async create(data) {
        this.validateFields(data);
        const pool = await connectDB();
        const res = await pool.request()
            .input('name', sql.NVarChar, data.name)
            .input('description', sql.NVarChar, data.description)
            .input('startTime', sql.DateTime, data.startTime)
            .input('endTime', sql.DateTime, data.endTime)
            .input('privilegeType', sql.NVarChar, data.privilegeType)
            .input('privilegeValue', sql.Float, data.privilegeValue)
            .input('minRank', sql.NVarChar, data.minRank)
            .input('status', sql.NVarChar, data.status || 'Active')
            .query(`
                INSERT INTO MarketingEvents (name, description, startTime, endTime, privilegeType, privilegeValue, minRank, status)
                OUTPUT INSERTED.*
                VALUES (@name, @description, @startTime, @endTime, @privilegeType, @privilegeValue, @minRank, @status)
            `);
        return res.recordset[0];
    }

    async update(id, data) {
        this.validateFields(data);
        const pool = await connectDB();
        const res = await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar, data.name)
            .input('description', sql.NVarChar, data.description)
            .input('startTime', sql.DateTime, data.startTime)
            .input('endTime', sql.DateTime, data.endTime)
            .input('privilegeType', sql.NVarChar, data.privilegeType)
            .input('privilegeValue', sql.Float, data.privilegeValue)
            .input('minRank', sql.NVarChar, data.minRank)
            .input('status', sql.NVarChar, data.status)
            .query(`
                UPDATE MarketingEvents SET 
                    name = @name, 
                    description = @description, 
                    startTime = @startTime, 
                    endTime = @endTime, 
                    privilegeType = @privilegeType, 
                    privilegeValue = @privilegeValue, 
                    minRank = @minRank, 
                    status = @status, 
                    updatedAt = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);
        return res.recordset[0];
    }

    async delete(id) {
        const pool = await connectDB();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM MarketingEvents WHERE id = @id');
        return true;
    }

    async getActiveEvents() {
        const pool = await connectDB();
        const res = await pool.request()
            .query(`
                SELECT * FROM MarketingEvents 
                WHERE status = 'Active' AND GETDATE() BETWEEN startTime AND endTime
            `);
        return res.recordset;
    }
    validateFields(data) {
        const { name, startTime, endTime } = data;

        // 1. Chặn tên bỏ trống
        if (!name || name.trim() === '') {
            throw new Error('Tên sự kiện không được để trống');
        }

        if (!startTime || startTime.toString().trim() === '') {
            throw new Error('Ngày bắt đầu không được để trống');
        }

        if (!endTime || endTime.toString().trim() === '') {
            throw new Error('Ngày kết thúc không được để trống');
        }

        // 2. Kiểm tra ngày (không được ở quá khứ)
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Quy về đầu ngày để so sánh

        if (startTime) {
            if (isNaN(Date.parse(startTime))) {
                throw new Error('Ngày bắt đầu không đúng định dạng');
            }
            const start = new Date(startTime);
            if (start < now) {
                throw new Error('Ngày bắt đầu không được ở trong quá khứ');
            }
        }

        if (endTime) {
            if (isNaN(Date.parse(endTime))) {
                throw new Error('Ngày kết thúc không đúng định dạng');
            }
            const end = new Date(endTime);
            if (end < now) {
                throw new Error('Ngày kết thúc không được ở trong quá khứ');
            }
        }

        // 3. Logic so sánh ngày bắt đầu & kết thúc
        if (startTime && endTime && !isNaN(Date.parse(startTime)) && !isNaN(Date.parse(endTime))) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            if (start > end) {
                throw new Error('Ngày bắt đầu không được lớn hơn ngày kết thúc');
            }
        }
    }

}


module.exports = new EventModel();
