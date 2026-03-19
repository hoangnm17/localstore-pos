import { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "utils/formatters";
import { getVoucherByCode, getPromotions } from "services/crm.service";

const POINT_RATE = 100; // 1 point = 100đ

export default function OrderDiscount({
  subtotal = 0,
  customer = null,
  onChange = () => { }
}) {

  const safeSubtotal = useMemo(() => Number(subtotal) || 0, [subtotal]);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucher, setVoucher] = useState(null);

  const [promotions, setPromotions] = useState([]);
  const [promotion, setPromotion] = useState(null);

  const [pointUsed, setPointUsed] = useState(0);

  /* ================= LOAD PROMOTIONS ================= */

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const res = await getPromotions({ status: "Active" });
        setPromotions(res?.data || []);
      } catch (err) {
        console.error("Load promotions error", err);
      }
    };

    loadPromotions();
  }, []);

  /* ================= CHECK VOUCHER ================= */

  const handleCheckVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) return;

    try {
      const res = await getVoucherByCode(code);

      if (!res?.data) {
        alert("Voucher không hợp lệ");
        setVoucher(null);
        return;
      }

      setVoucher(res.data);
    } catch (err) {
      console.error("Voucher error", err);
      alert("Không kiểm tra được voucher");
    }
  };

  /* ================= COMPUTE DISCOUNT (POS ORDER) =================
     Order: Voucher -> Promotion -> Points
     And never exceed subtotal
  ================================================================ */

  const voucherDiscount = useMemo(() => {
    if (!voucher) return 0;

    const type = (voucher.type || "Fixed").toLowerCase();
    const value = Number(voucher.value) || 0;

    const raw =
      type === "percent"
        ? Math.floor((safeSubtotal * value) / 100)
        : value;

    return Math.min(raw, safeSubtotal);
  }, [voucher, safeSubtotal]);

  const promotionDiscount = useMemo(() => {
    if (!promotion) return 0;

    const type = (promotion.type || "Fixed").toLowerCase();
    const value = Number(promotion.value) || 0;

    const raw =
      type === "percent"
        ? Math.floor((safeSubtotal * value) / 100)
        : value;

    const remaining = Math.max(safeSubtotal - voucherDiscount, 0);

    return Math.min(raw, remaining);
  }, [promotion, safeSubtotal, voucherDiscount]);

  const remainingAfterVoucherPromo = useMemo(() => {
    return Math.max(safeSubtotal - voucherDiscount - promotionDiscount, 0);
  }, [safeSubtotal, voucherDiscount, promotionDiscount]);

  // Compute point discount with remaining cap + convert back to actualPointUsed
  const { pointDiscount, actualPointUsed } = useMemo(() => {
    const maxPoints = Number(customer?.loyaltyPoints || 0);

    const desiredPoints = Math.max(0, Number(pointUsed) || 0);
    const safePoints = Math.min(desiredPoints, maxPoints);

    const rawDiscount = safePoints * POINT_RATE;

    const appliedDiscount = Math.min(rawDiscount, remainingAfterVoucherPromo);

    const used = Math.floor(appliedDiscount / POINT_RATE);

    return {
      pointDiscount: used * POINT_RATE,
      actualPointUsed: used
    };
  }, [pointUsed, customer?.loyaltyPoints, remainingAfterVoucherPromo]);

  // Keep input pointUsed in sync with actualPointUsed (auto reduce when remaining becomes 0)
  useEffect(() => {
    if (pointUsed !== actualPointUsed) {
      setPointUsed(actualPointUsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualPointUsed]);

  const totalDiscount = useMemo(() => {
    return Math.min(voucherDiscount + promotionDiscount + pointDiscount, safeSubtotal);
  }, [voucherDiscount, promotionDiscount, pointDiscount, safeSubtotal]);

  const finalAmount = useMemo(() => {
    return Math.max(safeSubtotal - totalDiscount, 0);
  }, [safeSubtotal, totalDiscount]);

  /* ================= EMIT ================= */

  useEffect(() => {
    onChange({
      pointUsed: actualPointUsed,
      voucherId: voucher?.id ?? null,
      promotionId: promotion?.id ?? null,
      totalDiscount,
      finalAmount
    });
  }, [actualPointUsed, voucher, promotion, totalDiscount, finalAmount, onChange]);

  /* ================= UI HANDLERS ================= */

  const handlePointInput = (val) => {
    const maxPoints = Number(customer?.loyaltyPoints || 0);
    const n = Number(val);

    if (!Number.isFinite(n)) {
      setPointUsed(0);
      return;
    }

    const safe = Math.max(0, Math.min(Math.floor(n), maxPoints));
    setPointUsed(safe);
  };

  const clearAll = () => {
    setVoucherCode("");
    setVoucher(null);
    setPromotion(null);
    setPointUsed(0);
  };

  return (
    <div className="border rounded-4 p-3">

      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="fw-semibold">Giảm giá</div>
        <button className="btn btn-sm btn-outline-secondary" onClick={clearAll}>
          Xóa áp dụng
        </button>
      </div>

      {/* POINT */}
      <div className="mb-3">
        <div className="fw-semibold mb-1">Điểm tích lũy</div>

        {customer ? (
          <>
            <div className="small text-muted mb-2">
              Bạn có {customer.loyaltyPoints || 0} điểm
            </div>

            <div className="d-flex gap-2">
              <input
                type="number"
                className="form-control"
                value={pointUsed}
                min={0}
                max={customer.loyaltyPoints || 0}
                disabled={remainingAfterVoucherPromo <= 0}
                onChange={(e) => handlePointInput(e.target.value)}
              />

              <div className="text-danger fw-semibold d-flex align-items-center">
                -{formatCurrency(pointDiscount)}
              </div>
            </div>

            {remainingAfterVoucherPromo <= 0 && (
              <div className="small text-muted mt-1">
                Đơn đã được giảm hết, không cần dùng điểm.
              </div>
            )}
          </>
        ) : (
          <div className="small text-muted">Chọn khách hàng để dùng điểm.</div>
        )}
      </div>

      {/* VOUCHER */}
      <div className="mb-3">
        <div className="fw-semibold mb-2">Voucher</div>

        <div className="d-flex gap-2 mb-2">
          <input
            className="form-control"
            placeholder="Nhập mã voucher"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCheckVoucher();
            }}
          />

          <button className="btn btn-primary" onClick={handleCheckVoucher}>
            Áp dụng
          </button>
        </div>

        {voucher && (
          <div className="border rounded p-2 bg-light d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">{voucher.code}</div>
              <small className="text-danger">
                -{formatCurrency(voucherDiscount)}
              </small>
            </div>

            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => setVoucher(null)}
              title="Bỏ voucher"
            >
              X
            </button>
          </div>
        )}
      </div>

      {/* PROMOTIONS */}
      <div className="mb-3">
        <div className="fw-semibold mb-2">Khuyến mãi</div>

        {promotions.length === 0 && (
          <div className="small text-muted">Không có khuyến mãi khả dụng.</div>
        )}

        {promotions
          .filter(p => {
              // Nếu khuyến mãi này đã được tính trực tiếp vào từng sản phẩm rồi thì không hiện ở đây nữa
              const isAppliedToItems = (id) => {
                  // Bạn có thể thêm logic kiểm tra ở đây, nhưng đơn giản nhất là 
                  // chỉ hiện những KM không phải loại áp lên Sản phẩm/Danh mục cụ thể 
                  // Hoặc nếu bạn muốn thủ công, hãy để người dùng chọn.
                  return false; 
              };
              return !isAppliedToItems(p.id);
          })
          .map((p) => {
          const raw =
            (p.type || "").toLowerCase() === "percent"
              ? Math.floor((safeSubtotal * (Number(p.value) || 0)) / 100)
              : Number(p.value) || 0;

          // Display computed with remaining after voucher (same as actual calc)
          const remaining = Math.max(safeSubtotal - voucherDiscount, 0);
          const displayDiscount = Math.min(raw, remaining);

          return (
            <div
              key={p.id}
              className={`border rounded p-2 mb-2 d-flex justify-content-between align-items-center ${promotion?.id === p.id ? "border-primary bg-light" : ""
                }`}
            >
              <div>
                <div className="fw-semibold">{p.name}</div>
                <small className="text-danger">
                  -{formatCurrency(displayDiscount)}
                </small>
              </div>

              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setPromotion(promotion?.id === p.id ? null : p)}
              >
                {promotion?.id === p.id ? "Bỏ" : "Áp dụng"}
              </button>
            </div>
          );
        })}
      </div>

      {/* SUMMARY */}
      <div className="border-top pt-2">
        <div className="d-flex justify-content-between">
          <span>Tổng giảm</span>
          <span className="text-danger fw-semibold">
            -{formatCurrency(totalDiscount)}
          </span>
        </div>

        <div className="d-flex justify-content-between fw-bold">
          <span>Thanh toán</span>
          <span>{formatCurrency(finalAmount)}</span>
        </div>
      </div>
    </div>
  );
}