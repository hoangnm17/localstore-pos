import { useEffect, useRef } from "react";
import { formatCurrency } from "utils/formatters";
import { safeParse } from "utils/safeParse";

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
  const qty = safeParse(item.quantity);
  const lineTotal = item.unitPrice * qty;

  const qtyRef = useRef(null);

  useEffect(() => {
    if (activeItemId === item.id && qtyRef.current) {
      requestAnimationFrame(() => {
        qtyRef.current.focus();
        qtyRef.current.select();
      });
    }
  }, [activeItemId, focusSignal]);

  const handleChange = (e) => {
    const { value } = e.target;
    let formattedValue = value;

    if (item.unitType === "PIECE") {
      formattedValue = value.replace(/\D/g, "");
    } else {
      formattedValue = value.replace(/[^0-9.]/g, "");
      const parts = formattedValue.split(".");
      if (parts.length > 2) {
        formattedValue = parts[0] + "." + parts.slice(1).join("");
      }
    }

    if (formattedValue === "" || formattedValue === ".") {
      onChangeQty(item.id, formattedValue);
      return;
    }

    let number = parseFloat(formattedValue);
    if (number > item.quantityOnHand) {
      number = item.quantityOnHand;
      formattedValue = number.toString();
    }
    if (number < 0) {
      number = 0;
      formattedValue = "0";
    }
    const finalValue = (item.unitType === "WEIGHT" && formattedValue.includes("."))
      ? formattedValue
      : number;

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
        {(item.variant || item.code) && (
          <small className="text-muted">
            {item.code} {item.variant ? `| ${item.variant}` : ""}
          </small>
        )}
      </td>

      <td>
        <span className={`badge ${item.unitType === 'WEIGHT' ? 'bg-info' : 'bg-secondary'}`}>
          {item.unitName}
        </span>
      </td>

      {/* UNIT PRICE */}
      <td className="text-end text-muted">
        {formatCurrency(item.unitPrice)}
      </td>

      {/* QUANTITY CONTROL */}
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