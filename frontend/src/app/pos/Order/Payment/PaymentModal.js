import { useEffect, useMemo, useState, useCallback } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";
import PaymentMethodSelector from "./PaymentModal/PaymentMethodSelector";
import CashPayment from "./PaymentModal/CashPayment";
import BankPayment from "./PaymentModal/BankPayment";
import OrderDiscount from "../Discount/OrderDiscount";
import useTitle from "hooks/common/useTitle";
import { POS_HOTKEYS } from "config/HotKey";

export default function PaymentModal({
  orderId,
  total = 0,
  customer = null,
  qr = null,
  onClose = () => { },
  onConfirm = () => { },
  onBankPaid = () => { },
  onCancelBank = () => { },
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

  useEffect(() => {
    setInternalQr(null);
  }, [finalAmount]);

  const [prevMethod, setPrevMethod] = useState("CASH");

  useEffect(() => {
    if (
      prevMethod === "BANK" &&
      method === "CASH" &&
      internalQr
    ) {
      onCancelBank?.(orderId);
      setInternalQr(null);
    }

    setPrevMethod(method);
  }, [method, prevMethod, internalQr, orderId]);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName;
      if (tag === "TEXTAREA") return;

      if (safeTotal <= 0) return;

      if (e.key === "F4") {
        e.preventDefault();
        setMethod((prev) => (prev === "CASH" ? "BANK" : "CASH"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [safeTotal, onClose]);

  return (
    <BaseModal onClose={onClose}>
      <div
        /* Thêm class mx-auto để căn giữa trục ngang */
        className="bg-white rounded-4 shadow overflow-hidden mx-auto"
        style={{
          width: "980px",
          maxWidth: "95vw",
          /* Đảm bảo không có margin lạ từ Bootstrap đè lên */
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
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
                  <div className="small text-danger mt-1">
                    Đã giảm: -{formatCurrency(safeDiscount.totalDiscount)}
                  </div>
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