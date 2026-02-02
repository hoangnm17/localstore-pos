import OrderItem from "./OrderItem";

const OrderItemList = ({ orderItems, increase, decrease, remove }) => {

  return (
    <table className="table table-bordered align-middle w-50">
      <thead className="table-light">
        <tr>
          <th className="text-start">Tên SP</th>
          <th className="text-end">Giá</th>
          <th className="text-center">Số lượng</th>
          <th className="text-end">Thành tiền</th>
          <th className="text-center">Xoá</th>
        </tr>
      </thead>

      <tbody>
        {orderItems.map(item => (
          <OrderItem
            key={item.id}
            item={item}
            increase={increase}
            decrease={decrease}
            remove={remove}
          />
        ))}
      </tbody>
    </table>
  );
};

export default OrderItemList;
