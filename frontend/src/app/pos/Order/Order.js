import { useState, useMemo } from "react";
import { invoiceCreate } from "../../../services/Invoices/invoice.service";
import OrderItemList from "./OrderItemList/OrderItemList";
import PaymentDetail from "./Payment/PaymentDetail";
import CustomerSearch from "./Customer/CustomerSearch";
import PaymentModal from "./Payment/PaymentModal";

export default function Order({
  orderItems = [],
  customer = null,
  increase,
  decrease,
  remove,
}) {
  const [showPayment, setShowPayment] = useState(false);

  // ✅ Tính total trực tiếp từ items
  const total = useMemo(() => {
    return orderItems.reduce(
      (sum, item) =>
        // 🔥 SỬA: dùng unitPrice thay vì price để đồng nhất toàn hệ thống
        sum + (item.unitPrice || 0) * item.quantity,
      0
    );
  }, [orderItems]);

  const handleConfirmPayment = async (paymentInfo) => {
    const payload = {
      items: orderItems,   // lấy trực tiếp từ props
      customer,
      total,
      payment: paymentInfo,
    };

    await invoiceCreate(payload);

    setShowPayment(false);
  };

  const isEmpty = orderItems.length === 0;

  return (
    <div
      className="d-flex flex-column h-100 bg-white"
      style={{ borderRight: "1px solid #e5e7eb" }}
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

      {/* PAYMENT */}
      <div
        className="p-3 border-top bg-white"
        style={{ boxShadow: "0 -2px 8px rgba(0,0,0,0.05)" }}
      >
        <PaymentDetail
          items={orderItems}
          total={total}
          disabled={isEmpty}
          onOpenPayment={() => setShowPayment(true)}
        />
      </div>

      {showPayment && (
        <PaymentModal
          total={total}
          onClose={() => setShowPayment(false)}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  );
}