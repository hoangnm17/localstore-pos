import React from 'react';
import CategoryActions from './CategoryActions';

const h = React.createElement;

export default function CategoryRow(props) {
    const { item, level } = props;

    return h(
        'div',
        { style: { paddingLeft: level * 20 } },
        h('span', null, item.name),
        h('span', { style: { marginLeft: 8, color: '#888' } },
            `(${item.totalProductCount})`
        ),
        h(CategoryActions, {
            category: item,
            onEdit: props.onEdit,
            onDelete: props.onDelete
        }),
        item.children &&
        item.children.map(c =>
            h(CategoryRow, {
                key: c.id,
                item: c,
                level: level + 1,
                ...props
            })
        )
    );
}