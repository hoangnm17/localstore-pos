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

  // Auto focus và select khi item được kích hoạt
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
    console.log(item)
    if (item.unitType === "PIECE") {
      // Chỉ cho phép nhập số nguyên: loại bỏ tất cả ký tự không phải số
      formattedValue = value.replace(/\D/g, "");
    } else {
      // unitType === "WEIGHT": Cho phép số thực
      // Loại bỏ ký tự lạ, chỉ giữ lại số và tối đa 1 dấu chấm
      formattedValue = value.replace(/[^0-9.]/g, "");
      const parts = formattedValue.split(".");
      if (parts.length > 2) {
        formattedValue = parts[0] + "." + parts.slice(1).join("");
      }
    }

    // Trường hợp đang gõ dở: để trống hoặc chỉ có dấu chấm
    if (formattedValue === "" || formattedValue === ".") {
      onChangeQty(item.id, formattedValue);
      return;
    }

    let number = parseFloat(formattedValue);

    // Kiểm tra giới hạn tồn kho (quantityOnHand)
    if (number > item.quantityOnHand) {
      number = item.quantityOnHand;
      formattedValue = number.toString();
    }

    // Không cho phép số âm
    if (number < 0) {
      number = 0;
      formattedValue = "0";
    }

    // Nếu đang gõ số thập phân (ví dụ "1.") thì truyền chuỗi để giữ giao diện
    const finalValue = (item.unitType === "WEIGHT" && formattedValue.includes("."))
      ? formattedValue
      : number;

    onChangeQty(item.id, finalValue);
  };

  const handleBlur = () => {
    // Khi thoát khỏi input, nếu giá trị không hợp lệ thì reset về 1
    const currentQty = parseFloat(item.quantity);
    if (isNaN(currentQty) || currentQty <= 0) {
      onChangeQty(item.id, 1);
    }
  };

  return (
    <tr className="border-top align-middle">
      {/* PRODUCT NAME */}
      <td className="text-start">
        <div className="fw-semibold">{displayName}</div>
        {(item.variant || item.code) && (
          <small className="text-muted">
            {item.code} {item.variant ? `| ${item.variant}` : ""}
          </small>
        )}
      </td>

      {/* UNIT NAME */}
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
            disabled={item.quantity >= item.quantityOnHand}
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