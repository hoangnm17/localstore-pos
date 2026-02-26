import { useState, useCallback, useEffect, useRef } from 'react';
import { getProducts } from '../../../../services/Product/product.service';
import '../ProductModal.css';

const ProductComboForm = ({
    productId = null,
    comboItems = [],
    onItemsChange,
    handleAddComboItem,
    handleRemoveComboItem,
    onError,
}) => {
    const isCreateMode = !productId;

    const [pendingItems, setPendingItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [searching, setSearching] = useState(false);

    const displayItems = isCreateMode ? pendingItems : comboItems;

    // Key để identify item trong search results (dùng productId vì chưa có id thật)
    const existingProductIds = displayItems.map(i =>
        isCreateMode ? i.childProductId : i.childProductId
    );

    const debounceRef = useRef(null);
    const latestQuery = useRef('');

    const handleSearch = useCallback((val) => {
        setSearchQuery(val);
        if (!val.trim()) { setSearchResults([]); setSearching(false); return; }

        setSearching(true);
        latestQuery.current = val;

        // Debounce: chờ 300ms sau lần gõ cuối mới gọi API
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            const query = latestQuery.current;
            const res = await getProducts({ search: query, limit: 10, status: 'Selling' });
            // Bỏ qua nếu query đã bị thay bằng query mới hơn (race condition)
            if (query !== latestQuery.current) return;
            setSearching(false);
            if (res.success !== false) {
                setSearchResults(
                    (res.data?.data || []).filter(p =>
                        p.id !== Number(productId) &&
                        !existingProductIds.includes(p.id) &&
                        !p.isCombo
                    )
                );
            }
        }, 300);
    }, [productId, existingProductIds]);

    // Cleanup debounce khi unmount
    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const handleAdd = async (child) => {
        const qty = parseInt(quantities[child.id]) || 1;
        if (qty < 1) return;

        if (isCreateMode) {
            const newItem = {
                childProductId: child.id,
                childProductCode: child.code,
                childProductName: child.name,
                baseUnit: child.baseUnit,
                salePrice: child.salePrice,
                quantity: qty,
            };
            const newItems = [...pendingItems, newItem];
            setPendingItems(newItems);
            onItemsChange?.(newItems);
        } else {
            const res = await handleAddComboItem({ childProductId: child.id, quantity: qty });
            if (!res.success) { onError?.(res.message); return; }
        }

        // Reset sau khi thêm
        setSearchQuery('');
        setSearchResults([]);
        setQuantities(prev => ({ ...prev, [child.id]: '' }));
    };

    const handleRemove = async (item, index) => {
        if (isCreateMode) {
            const newItems = pendingItems.filter((_, i) => i !== index);
            setPendingItems(newItems);
            onItemsChange?.(newItems);
        } else {
            const res = await handleRemoveComboItem(item.id);
            if (!res.success) onError?.(res.message);
        }
    };

    const fmt = (val) => val != null ? Number(val).toLocaleString('vi-VN') + 'đ' : '—';

    const totalPrice = displayItems.reduce((sum, item) => {
        const price = item.salePrice ?? 0;
        return sum + price * item.quantity;
    }, 0);

    return (
        <div>
            {/* Search box */}
            <div className="pm-combo-search">
                <label className="pm-label">Tìm sản phẩm thêm vào combo</label>
                <div style={{ position: 'relative' }}>
                    <input
                        className="pm-input"
                        value={searchQuery}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="Nhập tên hoặc mã sản phẩm..."
                    />
                    {searching && (
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9197b3' }}>
                            Đang tìm...
                        </span>
                    )}
                </div>

                {searchResults.length > 0 && (
                    <div className="pm-combo-results">
                        {searchResults.map(p => (
                            <div key={p.id} className="pm-combo-result-item">
                                <div className="pm-combo-result-info">
                                    <span className="pm-cell--code">{p.code}</span>
                                    <span className="pm-combo-result-name">{p.name}</span>
                                    <span className="pm-combo-result-price">{fmt(p.salePrice)}</span>
                                    <span style={{ fontSize: 11, color: '#9197b3' }}>/ {p.baseUnit}</span>
                                </div>
                                <div className="pm-combo-result-actions">
                                    <input
                                        className="pm-combo-qty"
                                        type="number"
                                        min="1"
                                        value={quantities[p.id] ?? 1}
                                        onChange={e => setQuantities(prev => ({ ...prev, [p.id]: e.target.value }))}
                                    />
                                    <button
                                        className="pm-btn pm-btn--primary pm-btn--sm"
                                        onClick={() => handleAdd(p)}
                                    >
                                        + Thêm
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {searchQuery && !searching && searchResults.length === 0 && (
                    <p style={{ fontSize: 13, color: '#9197b3', margin: '6px 0 0' }}>
                        Không tìm thấy sản phẩm phù hợp
                    </p>
                )}
            </div>

            {/* Danh sách đã thêm */}
            {displayItems.length === 0 ? (
                <div className="pm-empty">Chưa có sản phẩm nào trong combo</div>
            ) : (
                <>
                    <table className="pm-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mã SP</th>
                                <th>Tên sản phẩm</th>
                                <th>Đơn vị</th>
                                <th>Giá bán</th>
                                <th>Số lượng</th>
                                <th>Thành tiền</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayItems.map((item, idx) => (
                                <tr key={isCreateMode ? idx : item.id}>
                                    <td>{idx + 1}</td>
                                    <td className="pm-cell--code">{item.childProductCode || '—'}</td>
                                    <td className="pm-cell--name">{item.childProductName}</td>
                                    <td>{item.baseUnit || '—'}</td>
                                    <td className="pm-cell--price">{fmt(item.salePrice)}</td>
                                    <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                                    <td className="pm-cell--price">
                                        {item.salePrice != null ? fmt(item.salePrice * item.quantity) : '—'}
                                    </td>
                                    <td>
                                        <button
                                            className="pm-action-btn pm-action-btn--delete"
                                            onClick={() => handleRemove(item, idx)}
                                            title="Xóa khỏi combo"
                                        >🗑</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Tổng cộng */}
                    <div className="pm-combo-total">
                        <span>Tổng giá trị combo:</span>
                        <span className="pm-combo-total__price">{fmt(totalPrice)}</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductComboForm;