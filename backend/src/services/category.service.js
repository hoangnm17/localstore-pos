const { connectDB, sql } = require('../config/database');
const categoryModel = require('../models/category.model');

exports.getCategoryList = async (search, page, limit) => {
    const offset = (page - 1) * limit;
    const rows = await categoryModel.getRootCategories(search, limit, offset);
    const total = await categoryModel.countRootCategories(search);

    return {
        data: rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
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
        pagination: {
            page,
            limit,
            totalRoots: total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

exports.getCategoryById = async (id) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT id, name, parentId, ISNULL(imageUrl,'') imageUrl
            FROM Categories
            WHERE id = @id AND status = 1
        `);
    if (!rs.recordset[0]) throw new Error('CATEGORY_NOT_FOUND');
    return rs.recordset[0];
};

exports.createCategory = async (name, parentId, imageUrl) => {
    return categoryModel.createCategory(name, parentId, imageUrl);
};

exports.updateCategory = async (id, name, parentId, imageUrl) => {
    if (!await categoryModel.exists(id)) {
        throw new Error('CATEGORY_NOT_FOUND');
    }

    if (await categoryModel.isCircularParent(id, parentId)) {
        throw new Error('CIRCULAR_PARENT');
    }

    await categoryModel.updateCategory(id, name, parentId, imageUrl);
};

exports.deleteCategory = async (id) => {
    return categoryModel.deleteCategory(id);
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