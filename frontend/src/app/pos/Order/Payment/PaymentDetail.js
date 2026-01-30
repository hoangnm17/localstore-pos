const PaymentDetail = ({ items, customer, onPay }) => {
  const total = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  )

  return (
    <div className="p-4 border-t bg-white">
      {/* Summary */}
      <div className="flex justify-between mb-2">
        <span>Tạm tính</span>
        <span>{total.toLocaleString()} đ</span>
      </div>

      <div className="flex justify-between mb-3 font-bold">
        <span>Tổng cộng</span>
        <span>{total.toLocaleString()} đ</span>
      </div>

      {/* Payment button */}
      <button
        disabled={items.length === 0}
        onClick={() => onPay({ items, customer, total })}
        className="w-full bg-blue-600 text-white py-3 rounded disabled:opacity-50"
      >
        Thanh toán
      </button>
    </div>
  )
}

export default PaymentDetail
