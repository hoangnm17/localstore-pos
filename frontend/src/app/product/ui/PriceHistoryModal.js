import { useState, useEffect, useCallback } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import { getAllPriceHistory } from '../../../services/Product/productService';
import './ProductModal.css';

const PriceHistoryModal = ({ productId, productName, onClose }) => {
    const [allPriceHistory, setAllPriceHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadAllPriceHistory = useCallback(async () => {
        if (!productId) return;
        setLoading(true);
        const res = await getAllPriceHistory(productId);
        if (res.success !== false) setAllPriceHistory(res.data?.data || []);
        setLoading(false);
    }, [productId]);

    useEffect(() => { loadAllPriceHistory(); }, [loadAllPriceHistory]);

    const fmt = (v) => v != null ? Number(v).toLocaleString('vi-VN') + 'đ' : '—';
    const fmtDate = (d) => d ? new Date(d).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    }) : '—';

    return (
        <BaseModal onClose={onClose} maxWidth="560px">
            <div className="pm-card pm-card--md">
                <div className="pm-header">
                    <div>
                        <h2 className="pm-title">Lịch sử thay đổi giá</h2>
                        {productName && <p className="pm-subtitle">{productName}</p>}
                    </div>
                    <button className="pm-close" onClick={onClose}>✕</button>
                </div>

                <div className="pm-body">
                    {loading && <div className="pm-loading">Đang tải...</div>}
                    {!loading && allPriceHistory.length === 0 && (
                        <div className="pm-empty">Chưa có lịch sử thay đổi giá</div>
                    )}
                    {!loading && allPriceHistory.length > 0 && (
                        <div className="pm-history-list">
                            {allPriceHistory.map((item, idx) => (
                                <div key={item.id} className={`pm-history-entry${idx === 0 ? ' pm-history-entry--latest' : ''}`}>
                                    <div className="pm-history-badge">
                                        {idx === 0 ? 'Mới nhất' : `Lần ${allPriceHistory.length - idx}`}
                                    </div>
                                    <div className="pm-history-prices">
                                        <div className="pm-history-col">
                                            <span className="pm-history-label">Giá cũ</span>
                                            <span className="pm-history-val pm-history-val--old">{fmt(item.oldPrice)}</span>
                                        </div>
                                        <span className="pm-history-arrow">→</span>
                                        <div className="pm-history-col">
                                            <span className="pm-history-label">Giá mới</span>
                                            <span className="pm-history-val pm-history-val--new">{fmt(item.newPrice)}</span>
                                        </div>
                                    </div>
                                    <div className="pm-history-meta">
                                        <span>🕐 {fmtDate(item.changedAt)}</span>
                                        {item.changedByName && <span>👤 {item.changedByName}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pm-footer">
                    <button className="pm-btn pm-btn--ghost" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </BaseModal>
    );
};

export default PriceHistoryModal;