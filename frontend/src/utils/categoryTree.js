export function flattenTree(treeNodes = [], startLevel = 0) {
    const result = [];

    function walk(nodes, level) {
        nodes.forEach(node => {
            const hasChildren = Array.isArray(node.children) && node.children.length > 0;
            result.push({
                ...node,
                level,
                hasChildren,
                productCount: node.productCount ?? 0,
            });
            if (hasChildren) {
                walk(node.children, level + 1);
            }
        });
    }

    walk(treeNodes, startLevel);
    return result;
}
