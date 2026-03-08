import { useState, useEffect } from "react";

function UpdateMinThresholdModal({
    show,
    onClose,
    product,
    onSave,
    updating
}) {
    const [value, setValue] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (product) {
            setValue((product.minThreshold ?? 0).toString());
            setError("");
        }
    }, [product]);

    if (!show) return null;

    const handleChange = (e) => {
        let val = e.target.value;

        // 1. Chỉ cho phép chữ số và tối đa một dấu chấm thập phân
        // Loại bỏ mọi thứ KHÔNG phải là số hoặc dấu chấm
        val = val.replace(/[^0-9.]/g, "");

        // 2. Ngăn chặn nhập nhiều hơn một dấu chấm (ví dụ: 1.2.3 -> 1.23)
        const parts = val.split(".");
        if (parts.length > 2) {
            val = parts[0] + "." + parts.slice(1).join("");
        }

        setValue(val);
    };

    const handleSubmit = () => {
        const trimmed = value.trim();

        if (!trimmed) {
            setError("Vui lòng nhập ngưỡng tồn kho tối thiểu");
            return;
        }

        if (!/^\d*\.?\d*$/.test(trimmed)) {
            setError("Chỉ được nhập số");
            return;
        }

        const min = parseFloat(trimmed);

        if (isNaN(min)) {
            setError("Giá trị không hợp lệ");
            return;
        }

        if (min < 0) {
            setError("Ngưỡng không được âm");
            return;
        }

        const allowDecimal = product?.allowDecimalQuantity === true;

        if (!allowDecimal && !Number.isInteger(min)) {
            setError("Sản phẩm này chỉ chấp nhận số nguyên");
            return;
        }

        setError("");
        onSave(min);
    };

    return (
        <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
            <div className="modal-dialog modal-dialog-centered modal-md">
                <div className="modal-content rounded-4 shadow-xl border-0">

                    <div className="modal-header border-0 pb-2">
                        <h5 className="modal-title fw-bold">
                            Cập nhật ngưỡng tồn kho tối thiểu
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={updating}
                        ></button>
                    </div>

                    <div className="modal-body px-4 pb-4">
                        <p className="fw-medium mb-1 fs-5">
                            {product?.productName}
                        </p>
                        <p className="text-muted small mb-4">
                            Mã: {product?.productCode}
                        </p>

                        <label className="form-label fw-medium small mb-2">
                            Ngưỡng tồn kho thấp
                        </label>

                        <input
                            type="text"
                            inputMode="decimal" // Hiện bàn phím số trên điện thoại
                            className="form-control form-control-lg"
                            value={value}
                            onChange={handleChange}
                            disabled={updating}
                            placeholder="0"
                            // Thêm mẹo nhỏ để chặn các ký tự e, +, - của trình duyệt
                            onKeyDown={(e) => {
                                if (["e", "E", "+", "-"].includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                        />

                        {error && (
                            <div className="alert alert-danger mt-3 py-2 small">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-0 pt-1 px-4 pb-4">
                        <button
                            type="button"
                            className="btn btn-outline-secondary px-4"
                            onClick={onClose}
                            disabled={updating}
                        >
                            Hủy
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary px-5"
                            disabled={updating}
                            onClick={handleSubmit}
                        >
                            {updating ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Đang lưu...
                                </>
                            ) : (
                                "Lưu thay đổi"
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default UpdateMinThresholdModal;