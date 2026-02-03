import Order from "./Order/Order";
import Product from "./Product/Product";
import { useOrderItems } from "../../hooks/useOrderItems";

export default function SalesHome() {
  const hookOrder = useOrderItems();

  return (
    <div className="vh-100 d-flex bg-light">
      
      {/* LEFT – ORDER */}
      <div
        className="bg-white border-end d-flex flex-column"
        style={{ flex: 4 }}
      >
        <Order {...hookOrder} />
      </div>

      {/* RIGHT – PRODUCT */}
      <div
        className="d-flex flex-column"
        style={{ flex: 6 }}
      >
        <Product addItem={hookOrder.addItem} />
      </div>

    </div>
  );
}
