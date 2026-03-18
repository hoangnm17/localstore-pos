import { useState, useEffect, useCallback } from "react";
import OrderItemList from "./OrderItemList/OrderItemList";
import PaymentDetail from "./Payment/PaymentDetail";
import CustomerSearch from "./Customer/CustomerSearch";
import PaymentModal from "./Payment/PaymentModal";
import Bill from "components/pos/Sale/Bill";
import { invoiceGetDetail } from "services/Invoices/invoice.service";
import { cancelPendingPayment } from "services/Payment/payment.service"
import useHotkeys from "hooks/pos/useHotKeys";

export default function Order({
  orderId,
  orderItems = [],
  customer = null,
  total,
  totalQuantity,
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

  useEffect(() => {
    setQrData(null);
  }, [orderId]);

  useEffect(() => {
    if (openPaymentSignal > 0 && orderItems.length > 0) {
      setShowPayment(true);
    }
  }, [openPaymentSignal, orderItems.length]);

  useHotkeys(
    {
      enter: () => {
        if (showBill) {
          setShowBill(false);
          onParentBankPaid?.(billData?.id);
        }
      }
    },
    {
      enabled: showBill
    }
  );

  const fetchAndShowBill = useCallback(async (id) => {
    try {
      const res = await invoiceGetDetail(id);
      const invoice = res?.data?.data || res?.data || res;
      setBillData(invoice);
      setShowBill(true);
    } catch (err) {
      console.error("Load bill error:", err);
    }
  }, []);

  const handleCancelBank = async (invoiceId) => {
    try {
      await cancelPendingPayment(invoiceId);
    } catch (err) {
      console.error("Cancel bank error:", err);
    }
  };

  const handleConfirmPayment = async (paymentData) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const res = await onPay(paymentData);

      if (res?.pending) {
        setQrData(res.qr);
        return res;
      }

      if (res?.paid || res?.success) {
        setShowPayment(false);
        setQrData(null);

        const finalInvoiceId = res?.data?.id || res?.id || orderId;
        await fetchAndShowBill(finalInvoiceId);
      }

      return res;
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBankPaidSuccess = useCallback(async (payload) => {
    setShowPayment(false);
    setQrData(null);
    await fetchAndShowBill(payload.invoiceId);
  }, [fetchAndShowBill]);

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
          disabled={orderItems.length === 0}
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
            setShowPayment(false);
            setQrData(null);
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
          }
          }
          autoPrint={true}
        />
      )}
    </div>
  );
}