import React from 'react';
import ModalShell from './ModalShell';

function ProductStatusModal({ open, product, submitting, onClose, onConfirm }) {
    if (!product) return null;

    const isSelling = product.status === 'Selling';

    return (
        <ModalShell
            open={open}
            title={isSelling ? 'Ngừng bán sản phẩm' : 'Bật bán lại sản phẩm'}
            subtitle="Thay đổi trạng thái bán, không xóa dữ liệu."
            width="520px"
            onClose={onClose}
            footer={
                <>
                    <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                        Hủy
                    </button>
                    <button
                        type="button"
                        className={`btn ${isSelling ? 'btn-danger' : 'btn-success'}`}
                        disabled={submitting}
                        onClick={() => onConfirm(product)}
                    >
                        <i className="bi bi-power me-2" />
                        {submitting ? 'Đang xử lý...' : isSelling ? 'Ngừng bán' : 'Bật bán lại'}
                    </button>
                </>
            }
        >
            <div className="alert alert-light border mb-0">
                <div><strong>Sản phẩm:</strong> {product.name}</div>
                <div><strong>Mã:</strong> {product.code}</div>
                <div><strong>Trạng thái hiện tại:</strong> {isSelling ? 'Đang bán' : 'Ngừng bán'}</div>
            </div>
        </ModalShell>
    );
}

export default ProductStatusModal;