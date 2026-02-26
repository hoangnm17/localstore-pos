import React from 'react';
import CategoryForm from './CategoryForm';

const h = React.createElement;

export default function CategoryModal(props) {
    if (!props.open) return null;

    return h(
        'div',
        { style: overlay },
        h(
            'div',
            { style: modal },
            h(
                'div',
                { style: header },
                h('strong', null, props.isEdit ? 'Sửa danh mục' : 'Thêm danh mục'),
                h('button', { onClick: props.onClose }, '✖')
            ),
            h(CategoryForm, props)
        )
    );
}

const overlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
};

const modal = {
    background: '#fff',
    padding: 20,
    width: 420,
    borderRadius: 6
};

const header = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12
};