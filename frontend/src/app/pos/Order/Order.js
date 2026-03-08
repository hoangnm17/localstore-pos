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
  onBankPaid,
  activeItemId,
  onChangeQty,
  focusSignal,
}) {
  const [showPayment, setShowPayment] = useState(false);

  const handleConfirmPayment = async ({ method, amount, discount }) => {
    try {
      const res = await onPay({
        method,
        amount,
        discount,
      });

      if (res?.paid || res?.success) {
        setShowPayment(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const handleSelectCustomer = (selectedCustomer) => {
    onSelectCustomer(selectedCustomer);
  };

  const isEmpty = orderItems.length === 0;

  return (
    <div
      className="d-flex flex-column h-100 bg-white"
      style={{ borderRight: "1px solid #e5e7eb" }}
    >
      <div className="p-3 border-bottom">
        <CustomerSearch
          invoiceId={orderId}
          customer={customer}
          onSelectCustomer={handleSelectCustomer}
        />
      </div>

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
          customer={customer}
          onClose={() => setShowPayment(false)}
          onConfirm={handleConfirmPayment}
          onBankPaid={() => {
            setShowPayment(false);
            onBankPaid?.(orderId);
          }}
        />
      )}
    </div>
  );
}