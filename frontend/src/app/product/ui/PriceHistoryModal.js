import { useEffect } from 'react';
import useProductDetail from '../../../hooks/product/useProductDetail';
import './ProductModal.css';

const PriceHistoryModal = ({ productId, onClose }) => {
    const { priceHistory, loading, loadPriceHistory } = useProductDetail(productId);

    useEffect(() => {
        loadPriceHistory();
    }, [loadPriceHistory]);

    const formatPrice = (val) =>
        val != null ? Number(val).toLocaleString('vi-VN') + 'đ' : '—';

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal--md" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">Lịch sử thay đổi giá</h2>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="modal__body">
                    {loading && <div className="modal-loading">Đang tải...</div>}

                    {!loading && !priceHistory && (
                        <div className="modal-empty">Chưa có lịch sử thay đổi giá</div>
                    )}

                    {!loading && priceHistory && (
                        <div className="price-history__item">
                            <div className="price-history__row">
                                <div className="price-history__field">
                                    <span className="price-history__label">Giá vốn</span>
                                    <span className="price-history__value">{formatPrice(priceHistory.costPrice)}</span>
                                </div>
                                <div className="price-history__field">
                                    <span className="price-history__label">Giá bán</span>
                                    <span className="price-history__value">{formatPrice(priceHistory.salePrice)}</span>
                                </div>
                            </div>
                            <div className="price-history__meta">
                                <span>🕐 {formatDate(priceHistory.createdAt)}</span>
                                {priceHistory.changedBy && (
                                    <span>👤 {priceHistory.changedBy}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    <button className="btn btn--ghost" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default PriceHistoryModal;