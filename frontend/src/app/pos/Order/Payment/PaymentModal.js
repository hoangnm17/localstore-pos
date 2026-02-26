import { useState, useMemo, useEffect } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";

import PaymentMethodSelector from "./PaymentModal/PaymentMethodSelector";
import CashPayment from "./PaymentModal/CashPayment";
import BankPayment from "./PaymentModal/BankPayment";

export default function PaymentModal({
  orderId,
  total = 0,
  onClose = () => { },
  onConfirm = () => { },
}) {
  const safeTotal = useMemo(() => Number(total) || 0, [total]);
  const [method, setMethod] = useState("CASH");

  useEffect(() => {
    setMethod("CASH");
  }, [safeTotal]);

  const handleConfirm = (payload) => {
    onConfirm({
      orderId,
      method,
      ...payload,
    });
  };

  return (
    <BaseModal onClose={onClose}>
      <div
        className="bg-white rounded-3 shadow-sm overflow-hidden"
        style={{
          width: "480px",
          maxWidth: "95vw",
        }}
      >
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <span className="fw-semibold">Thanh toán</span>
          <button className="btn-close shadow-none" onClick={onClose} />
        </div>

        {/* BODY */}
        <div className="p-3">

          {/* TOTAL */}
          <div className="text-center mb-3 p-2 rounded-3 bg-light border">
            <div className="small text-muted mb-1">
              <strong>Tổng tiền cần thu</strong>
            </div>
            <div className="h3 fw-bold text-primary mb-0">
              <strong>{formatCurrency(safeTotal)}</strong>
            </div>
          </div>

          {/* METHOD */}
          <div className="mb-2">
            <PaymentMethodSelector
              method={method}
              setMethod={setMethod}
            />
          </div>

          {/* CONTENT */}
          {method === "CASH" && (
            <CashPayment
              total={total}
              onConfirm={(data) =>
                onConfirm({
                  method: "CASH",
                  amount: data.amount
                })
              }
            />
          )}

          {method === "BANK" && (
            <BankPayment
              total={total}
              onConfirm={(data) =>
                onConfirm({
                  method: "QR_VNPAY",
                  amount: data.amount
                })
              }
            />
          )}
        </div>
      </div>
    </BaseModal>
  );
}