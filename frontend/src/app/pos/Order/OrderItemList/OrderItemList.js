import OrderItem from "app/pos/Order/OrderItemList/OrderItem";

const OrderItemList = ({ orderItems, increase, decrease, remove }) => {
  return (
    <div className="bg-white rounded shadow-sm overflow-hidden">

      <table className="table align-middle mb-0">

        {/* HEADER */}
        <thead
          className="table-light"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1
          }}
        >
          <tr>
            <th className="text-start">Sản phẩm</th>
            <th className="text-end">Giá</th>
            <th className="text-center">Số lượng</th>
            <th className="text-end">Thành tiền</th>
            <th className="text-center">Xoá</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>

          {orderItems.length === 0 ? (
            <tr>
              <td colSpan="5">
                <div className="text-center py-5 text-muted">

                  <i className="bi bi-cart-x fs-2"></i>

                  <p className="mt-2 mb-0 fw-semibold">
                    Đơn hàng chưa có sản phẩm
                  </p>

                  <small>Hãy chọn sản phẩm để bắt đầu</small>

                </div>
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
              />
            ))
          )}

        </tbody>

      </table>
    </div>
  );
};

export default OrderItemList;
