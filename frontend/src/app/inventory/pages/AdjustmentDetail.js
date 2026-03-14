import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adjustmentService from "../../../services/Inventory/adjustmentService";

function AdjustmentDetail() {
    const user = JSON.parse(localStorage.getItem("user"));
    const canProcess = user?.features?.includes("PROCESS_ADJUST");


    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showRedirectButton, setShowRedirectButton] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        setLoading(true);
        const res = await adjustmentService.getAdjustmentDetail(id);

        if (!res?.data) {
            alert(res?.message || "Có lỗi xảy ra");
            setLoading(false);
            return;
        }

        if (res.data.success) {
            setData(res.data.data);
        } else {
            alert(res.data.message);
        }
        setLoading(false);
    };

    const handleProcess = async (newStatus) => {
        const confirmText =
            newStatus === "Approved"
                ? "Bạn có chắc muốn **duyệt** đơn điều chỉnh này?"
                : "Bạn có chắc muốn **từ chối** đơn điều chỉnh này?";

        if (!window.confirm(confirmText)) return;

        setProcessing(true);

        const res = await adjustmentService.updateAdjustmentStatus(data.id, newStatus);

        if (!res?.data?.success) {
            alert(res?.data?.message || "Có lỗi xảy ra");
            setProcessing(false);
            return;
        }

        // Cập nhật local state
        setData((prev) => ({
            ...prev,
            status: newStatus,
            processedAt: new Date().toISOString(),
        }));

        setShowRedirectButton(true);
        setProcessing(false);
    };

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Đang tải thông tin đơn điều chỉnh...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="container-fluid py-4 px-md-5">

            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h3 className="fw-bold mb-1 text-dark">
                        Đơn điều chỉnh kho #{data.id}
                    </h3>
                    <div>
                        <StatusBadge status={data.status} />
                    </div>
                </div>

                <button
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={() => navigate(`/inventory/requests/adjust?status=${data.status}`)}
                >
                    <i className="bi bi-arrow-left"></i>
                    Quay lại danh sách
                </button>
            </div>

            {/* Info Card */}
            <div className="card border-0 shadow-sm rounded-3 mb-4">
                <div className="card-header bg-light py-3 border-0">
                    <h5 className="mb-0 fw-semibold text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-info-circle-fill text-primary"></i>
                        Thông tin đơn điều chỉnh
                    </h5>
                </div>

                <div className="card-body pb-4">
                    <div className="row g-4 g-md-5">
                        <div className="col-12 col-lg-5">
                            <div className="d-flex flex-column">
                                <small className="text-uppercase fw-medium text-muted mb-1 fs-6">Lý do điều chỉnh</small>
                                <p className="mb-0 fs-5 fw-semibold text-dark lh-base">
                                    {data.reason || "—"}
                                </p>
                            </div>
                        </div>

                        <div className="col-6 col-md-3 col-lg-7">
                            <div className="row g-4">
                                <div className="col-12 col-sm-6">
                                    <div>
                                        <small className="text-uppercase fw-medium text-muted mb-1 d-block fs-6">
                                            <i className="bi bi-person me-1"></i>Người tạo
                                        </small>
                                        <p className="mb-0 fs-5 fw-semibold text-dark">
                                            {data.createdByName || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-6">
                                    <div>
                                        <small className="text-uppercase fw-medium text-muted mb-1 d-block fs-6">
                                            <i className="bi bi-calendar-event me-1"></i>Ngày tạo
                                        </small>
                                        <p className="mb-0 fs-5 fw-semibold text-dark">
                                            {formatDate(data.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-6">
                                    <div>
                                        <small className="text-uppercase fw-medium text-muted mb-1 d-block fs-6">
                                            <i className="bi bi-person-check me-1"></i>Người xử lý
                                        </small>
                                        <p className="mb-0 fs-5 fw-semibold text-dark">
                                            {data.processedByName || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-6">
                                    <div>
                                        <small className="text-uppercase fw-medium text-muted mb-1 d-block fs-6">
                                            <i className="bi bi-calendar-check me-1"></i>Ngày xử lý
                                        </small>
                                        <p className="mb-0 fs-5 fw-semibold text-dark">
                                            {formatDate(data.processedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th scope="col" className="text-center ps-3 pe-2 py-3" style={{ width: '60px' }}>#</th>
                            <th scope="col" className="ps-3 pe-2 py-3 fw-semibold" style={{ minWidth: '120px' }}>Mã SP</th>
                            <th scope="col" className="ps-3 pe-2 py-3 fw-semibold" style={{ minWidth: '260px' }}>Tên sản phẩm</th>
                            <th scope="col" className="text-end px-3 py-3 fw-semibold" style={{ minWidth: '120px' }}>Tồn hệ thống</th>
                            <th scope="col" className="text-end px-3 py-3 fw-semibold" style={{ minWidth: '120px' }}>Tồn thực tế</th>
                            <th scope="col" className="text-end px-3 py-3 fw-semibold" style={{ minWidth: '120px' }}>Chênh lệch</th>
                        </tr>
                    </thead>
                    <tbody className="fs-5">
                        {data.items?.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-5 text-muted fst-italic">
                                    Không có sản phẩm nào
                                </td>
                            </tr>
                        ) : (
                            data.items.map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-body-tertiary" : ""}>
                                    <td className="text-center py-3 fw-medium">{idx + 1}</td>
                                    <td className="ps-3 pe-2 py-3 fw-medium">{item.code}</td>
                                    <td className="ps-3 pe-2 py-3">{item.name}</td>
                                    <td className="text-end px-3 py-3 fw-medium">{item.systemQuantity.toLocaleString("vi-VN")}</td>
                                    <td className="text-end px-3 py-3 fw-medium">{item.actualQuantity.toLocaleString("vi-VN")}</td>
                                    <td className="text-end px-3 py-3">
                                        <span
                                            className={`fw-bold px-3 py-2 rounded fs-5 d-inline-block ${item.difference > 0
                                                ? "text-success bg-success-subtle"
                                                : item.difference < 0
                                                    ? "text-danger bg-danger-subtle"
                                                    : "text-secondary bg-secondary-subtle"
                                                }`}
                                            style={{ minWidth: '80px', textAlign: 'center' }}
                                        >
                                            {item.difference > 0 ? "+" : ""}
                                            {item.difference.toLocaleString("vi-VN")}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Action Buttons */}
            {canProcess && (<div className="position-sticky bottom-0 bg-white border-top py-3 px-4 shadow-lg d-flex justify-content-end gap-3" style={{ zIndex: 10 }}>
                {data.status === "Pending" && (
                    <>
                        <button
                            className="btn btn-outline-danger d-flex align-items-center gap-2"
                            disabled={processing}
                            onClick={() => handleProcess("Rejected")}
                        >
                            <i className="bi bi-x-circle"></i>
                            {processing ? "Đang xử lý..." : "Từ chối"}
                        </button>

                        <button
                            className="btn btn-success d-flex align-items-center gap-2"
                            disabled={processing}
                            onClick={() => handleProcess("Approved")}
                        >
                            <i className="bi bi-check-circle"></i>
                            {processing ? "Đang xử lý..." : "Duyệt"}
                        </button>
                    </>
                )}

                {showRedirectButton && (
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => navigate(`/inventory/requests/adjust?status=${data.status}`)}
                    >
                        <i className="bi bi-list-ul"></i>
                        Xem danh sách ({data.status})
                    </button>
                )}
            </div>)}
        </div>
    );
}

function StatusBadge({ status }) {
    const variants = {
        Pending: { bg: "warning", text: "text-dark", label: "Chờ duyệt" },
        Approved: { bg: "success", text: "text-white", label: "Đã duyệt" },
        Rejected: { bg: "danger", text: "text-white", label: "Đã từ chối" },
    };

    const style = variants[status] || { bg: "secondary", text: "text-white", label: status };

    return (
        <span className={`badge bg-${style.bg} ${style.text} fs-6 px-3 py-2 rounded-pill`}>
            {style.label}
        </span>
    );
}

export default AdjustmentDetail;