import BaseModal from '../../../components/common/BaseModal';
import useProductDetail from '../../../hooks/product/useProductDetail';
import './ProductModal.css';

const STATUS_MAP = {
    Selling: { label: 'Đang bán', cls: 'pm-badge pm-badge--selling' },
    StopSelling: { label: 'Ngừng bán', cls: 'pm-badge pm-badge--stop' },
};

const ProductDetailModal = ({ productId, onClose, onEdit }) => {
    const { product, units, loading, error } = useProductDetail(productId);
    const fmt = (v) => v != null ? Number(v).toLocaleString('vi-VN') + 'đ' : '—';

    return (
        <BaseModal onClose={onClose} maxWidth="780px">
            <div className="pm-card pm-card--lg">
                <div className="pm-header">
                    <div>
                        <h2 className="pm-title">Chi tiết sản phẩm</h2>
                        {product && <p className="pm-subtitle">{product.code}</p>}
                    </div>
                    <button className="pm-close" onClick={onClose}>✕</button>
                </div>

                <div className="pm-body">
                    {loading && <div className="pm-loading">Đang tải...</div>}
                    {error && <div className="pm-error">{error}</div>}

                    {!loading && product && (
                        <>
                            <div className="pm-detail-top">
                                <div className="pm-detail-image">
                                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : '📦'}
                                </div>
                                <div className="pm-detail-info">
                                    <h3 className="pm-detail-name">{product.name}</h3>
                                    <div className="pm-detail-grid">
                                        <div className="pm-detail-field">
                                            <span className="pm-detail-label">Mã SP</span>
                                            <span className="pm-detail-value pm-detail-value--code">{product.code}</span>
                                        </div>
                                        <div className="pm-detail-field">
                                            <span className="pm-detail-label">Barcode</span>
                                            <span className="pm-detail-value">{product.barcode || '—'}</span>
                                        </div>
                                        <div className="pm-detail-field">
                                            <span className="pm-detail-label">Danh mục</span>
                                            <span className="pm-detail-value">{product.categoryName || '—'}</span>
                                        </div>
                                        <div className="pm-detail-field">
                                            <span className="pm-detail-label">Đơn vị</span>
                                            <span className="pm-detail-value">{product.baseUnit}</span>
                                        </div>
                                        <div className="pm-detail-field">
                                            <span className="pm-detail-label">Giá vốn</span>
                                            <span className="pm-detail-value pm-detail-value--price">{fmt(product.costPrice)}</span>
                                        </div>
                                        <div className="pm-detail-field">
                                            <span className="pm-detail-label">Giá bán</span>
                                            <span className="pm-detail-value pm-detail-value--price">{fmt(product.salePrice)}</span>
                                        </div>
                                        <div className="pm-detail-field">
                                            <span className="pm-detail-label">Tồn kho</span>
                                            <span className="pm-detail-value">{product.stockQuantity ?? 0}</span>
                                        </div>
                                        <div className="pm-detail-field">
                                            <span className="pm-detail-label">Trạng thái</span>
                                            <span className={STATUS_MAP[product.status]?.cls || 'pm-badge'}>
                                                {STATUS_MAP[product.status]?.label || product.status}
                                            </span>
                                        </div>
                                        <div className="pm-detail-field">
                                            <span className="pm-detail-label">Loại</span>
                                            <span className="pm-detail-value">
                                                {product.isCombo ? '🎁 Combo' : product.allowDecimalQuantity ? '⚖️ Bán theo cân' : '📦 Thông thường'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {units.length > 0 && (
                                <div className="pm-section">
                                    <h4 className="pm-section__title">Đơn vị tính</h4>
                                    <table className="pm-table">
                                        <thead>
                                            <tr><th>Tên ĐVT</th><th>Quy đổi</th><th>Giá bán</th><th>Barcode</th></tr>
                                        </thead>
                                        <tbody>
                                            {units.map(u => (
                                                <tr key={u.id}>
                                                    <td>{u.unitName}</td>
                                                    <td>x{u.conversionFactor}</td>
                                                    <td className="pm-cell--price">{fmt(u.price)}</td>
                                                    <td>{u.barcode || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="pm-footer">
                    <button className="pm-btn pm-btn--ghost" onClick={onClose}>Đóng</button>
                    <button className="pm-btn pm-btn--primary" onClick={onEdit}>Chỉnh sửa</button>
                </div>
            </div>
        </BaseModal>
    );
};

export default ProductDetailModal;