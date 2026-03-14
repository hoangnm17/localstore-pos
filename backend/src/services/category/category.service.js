const categoryModel = require('../../models/category.model');

exports.getAllCategories = async () => {
    return await categoryModel.getAll();
};

exports.getCategoryById = async (id) => {
    const category = await categoryModel.getCategoryById(id);
    if (!category) {
        throw new Error('Category not found');
    }
    return category;
};

exports.getCategoryList = async (search, page, limit) => {
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const offset = (page - 1) * limit;
    const data = await categoryModel.getCategoriesList(search, limit, offset);
    const total = await categoryModel.countCategories(search);

    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

exports.createCategory = async (name, parentId, imageUrl) => {
    if (!name) {
        throw new Error('Category name is required');
    }
    if (parentId) {
        const hasProduct = await categoryModel.hasProduct(parentId);

        if (hasProduct) {
            throw new Error('CATEGORY_HAS_PRODUCT_CANNOT_HAVE_CHILD');
        }
    }
    return await categoryModel.createCategory(name, parentId, imageUrl);
};

exports.updateCategory = async (id, name, parentId, imageUrl) => {
    if (!name) {
        throw new Error('Category name is required');
    }
    if (parentId) {
        const hasProduct = await categoryModel.hasProduct(parentId);

        if (hasProduct) {
            throw new Error('CATEGORY_HAS_PRODUCT_CANNOT_HAVE_CHILD');
        }
    }
    const updated = await categoryModel.updateCategory(id, name, parentId, imageUrl);
    if (!updated) {
        throw new Error('Category not found or update failed');
    }
    return updated;
};

exports.deleteCategory = async (id) => {
    const deleted = await categoryModel.deleteCategory(id);
    if (!deleted) {
        throw new Error('Category not found or delete failed');
    }
    return deleted;
};

exports.getCategoryTree = async (search, page, limit) => {
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const offset = (page - 1) * limit;

    // 1. Lấy ROOT categories
    const roots = await categoryModel.getCategoriesList(search, limit, offset);
    const total = await categoryModel.countCategories(search);

    // 2. Lấy children
    const rootIds = roots.map(r => r.id);
    const children = rootIds.length > 0 ? await categoryModel.getChildrenCategoryList(rootIds) : [];
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
