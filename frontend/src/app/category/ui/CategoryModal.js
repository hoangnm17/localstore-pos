import React from 'react';
import CategoryForm from './CategoryForm';

export default function CategoryModal(props) {
    if (!props.open) return null;

    return (
        <div className="pm-modal-overlay">
            <div className="pm-modal-box">
                <div className="pm-modal-header">
                    <strong>{props.isEdit ? 'Sửa danh mục' : 'Thêm danh mục mới'}</strong>
                    <button
                        type="button"
                        className="pm-modal-close-btn"
                        onClick={props.onClose}
                        title="Đóng"
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>
                <div className="pm-modal-body pm-modal">
                    <CategoryForm {...props} />
                </div>
            </div>
        </div>
    );
}