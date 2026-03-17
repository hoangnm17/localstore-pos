import React from 'react';
import CategoryRow from './CategoryRow';

const h = React.createElement;

export default function CategoryTree(props) {
    return h(
        'div',
        null,
        props.data.map(item =>
            h(CategoryRow, {
                key: item.id,
                item,
                level: 0,
                ...props
            })
        )
    );
}