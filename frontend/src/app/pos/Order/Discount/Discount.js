import { useState, useEffect } from "react";

export default function OrderDiscount({
  subtotal = 0,
  customer = null,
  onChange,
}) {
  const [activeTab, setActiveTab] = useState("POINT");

  const [pointUsed, setPointUsed] = useState(0);
  const [voucher, setVoucher] = useState(null);
  const [voucherInput, setVoucherInput] = useState("");

  const [manualType, setManualType] = useState("AMOUNT"); // AMOUNT | PERCENT
  const [manualValue, setManualValue] = useState(0);

  /* ================= POINT CALC ================= */

  const pointRate = 100; // 1 point = 100đ
  const maxPoint = customer?.points || 0;

  const pointDiscount = Math.min(pointUsed * pointRate, subtotal);

  /* ================= VOUCHER CALC ================= */

  const voucherDiscount = voucher
    ? voucher.type === "PERCENT"
      ? Math.min((subtotal * voucher.value) / 100, subtotal)
      : Math.min(voucher.value, subtotal)
    : 0;

  /* ================= MANUAL CALC ================= */

  const manualDiscount =
    manualType === "PERCENT"
      ? Math.min((subtotal * manualValue) / 100, subtotal)
      : Math.min(manualValue, subtotal);

  /* ================= TOTAL ================= */

  const totalDiscount =
    pointDiscount + voucherDiscount + manualDiscount;

  const finalAmount = Math.max(subtotal - totalDiscount, 0);

  /* ================= EMIT ================= */

  useEffect(() => {
    onChange?.({
      pointUsed,
      pointDiscount,
      voucherCode: voucher?.code || null,
      voucherDiscount,
      manualType,
      manualValue,
      manualDiscount,
      totalDiscount,
      finalAmount,
    });
  }, [
    pointUsed,
    voucher,
    manualValue,
    manualType,
    subtotal,
  ]);

  /* ================= MOCK CHECK VOUCHER ================= */
  const handleApplyVoucher = () => {
    // MOCK DATA (sau này call API)
    const mockVouchers = [
      { code: "SUMMER10", type: "PERCENT", value: 10 },
      { code: "50KOFF", type: "AMOUNT", value: 50000 },
    ];

    const found = mockVouchers.find(
      (v) => v.code === voucherInput.trim().toUpperCase()
    );

    if (!found) {
      alert("Voucher không hợp lệ");
      return;
    }

    setVoucher(found);
  };

  /* ================= UI ================= */

  return (
    <div className="card p-3 mt-3">
      <h5 className="mb-3">Discount</h5>

      {/* TABS */}
      <div className="d-flex gap-2 mb-3">
        <button
          className={`btn btn-sm ${
            activeTab === "POINT" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("POINT")}
        >
          Điểm
        </button>
        <button
          className={`btn btn-sm ${
            activeTab === "VOUCHER" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("VOUCHER")}
        >
          Voucher
        </button>
        <button
          className={`btn btn-sm ${
            activeTab === "MANUAL" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("MANUAL")}
        >
          Giảm tay
        </button>
      </div>

      {/* POINT TAB */}
      {activeTab === "POINT" && (
        <div>
          {customer ? (
            <>
              <p>Điểm hiện có: <strong>{maxPoint}</strong></p>
              <input
                type="number"
                className="form-control"
                placeholder="Nhập số điểm dùng"
                value={pointUsed}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= maxPoint) setPointUsed(val);
                }}
              />
              <small className="text-muted">
                Giảm: {pointDiscount.toLocaleString()} đ
              </small>
            </>
          ) : (
            <p className="text-muted">
              Chọn khách hàng để dùng điểm
            </p>
          )}
        </div>
      )}

      {/* VOUCHER TAB */}
      {activeTab === "VOUCHER" && (
        <div>
          <div className="d-flex gap-2">
            <input
              className="form-control"
              placeholder="Nhập mã voucher"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value)}
            />
            <button
              className="btn btn-success"
              onClick={handleApplyVoucher}
            >
              Áp dụng
            </button>
          </div>

          {voucher && (
            <div className="mt-2 alert alert-success d-flex justify-content-between align-items-center">
              <span>
                {voucher.code} - Giảm{" "}
                {voucher.type === "PERCENT"
                  ? `${voucher.value}%`
                  : `${voucher.value.toLocaleString()} đ`}
              </span>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => setVoucher(null)}
              >
                X
              </button>
            </div>
          )}
        </div>
      )}

      {/* MANUAL TAB */}
      {activeTab === "MANUAL" && (
        <div>
          <div className="d-flex gap-3 mb-2">
            <label>
              <input
                type="radio"
                checked={manualType === "AMOUNT"}
                onChange={() => setManualType("AMOUNT")}
              />
              Giảm tiền
            </label>
            <label>
              <input
                type="radio"
                checked={manualType === "PERCENT"}
                onChange={() => setManualType("PERCENT")}
              />
              Giảm %
            </label>
          </div>

          <input
            type="number"
            className="form-control"
            value={manualValue}
            onChange={(e) => setManualValue(Number(e.target.value))}
          />

          <small className="text-muted">
            Giảm: {manualDiscount.toLocaleString()} đ
          </small>
        </div>
      )}

      {/* SUMMARY */}
      <hr />
      <div className="d-flex justify-content-between">
        <span>Tạm tính:</span>
        <strong>{subtotal.toLocaleString()} đ</strong>
      </div>
      <div className="d-flex justify-content-between text-danger">
        <span>Tổng giảm:</span>
        <strong>- {totalDiscount.toLocaleString()} đ</strong>
      </div>
      <div className="d-flex justify-content-between fs-5 mt-2">
        <span>Thanh toán:</span>
        <strong>{finalAmount.toLocaleString()} đ</strong>
      </div>
    </div>
  );
}