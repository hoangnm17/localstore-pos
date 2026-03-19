const { connectDB, sql } = require("../config/database.js");

// Các giá trị hợp lệ theo CHECK CONSTRAINT trong database
const VALID_TYPES = ['Percent', 'Amount', 'BuyXGetY'];
const VALID_STATUSES = ['Active', 'Expired', 'Disabled'];

// ─── HELPERS ────────────────────────────────────────────────────────────────

/**
 * Validate type và status theo đúng CHECK CONSTRAINT của DB.
 * Ném lỗi rõ ràng thay vì để SQL Server trả về lỗi khó đọc.
 */
const validateFields = (data) => {
    const { type, status, value, startDate, endDate } = data;

    if (type !== undefined && !VALID_TYPES.includes(type)) {
        throw new Error(`type không hợp lệ. Chỉ chấp nhận: ${VALID_TYPES.join(', ')}`);
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
        throw new Error(`status không hợp lệ. Chỉ chấp nhận: ${VALID_STATUSES.join(', ')}`);
    }

    if (value !== undefined && parseFloat(value) < 0) {
        throw new Error('Giá trị khuyến mãi không được là số âm');
    }

    if (startDate && isNaN(Date.parse(startDate))) {
        throw new Error('Ngày bắt đầu không hợp lệ');
    }

    if (endDate && isNaN(Date.parse(endDate))) {
        throw new Error('Ngày kết thúc không hợp lệ');
    }

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
            throw new Error('Ngày bắt đầu không được lớn hơn ngày kết thúc');
        }
    }
};

// ─── PROMOTIONS ─────────────────────────────────────────────────────────────

exports.getPromotions = async (filters) => {
    const pool = await connectDB();
    const {
        search = '',
        status = null,
        type = null,
        limit = 10,
        offset = 0
    } = filters;

    let query = `
        SELECT *
        FROM Promotions
        WHERE 1=1
    `;

    if (status) query += ` AND status = @status`;
    if (type) query += ` AND type = @type`;
    if (search) query += ` AND name LIKE @search`;

    query += ` ORDER BY createdAt DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request()
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset);

    if (status) request.input('status', sql.VarChar, status);
    if (type) request.input('type', sql.VarChar, type);
    if (search) request.input('search', sql.NVarChar, `%${search}%`);

    const result = await request.query(query);
    return result.recordset;
};

/**
 * Đếm tổng số promotion phù hợp filter — dùng cho phân trang.
 */
exports.countPromotions = async (filters) => {
    const pool = await connectDB();
    const { search = '', status = null, type = null } = filters;

    let query = `SELECT COUNT(*) AS total FROM Promotions WHERE 1=1`;

    if (status) query += ` AND status = @status`;
    if (type) query += ` AND type = @type`;
    if (search) query += ` AND name LIKE @search`;

    const request = pool.request();
    if (status) request.input('status', sql.VarChar, status);
    if (type) request.input('type', sql.VarChar, type);
    if (search) request.input('search', sql.NVarChar, `%${search}%`);

    const result = await request.query(query);
    return result.recordset[0].total;
};

exports.getPromotionById = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`SELECT * FROM Promotions WHERE id = @id`);

    if (result.recordset.length === 0) return null;

    const promotion = result.recordset[0];

    // Lấy kèm danh sách sản phẩm/danh mục áp dụng
    const productsResult = await pool.request()
        .input('promotionId', sql.BigInt, id)
        .query(`
            SELECT pp.*, p.name AS productName, c.name AS categoryName
            FROM PromotionProducts pp
            LEFT JOIN Products p ON pp.productId = p.id
            LEFT JOIN Categories c ON pp.categoryId = c.id
            WHERE pp.promotionId = @promotionId
        `);

    promotion.items = productsResult.recordset;
    return promotion;
};

exports.createPromotion = async (data) => {
    const pool = await connectDB();
    const { name, type, value, startDate, endDate, status = 'Active' } = data;

    // Validate trước khi INSERT — tránh lỗi constraint từ SQL Server
    validateFields(data);

    const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('type', sql.VarChar, type)
        .input('value', sql.Decimal(15, 2), value)
        .input('startDate', sql.DateTime2, startDate)
        .input('endDate', sql.DateTime2, endDate)
        .input('status', sql.VarChar, status)
        .query(`
            INSERT INTO Promotions (name, type, value, startDate, endDate, status)
            VALUES (@name, @type, @value, @startDate, @endDate, @status);

            SELECT * FROM Promotions WHERE id = SCOPE_IDENTITY();
        `);

    return result.recordset[0];
};

/**
 * Cập nhật thông tin promotion — chỉ SET những field được truyền vào (partial update).
 * Không cho phép đổi type sau khi đã tạo để tránh sai lệch business logic.
 */
exports.updatePromotion = async (id, data) => {
    const pool = await connectDB();
    const existing = await exports.getPromotionById(id);
    if (!existing) return null;

    const { name, value, startDate, endDate, status } = data;

    // Merge existing dates with new ones for validation
    const validationData = {
        ...data,
        startDate: startDate !== undefined ? startDate : existing.startDate,
        endDate: endDate !== undefined ? endDate : existing.endDate
    };
    validateFields(validationData);

    const setClauses = [];
    const request = pool.request().input('id', sql.BigInt, id);

    if (name !== undefined) {
        setClauses.push('name = @name');
        request.input('name', sql.NVarChar, name);
    }
    if (value !== undefined) {
        setClauses.push('value = @value');
        request.input('value', sql.Decimal(15, 2), value);
    }
    if (startDate !== undefined) {
        setClauses.push('startDate = @startDate');
        request.input('startDate', sql.DateTime2, startDate);
    }
    if (endDate !== undefined) {
        setClauses.push('endDate = @endDate');
        request.input('endDate', sql.DateTime2, endDate);
    }
    if (status !== undefined) {
        setClauses.push('status = @status');
        request.input('status', sql.VarChar, status);
    }

    if (setClauses.length === 0) return null;

    const result = await request.query(`
        UPDATE Promotions
        SET ${setClauses.join(', ')}
        WHERE id = @id;

        SELECT * FROM Promotions WHERE id = @id;
    `);

    return result.recordset[0] || null;
};

/**
 * Soft-delete: chuyển status = 'Disabled' thay vì xóa cứng.
 * Tránh lỗi FK với bảng Invoices đang tham chiếu promotionId.
 */
exports.deletePromotion = async (id) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('id', sql.BigInt, id)
        .query(`
            UPDATE Promotions
            SET status = 'Disabled'
            WHERE id = @id;

            SELECT * FROM Promotions WHERE id = @id;
        `);
    return result.recordset[0] || null;
};

// ─── PROMOTION ITEMS (PromotionProducts) ────────────────────────────────────

/**
 * Thêm sản phẩm hoặc danh mục vào promotion.
 * Ít nhất một trong hai (productId hoặc categoryId) phải có giá trị.
 */
exports.addPromotionItem = async (promotionId, item) => {
    const pool = await connectDB();
    const { productId, categoryId, productUnitId } = item;

    if (!productId && !categoryId && !productUnitId) {
        throw new Error('Phải cung cấp ít nhất productId, categoryId hoặc productUnitId');
    }

    await pool.request()
        .input('promotionId', sql.BigInt, promotionId)
        .input('productId', sql.BigInt, productId || null)
        .input('categoryId', sql.Int, categoryId || null)
        .input('productUnitId', sql.Int, productUnitId || null)
        .query(`
            INSERT INTO PromotionProducts (promotionId, productId, categoryId, productUnitId)
            VALUES (@promotionId, @productId, @categoryId, @productUnitId)
        `);
};

/**
 * Xóa một item khỏi PromotionProducts theo itemId (id của dòng trong bảng).
 */
exports.removePromotionItem = async (itemId) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('itemId', sql.Int, itemId)
        .query(`
            SELECT * FROM PromotionProducts WHERE id = @itemId;
            DELETE FROM PromotionProducts WHERE id = @itemId;
        `);
    return result.recordset[0] || null;
};

/**
 * Xóa toàn bộ items của một promotion — dùng khi cần replace toàn bộ danh sách sản phẩm.
 */
exports.clearPromotionItems = async (promotionId) => {
    const pool = await connectDB();
    await pool.request()
        .input('promotionId', sql.BigInt, promotionId)
        .query(`DELETE FROM PromotionProducts WHERE promotionId = @promotionId`);
};

/**
 * Lấy danh sách promotion đang hoạt động — UC8: áp dụng khuyến mãi khi bán hàng.
 * Chỉ trả về promotion có status = Active và trong khoảng thời gian hiệu lực.
 */
exports.getActivePromotions = async () => {
    const pool = await connectDB();
    const now = new Date();
    const result = await pool.request()
        .input('now', sql.DateTime2, now)
        .query(`
            SELECT
                p.*,
                (
                    SELECT pp.id, pp.productId, pp.categoryId,
                           prod.name AS productName, cat.name AS categoryName
                    FROM PromotionProducts pp
                    LEFT JOIN Products   prod ON pp.productId   = prod.id
                    LEFT JOIN Categories cat  ON pp.categoryId  = cat.id
                    WHERE pp.promotionId = p.id
                    FOR JSON PATH
                ) AS itemsJson
            FROM Promotions p
            WHERE p.status = 'Active'
              AND (p.startDate IS NULL OR p.startDate <= @now)
              AND (p.endDate   IS NULL OR p.endDate   >= @now)
            ORDER BY p.startDate DESC
        `);

    // Parse itemsJson string thành array
    return result.recordset.map(row => ({
        ...row,
        items: row.itemsJson ? JSON.parse(row.itemsJson) : []
    }));
};

/**
 * Báo cáo hiệu quả khuyến mãi — UC9: View Promotion Reports
 * JOIN với Invoices để tính số lần dùng, tổng giảm giá, doanh thu sau khuyến mãi
 */
exports.getPromotionReport = async ({ limit = 20, offset = 0 } = {}) => {
    const pool = await connectDB();
    const result = await pool.request()
        .input('limit', sql.Int, parseInt(limit))
        .input('offset', sql.Int, parseInt(offset))
        .query(`
            SELECT
                p.id,
                p.name,
                p.type,
                p.value,
                p.startDate,
                p.endDate,
                p.status,
                COUNT(i.id)                           AS timesUsed,
                COALESCE(SUM(i.promotionDiscount), 0)  AS totalDiscountGiven,
                COALESCE(SUM(i.finalAmount), 0)        AS totalRevenueAfterDiscount
            FROM Promotions p
            LEFT JOIN Invoices i ON p.id = i.promotionId AND i.status = 'PAID'
            GROUP BY p.id, p.name, p.type, p.value, p.startDate, p.endDate, p.status
            ORDER BY timesUsed DESC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);
    return result.recordset;
};

exports.countPromotionReport = async () => {
    const pool = await connectDB();
    const result = await pool.request()
        .query(`SELECT COUNT(*) AS total FROM Promotions`);
    return result.recordset[0].total;
};

/**
 * Tìm giảm giá áp dụng cho sản phẩm theo productId và productUnitId.
 * Ưu tiên: theo đơn vị (productUnitId) > theo sản phẩm (productId) > theo danh mục (categoryId)
 * Nếu có nhiều KM cùng cấp, chọn giá trị cao nhất.
 */
exports.getDiscountByProduct = async ({ productId, productUnitId }) => {
    const pool = await connectDB();

    // Lấy categoryId của sản phẩm
    const productRes = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query('SELECT categoryId FROM Products WHERE id = @productId');

    if (productRes.recordset.length === 0) return null;
    const categoryId = productRes.recordset[0].categoryId;

    const now = new Date();
    const result = await pool.request()
        .input('productId', sql.BigInt, productId)
        .input('productUnitId', sql.Int, productUnitId || null)
        .input('categoryId', sql.Int, categoryId || null)
        .input('now', sql.DateTime2, now)
        .query(`
            SELECT TOP 1
                p.id          AS promotionId,
                p.name        AS promotionName,
                p.type,
                p.value       AS discountValue,
                CASE 
                    WHEN pp.productUnitId = @productUnitId THEN 1
                    WHEN pp.productId    = @productId      THEN 2
                    ELSE 3
                END AS priority
            FROM Promotions p
            JOIN PromotionProducts pp ON pp.promotionId = p.id
            WHERE p.status = 'Active'
              AND (p.startDate IS NULL OR p.startDate <= @now)
              AND (p.endDate   IS NULL OR p.endDate   >= @now)
              AND (
                    (@productUnitId IS NOT NULL AND pp.productUnitId = @productUnitId)
                 OR pp.productId    = @productId
                 OR (@categoryId IS NOT NULL AND pp.categoryId = @categoryId)
              )
            ORDER BY priority ASC, p.value DESC
        `);

    if (result.recordset.length === 0) {
        return { discountPercent: 0, discountAmount: 0, promotionId: null, promotionName: null };
    }

    const row = result.recordset[0];
    return {
        promotionId: row.promotionId,
        promotionName: row.promotionName,
        type: row.type,
        discountPercent: row.type === 'Percent' ? parseFloat(row.discountValue) : 0,
        discountAmount: row.type === 'Amount' ? parseFloat(row.discountValue) : 0
    };
};
