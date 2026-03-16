import React, { useEffect, useRef } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";

export default function BillModal({ invoice, onClose }) {
  const printRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (!invoice) return null;

  return (
    <BaseModal onClose={onClose} maxWidth="500px">
      <style>{`
        .bill-wrapper {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 16px;
        }
        .bill-paper {
          background: #ffffff;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          padding: 40px 30px;
          position: relative;
          color: #2d3436;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        /* Hiệu ứng răng cưa giả ở đáy hóa đơn */
        .bill-paper::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 10px;
          background: linear-gradient(-45deg, #f8f9fa 5px, transparent 0), 
                      linear-gradient(45deg, #f8f9fa 5px, transparent 0);
          background-size: 10px 10px;
        }
        .bill-header-title {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #000;
        }
        .dashed-line {
          border-top: 2px dashed #dfe6e9;
          margin: 20px 0;
        }
        .item-row td {
          padding: 12px 0;
          vertical-align: top;
        }
        .product-name {
          font-size: 1.1rem;
          font-weight: 600;
          display: block;
          margin-bottom: 2px;
        }
        .total-section {
          background-color: #f1f2f6;
          border-radius: 12px;
          padding: 20px;
        }
        .qr-placeholder {
          width: 120px;
          height: 120px;
          background: #fff;
          border: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border-radius: 8px;
        }
        @media print {
          body * { visibility: hidden; }
          .bill-paper, .bill-paper * { visibility: visible; }
          .bill-paper {
            position: absolute;
            left: 0; top: 0; width: 100%;
            box-shadow: none;
            padding: 0;
          }
          .d-print-none { display: none !important; }
        }
      `}</style>

      <div className="bill-wrapper">
        <div ref={printRef} className="bill-paper">
          
          {/* Header */}
          <div className="text-center mb-4">
            <div className="bill-header-title mb-1 text-uppercase">Cửa hàng đẳng cấp</div>
            <div className="text-muted small">Địa chỉ: 123 Đường ABC, Quận 1, TP. HCM</div>
            <div className="text-muted small">Hotline: 0901.234.567</div>
          </div>

          <div className="text-center mb-4">
            <h4 className="fw-bold m-0">HÓA ĐƠN BÁN LẺ</h4>
            <div className="badge bg-light text-dark border mt-2 px-3 py-2">
              SỐ: {invoice.invoiceCode || "HD-000123"}
            </div>
          </div>

          {/* Thông tin khách/nhân viên */}
          <div className="row g-3 mb-2 small">
            <div className="col-7">
              <div className="text-muted">Ngày lập:</div>
              <div className="fw-bold">{new Date(invoice.createdAt).toLocaleString("vi-VN")}</div>
            </div>
            <div className="col-5 text-end">
              <div className="text-muted">Thu ngân:</div>
              <div className="fw-bold">{invoice.staffName}</div>
            </div>
          </div>

          <div className="dashed-line"></div>

          {/* Danh sách sản phẩm */}
          <table className="w-100 mb-4">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th className="pb-2">Mặt hàng</th>
                <th className="pb-2 text-center">SL</th>
                <th className="pb-2 text-end">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item) => (
                <tr key={item.id} className="item-row border-bottom-0">
                  <td>
                    <span className="product-name">{item.productName}</span>
                    <span className="text-muted small">
                      {formatCurrency(item.unitPrice)} / {item.unitName}
                    </span>
                  </td>
                  <td className="text-center fw-bold">x{item.quantity}</td>
                  <td className="text-end fw-bold">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="dashed-line"></div>

          {/* Phần thanh toán */}
          <div className="total-section mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Tổng tiền hàng:</span>
              <span className="fw-medium">{formatCurrency(invoice.totalAmount || invoice.finalAmount)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 text-danger">
              <span className="">Chiết khấu:</span>
              <span>- 0đ</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-10">
              <span className="fw-bold h5 mb-0 text-uppercase">Tổng cộng:</span>
              <span className="h3 mb-0 fw-bolder text-primary">
                {formatCurrency(invoice.finalAmount)}
              </span>
            </div>
          </div>

          {/* Footer & QR */}
          <div className="text-center mt-5">
            <div className="qr-placeholder mb-3">
              <div className="text-center">
                <div style={{fontSize: '10px', color: '#999'}}>QUÉT MÃ</div>
                <div style={{fontSize: '12px', fontWeight: 'bold'}}>THANH TOÁN</div>
              </div>
            </div>
            <p className="fw-bold mb-1" style={{fontSize: '1.1rem'}}>CẢM ƠN QUÝ KHÁCH!</p>
            <p className="text-muted small">Hẹn gặp lại quý khách lần sau</p>
          </div>
        </div>

        {/* Nút bấm điều khiển */}
        <div className="mt-4 d-flex gap-3 d-print-none">
          <button 
            className="btn btn-secondary btn-lg w-100 fw-bold border-0 shadow-sm" 
            style={{backgroundColor: '#e9ecef', color: '#495057'}}
            onClick={onClose}
          >
            ĐÓNG
          </button>
          <button 
            className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" 
            style={{backgroundColor: '#0d6efd'}}
            onClick={() => window.print()}
          >
            IN LẠI
          </button>
        </div>
      </div>
    </BaseModal>
  );
}