import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import adjustmentService from "../../../services/Inventory/adjustmentService";

function AdjustmentList() {
    const [data, setData] = useState([]);
    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [loading, setLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const statusParam = searchParams.get("status");
        if (statusParam) setStatus(statusParam);
    }, [searchParams]);

    useEffect(() => {
        fetchData();
    }, [status, fromDate, toDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adjustmentService.getAdjustments({
                status,
                fromDate,
                toDate,
            });

            if (res?.data?.success) {
                setData(res.data.data || []);
            } else {
                alert(res?.data?.message || "Có lỗi xảy ra");
            }
        } catch (err) {
            alert("Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        navigate(`?status=${newStatus}`);
    };

    const handleReset = () => {
        setFromDate("");
        setToDate("");
        const currentStatus = status ? `?status=${status}` : "";
        navigate(`/inventory/requests/adjust${currentStatus}`);
    };

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="container-fluid py-4 px-md-4">

            {/* Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <h3 className="fw-bold mb-0 text-dark">
                    Đơn điều chỉnh tồn kho
                </h3>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={() => navigate("/inventory/menu")}
                    >
                        <i className="bi bi-arrow-left"></i>
                        Về Menu
                    </button>

                    <button className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => navigate("/inventory/requests/adjust/create")}
                    >
                        <i className="bi bi-plus-lg"></i>
                        Tạo đơn mới
                    </button>
                </div>
            </div>

            {/*Filter*/}
            <div className="row g-3 mb-5">
                {[
                    { title: "Chờ xử lý", status: "Pending", color: "warning", icon: "bi-hourglass-split" },
                    { title: "Đã duyệt", status: "Approved", color: "success", icon: "bi-check-circle" },
                    { title: "Từ chối", status: "Rejected", color: "danger", icon: "bi-x-circle" },
                ].map((item) => (
                    <div key={item.status} className="col-md-4">
                        <div
                            className={`card shadow-sm border-0 rounded-3 text-center transition-all cursor-pointer ${status === item.status
                                ? `active-glow bg-${item.color}-subtle border-${item.color} border-3 shadow-lg`
                                : "hover-glow border border-light"
                                }`}
                            onClick={() => handleStatusChange(item.status)}
                            style={{ cursor: "pointer" }}
                        >
                            <div className="card-body py-4">
                                <i className={`bi ${item.icon} fs-1 text-${item.color} mb-2 d-block`}></i>
                                <h5 className={`fw-bold mb-1 text-${item.color}`}>
                                    {item.title}
                                </h5>
                                {/* Nếu có số lượng đơn, thêm ở đây */}
                                {/* <small className="text-muted">15 đơn</small> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card shadow-sm border-0 rounded-3 mb-4">
                <div className="card-header bg-light py-3 border-0">
                    <h6 className="mb-0 fw-semibold text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-calendar-range fs-5 text-primary"></i>
                        Lọc theo khoảng thời gian
                    </h6>
                </div>

                <div className="card-body pb-4 pt-3">
                    <div className="row g-3 align-items-end">

                        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label className="form-label fw-medium mb-1">Từ ngày</label>
                            <input
                                type="date"
                                className="form-control form-control-lg rounded-3"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>

                        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <label className="form-label fw-medium mb-1">Đến ngày</label>
                            <input
                                type="date"
                                className="form-control form-control-lg rounded-3"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>

                        <div className="col-12 col-sm-12 col-md-4 col-lg-6 d-flex gap-2 flex-column flex-sm-row">
                            <button
                                className="btn btn-primary flex-fill d-flex align-items-center justify-content-center gap-2 py-2 fs-5"
                                onClick={fetchData}
                                disabled={loading}
                            >
                                <i className="bi bi-funnel fs-5"></i>
                                Lọc
                            </button>

                            <button
                                className="btn btn-outline-secondary flex-fill d-flex align-items-center justify-content-center gap-2 py-2 fs-5"
                                onClick={handleReset}
                            >
                                <i className="bi bi-arrow-repeat fs-5"></i>
                                Reset ngày
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                <div className="card-header bg-light border-0 py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-semibold text-dark">
                        Danh sách đơn điều chỉnh
                    </h5>
                    <small className="text-muted">
                        {data.length} đơn
                    </small>
                </div>

                <div className="table-responsive">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                            <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-5 text-muted fst-italic">
                            Không tìm thấy đơn điều chỉnh nào phù hợp với bộ lọc
                        </div>
                    ) : (
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4 py-4">ID</th>
                                    <th className="py-4">Lý do</th>
                                    <th className="py-4">Người tạo</th>
                                    <th className="py-4">Ngày tạo</th>
                                    <th className="py-4">Trạng thái</th>
                                    <th className="py-4">Người xử lý</th>
                                    <th className="py-4">Ngày xử lý</th>
                                    <th className="text-center py-4 pe-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="fs-6 lh-lg">
                                {data.map((item) => (
                                    <tr key={item.id}>
                                        <td className="ps-4 py-4 fw-medium">#{item.id}</td>
                                        <td className="py-4 text-truncate" style={{ maxWidth: "240px" }} title={item.reason}>
                                            {item.reason || "—"}
                                        </td>
                                        <td className="py-4">{item.createdByName || "—"}</td>
                                        <td className="py-4">{formatDate(item.createdAt)}</td>
                                        <td className="py-4">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="py-4">{item.processedByName || "—"}</td>
                                        <td className="py-4">{formatDate(item.processedAt)}</td>
                                        <td className="text-center py-4 pe-4">
                                            <button
                                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 mx-auto px-3 py-2"
                                                onClick={() => navigate(`/inventory/requests/adjust/${item.id}`)}
                                            >
                                                <i className="bi bi-eye"></i>
                                                Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const config = {
        Pending: { bg: "warning", label: "Chờ duyệt" },
        Approved: { bg: "success", label: "Đã duyệt" },
        Rejected: { bg: "danger", label: "Từ chối" },
    };

    const { bg, label } = config[status] || { bg: "secondary", label: status };

    return (
        <span className={`badge bg-${bg} rounded-pill px-3 py-2 fs-6 fw-medium`}>
            {label}
        </span>
    );
}

export default AdjustmentList;