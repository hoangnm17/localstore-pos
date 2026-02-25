import { useState } from "react";
import { createPayment } from "services/Payment/payment.service";
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
}) {
  const [showPayment, setShowPayment] = useState(false);

  const handleConfirmPayment = async ({ method, customerPay }) => {
    const payload = {
      orderId: orderId,
      method: method,
      customerPay: customerPay,
    };

    await createPayment(payload);

    setShowPayment(false);
  };

  const isEmpty = orderItems.length === 0;

  const handleSelectCustomer = async (selectedCustomer) => {
    try {
      if (!selectedCustomer) return;

      onSelectCustomer(selectedCustomer);
      // await attachCustomerToInvoice(orderId, selectedCustomer.id);

    } catch (error) {
      console.error("Attach customer error:", error);
    }
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