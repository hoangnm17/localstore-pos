import React from 'react';

const h = React.createElement;

export default function CategoryActions(props) {
    const disabled = props.category.totalProductCount > 0;

    return h(
        'span',
        { style: { marginLeft: 8 } },
        h('button', { onClick: () => props.onEdit(props.category.id) }, '✏️'),
        h(
            'button',
            {
                disabled,
                onClick: () => !disabled && props.onDelete(props.category.id)
            },
            '🗑️'
        )
    );
}