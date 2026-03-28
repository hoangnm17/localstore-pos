import React from 'react';
import ModalShell from './ModalShell';
import { getImageUrl } from 'utils/image';

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

function formatQuantity(value, allowDecimalQuantity) {
    const num = Number(value || 0);
    if (allowDecimalQuantity) {
        return num.toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        });
    }
    return Math.round(num).toLocaleString('vi-VN');
}

function ProductDetailModal({
    open,
    loading,
    product,
    comboItems,
    submitting,
    onClose,
    onEditProduct,
    onOpenStatus,
    onOpenPriceHistory,
    onOpenCreateUnit,
    onOpenEditUnit,
    onDeleteUnit,
    onOpenAddComboItem,
    onRemoveComboItem,
    onRefresh
}) {
    return (
        <ModalShell
            open={open}
            title="Chi tiết sản phẩm"
            subtitle={product ? `${product.name} - ${product.code}` : 'Đang tải dữ liệu...'}
            width="1200px"
            onClose={onClose}
            footer={
                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                    Đóng
                </button>
            }
        >
            {loading || !product ? (
                <div className="text-center py-4">Đang tải chi tiết sản phẩm...</div>
            ) : (
                <>

                    <div className="row g-3 mb-4">
                        <div className="col-lg-4">
                            <div className="card h-100">
                                <div className="card-header fw-bold">Thông tin chung</div>
                                <div className="card-body">
                                    <p><strong>Mã sản phẩm:</strong> {product.code}</p>
                                    <p><strong>Tên sản phẩm:</strong> {product.name}</p>
                                    <p><strong>Danh mục:</strong> {product.categoryName || 'Chưa có'}</p>
                                    <p><strong>Đơn vị cơ bản:</strong> {product.baseUnit}</p>
                                    <p><strong>Barcode đơn vị cơ bản:</strong> {product.barcode || '—'}</p>
                                    <p className="mb-0">
                                        <strong>Trạng thái:</strong>{' '}
                                        {product.status === 'Selling' ? 'Đang bán' : 'Ngừng bán'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card h-100">
                                <div className="card-header fw-bold">Phân loại</div>
                                <div className="card-body">
                                    <p>
                                        <strong>Loại sản phẩm:</strong>{' '}
                                        {product.isCombo ? (
                                            <span className="badge bg-success">Combo</span>
                                        ) : (
                                            <span className="badge bg-primary">Thường</span>
                                        )}
                                    </p>
                                    <p>
                                        <strong>Kiểu bán:</strong>{' '}
                                        {product.isCombo ? 'Combo' : product.allowDecimalQuantity ? 'Cân' : 'Piece'}
                                    </p>
                                    <p><strong>Cho phép số lẻ:</strong> {product.allowDecimalQuantity ? 'Có' : 'Không'}</p>
                                    <p><strong>Ngưỡng tồn tối thiểu:</strong> {Number(product.minThreshold || 0).toLocaleString('vi-VN')}</p>
                                    <p className="mb-0"><strong>Có nhiều đơn vị tính:</strong> {product.hasMultiUnit ? 'Có' : 'Không'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card h-100">
                                <div className="card-header fw-bold">Giá và tồn kho</div>
                                <div className="card-body">
                                    <p><strong>Giá bán đơn vị cơ bản:</strong> {formatMoney(product.salePrice)}</p>
                                    <p><strong>Giá nhập gần nhất:</strong> {formatMoney(product.costPrice)}</p>
                                    <p><strong>Tồn kho hiện tại:</strong> {formatQuantity(product.stockQuantity, product.allowDecimalQuantity)}</p>
                                    {product.imageUrl && (
                                        <div>
                                            <strong>Ảnh sản phẩm:</strong>
                                            <div className="mt-2">
                                                <img
                                                    src={getImageUrl(product.imageUrl)}
                                                    alt={product.name}
                                                    style={{ width: '100%', maxWidth: 200, height: 'auto', borderRadius: 6, border: '1px solid #dee2e6' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {!product.isCombo && <div className="card mb-4">
                        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div>
                                <div className="fw-bold">Danh sách đơn vị tính</div>
                                <small className="text-muted">Đơn vị cơ bản và các đơn vị phụ của sản phẩm</small>
                            </div>

                            <button type="button" className="btn btn-success btn-sm" onClick={onOpenCreateUnit}>
                                <i className="bi bi-plus-circle me-2" />
                                Thêm đơn vị phụ
                            </button>
                        </div>

                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Đơn vị</th>
                                            <th>Loại</th>
                                            <th>Hệ số quy đổi</th>
                                            <th>Giá bán</th>
                                            <th>Barcode</th>
                                            <th>Đơn vị cơ bản</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!product.units?.length ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4">
                                                    Không có đơn vị tính.
                                                </td>
                                            </tr>
                                        ) : (
                                            product.units.map((unit) => (
                                                <tr key={unit.id}>
                                                    <td className="fw-semibold">{unit.unitName}</td>
                                                    <td>{unit.unitType}</td>
                                                    <td>{Number(unit.conversionFactor || 0).toLocaleString('vi-VN')}</td>
                                                    <td>{formatMoney(unit.salePrice)}</td>
                                                    <td>{unit.barcode || '—'}</td>
                                                    <td>{unit.isBaseUnit ? 'Có' : 'Không'}</td>
                                                    <td>
                                                        {unit.isBaseUnit ? (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-warning"
                                                                onClick={() => onOpenEditUnit(unit)}
                                                            >
                                                                <i className="bi bi-pencil-square me-1" />
                                                                Sửa giá
                                                            </button>
                                                        ) : (
                                                            <div className="d-flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-warning"
                                                                    onClick={() => onOpenEditUnit(unit)}
                                                                >
                                                                    <i className="bi bi-pencil-square me-1" />
                                                                    Sửa
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    disabled={submitting}
                                                                    onClick={() => onDeleteUnit(unit)}
                                                                >
                                                                    <i className="bi bi-trash me-1" />
                                                                    Xóa
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>}

                    {product.isCombo ? (
                        <div className="card">
                            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
                                <div>
                                    <div className="fw-bold">Thành phần combo</div>
                                    <small className="text-muted">Quản lý các sản phẩm con cấu thành combo</small>
                                </div>

                                <button type="button" className="btn btn-success btn-sm" onClick={() => onOpenAddComboItem(product)}>
                                    <i className="bi bi-plus-circle me-2" />
                                    Thêm thành phần
                                </button>
                            </div>

                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-bordered align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Mã SP con</th>
                                                <th>Tên SP con</th>
                                                <th>Base unit</th>
                                                <th>Số lượng</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!comboItems?.length ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-4">
                                                        Combo chưa có thành phần nào.
                                                    </td>
                                                </tr>
                                            ) : (
                                                comboItems.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>{item.childProductCode}</td>
                                                        <td className="fw-semibold">{item.childProductName}</td>
                                                        <td>{item.baseUnit}</td>
                                                        <td>{Number(item.quantity || 0).toLocaleString('vi-VN')}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => onRemoveComboItem(item.id)}
                                                            >
                                                                <i className="bi bi-trash me-1" />
                                                                Xóa
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </>
            )}
        </ModalShell>
    );
}

export default ProductDetailModal;