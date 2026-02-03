import OrderItemList from "./OrderItemList/OrderItemList";
import PaymentDetail from "./Payment/PaymentDetail";
import CustomerSearch from "./Customer/CustomerSearch";

export default function Order({ orderItems, increase, decrease, remove }) {

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
        <PaymentDetail items={orderItems} />
      </div>

    </div>
  );
}
