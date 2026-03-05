import { useState, useMemo } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";

import PaymentMethodSelector from "./PaymentModal/PaymentMethodSelector";
import CashPayment from "./PaymentModal/CashPayment";
import BankPayment from "./PaymentModal/BankPayment";
import OrderDiscount from "../Discount/OrderDiscount";

export default function PaymentModal({
  orderId,
  total = 0,
  customer = null,
  onClose = () => {},
  onConfirm = () => {}
}) {

  const safeTotal = useMemo(() => Number(total) || 0, [total]);

  const [method, setMethod] = useState("CASH");
  const [discount, setDiscount] = useState(null);

  const finalAmount = discount?.finalAmount || safeTotal;

  const handleConfirm = (payload) => {
    
    onConfirm({
      orderId,
      method,
      amount: finalAmount,
      discount,
      ...payload
    });

  };

  return (

    <BaseModal onClose={onClose}>

      <div
        className="bg-white rounded-4 shadow overflow-hidden"
        style={{
          width: "950px",
          maxWidth: "95vw"
        }}
      >

        {/* HEADER */}

        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">

          <h6 className="fw-bold mb-0">
            Thanh toán
          </h6>

          <button
            className="btn-close"
            onClick={onClose}
          />

        </div>

        {/* BODY */}

        <div className="p-4">

          <div className="row g-4">

            {/* LEFT : DISCOUNT */}

            <div className="col-md-6">

              <OrderDiscount
                subtotal={safeTotal}
                customer={customer}
                onChange={(data) => setDiscount(data)}
              />

            </div>

            {/* RIGHT : PAYMENT */}

            <div className="col-md-6">

              {/* TOTAL */}

              <div className="mb-3 p-3 border rounded-3 bg-light text-center">

                <div className="small text-muted mb-1">
                  Tổng cần thanh toán
                </div>

                <div className="h3 fw-bold text-primary">
                  {formatCurrency(finalAmount)}
                </div>

              </div>

              {/* METHOD */}

              <PaymentMethodSelector
                method={method}
                setMethod={setMethod}
              />

              {/* CONTENT */}

              {method === "CASH" && (

                <CashPayment
                  total={finalAmount}
                  onConfirm={handleConfirm}
                />

              )}

              {method === "BANK" && (

                <BankPayment
                  total={finalAmount}
                  onConfirm={handleConfirm}
                />

              )}

            </div>

          </div>

        </div>

      </div>

    </BaseModal>

  );

}