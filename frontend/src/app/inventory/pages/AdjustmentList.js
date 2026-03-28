import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import adjustmentService from "../../../services/Inventory/adjustmentService";
import useTitle from "../../../hooks/common/useTitle";

function AdjustmentList() {
    useTitle("Danh sách phiếu điều chỉnh kho");
    const [searchParams] = useSearchParams();
    const [data, setData] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [loading, setLoading] = useState(false);

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;


    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        setCurrentPage(1); // reset page khi filter đổi
        const statusParam = searchParams.get("status") || "";
        fetchData(statusParam, fromDate, toDate);
    }, [searchParams, fromDate, toDate]);

    const fetchData = async (statusParam, fromDateParam, toDateParam) => {
        setLoading(true);
        try {
            const res = await adjustmentService.getAdjustments({
                status: statusParam,
                fromDate: fromDateParam,
                toDate: toDateParam,
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
        setSelectedStatus(newStatus); // highlight button
        navigate(`?status=${newStatus}`);
    };

    const handleReset = () => {
        setFromDate("");
        setToDate("");
        const currentStatus = selectedStatus ? `?status=${selectedStatus}` : "";
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

    // pagination logic
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const paginatedData = data.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                            className={`card shadow-sm border-0 rounded-3 text-center transition-all cursor-pointer ${selectedStatus === item.status
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
                        <>
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
                                    {paginatedData.map((item) => (
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

                            {/* Pagination */}
                            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top flex-wrap gap-2">

                                <small className="text-muted">
                                    Tổng {data.length} đơn
                                </small>

                                <div className="d-flex align-items-center gap-2">

                                    {/* Prev */}
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>

                                    {/* Input page */}
                                    <div className="d-flex align-items-center gap-1">
                                        <input
                                            type="number"
                                            min="1"
                                            max={totalPages || 1}
                                            value={currentPage}
                                            onChange={(e) => {
                                                let value = Number(e.target.value);

                                                if (!value) return;

                                                if (value < 1) value = 1;
                                                if (value > totalPages) value = totalPages;

                                                setCurrentPage(value);
                                            }}
                                            className="form-control form-control-sm text-center"
                                            style={{ width: "60px" }}
                                        />

                                        <span>/ {totalPages || 1}</span>
                                    </div>

                                    {/* Next */}
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>

                                </div>
                            </div>
                        </>
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