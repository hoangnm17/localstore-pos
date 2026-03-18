import { useEffect, useMemo, useState, useCallback } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";
import PaymentMethodSelector from "./PaymentModal/PaymentMethodSelector";
import CashPayment from "./PaymentModal/CashPayment";
import BankPayment from "./PaymentModal/BankPayment";
import OrderDiscount from "../Discount/OrderDiscount";
import useHotkeys from "hooks/pos/useHotKeys";
import useTitle from "hooks/common/useTitle";
import { POS_HOTKEYS } from "config/HotKey";

export default function PaymentModal({
  orderId,
  total = 0,
  customer = null,
  qr = null,
  onClose = () => {},
  onConfirm = () => {},
  onBankPaid = () => {},
  onCancelBank = () => {},
}) {
  useTitle("Thanh toán");

  const [method, setMethod] = useState("CASH");
  const [discount, setDiscount] = useState(null);
  const [internalQr, setInternalQr] = useState(qr);
  const [loadingQr, setLoadingQr] = useState(false);

  const safeTotal = useMemo(() => Number(total) || 0, [total]);
  const safeDiscount = useMemo(() => (
    discount ?? { pointUsed: 0, totalDiscount: 0, finalAmount: safeTotal }
  ), [discount, safeTotal]);

  const finalAmount = safeDiscount.finalAmount ?? safeTotal;

  useHotkeys({
    [POS_HOTKEYS.CASH_PAY]: () => setMethod("CASH"),
    [POS_HOTKEYS.BANK_PAY]: () => setMethod("BANK"),
  });

  useEffect(() => {
    setInternalQr(null);
  }, [finalAmount]);

  useEffect(() => {
  if (method === "CASH") {
    setInternalQr(null);
    onCancelBank?.(orderId);
  }
}, [method]);

  useEffect(() => {
    if (method !== "BANK" || internalQr || finalAmount <= 0) return;

    const initQR = async () => {
      setLoadingQr(true);
      try {
        const res = await onConfirm({
          orderId,
          method: "BANK",
          amount: Math.round(finalAmount),
          discount: safeDiscount
        });
        if (res?.pending) setInternalQr(res.qr);
      } catch (error) {
        console.error("Lỗi tạo QR:", error);
      } finally {
        setLoadingQr(false);
      }
    };

    const timer = setTimeout(initQR, 100);
    return () => clearTimeout(timer);
  }, [method, internalQr, finalAmount, orderId, safeDiscount, onConfirm]);

  useEffect(() => {
    if (!internalQr || method !== "BANK") return;

    const es = new EventSource(`${process.env.REACT_APP_API_BASE_URL}/sse`);

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload?.type === "PAYMENT_SUCCESS") {
          onBankPaid(payload);
        }

      } catch (err) {
        console.error("SSE Parse Error:", err);
      }
    };

    return () => es.close();
  }, [internalQr, method, onBankPaid]);

  const handleConfirmCash = useCallback((payload = {}) => {
    console.log(payload, safeDiscount);

    onConfirm({
      orderId,
      ...payload,
      method: "CASH",
      amount: Math.round(finalAmount),
      discount: safeDiscount,
    });
  }, [onConfirm, orderId, finalAmount, safeDiscount]);

  return (
    <BaseModal onClose={onClose}>
      <div className="bg-white rounded-4 shadow overflow-hidden" style={{ width: "980px", maxWidth: "95vw" }}>
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
          <h6 className="fw-bold mb-0">Thanh toán đơn hàng #{orderId}</h6>
          <button className="btn-close" onClick={onClose} />
        </div>

        <div className="p-4">
          <div className="row g-4">
            <div className="col-md-6 border-end">
              <OrderDiscount subtotal={safeTotal} customer={customer} onChange={setDiscount} />
            </div>
            <div className="col-md-6">
              <div className="mb-3 p-3 border rounded-3 bg-light text-center">
                <div className="small text-muted mb-1">Tổng cần thanh toán</div>
                <div className="h2 fw-bold text-primary mb-0">{formatCurrency(finalAmount)}</div>
                {safeDiscount.totalDiscount > 0 && (
                  <div className="small text-danger mt-1">Đã giảm: -{formatCurrency(safeDiscount.totalDiscount)}</div>
                )}
              </div>

              <PaymentMethodSelector method={method} setMethod={setMethod} disabled={safeTotal <= 0} />

              <div className="mt-3">
                {safeTotal <= 0 ? (
                  <div className="alert alert-warning">Vui lòng thêm sản phẩm.</div>
                ) : method === "CASH" ? (
                  <CashPayment total={finalAmount} onConfirm={handleConfirmCash} />
                ) : (
                  <BankPayment
                    qr={internalQr}
                    total={finalAmount}
                    loading={loadingQr}
                    expiresAt={internalQr?.expiresAt}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}