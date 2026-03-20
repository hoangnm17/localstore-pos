import { useState, useEffect, useCallback } from "react";
import OrderItemList from "./OrderItemList/OrderItemList";
import PaymentDetail from "./Payment/PaymentDetail";
import CustomerSearch from "./Customer/CustomerSearch";
import PaymentModal from "./Payment/PaymentModal";
import Bill from "components/pos/Sale/Bill";
import { invoiceGetDetail } from "services/Invoices/invoice.service";
import { cancelPendingPayment } from "services/Payment/payment.service";
import useHotkeys from "hooks/pos/useHotKeys";

export default function Order({
  orderId,
  orderItems = [],
  customer = null,
  total = 0, // Đảm bảo mặc định là 0
  totalQuantity = 0,
  increase,
  decrease,
  remove,
  onSelectCustomer,
  onPay,
  onBankPaid: onParentBankPaid,
  activeItemId,
  onChangeQty,
  focusSignal,
  openPaymentSignal,
}) {
  const [showPayment, setShowPayment] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const [billData, setBillData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset QR khi đổi đơn hàng, tránh nhầm lẫn dữ liệu cũ
  useEffect(() => {
    setQrData(null);
  }, [orderId]);

  // Chỉ mở payment khi có sản phẩm và tín hiệu hợp lệ
  useEffect(() => {
    if (openPaymentSignal > 0 && orderItems?.length > 0) {
      setShowPayment(true);
    }
  }, [openPaymentSignal, orderItems?.length]);

  useHotkeys(
    {
      enter: () => {
        if (showBill && billData) {
          setShowBill(false);
          onParentBankPaid?.(billData?.id);
        }
      },
    },
    {
      enabled: showBill,
    }
  );

  const fetchAndShowBill = useCallback(async (id) => {
    if (!id) return; // Chặn lỗi nếu id truyền vào rỗng
    try {
      const res = await invoiceGetDetail(id);
      const invoice = res?.data?.data || res?.data || res;
      if (invoice) {
        setBillData(invoice);
        setShowBill(true);
      }
    } catch (err) {
      console.error("Load bill error:", err);
    }
  }, []);

  const handleCancelBank = async (invoiceId) => {
    if (!invoiceId) return;
    try {
      await cancelPendingPayment(invoiceId);
    } catch (err) {
      console.error("Cancel bank error:", err);
    }
  };

  const handleConfirmPayment = async (paymentData) => {
    // FIX: Chặn click liên tục hoặc bấm khi giỏ hàng trống/đang load
    if (submitting || !orderItems || orderItems.length === 0) {
        return { success: false, message: "No items to pay" };
    }

    try {
      setSubmitting(true);

      const res = await onPay(paymentData);

      // Nếu API trả về lỗi hoặc không có phản hồi
      if (!res) throw new Error("Payment failed to initialize");

      if (res.pending) {
        setQrData(res.qr);
        return res;
      }

      // Xử lý khi thanh toán thành công (Tiền mặt hoặc ví đã trừ tiền)
      if (res.paid || res.success) {
        setShowPayment(false);
        setQrData(null);

        // Ưu tiên lấy ID từ kết quả trả về, nếu không có mới dùng orderId hiện tại
        const finalInvoiceId = res?.data?.id || res?.id || orderId;
        await fetchAndShowBill(finalInvoiceId);
      }

      return res;
    } catch (error) {
      console.error("Payment error:", error);
      // Bạn có thể thêm alert hoặc toast thông báo lỗi tại đây
    } finally {
      setSubmitting(false);
    }
  };

  const handleBankPaidSuccess = useCallback(
    async (payload) => {
      setShowPayment(false);
      setQrData(null);
      if (payload?.invoiceId) {
        await fetchAndShowBill(payload.invoiceId);
      }
    },
    [fetchAndShowBill]
  );

  return (
    <div className="d-flex flex-column h-100 bg-white border-end">
      <div className="p-3 border-bottom">
        <CustomerSearch
          invoiceId={orderId}
          customer={customer}
          onSelectCustomer={onSelectCustomer}
        />
      </div>

      <div className="flex-grow-1 overflow-auto p-3 bg-light">
        <OrderItemList
          orderItems={orderItems}
          increase={increase}
          decrease={decrease}
          remove={remove}
          activeItemId={activeItemId}
          onChangeQty={onChangeQty}
          focusSignal={focusSignal}
        />
      </div>

      <div className="p-3 border-top bg-white shadow-sm">
        <PaymentDetail
          items={orderItems}
          total={total}
          totalQuantity={totalQuantity}
          disabled={!orderItems || orderItems.length === 0 || submitting}
          onOpenPayment={() => setShowPayment(true)}
        />
      </div>

      {showPayment && (
        <PaymentModal
          orderId={orderId}
          total={total}
          customer={customer}
          qr={qrData}
          submitting={submitting}
          onClose={() => {
            if (!submitting) { // Không cho đóng modal khi đang xử lý payment ngầm
                setShowPayment(false);
                setQrData(null);
            }
          }}
          onConfirm={handleConfirmPayment}
          onBankPaid={handleBankPaidSuccess}
          onCancelBank={handleCancelBank}
        />
      )}

      {showBill && billData && (
        <Bill
          invoice={billData}
          onClose={() => {
            setShowBill(false);
            onParentBankPaid?.(billData.id);
          }}
          autoPrint={true}
        />
      )}
    </div>
  );
}