import { Link } from "react-router-dom";
import OrderItemList from "./OrderItemList/OrderItemList";
import PaymentDetail from "./Payment/PaymentDetail";
import { useOrderItems } from "../../../hooks/useOrderItems";
import CustomerSearch from "./Customer/CustomerSearch";

export default function SalesHome() {
  const hookOrder = useOrderItems();
  return (
    <div>
      <CustomerSearch />
      <OrderItemList {...hookOrder}/>
      <PaymentDetail items={hookOrder.orderItems} />
    </div>
  );
}
