import { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "utils/formatters";
import { getVoucherByCode, getPromotions } from "services/crm.service";

const POINT_RATE = 100;

export default function OrderDiscount({
  subtotal = 0,
  customer = null,
  onChange = () => { }
}) {
  const safeSubtotal = useMemo(() => Number(subtotal) || 0, [subtotal]);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [error, setError] = useState(null);

  const [promotions, setPromotions] = useState([]);
  const [promotion, setPromotion] = useState(null);

  const [pointUsed, setPointUsed] = useState(0);

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

  const handleCheckVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) return;

    setError(null);

    try {
      const res = await getVoucherByCode(code, safeSubtotal);

      if (!res?.data) {
        setError("Voucher không hợp lệ");
        setVoucher(null);
        return;
      }

      setVoucher(res.data);
      setVoucherCode("");
    } catch (err) {
      console.error("Voucher error", err);
      const errMsg = err.response?.data?.message || "Không kiểm tra được voucher";
      setError(errMsg);
      setVoucher(null);
    }
  };


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

  useEffect(() => {
    if (pointUsed !== actualPointUsed) {
      setPointUsed(actualPointUsed);
    }
  }, [actualPointUsed]);

  const totalDiscount = useMemo(() => {
    return Math.min(voucherDiscount + promotionDiscount + pointDiscount, safeSubtotal);
  }, [voucherDiscount, promotionDiscount, pointDiscount, safeSubtotal]);

  const finalAmount = useMemo(() => {
    return Math.max(safeSubtotal - totalDiscount, 0);
  }, [safeSubtotal, totalDiscount]);

  useEffect(() => {
    onChange({
      pointUsed: actualPointUsed,
      voucherId: voucher?.id ?? null,
      promotionId: promotion?.id ?? null,
      totalDiscount,
      finalAmount
    });
  }, [actualPointUsed, voucher, promotion, totalDiscount, finalAmount, onChange]);

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
    setError(null);
  };

  return (
    <div className="border rounded-4 p-3 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-bold">Giảm giá & Ưu đãi</div>
        <button className="btn btn-sm btn-outline-secondary" onClick={clearAll}>
          Xóa áp dụng
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small d-flex justify-content-between align-items-center mb-3">
          <span>{error}</span>
          <button type="button" className="btn-close" style={{ fontSize: '0.5rem' }} onClick={() => setError(null)}></button>
        </div>
      )}

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
          </>
        ) : (
          <div className="small text-muted">Chọn khách hàng để dùng điểm.</div>
        )}
      </div>

      <div className="mb-3">
        <div className="fw-semibold mb-2">Voucher</div>
        <div className="d-flex gap-2 mb-2">
          <input
            className={`form-control ${error ? 'is-invalid' : ''}`}
            placeholder="Nhập mã voucher"
            value={voucherCode}
            onChange={(e) => {
                setVoucherCode(e.target.value);
                if(error) setError(null);
            }}
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
            >
              X
            </button>
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="fw-semibold mb-2">Khuyến mãi</div>
        {promotions.length === 0 && (
          <div className="small text-muted">Không có khuyến mãi khả dụng.</div>
        )}
        {promotions.map((p) => {
          const raw =
            (p.type || "").toLowerCase() === "percent"
              ? Math.floor((safeSubtotal * (Number(p.value) || 0)) / 100)
              : Number(p.value) || 0;

          const remaining = Math.max(safeSubtotal - voucherDiscount, 0);
          const displayDiscount = Math.min(raw, remaining);

          return (
            <div
              key={p.id}
              className={`border rounded p-2 mb-2 d-flex justify-content-between align-items-center ${promotion?.id === p.id ? "border-primary bg-light" : ""}`}
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