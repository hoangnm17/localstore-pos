import { useState, useEffect, useMemo } from "react";
import { formatCurrency } from "utils/formatters";
import { getVoucherByCode, getPromotions } from "services/crm.service";

export default function OrderDiscount({
  subtotal = 0,
  customer = null,
  onChange = () => { }
}) {

  const [voucherCode, setVoucherCode] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [promotion, setPromotion] = useState(null);
  const [pointUsed, setPointUsed] = useState(0);

  /* LOAD PROMOTIONS */

  useEffect(() => {

    const loadPromotions = async () => {

      try {

        const res = await getPromotions({
          status: "Active"
        });

        setPromotions(res.data || []);

      } catch (err) {

        console.error("Load promotions error", err);

      }

    };

    loadPromotions();

  }, []);

  /* CHECK VOUCHER */

  const handleCheckVoucher = async () => {

    if (!voucherCode) return;

    try {

      const res = await getVoucherByCode(voucherCode);

      if (!res?.data) {

        alert("Voucher không hợp lệ");
        return;

      }

      setVoucher(res.data);

    } catch (err) {

      console.error("Voucher error", err);

    }

  };

  /* POINT */

  const pointRate = 100;

  const pointDiscount = useMemo(() => {
    return pointUsed * pointRate;
  }, [pointUsed]);

  /* VOUCHER */

  const voucherDiscount = useMemo(() => {

    if (!voucher) return 0;

    return voucher.value;

  }, [voucher]);

  /* PROMOTION */

  const promotionDiscount = useMemo(() => {

    if (!promotion) return 0;

    if (promotion.type === "Percent") {
      return Math.floor((subtotal * promotion.value) / 100);
    }

    return promotion.value;

  }, [promotion, subtotal]);

  /* TOTAL */

  const totalDiscount =
    pointDiscount +
    voucherDiscount +
    promotionDiscount;

  const finalAmount =
    Math.max(subtotal - totalDiscount, 0);

  /* EMIT */

  useEffect(() => {

    onChange({
      pointUsed,
      voucherId: voucher?.id,
      promotionId: promotion?.id,
    });

  }, [
    pointUsed,
    voucher,
    promotion,
    totalDiscount,
    finalAmount
  ]);

  return (

    <div className="border rounded-4 p-3">

      {/* POINT */}

      {customer && (

        <div className="mb-3">

          <div className="fw-semibold mb-1">
            Điểm tích lũy
          </div>

          <div className="small text-muted mb-2">
            Bạn có {customer.loyaltyPoints || 0} điểm
          </div>

          <div className="d-flex gap-2">

            <input
              type="number"
              className="form-control"
              value={pointUsed}
              max={customer.points || 0}
              onChange={(e) =>
                setPointUsed(Number(e.target.value))
              }
            />

            <div className="text-danger fw-semibold d-flex align-items-center">
              -{formatCurrency(pointDiscount)}
            </div>

          </div>

        </div>

      )}

      {/* VOUCHER */}

      <div className="mb-3">

        <div className="fw-semibold mb-2">
          Voucher
        </div>

        <div className="d-flex gap-2 mb-2">

          <input
            className="form-control"
            placeholder="Nhập mã voucher"
            value={voucherCode}
            onChange={(e) =>
              setVoucherCode(e.target.value)
            }
          />

          <button
            className="btn btn-primary"
            onClick={handleCheckVoucher}
          >
            Áp dụng
          </button>

        </div>

        {voucher && (

          <div className="border rounded p-2 bg-light d-flex justify-content-between align-items-center">

            <div>

              <div className="fw-semibold">
                {voucher.code}
              </div>

              <small className="text-danger">
                -{formatCurrency(voucher.value)}
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

      {/* PROMOTIONS */}

      <div className="mb-3">

        <div className="fw-semibold mb-2">
          Khuyến mãi
        </div>

        {promotions.map((p) => {

          const discount =
            p.type === "Percent"
              ? Math.floor(subtotal * p.value / 100)
              : p.value;

          return (

            <div
              key={p.id}
              className={`border rounded p-2 mb-2 d-flex justify-content-between align-items-center ${promotion?.id === p.id
                ? "border-primary bg-light"
                : ""
                }`}
            >

              <div>

                <div className="fw-semibold">
                  {p.name}
                </div>

                <small className="text-danger">
                  -{formatCurrency(discount)}
                </small>

              </div>

              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setPromotion(p)}
              >
                {promotion?.id === p.id
                  ? "Đã chọn"
                  : "Áp dụng"}
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

          <span>
            {formatCurrency(finalAmount)}
          </span>

        </div>

      </div>

    </div>

  );

}