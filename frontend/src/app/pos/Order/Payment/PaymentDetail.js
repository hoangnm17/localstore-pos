const PaymentDetail = ({ items, customer, onPay }) => {
    const total = items?.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity,
        0
    )

    return (
        <div className="p-4 bg-white border-t">
            <h4>Tổng thanh toán: {total.toLocaleString()} đ</h4>
            <button
                disabled={items.length === 0}
                onClick={() => onPay({ items, customer, total })}
                className="w-full bg-blue-600 text-black py-3 rounded"
            >
                Thanh toán
            </button>
        </div>
    )
}

export default PaymentDetail
