import Order from "./Order/Order"
import Product from "./Product/Product";

export default function SalesHome() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 4 }}>
        <Order />
      </div>
      <div style={{ flex: 6 }}>
        <Product />
      </div>
    </div>
  );
}
