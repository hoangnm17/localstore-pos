import { useState, useMemo, useEffect } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";

import PaymentMethodSelector from "./PaymentModal/PaymentMethodSelector";
import CashPayment from "./PaymentModal/CashPayment";
import BankPayment from "./PaymentModal/BankPayment";
// import usePaymentKeyboard from "./usePaymentKeyboard";

export default function PaymentModal({
  orderId,
  total = 0,
  onClose = () => {},
  onConfirm = () => {},
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

  // usePaymentKeyboard({
  //   method,
  //   setMethod,
  //   onClose,
  // });

  return (
    <BaseModal onClose={onClose}>
      <div className="bg-white rounded-4 shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center pt-4 px-4 pb-0">
          <h5 className="fw-bold fs-4 mb-0">Thanh toán</h5>
          <button className="btn-close shadow-none" onClick={onClose} />
        </div>

        {/* BODY */}
        <div className="p-4">

          <div className="text-center mb-4 p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10">
            <div className="text-secondary small fw-bold text-uppercase mb-1">
              Tổng tiền cần thu
            </div>
            <h2 className="text-primary fw-bold mb-0">
              {formatCurrency(safeTotal)}
            </h2>
          </div>

          <PaymentMethodSelector
            method={method}
            setMethod={setMethod}
          />

          {method === "CASH" && (
            <CashPayment
              total={safeTotal}
              onConfirm={handleConfirm}
            />
          )}

          {method === "BANK" && (
            <BankPayment
              total={safeTotal}
              onConfirm={handleConfirm}
            />
          )}

        </div>

      </div>
    </BaseModal>
  );
}