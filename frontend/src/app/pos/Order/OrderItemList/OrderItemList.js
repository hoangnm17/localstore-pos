import OrderItem from "app/pos/Order/OrderItemList/OrderItem";

const OrderItemList = ({ orderItems, increase, decrease, remove, activeItemId, onChangeQty, focusSignal }) => {
  return (
    <div className="bg-white rounded shadow-sm overflow-hidden">
      <table 
        className="table align-middle mb-0" 
        style={{ tableLayout: "fixed", width: "100%" }} // Cố định layout bảng
      >
        <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
          <tr>
            <th className="text-start" style={{ width: '31%' }}>Sản phẩm</th>
            <th className="text-start" style={{ width: '10%' }}>Đơn vị</th>
            <th className="text-end" style={{ width: '15%' }}>Giá</th>
            <th className="text-center" style={{ width: '20%' }}>Số lượng</th>
            <th className="text-end" style={{ width: '17%' }}>Thành tiền</th>
            <th className="text-center" style={{ width: '7%' }}>Xoá</th>
          </tr>
        </thead>

        <tbody>
          {orderItems.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-5 text-muted">
                <i className="bi bi-cart-x fs-2"></i>
                <p className="mt-2 mb-0 fw-semibold">Đơn hàng chưa có sản phẩm</p>
                <small>Hãy chọn sản phẩm để bắt đầu</small>
              </td>
            </tr>
          ) : (
            orderItems.map((item) => (
              <OrderItem
                key={item.id}
                item={item}
                increase={increase}
                decrease={decrease}
                remove={remove}
                activeItemId={activeItemId}
                onChangeQty={onChangeQty}
                focusSignal={focusSignal}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderItemList;
