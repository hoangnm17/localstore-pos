const { connectDB, sql } = require('../config/database');
const categoryModel = require('../models/category.model');

function translateSqlError(err) {
    const num = err.number;
    const msg = err.message || '';
    if (num === 2627 || num === 2601) {
        if (/name/i.test(msg)) return new Error('Tên danh mục đã tồn tại. Vui lòng dùng tên khác.');
        return new Error('Danh mục bị trùng lặp. Vui lòng kiểm tra lại.');
    }
    if (num === 547) return new Error('Danh mục cha không hợp lệ hoặc không tồn tại.');
    return err;
}

exports.getCategoryList = async (search, page, limit) => {
    const offset = (page - 1) * limit;
    const rows = await categoryModel.getRootCategories(search, limit, offset);
    const total = await categoryModel.countRootCategories(search);

    return {
        data: rows,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

exports.getCategoryTree = async (search, page, limit) => {
    const offset = (page - 1) * limit;
    const roots = await categoryModel.getRootCategories(search, limit, offset);
    const total = await categoryModel.countRootCategories(search);
    const rootIds = roots.map(r => r.id);
    const descendants = await categoryModel.getAllDescendants(rootIds);
    const tree = buildTree([...roots, ...descendants]);

    return {
        data: tree,
        pagination: { page, limit, totalRoots: total, totalPages: Math.ceil(total / limit) }
    };
};

exports.getCategoryById = async (id) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('id', sql.Int, id)
        .query(`SELECT id, name, parentId, ISNULL(imageUrl,'') imageUrl FROM Categories WHERE id = @id AND status = 1`);
    if (!rs.recordset[0]) throw new Error('Không tìm thấy danh mục.');
    return rs.recordset[0];
};

exports.createCategory = async (name, parentId, imageUrl) => {
    if (!name) throw new Error('Tên danh mục không được để trống.');
    try {
        return await categoryModel.createCategory(name, parentId, imageUrl);
    } catch (err) {
        throw translateSqlError(err);
    }
};

exports.updateCategory = async (id, name, parentId, imageUrl) => {
    if (!name) throw new Error('Tên danh mục không được để trống.');
    if (!await categoryModel.exists(id)) throw new Error('Không tìm thấy danh mục.');
    if (await categoryModel.isCircularParent(id, parentId)) {
        throw new Error('Không thể đặt danh mục con làm cha của chính nó (vòng tròn).');
    }
    try {
        await categoryModel.updateCategory(id, name, parentId, imageUrl);
    } catch (err) {
        throw translateSqlError(err);
    }
};

exports.deleteCategory = async (id) => {
    return categoryModel.deleteCategory(id);
};

exports.getAllCategories = async () => {
    const categories = await categoryModel.getAllCategories();
    return categories;
};

//build tree + tổng SL sản phẩm
function buildTree(rows) {
    const map = {};
    const roots = [];

    rows.forEach(c => {
        map[c.id] = {
            ...c,
            children: [],
            totalProductCount: c.productCount || 0
        };
    });

    rows.forEach(c => {
        if (c.parentId && map[c.parentId]) {
            map[c.parentId].children.push(map[c.id]);
        } else if (!c.parentId) {
            roots.push(map[c.id]);
        }
    });

    const num = (node) => {
        node.children.forEach(child => {
            num(child);
            node.totalProductCount += child.totalProductCount;
        });
    };

    roots.forEach(num);
    return roots;
}

