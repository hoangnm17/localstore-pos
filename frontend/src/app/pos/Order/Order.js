import { useState } from "react";
import OrderItemList from "./OrderItemList/OrderItemList";
import PaymentDetail from "./Payment/PaymentDetail";
import CustomerSearch from "./Customer/CustomerSearch";
import PaymentModal from "./Payment/PaymentModal";

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
  activeItemId,
  onChangeQty,
  focusSignal,
}) {
  const [showPayment, setShowPayment] = useState(false);

  const handleConfirmPayment = async ({ method, amount }) => {
    try {
      const res = await onPay({
        method,
        amount
      });

      if (res?.paid || res?.success) {
        setShowPayment(false);
      }

      if (res?.pending && res?.paymentUrl) {
        window.location.href = res.paymentUrl;
      }

    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const isEmpty = orderItems.length === 0;

const handleSelectCustomer = (selectedCustomer) => {
  onSelectCustomer(selectedCustomer);
};
  return (
    <div
      className="d-flex flex-column h-100 bg-white"
      style={{ borderRight: "1px solid #e5e7eb" }}
    >
      {/* HEADER */}
      <div className="p-3 border-bottom">
        <CustomerSearch
          invoiceId={orderId}
          customer={customer}
          onSelectCustomer={handleSelectCustomer}
        />
      </div>

      {/* ORDER BODY */}
      <div
        className="flex-grow-1 overflow-auto p-3"
        style={{ background: "#f9fafb" }}
      >
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

      {/* PAYMENT */}
      <div
        className="p-3 border-top bg-white"
        style={{ boxShadow: "0 -2px 8px rgba(0,0,0,0.05)" }}
      >
        <PaymentDetail
          items={orderItems}
          total={total}
          totalQuantity={totalQuantity}
          disabled={isEmpty}
          onOpenPayment={() => setShowPayment(true)}
        />
      </div>

      {showPayment && (
        <PaymentModal
          orderId={orderId}
          total={total}
          onClose={() => setShowPayment(false)}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  );
}