const { connectDB, sql } = require("../config/database.js");

const VALID_TYPES = ['Percent', 'Fixed'];
const VALID_STATUSES = ['Active', 'Expired', 'Disabled'];

const validateFields = (data, isUpdate = false) => {
    const { code, type, status, value, minOrderValue, maxUsage, startDate, expiryDate } = data;

    // 1. Kiểm tra mã voucher (chỉ khi tạo mới hoặc nếu có truyền vào khi update)
    if (!isUpdate || (code !== undefined)) {
        if (code === undefined || code === null || String(code).trim() === '') {
            throw new Error('Mã voucher không được để trống');
        }
    }

    // 2. Kiểm tra các số (không được âm)
    if (value !== undefined && parseFloat(value) < 0) {
        throw new Error('Giá trị giảm của voucher không được là số âm');
    }

    if (minOrderValue !== undefined && parseFloat(minOrderValue) < 0) {
        throw new Error('Giá trị đơn hàng tối thiểu không được là số âm');
    }

    if (maxUsage !== undefined && parseInt(maxUsage) < 0) {
        throw new Error('Số lượt sử dụng tối đa không được là số âm');
    }

    // 3. Kiểm tra ngày (không được ở quá khứ)
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Chỉ so sánh ngày, không cần giờ phút giây

    if (startDate) {
        if (isNaN(Date.parse(startDate))) {
            throw new Error('Ngày bắt đầu không đúng định dạng');
        }
        if (!isUpdate) {
            const start = new Date(startDate);
            if (start < now) {
                throw new Error('Ngày bắt đầu không được ở trong quá khứ');
            }
        }
    }

    if (expiryDate) {
        if (isNaN(Date.parse(expiryDate))) {
            throw new Error('Ngày hết hạn không đúng định dạng');
        }
        const end = new Date(expiryDate);
        if (end < now) {
            throw new Error('Ngày hết hạn không được ở trong quá khứ');
        }
    }

    // 4. Logic so sánh ngày
    if (startDate && expiryDate && !isNaN(Date.parse(startDate)) && !isNaN(Date.parse(expiryDate))) {
        const start = new Date(startDate);
        const end = new Date(expiryDate);
        if (start > end) {
            throw new Error('Ngày bắt đầu không được lớn hơn ngày hết hạn');
        }
    }

    // 5. Validate ENUMs
    if (type !== undefined && !VALID_TYPES.includes(type)) {
        throw new Error(`Kiểu voucher không hợp lệ. Chỉ chấp nhận: ${VALID_TYPES.join(', ')}`);
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
        throw new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${VALID_STATUSES.join(', ')}`);
    }
};

exports.getVouchers = async (filters) => {
    const pool = await connectDB();
    const {
        search = '',
        status = null,
        limit = 10,
        offset = 0
    } = filters;

    let query = `SELECT * FROM Vouchers WHERE 1=1`;
    if (status) query += ` AND status = @status`;
    if (search) query += ` AND code LIKE @search`;
    query += ` ORDER BY createdAt DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request()
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset);
    if (status) request.input('status', sql.VarChar, status);
    if (search) request.input('search', sql.VarChar, `%${search}%`);

    const result = await request.query(query);
    return result.recordset;
};

exports.countVouchers = async (filters) => {
    const pool = await connectDB();
    const { search = '', status = null } = filters;

    let query = `SELECT COUNT(*) AS total FROM Vouchers WHERE 1=1`;
    if (status) query += ` AND status = @status`;
    if (search) query += ` AND code LIKE @search`;

    const request = pool.request();
    if (status) request.input('status', sql.VarChar, status);
    if (search) request.input('search', sql.VarChar, `%${search}%`);

    const result = await request.query(query);
    return result.recordset[0].total;
};

exports.getVoucherById = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT * FROM Vouchers WHERE id = @id`);
    return result.recordset[0] || null;
};

exports.getVoucherByCode = async (code) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('code', sql.VarChar, code)
        .query(`SELECT * FROM Vouchers WHERE code = @code`);
    return result.recordset[0];
};

exports.createVoucher = async (data) => {
    const pool = await connectDB();
    const { code, value, type, minOrderValue = 0, maxUsage = 100, startDate, expiryDate, status = 'Active' } = data;

    validateFields(data, false);

    try {
        const result = await pool.request()
            .input('code', sql.VarChar, code)
            .input('value', sql.Decimal(15, 2), value)
            .input('type', sql.VarChar, type)
            .input('minOrderValue', sql.Decimal(15, 2), minOrderValue)
            .input('maxUsage', sql.Int, maxUsage)
            .input('startDate', sql.DateTime2, startDate || null)
            .input('expiryDate', sql.DateTime2, expiryDate || null)
            .input('status', sql.VarChar, status)
            .query(`
                INSERT INTO Vouchers (code, value, type, minOrderValue, maxUsage, startDate, expiryDate, status)
                VALUES (@code, @value, @type, @minOrderValue, @maxUsage, @startDate, @expiryDate, @status);

                SELECT * FROM Vouchers WHERE id = SCOPE_IDENTITY();
            `);
        return result.recordset[0];
    } catch (err) {
        if (err.message.includes('UNIQUE KEY')) {
            throw new Error(`Mã voucher "${code}" đã tồn tại trong hệ thống. Vui lòng dùng mã khác.`);
        }
        throw err;
    }
};

exports.updateVoucher = async (id, data) => {
    const pool = await connectDB();
    const existing = await exports.getVoucherById(id);
    if (!existing) return null;

    const { value, type, minOrderValue, maxUsage, startDate, expiryDate, status } = data;

    // Merge for validation
    const validationData = {
        ...data,
        startDate: startDate !== undefined ? startDate : existing.startDate,
        expiryDate: expiryDate !== undefined ? expiryDate : existing.expiryDate
    };
    validateFields(validationData, true);

    const setClauses = [];
    const request = pool.request().input('id', sql.Int, id);

    if (value !== undefined) { setClauses.push('value = @value'); request.input('value', sql.Decimal(15, 2), value); }
    if (type !== undefined) { setClauses.push('type = @type'); request.input('type', sql.VarChar, type); }
    if (minOrderValue !== undefined) { setClauses.push('minOrderValue = @minOrderValue'); request.input('minOrderValue', sql.Decimal(15, 2), minOrderValue); }
    if (maxUsage !== undefined) { setClauses.push('maxUsage = @maxUsage'); request.input('maxUsage', sql.Int, maxUsage); }
    if (startDate !== undefined) { setClauses.push('startDate = @startDate'); request.input('startDate', sql.DateTime2, startDate || null); }
    if (expiryDate !== undefined) { setClauses.push('expiryDate = @expiryDate'); request.input('expiryDate', sql.DateTime2, expiryDate || null); }
    if (status !== undefined) { setClauses.push('status = @status'); request.input('status', sql.VarChar, status); }

    if (setClauses.length === 0) return null;

    const result = await request.query(`
        UPDATE Vouchers
        SET ${setClauses.join(', ')}
        WHERE id = @id;

        SELECT * FROM Vouchers WHERE id = @id;
    `);
    return result.recordset[0];
};

// Soft delete — đặt status = 'Disabled'
exports.deleteVoucher = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            UPDATE Vouchers
            SET status = 'Disabled'
            WHERE id = @id;

            SELECT * FROM Vouchers WHERE id = @id;
        `);
    return result.recordset[0];
};

/**
 * Validate voucher trước khi áp dụng — UC8: Validate & Apply Voucher
 * Kiểm tra: tồn tại, status Active, trong hạn, chưa hết lượt dùng, đủ giá trị đơn tối thiểu
 * @param {string} code - mã voucher
 * @param {number} orderAmount - giá trị đơn hàng hiện tại
 * @returns {{ valid: boolean, voucher: object|null, discountAmount: number, message: string }}
 */
exports.validateVoucher = async (code, orderAmount = 0) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('code', sql.VarChar, code)
        .query(`SELECT * FROM Vouchers WHERE code = @code`);

    const voucher = result.recordset[0];

    if (!voucher) {
        return { valid: false, voucher: null, discountAmount: 0, message: 'Mã voucher không tồn tại' };
    }
    if (voucher.status !== 'Active') {
        return { valid: false, voucher, discountAmount: 0, message: 'Voucher đã bị vô hiệu hóa hoặc hết hạn' };
    }

    const now = new Date();
    if (voucher.startDate && new Date(voucher.startDate) > now) {
        return { valid: false, voucher, discountAmount: 0, message: 'Voucher chưa đến thời gian sử dụng' };
    }
    if (voucher.expiryDate && new Date(voucher.expiryDate) < now) {
        return { valid: false, voucher, discountAmount: 0, message: 'Voucher đã hết hạn sử dụng' };
    }
    if (voucher.currentUsage >= voucher.maxUsage) {
        return { valid: false, voucher, discountAmount: 0, message: 'Voucher đã hết lượt sử dụng' };
    }
    if (parseFloat(orderAmount) < parseFloat(voucher.minOrderValue)) {
        return {
            valid: false,
            voucher,
            discountAmount: 0,
            message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()} đ để dùng voucher này`
        };
    }

    // Tính tiền được giảm
    let discountAmount = 0;
    if (voucher.type === 'Percent') {
        discountAmount = parseFloat(orderAmount) * parseFloat(voucher.value) / 100;
    } else {
        // Fixed
        discountAmount = Math.min(parseFloat(voucher.value), parseFloat(orderAmount));
    }

    return { valid: true, voucher, discountAmount: parseFloat(discountAmount.toFixed(2)), message: 'Voucher hợp lệ' };
};

/**
 * Báo cáo hiệu quả voucher — UC10: View Voucher Usage Reports
 * JOIN từ bảng Invoices (voucherId) lấy tổng số lần dùng và tổng chiết khấu đã cấp
 */
exports.getVoucherReport = async ({ limit = 20, offset = 0 } = {}) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('limit', sql.Int, parseInt(limit))
        .input('offset', sql.Int, parseInt(offset))
        .query(`
            SELECT
                v.id,
                v.code,
                v.type,
                v.value,
                v.minOrderValue,
                v.maxUsage,
                v.currentUsage,
                v.status,
                v.startDate,
                v.expiryDate,
                COUNT(i.id)                        AS timesUsed,
                COALESCE(SUM(i.voucherDiscount), 0) AS totalDiscountGiven,
                COALESCE(SUM(i.finalAmount), 0)     AS totalRevenueFromVoucher
            FROM Vouchers v
            LEFT JOIN Invoices i ON v.id = i.voucherId AND i.status = 'PAID'
            GROUP BY
                v.id, v.code, v.type, v.value, v.minOrderValue,
                v.maxUsage, v.currentUsage, v.status, v.startDate, v.expiryDate
            ORDER BY timesUsed DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
    return result.recordset;
};

exports.countVoucherReport = async () => {
    const pool = await connectDB();
    const result = await pool.request()
        .query(`SELECT COUNT(*) AS total FROM Vouchers`);
    return result.recordset[0].total;
};


exports.increaseUsage = async (transaction, voucherId) => {
    await new sql.Request(transaction)
        .input("voucherId", sql.Int, voucherId)
        .query(`
            UPDATE Vouchers
            SET currentUsage = currentUsage + 1
            WHERE id = @voucherId
        `);
}