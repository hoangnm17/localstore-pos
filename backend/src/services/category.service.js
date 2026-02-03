const categoryModel = require('../models/category.model');

exports.getCategoryTree = async (search, page, limit) => {
    const offset = (page - 1) * limit;

    // 1. Lấy ROOT categories
    const roots = await categoryModel.getRootCategories(
        search,
        limit,
        offset
    );

    const total = await categoryModel.countRootCategories(search);

    // 2. Lấy children
    const rootIds = roots.map(r => r.id);
    const children = await categoryModel.getChildrenByRootIds(rootIds);

    // 3. Build tree
    const tree = buildTree([...roots, ...children]);

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

function buildTree(rows) {
    const map = {};
    const roots = [];

    rows.forEach(c => {
        map[c.id] = {
            ...c,
            children: [],
            productCount: c.productCount || 0,
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

    const sum = (node) => {
        node.children.forEach(child => {
            sum(child);
            node.totalProductCount += child.totalProductCount;
        });
    };

    roots.forEach(sum);
    return roots;
}
