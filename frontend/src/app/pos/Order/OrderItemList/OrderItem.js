import { useEffect, useRef } from "react";
import { formatCurrency } from "utils/formatters";
import { safeParse } from "utils/safeParse";
import { formatQuantityInput } from "utils/quantityValidator";

const OrderItem = ({
  item,
  increase,
  decrease,
  remove,
  activeItemId,
  onChangeQty,
}) => {
  const displayName = item.name ? item.name : item.productName;
  const qty = safeParse(item.quantity);
  const lineTotal = item.unitPrice * qty;
  const qtyRef = useRef(null);

  const handleChange = (e) => {
    const { value } = e.target;
    const finalValue = formatQuantityInput(
      value,
      item.unitType,
      item.quantityOnHand
    );

    onChangeQty(item.id, finalValue);
  };

  const handleBlur = () => {
    let currentQty = safeParse(item.quantity);

    if (currentQty <= 0) {
      currentQty = 1;
    }
    onChangeQty(item.id, currentQty);
  };
  return (
    <tr className="border-top align-middle">
      <td className="text-start">
        <div className="fw-semibold">{displayName}</div>
      </td>

      <td>
        <span className={`badge ${item.unitType === 'WEIGHT' ? 'bg-info' : 'bg-secondary'}`}>
          {item.unitName}
        </span>
      </td>

      <td className="text-end text-muted">
        {formatCurrency(item.unitPrice)}
      </td>

      <td className="text-center">
        <div className="d-inline-flex align-items-center border rounded overflow-hidden">
          <button
            className="btn btn-light btn-sm border-0 rounded-0"
            onClick={() => decrease(item.id)}
            type="button"
          >
            <i className="bi bi-dash"></i>
          </button>

          <input
            ref={qtyRef}
            type="text"
            inputMode={item.unitType === "PIECE" ? "numeric" : "decimal"}
            className="form-control form-control-sm text-center border-0 fw-semibold shadow-none"
            style={{ width: 70 }}
            value={item.quantity}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
          />

          <button
            className="btn btn-light btn-sm border-0 rounded-0"
            onClick={() => increase(item.id)}
            disabled={safeParse(item.quantity) >= item.quantityOnHand}
            type="button"
          >
            <i className="bi bi-plus"></i>
          </button>
        </div>
      </td>

      {/* LINE TOTAL */}
      <td className="text-end fw-bold text-primary">
        {formatCurrency(lineTotal)}
      </td>

      {/* REMOVE ACTION */}
      <td className="text-center">
        <button
          className="btn btn-outline-danger btn-sm border-0"
          onClick={() => remove(item.id)}
          title="Xóa"
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  );
};

export default OrderItem;