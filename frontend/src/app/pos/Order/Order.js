import { useState } from "react";
import { invoiceCreate } from "../../../services/Invoices/invoice.service";
import OrderItemList from "./OrderItemList/OrderItemList";
import PaymentDetail from "./Payment/PaymentDetail";
import CustomerSearch from "./Customer/CustomerSearch";
import PaymentModal from "./Payment/PaymentModal";

export default function Order({ orderItems, increase, decrease, remove }) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentContext, setPaymentContext] = useState(null);

  const handleOpenPayment = (data) => {
    setPaymentContext(data);
    setShowPayment(true);
  };

  const handleConfirmPayment = (paymentInfo) => {
    const payload = {
      items: paymentContext.items,
      customer: paymentContext.customer,
      total: paymentContext.total,
      payment: paymentInfo,
    };

    console.log("POST ORDER:", payload);
    invoiceCreate(payload)
    setShowPayment(false);
  };

  const isEmpty = orderItems.length === 0;

  return (
    <div
      className="d-flex flex-column h-100 bg-white"
      style={{
        borderRight: "1px solid #e5e7eb"
      }}
    >

      {/* HEADER */}
      <div className="p-3 border-bottom">
        <CustomerSearch />
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

      {/* PAYMENT STICKY */}
      <div
        className="p-3 border-top bg-white"
        style={{
          boxShadow: "0 -2px 8px rgba(0,0,0,0.05)"
        }}
      >
        <PaymentDetail
          items={orderItems}
          onOpenPayment={handleOpenPayment} />
      </div>

      {showPayment && (
        <PaymentModal
          total={paymentContext.total}
          onClose={() => setShowPayment(false)}
          onConfirm={handleConfirmPayment}
        />
      )}

    </div>
  );
}
