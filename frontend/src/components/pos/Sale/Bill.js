import React, { useEffect } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";

export default function BillModal({ invoice, onClose, autoPrint = false }) {
  useEffect(() => {
    if (autoPrint && invoice) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, invoice]);

  if (!invoice) return null;

  return (
    <BaseModal onClose={onClose} maxWidth="420px">
      <style>{`
        @media print {
          @page { margin: 0; size: 80mm auto; }
          body { margin: 0; padding: 0; background: #fff; }
          .d-print-none { display: none !important; }
          body * { visibility: hidden; }
          .bill-paper, .bill-paper * { visibility: visible; }
          .bill-paper {
            position: absolute; left: 0; top: 0;
            width: 80mm; padding: 4mm 6mm;
            box-shadow: none !important;
          }
        }
        .bill-wrapper { background-color: #f0f2f5; padding: 20px 10px; display: flex; justify-content: center; }
        .bill-paper {
          background: #fff; width: 80mm; padding: 20px; color: #000;
          font-family: "Inter", sans-serif; font-size: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .divider { border-top: 1px dashed #000; margin: 12px 0; }
        .customer-section { background: #f9f9f9; padding: 8px; border-radius: 4px; margin: 10px 0; border: 0.5px solid #eee; }
        .item-table { width: 100%; margin-top: 10px; border-collapse: collapse; }
        .item-table th { text-align: left; font-size: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
        .grand-total { font-size: 16px; font-weight: bold; margin-top: 8px; padding-top: 8px; border-top: 1.5px solid #000; }
        .qr-mock { width: 80px; height: 80px; border: 1px solid #000; margin: 10px auto; display: flex; align-items: center; justify-content: center; font-size: 9px; }
      `}</style>

      <div className="bill-wrapper">
        <div className="bill-paper">
          <div className="text-center">
            <div className="fw-bold" style={{fontSize: '18px'}}>CỬA HÀNG CAO BẰNG MỘ MIXUE</div>
            <div style={{fontSize: '10px'}}>120 Yên Lãng, Đống Đa, Hà Nội</div>
            <div style={{fontSize: '10px'}}>Hotline: 0666666666</div>
          </div>

          <div className="divider"></div>

          <div className="text-center mb-3">
            <div className="fw-bold" style={{fontSize: '14px'}}>HÓA ĐƠN BÁN LẺ</div>
            <div style={{fontSize: '11px'}}>Mã: {invoice.invoiceCode}</div>
          </div>

          <div className="small d-flex justify-content-between">
            <span>Ngày: <b>{new Date(invoice.createdAt).toLocaleDateString("vi-VN")}</b></span>
            <span>Giờ: <b>{new Date(invoice.createdAt).toLocaleTimeString("vi-VN", {hour:'2-digit', minute:'2-digit'})}</b></span>
          </div>

          <div className="customer-section">
            <div style={{fontSize: '10px', color: '#666'}}>Khách hàng:</div>
            <div className="fw-bold">{invoice.customerName || "Khách lẻ"}</div>
            {invoice.customerPhone && <div className="small">{invoice.customerPhone}</div>}
          </div>

          <table className="item-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th className="text-center">SL</th>
                <th className="text-end">T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2">
                    <div className="fw-bold">{item.productName}</div>
                    <div style={{fontSize: '10px'}}>{formatCurrency(item.unitPrice)}</div>
                  </td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end fw-bold">{formatCurrency(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="divider"></div>

          <div className="d-flex justify-content-between">
            <span>Tiền hàng:</span>
            <span>{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="d-flex justify-content-between grand-total">
            <span>TỔNG CỘNG:</span>
            <span>{formatCurrency(invoice.finalAmount)}</span>
          </div>

          <div className="text-center mt-4">
            <div className="fw-bold mt-2">CẢM ƠN QUÝ KHÁCH!</div>
          </div>
        </div>
      </div>

      <div className="p-3 d-print-none text-center bg-white border-top">
         <button className="btn btn-primary fw-bold px-4 shadow-sm" onClick={() => window.print()}>
           <i className="bi bi-printer me-2"></i>IN LẠI
         </button>
         <button className="btn btn-light ms-2" onClick={onClose}>Đóng</button>
      </div>
    </BaseModal>
  );
}