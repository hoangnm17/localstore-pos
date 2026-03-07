import React from "react";
import { Modal, Table, Button } from "react-bootstrap";

export default function BillModal({ show, invoice, onClose }) {
  if (!invoice) return null;

  const formatMoney = (n) =>
    new Intl.NumberFormat("vi-VN").format(n);

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Hóa đơn thanh toán</Modal.Title>
      </Modal.Header>

      <Modal.Body>

        {/* Header */}
        <div className="text-center mb-4">
          <h4>LocalStore POS</h4>
          <div>Mã hóa đơn: <b>{invoice.invoiceCode}</b></div>
          <div>{new Date(invoice.createdAt).toLocaleString()}</div>
        </div>

        {/* Product list */}
        <Table bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Sản phẩm</th>
              <th className="text-center">SL</th>
              <th className="text-end">Đơn giá</th>
              <th className="text-end">Thành tiền</th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-end">
                  {formatMoney(item.unitPrice)}
                </td>
                <td className="text-end">
                  {formatMoney(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Summary */}
        <div className="d-flex justify-content-end">
          <div style={{ width: 300 }}>

            <div className="d-flex justify-content-between">
              <span>Tạm tính</span>
              <span>{formatMoney(invoice.subTotal)}</span>
            </div>

            {invoice.discount > 0 && (
              <div className="d-flex justify-content-between text-danger">
                <span>Giảm giá</span>
                <span>- {formatMoney(invoice.discount)}</span>
              </div>
            )}

            <hr />

            <div className="d-flex justify-content-between fs-5">
              <strong>Tổng thanh toán</strong>
              <strong>{formatMoney(invoice.finalAmount)}</strong>
            </div>

          </div>
        </div>

      </Modal.Body>

      <Modal.Footer>

        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>

        <Button variant="primary" onClick={() => window.print()}>
          In hóa đơn
        </Button>

      </Modal.Footer>
    </Modal>
  );
}