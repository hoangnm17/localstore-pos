import React, { useMemo, useState } from 'react';
import ModalShell from './ModalShell';

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toLocaleString('vi-VN');
}

function ProductPriceHistoryModal({ open, loading, product, histories, onClose }) {
    const [tab, setTab] = useState('sale');

    const saleRows = useMemo(() => histories?.salePriceHistories || [], [histories]);

    return (
        <ModalShell
            open={open}
            title="Lịch sử giá sản phẩm"
            subtitle={product ? `${product.name} - ${product.code}` : ''}
            width="1100px"
            onClose={onClose}
        >
            <div className="d-flex flex-wrap gap-2 mb-3">
                <button
                    type="button"
                    className={`btn ${tab === 'sale' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setTab('sale')}
                >
                    <i className="bi bi-cash-coin me-2" />
                    Lịch sử giá bán
                </button>
            </div>

            {loading ? (
                <div className="text-center py-4">Đang tải lịch sử giá...</div>
            ) : tab === 'sale' ? (
                <>
                    <div className="alert alert-primary">
                        Lịch sử giá bán hiển thị cho cả đơn vị cơ bản và các đơn vị phụ của sản phẩm.
                    </div>

                    <div className="table-responsive">
                        <table className="table table-bordered align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Thời gian</th>
                                    <th>Đơn vị tính</th>
                                    <th>Giá cũ</th>
                                    <th>Giá mới</th>
                                    <th>Người thay đổi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {saleRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            Chưa có lịch sử giá bán.
                                        </td>
                                    </tr>
                                ) : (
                                    saleRows.map((item) => (
                                        <tr key={item.id}>
                                            <td>{formatDate(item.changedAt)}</td>
                                            <td>{item.unitName || '—'}</td>
                                            <td>{item.oldSalePrice == null ? 'Khởi tạo' : formatMoney(item.oldSalePrice)}</td>
                                            <td className="fw-semibold">{formatMoney(item.newSalePrice)}</td>
                                            <td>{item.changedByName || 'Hệ thống'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>

                </>
            )}
        </ModalShell>
    );
}

export default ProductPriceHistoryModal;