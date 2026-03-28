import { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "utils/formatters";
import { getVoucherByCode } from "services/crm.service";

const POINT_RATE = 100; // 1 point = 100đ

export default function OrderDiscount({
  subtotal = 0,
  customer = null,
  onChange = () => {}
}) {
  const safeSubtotal = useMemo(() => Number(subtotal) || 0, [subtotal]);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucher, setVoucher] = useState(null);
  
  // Dùng "" để input có thể xóa trống hoàn toàn
  const [pointUsed, setPointUsed] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= RESET KHI ĐỔI GIÁ TRỊ ĐƠN ================= */
  useEffect(() => {
    setVoucher(null);
    setVoucherCode("");
    setPointUsed("");
    setError("");
  }, [safeSubtotal]);

  /* ================= CHECK VOUCHER ================= */
  const handleCheckVoucher = async () => {
    const code = voucherCode.trim();
    if (!code) {
      setError("Vui lòng nhập mã voucher");
      return;
    }
    if (safeSubtotal <= 0) {
      setError("Đơn hàng chưa có sản phẩm");
      return;
    }
    if (loading) return;

    try {
      setLoading(true);
      const res = await getVoucherByCode(code, safeSubtotal);
      if (!res?.data) {
        setError("Voucher không hợp lệ");
        setVoucher(null);
        return;
      }
      setVoucher(res.data);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Không kiểm tra được voucher");
      setVoucher(null);
    } finally {
      setLoading(false);
    }
  };

  /* ================= VOUCHER DISCOUNT ================= */
  const voucherDiscount = useMemo(() => {
    if (!voucher) return 0;
    const type = (voucher.type || "fixed").toLowerCase();
    const value = Number(voucher.value) || 0;
    const raw = type === "percent" ? Math.floor((safeSubtotal * value) / 100) : value;
    return Math.min(raw, safeSubtotal);
  }, [voucher, safeSubtotal]);

  const remainingAfterVoucher = useMemo(() => {
    return Math.max(safeSubtotal - voucherDiscount, 0);
  }, [safeSubtotal, voucherDiscount]);

  /* ================= POINT LOGIC ================= */
  const { pointDiscount, actualPointUsed } = useMemo(() => {
    const maxPointsFromCustomer = Number(customer?.loyaltyPoints || 0);
    const desiredPoints = Math.max(0, Number(pointUsed) || 0);
    
    // Giới hạn bởi ví điểm khách hàng
    const safePoints = Math.min(desiredPoints, maxPointsFromCustomer);
    const rawDiscount = safePoints * POINT_RATE;

    // Giới hạn bởi số tiền còn lại sau khi áp voucher
    const appliedDiscount = Math.min(rawDiscount, remainingAfterVoucher);
    const used = Math.floor(appliedDiscount / POINT_RATE);

    return {
      pointDiscount: used * POINT_RATE,
      actualPointUsed: used
    };
  }, [pointUsed, customer?.loyaltyPoints, remainingAfterVoucher]);

  // Đồng bộ lại state nếu giá trị thực tế dùng khác với giá trị nhập (do bị clamp)
  useEffect(() => {
    if (pointUsed !== "" && Number(pointUsed) !== actualPointUsed) {
      setPointUsed(actualPointUsed);
    }
  }, [actualPointUsed, pointUsed]);

  /* ================= FINAL TOTALS ================= */
  const totalDiscount = useMemo(() => {
    return Math.min(voucherDiscount + pointDiscount, safeSubtotal);
  }, [voucherDiscount, pointDiscount, safeSubtotal]);

  const finalAmount = useMemo(() => {
    return Math.max(safeSubtotal - totalDiscount, 0);
  }, [safeSubtotal, totalDiscount]);

  /* ================= EMIT DATA ================= */
  useEffect(() => {
    onChange({
      pointUsed: actualPointUsed,
      voucherId: voucher?.id ?? null,
      totalDiscount,
      finalAmount
    });
  }, [actualPointUsed, voucher, totalDiscount, finalAmount, onChange]);

  /* ================= UI HANDLERS ================= */
  const handlePointInput = (val) => {
    if (val === "") {
      setPointUsed("");
      return;
    }
    const maxPoints = Number(customer?.loyaltyPoints || 0);
    const n = parseInt(val);
    if (isNaN(n)) {
      setPointUsed("");
      return;
    }
    setPointUsed(Math.max(0, Math.min(n, maxPoints)));
  };

  const handleUseMaxPoints = () => {
    const maxPointsFromCustomer = Number(customer?.loyaltyPoints || 0);
    const pointsNeededForOrder = Math.floor(remainingAfterVoucher / POINT_RATE);
    setPointUsed(Math.min(maxPointsFromCustomer, pointsNeededForOrder));
  };

  const clearAll = () => {
    setVoucherCode("");
    setVoucher(null);
    setPointUsed("");
    setError("");
  };

  return (
    <div className="border rounded-4 p-3 bg-white shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="fw-bold text-uppercase small text-muted" style={{ letterSpacing: '0.5px' }}>Ưu đãi đơn hàng</div>
        <button className="btn btn-sm btn-link text-danger text-decoration-none fw-medium p-0" onClick={clearAll}>
          Xóa áp dụng
        </button>
      </div>

      {/* POINT SECTION */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="fw-semibold small mb-0">Dùng điểm tích lũy</label>
          {customer && (
            <span className="small text-muted">
              Ví: <span className="text-primary fw-bold">{customer.loyaltyPoints || 0}</span>
            </span>
          )}
        </div>

        {customer ? (
          <div className="input-group">
            <input
              type="number"
              className="form-control shadow-none"
              placeholder="Nhập số điểm..."
              value={pointUsed}
              disabled={remainingAfterVoucher <= 0}
              onChange={(e) => handlePointInput(e.target.value)}
              style={{ borderRadius: '8px 0 0 8px' }}
            />
            <button 
              className="btn btn-outline-primary fw-semibold px-3" 
              type="button"
              onClick={handleUseMaxPoints}
              disabled={remainingAfterVoucher <= 0}
              style={{ borderRadius: '0 8px 8px 0' }}
            >
              Tối đa
            </button>
          </div>
        ) : (
          <div className="p-2 border border-dashed rounded-3 bg-light text-center small text-muted italic">
            Vui lòng chọn khách hàng để sử dụng điểm
          </div>
        )}
        
        {pointDiscount > 0 && (
          <div className="mt-2 text-success small fw-medium">
            <i className="bi bi-check-circle-fill me-1"></i>
            Giảm: -{formatCurrency(pointDiscount)}
          </div>
        )}
      </div>

      {/* VOUCHER SECTION */}
      <div className="mb-4">
        <label className="fw-semibold small mb-2">Mã giảm giá (Voucher)</label>
        <div className="d-flex gap-2">
          <input
            className="form-control shadow-none px-3"
            placeholder="Nhập mã voucher"
            value={voucherCode}
            onChange={(e) => { setVoucherCode(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleCheckVoucher()}
            style={{ borderRadius: '8px' }}
          />
          <button 
            className="btn btn-primary px-3 fw-medium" 
            onClick={handleCheckVoucher} 
            disabled={loading}
            style={{ borderRadius: '8px' }}
          >
            {loading ? <span className="spinner-border spinner-border-sm"></span> : "Áp dụng"}
          </button>
        </div>
        
        {error && <div className="text-danger small mt-2 ps-1"><i className="bi bi-exclamation-circle me-1"></i>{error}</div>}

        {voucher && (
          <div className="mt-3 p-2 border border-primary border-dashed rounded bg-primary bg-opacity-10 d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold text-primary mb-0">{voucher.code}</div>
              <small className="text-primary fw-medium">-{formatCurrency(voucherDiscount)}</small>
            </div>
            <button className="btn btn-sm text-primary p-0" onClick={() => setVoucher(null)}>
              <i className="bi bi-x-circle-fill fs-5"></i>
            </button>
          </div>
        )}
      </div>

      {/* SUMMARY SECTION */}
      <div className="border-top pt-3 mt-2">
        <div className="d-flex justify-content-between align-items-center mb-1 text-muted small">
          <span>Tổng tiền giảm:</span>
          <span className="text-danger fw-bold">-{formatCurrency(totalDiscount)}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span className="fw-bold">Thanh toán:</span>
          <span className="h4 fw-black text-primary mb-0">{formatCurrency(finalAmount)}</span>
        </div>
      </div>
    </div>
  );
}