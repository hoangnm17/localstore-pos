import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import ModalShell from './ModalShell';
import { formatMoney } from '../../../utils/formatters';

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function buildBarcodeSvg(barcode) {
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    JsBarcode(svgNode, barcode, {
        format: 'CODE128',
        displayValue: true,
        fontSize: 16,
        height: 48,
        width: 1.6,
        margin: 0
    });

    return svgNode.outerHTML;
}

function BarcodePreview({ barcode }) {
    const barcodeRef = useRef(null);

    useEffect(() => {
        if (!barcodeRef.current || !barcode) return;

        JsBarcode(barcodeRef.current, barcode, {
            format: 'CODE128',
            displayValue: true,
            fontSize: 16,
            height: 52,
            width: 1.8,
            margin: 0
        });
    }, [barcode]);

    if (!barcode) {
        return <div className="text-danger small">Đơn vị tính này chưa có barcode.</div>;
    }

    return <svg ref={barcodeRef} />;
}

function BarcodePrintModal({ open, product, unit, onClose }) {
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (open) setQuantity(1);
    }, [open, product?.id, unit?.id]);

    const handlePrint = () => {
        if (!product || !unit || !unit.barcode) return;

        const qty = Math.max(1, Number(quantity || 1));
        const barcodeSvg = buildBarcodeSvg(unit.barcode);

        const labelHtml = Array.from({ length: qty }, () => `
            <div class="barcode-label">
                <div class="product-name">${escapeHtml(product.name)}</div>
                <div class="meta-row"><strong>ĐVT:</strong> ${escapeHtml(unit.unitName)}</div>
                <div class="meta-row"><strong>Giá:</strong> ${escapeHtml(formatMoney(unit.salePrice))}</div>
                <div class="barcode-wrap">${barcodeSvg}</div>
            </div>
        `).join('');

        const printWindow = window.open('', '_blank', 'width=1000,height=800');

        if (!printWindow) {
            alert('Không thể mở cửa sổ in. Hãy kiểm tra popup blocker của trình duyệt.');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8" />
                <title>In mã vạch</title>
                <style>
                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        padding: 12px;
                        font-family: Arial, sans-serif;
                        color: #000;
                        background: #fff;
                    }

                    .sheet {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px;
                    }

                    .barcode-label {
                        border: 1px solid #d9d9d9;
                        border-radius: 8px;
                        padding: 10px;
                        min-height: 180px;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                    }

                    .product-name {
                        font-size: 18px;
                        font-weight: 700;
                        line-height: 1.3;
                        margin-bottom: 8px;
                    }

                    .meta-row {
                        font-size: 14px;
                        margin-bottom: 4px;
                    }

                    .barcode-wrap {
                        margin-top: 10px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .barcode-wrap svg {
                        width: 100%;
                        max-width: 260px;
                        height: auto;
                    }

                    @media print {
                        body {
                            padding: 0;
                        }

                        .sheet {
                            gap: 8px;
                        }

                        .barcode-label {
                            break-inside: avoid;
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="sheet">
                    ${labelHtml}
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
        }, 300);
    };

    return (
        <ModalShell
            open={open}
            title="In mã vạch"
            subtitle={product && unit ? `${product.name} - ${unit.unitName}` : 'Chuẩn bị dữ liệu in'}
            width="760px"
            onClose={onClose}
            footer={
                <>
                    <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                        Đóng
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handlePrint}
                        disabled={!unit?.barcode}
                    >
                        <i className="bi bi-printer me-2" />
                        In tem
                    </button>
                </>
            }
        >
            {!product || !unit ? (
                <div className="text-center py-4">Không có dữ liệu để in.</div>
            ) : (
                <div className="row g-3">
                    <div className="col-lg-5">
                        <div className="card h-100">
                            <div className="card-header fw-bold">Thông tin tem</div>
                            <div className="card-body">
                                <p><strong>Sản phẩm:</strong> {product.name}</p>
                                <p><strong>Đơn vị:</strong> {unit.unitName}</p>
                                <p><strong>Giá bán:</strong> {formatMoney(unit.salePrice)}</p>
                                <p><strong>Barcode:</strong> {unit.barcode || '—'}</p>

                                <div className="mt-3">
                                    <label className="form-label fw-semibold">Số lượng tem cần in</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="200"
                                        className="form-control"
                                        value={quantity}
                                        onChange={(e) => {
                                            const next = Number(e.target.value || 1);
                                            setQuantity(Math.max(1, Math.min(200, next)));
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-7">
                        <div className="card h-100">
                            <div className="card-header fw-bold">Xem trước tem</div>
                            <div className="card-body">
                                <div
                                    style={{
                                        border: '1px solid #dee2e6',
                                        borderRadius: 8,
                                        padding: 16,
                                        background: '#fff'
                                    }}
                                >
                                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                                        {product.name}
                                    </div>

                                    <div style={{ marginBottom: 4 }}>
                                        <strong>ĐV:</strong> {unit.unitName}
                                    </div>

                                    <div style={{ marginBottom: 12 }}>
                                        <strong>Giá:</strong> {formatMoney(unit.salePrice)}
                                    </div>

                                    <div className="d-flex justify-content-center">
                                        <BarcodePreview barcode={unit.barcode} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ModalShell>
    );
}

export default BarcodePrintModal;