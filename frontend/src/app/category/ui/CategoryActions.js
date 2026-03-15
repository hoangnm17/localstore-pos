import React from 'react';

const h = React.createElement;

export default function CategoryActions(props) {
    const disabled = props.category.totalProductCount > 0;

    return h(
        'span',
        { style: { marginLeft: 8 } },
        h(
            'button',
            {
                onClick: () => props.onEdit(props.category.id),
                className: 'btn btn-link btn-sm p-0 me-2 text-warning',
                title: 'Sửa'
            },
            h('i', { className: 'bi bi-pencil-square fs-5' })
        ),
        h(
            'button',
            {
                disabled,
                onClick: () => !disabled && props.onDelete(props.category.id),
                className: 'btn btn-link btn-sm p-0 text-danger',
                title: disabled ? 'Không thể xóa vì có sản phẩm' : 'Xóa'
            },
            h('i', { className: 'bi bi-trash fs-5' })
        )
    );
}