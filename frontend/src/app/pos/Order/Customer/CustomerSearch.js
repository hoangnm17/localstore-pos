import { useState } from "react"
import CustomerCreateModal from "./CustomerCreateModal"
import { useCustomerSearch } from "../../../../hooks/useCustomerSearch"

export default function CustomerSearch() {
    const [phone, setPhone] = useState("")
    const [showCreate, setShowCreate] = useState(false)

    // Giả sử hook này đã xử lý debounce. Nếu chưa, hãy dùng useDebounce
    const { customer, loading, setCustomer } = useCustomerSearch(phone)

    // Hàm xử lý chỉ cho phép nhập số
    const handlePhoneChange = (e) => {
        const value = e.target.value
        // Chỉ lấy ký tự số
        if (!value || /^[0-9]+$/.test(value)) {
            setPhone(value)
        }
    }

    // Hàm clear nhanh input
    const handleClear = () => {
        setPhone("")
        setCustomer(null) // Reset customer nếu hook không tự handle việc phone rỗng
    }

    return (
        <div className="p-3 border rounded position-relative">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">Khách hàng</h5>
                {/* Nút clear tiện lợi */}
                {phone && (
                    <button 
                        className="btn btn-link text-muted p-0 text-decoration-none" 
                        onClick={handleClear}
                    >
                        <small>Xóa tìm kiếm</small>
                    </button>
                )}
            </div>

            {/* Input Group */}
            <div className="input-group mb-2">
                <input
                    type="tel" // Giúp hiện bàn phím số trên mobile
                    className="form-control"
                    placeholder="Nhập số điện thoại..."
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={12} // Giới hạn độ dài hợp lý
                />
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-muted small">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang tìm...
                </div>
            )}

            {/* Found - Hiển thị đẹp hơn chút */}
            {customer && !loading && (
                <div className="alert alert-success d-flex flex-column py-2 mt-2 mb-0">
                    <span className="fw-bold">{customer.name}</span>
                    <span className="small">{customer.phone} • {customer.points} điểm</span>
                </div>
            )}

            {/* Not found */}
            {phone.length >= 6 && !loading && !customer && (
                <div className="mt-2 text-center p-2 bg-light rounded">
                    <span className="text-danger small d-block mb-1">
                        Chưa có dữ liệu khách hàng này
                    </span>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowCreate(true)}
                    >
                        + Tạo khách hàng mới
                    </button>
                </div>
            )}

            {/* Modal */}
            {showCreate && (
                <CustomerCreateModal
                    phone={phone}
                    onClose={() => setShowCreate(false)}
                    onCreated={(newCustomer) => {
                        setCustomer(newCustomer)
                        setShowCreate(false)
                    }}
                />
            )}
        </div>
    )
}