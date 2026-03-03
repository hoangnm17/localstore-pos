import { useEffect, useRef } from "react";
import { formatCurrency } from "utils/formatters";

const OrderItem = ({
  item,
  increase,
  decrease,
  remove,
  activeItemId,
  onChangeQty,
  focusSignal,
}) => {

  const displayName = item.name ? item.name : item.productName;
  const lineTotal = (item.unitPrice || 0) * item.quantity;

  const qtyRef = useRef(null);

  /* ================================
     AUTO FOCUS KHI VỪA ADD
  ================================= */
  useEffect(() => {
    if (activeItemId === item.id && qtyRef.current) {
      requestAnimationFrame(() => {
        qtyRef.current.focus();
        qtyRef.current.select();
      });
    }
  }, [activeItemId, focusSignal]);

  /* ================================
     CHANGE QUANTITY
  ================================= */
  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const number = value === "" ? 1 : Number(value);

    if (number >= 1) {
      onChangeQty(item.id, number);
    }
  };

  return (
    <tr className="border-top">

      {/* PRODUCT NAME */}
      <td className="text-start">
        <div className="fw-semibold">{displayName}</div>
        {item.variant && (
          <small className="text-muted">{item.variant}</small>
        )}
      </td>

      {/* UNIT PRICE */}
      <td className="text-end text-muted">
        {formatCurrency(item.unitPrice)}
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

          <input
            ref={qtyRef}
            type="text"
            inputMode="numeric"
            className="form-control form-control-sm text-center border-0 fw-semibold"
            style={{ width: 60 }}
            value={item.quantity}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
          />

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
        {formatCurrency(lineTotal)}
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