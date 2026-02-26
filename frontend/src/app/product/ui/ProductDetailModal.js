import useProductDetail from '../../../hooks/product/useProductDetail';
import './ProductModal.css';

const STATUS_MAP = {
    Selling: { label: 'Đang bán', cls: 'badge badge--selling' },
    StopSelling: { label: 'Ngừng bán', cls: 'badge badge--stop' },
    Suspended: { label: 'Tạm khóa', cls: 'badge badge--suspended' },
};

const ProductDetailModal = ({ productId, onClose, onEdit }) => {
    const { product, units, loading, error } = useProductDetail(productId);

    const formatPrice = (val) =>
        val != null ? Number(val).toLocaleString('vi-VN') + 'đ' : '—';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">Chi tiết sản phẩm</h2>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="modal__body">
                    {loading && <div className="modal-loading">Đang tải...</div>}
                    {error && <div className="modal-error">{error}</div>}

                    {!loading && product && (
                        <>
                            <div className="detail-top">
                                <div className="detail-image">
                                    {product.imageUrl
                                        ? <img src={product.imageUrl} alt={product.name} />
                                        : <div className="detail-image__placeholder">📦</div>
                                    }
                                </div>
                                <div className="detail-info">
                                    <h3 className="detail-name">{product.name}</h3>
                                    <div className="detail-grid">
                                        <div className="detail-field">
                                            <span className="detail-label">Mã SP</span>
                                            <span className="detail-value detail-value--code">{product.code}</span>
                                        </div>
                                        <div className="detail-field">
                                            <span className="detail-label">Barcode</span>
                                            <span className="detail-value">{product.barcode || '—'}</span>
                                        </div>
                                        <div className="detail-field">
                                            <span className="detail-label">Danh mục</span>
                                            <span className="detail-value">{product.categoryName || '—'}</span>
                                        </div>
                                        <div className="detail-field">
                                            <span className="detail-label">Đơn vị cơ bản</span>
                                            <span className="detail-value">{product.baseUnit}</span>
                                        </div>
                                        <div className="detail-field">
                                            <span className="detail-label">Giá vốn</span>
                                            <span className="detail-value detail-value--price">{formatPrice(product.costPrice)}</span>
                                        </div>
                                        <div className="detail-field">
                                            <span className="detail-label">Giá bán</span>
                                            <span className="detail-value detail-value--price">{formatPrice(product.salePrice)}</span>
                                        </div>
                                        <div className="detail-field">
                                            <span className="detail-label">Tồn kho</span>
                                            <span className="detail-value">{product.stockQuantity ?? 0}</span>
                                        </div>
                                        <div className="detail-field">
                                            <span className="detail-label">Trạng thái</span>
                                            <span className={STATUS_MAP[product.status]?.cls || 'badge'}>
                                                {STATUS_MAP[product.status]?.label || product.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {units.length > 0 && (
                                <div className="detail-section">
                                    <h4 className="detail-section__title">Đơn vị tính</h4>
                                    <table className="detail-table">
                                        <thead>
                                            <tr>
                                                <th>Tên ĐVT</th>
                                                <th>Loại</th>
                                                <th>Quy đổi</th>
                                                <th>Giá bán</th>
                                                <th>Barcode</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {units.map(u => (
                                                <tr key={u.id}>
                                                    <td>{u.unitName}</td>
                                                    <td>{u.unitType}</td>
                                                    <td>{u.conversionFactor}</td>
                                                    <td className="cell--price">{formatPrice(u.price)}</td>
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

                <div className="modal__footer">
                    <button className="btn btn--ghost" onClick={onClose}>Đóng</button>
                    <button className="btn btn--primary" onClick={onEdit}>Chỉnh sửa</button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;