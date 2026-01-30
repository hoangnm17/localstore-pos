const OrderItem = ({ item, increase, decrease, remove }) => {
  return (
    <tr className="align-middle">
      <td className="text-start">{item.productName}</td>

      <td className="text-end">
        {item.unitPrice.toLocaleString()}
      </td>

      <td className="text-center">
        <button
          className="btn btn-outline-secondary btn-sm me-1"
          onClick={() => decrease(item.id)}
        >
          <i className="bi bi-dash"></i>
        </button>

        <span className="fw-semibold mx-2">
          {item.quantity}
        </span>

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => increase(item.id)}
        >
          <i className="bi bi-plus"></i>
        </button>
      </td>

      <td className="text-end">
        {item.lineTotal.toLocaleString()}
      </td>

      <td className="text-center">
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => remove(item.id)}
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  );
};

export default OrderItem;
