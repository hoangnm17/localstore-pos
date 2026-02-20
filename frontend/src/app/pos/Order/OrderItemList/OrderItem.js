const OrderItem = ({ item, increase, decrease, remove }) => {
  return (
    <tr className="border-top">

      {/* PRODUCT NAME */}
      <td className="text-start">
        <div className="fw-semibold">{item.productName}</div>
        {item.variant && (
          <small className="text-muted">{item.variant}</small>
        )}
      </td>

      {/* UNIT PRICE */}
      <td className="text-end text-muted">
        {Number(item.unitPrice || 0).toLocaleString()} đ
      </td>

      {/* QUANTITY */}
      <td className="text-center">

        <div className="d-inline-flex align-items-center border rounded">

          <button
            className="btn btn-light btn-sm border-0"
            onClick={() => decrease(item.id)}
          >
            <i className="bi bi-dash"></i>
          </button>

          <span
            className="px-2 fw-semibold"
            style={{ minWidth: 30 }}
          >
            {item.quantity}
          </span>

          <button
            className="btn btn-light btn-sm border-0"
            onClick={() => increase(item.id)}
          >
            <i className="bi bi-plus"></i>
          </button>

        </div>

      </td>

      {/* LINE TOTAL */}
      <td className="text-end fw-semibold">
         {(item.unitPrice * item.quantity).toLocaleString()} đ
      </td>

      {/* REMOVE */}
      <td className="text-center">

        <button
          className="btn btn-light btn-sm border text-danger"
          onClick={() => remove(item.id)}
        >
          <i className="bi bi-trash"></i>
        </button>

      </td>

    </tr>
  );
};

export default OrderItem;
