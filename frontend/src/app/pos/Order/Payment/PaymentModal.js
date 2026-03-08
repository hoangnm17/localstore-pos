import { useEffect, useMemo, useState, useCallback } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";

import PaymentMethodSelector from "./PaymentModal/PaymentMethodSelector";
import CashPayment from "./PaymentModal/CashPayment";
import BankPayment from "./PaymentModal/BankPayment";
import OrderDiscount from "../Discount/OrderDiscount";

export default function PaymentModal({
  orderId,
  total = 0,
  customer = null,
  onClose = () => { },
  onConfirm = () => { },
  onBankPaid = () => { },
}) {
  const safeTotal = useMemo(() => Number(total) || 0, [total]);

  const [method, setMethod] = useState("CASH");
  const [discount, setDiscount] = useState(null);

  const safeDiscount = useMemo(() => {
    return (
      discount ?? {
        pointUsed: 0,
        voucherId: null,
        promotionId: null,
        totalDiscount: 0,
        finalAmount: safeTotal,
      }
    );
  }, [discount, safeTotal]);

  const finalAmount = useMemo(() => {
    return safeDiscount.finalAmount ?? safeTotal;
  }, [safeDiscount.finalAmount, safeTotal]);

  useEffect(() => {
    setMethod("CASH");
    setDiscount(null);
  }, [orderId]);

  const disabledPay = safeTotal <= 0;

  const handleConfirmCash = useCallback(
    (payload = {}) => {
      onConfirm({
        orderId,
        ...payload,
        method: "CASH",
        amount: finalAmount,
        discount: safeDiscount,
      });
    },
    [onConfirm, orderId, finalAmount, safeDiscount]
  );

  return (
    <BaseModal onClose={onClose}>
      <div
        className="bg-white rounded-4 shadow overflow-hidden"
        style={{ width: "980px", maxWidth: "95vw" }}
      >
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
          <h6 className="fw-bold mb-0">Thanh toán</h6>
          <button className="btn-close" onClick={onClose} />
        </div>

        <div className="p-4">
          <div className="row g-4">
            <div className="col-md-6">
              <OrderDiscount
                subtotal={safeTotal}
                customer={customer}
                onChange={setDiscount}
              />
            </div>

            <div className="col-md-6">
              <div className="mb-3 p-3 border rounded-3 bg-light text-center">
                <div className="small text-muted mb-1">Tổng cần thanh toán</div>
                <div className="h3 fw-bold text-primary mb-0">
                  {formatCurrency(finalAmount)}
                </div>

                {safeDiscount.totalDiscount > 0 && (
                  <div className="small text-muted mt-1">
                    Giảm: -{formatCurrency(safeDiscount.totalDiscount)}
                  </div>
                )}
              </div>

              <PaymentMethodSelector
                method={method}
                setMethod={setMethod}
                disabled={disabledPay}
              />

              {disabledPay ? (
                <div className="alert alert-light border mt-3 mb-0">
                  Không có sản phẩm để thanh toán.
                </div>
              ) : (
                <>
                  {method === "CASH" && (
                    <CashPayment total={finalAmount} onConfirm={handleConfirmCash} />
                  )}

                  {method === "BANK" && (
                    <BankPayment
                      invoiceId={orderId}
                      amount={finalAmount}
                      discount={safeDiscount}
                      onPaid={onBankPaid}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}