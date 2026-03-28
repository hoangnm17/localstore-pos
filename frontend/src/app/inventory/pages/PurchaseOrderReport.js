import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import purchaseOrderService from "../../../services/Inventory/purchaseOrderService";
import SummaryCard from "../InventoryModal/SummaryCard";
import useTitle from "../../../hooks/common/useTitle";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function PurchaseOrderReport() {
  useTitle("Báo cáo đơn đặt hàng");
  const navigate = useNavigate();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (customMonth = month, customYear = year) => {
    try {
      setLoading(true);
      const res = await purchaseOrderService.getMonthlyPOReport({
        month: customMonth,
        year: customYear,
      });
      setReport(res?.data?.data || null);
    } catch (err) {
      console.error("Lỗi lấy báo cáo:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  // Format tiền tệ VNĐ
  const formatCurrency = (value) =>
    value != null ? value.toLocaleString("vi-VN") + " ₫" : "0 ₫";

  // Tính % cho tooltip và danh sách top NCC
  const getPercentage = (amount) => {
    const total = report?.summary?.totalAmount || 1;
    return ((amount / total) * 100).toFixed(1) + "%";
  };

  // Biểu đồ số lượng theo ngày
  const dailyQuantityData = useMemo(() => {
    if (!report?.dailyStats?.length) return null;
    return {
      labels: report.dailyStats.map((d) => `Ngày ${d.day}`),
      datasets: [
        {
          label: "Số lượng nhập",
          data: report.dailyStats.map((d) => d.totalQuantity),
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(54, 162, 235, 0.85)");
            gradient.addColorStop(1, "rgba(54, 162, 235, 0.35)");
            return gradient;
          },
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    };
  }, [report]);

  // Biểu đồ giá trị theo ngày
  const dailyAmountData = useMemo(() => {
    if (!report?.dailyStats?.length) return null;
    return {
      labels: report.dailyStats.map((d) => `Ngày ${d.day}`),
      datasets: [
        {
          label: "Giá trị nhập (VNĐ)",
          data: report.dailyStats.map((d) => d.totalAmount),
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(255, 159, 64, 0.85)");
            gradient.addColorStop(1, "rgba(255, 159, 64, 0.35)");
            return gradient;
          },
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 2,
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    };
  }, [report]);

  // Biểu đồ phân bổ giá trị theo NCC
  const supplierAmountData = useMemo(() => {
    if (!report?.supplierStats?.length) return null;

    const colors = report.supplierStats.map(
      (_, i) => `hsl(${i * (360 / report.supplierStats.length)}, 70%, 50%)`
    );

    return {
      labels: report.supplierStats.map((s) => s.name),
      datasets: [
        {
          label: "Tổng giá trị",
          data: report.supplierStats.map((s) => s.totalAmount),
          backgroundColor: colors, 
          hoverOffset: 30,
        },
      ],
    };
  }, [report]);

  return (
    <div className="container-fluid bg-light min-vh-100 py-4 px-md-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-secondary shadow-sm px-4"
            onClick={() => navigate("/inventory/menu")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại
          </button>
          <h2 className="fw-bold text-primary mb-0">
            <i className="bi bi-truck me-3"></i>
            Báo cáo Nhập Hàng Theo Tháng
          </h2>
        </div>
        <small className="text-muted fs-5">
          {month}/{year}
        </small>
      </div>

      {/* Bộ lọc */}
      <div className="card shadow border-0 rounded-4 mb-5 overflow-hidden">
        <div
          className="card-body text-white p-4"
          style={{
            background: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)",
          }}
        >
          <form className="row g-3 align-items-end" onSubmit={handleFilter}>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Tháng</label>
              <select
                className="form-select form-select-lg"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Tháng {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Năm</label>
              <input
                type="number"
                className="form-control form-control-lg"
                min="2020"
                max="2030"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>
            <div className="col-md-4">
              <button
                type="submit"
                className="btn btn-light btn-lg w-100 fw-bold shadow"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang tải...
                  </>
                ) : (
                  "Xem báo cáo"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && !report ? (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-primary" style={{ width: "4rem", height: "4rem" }}></div>
          <p className="mt-4 fs-4 text-muted">Đang tải báo cáo nhập hàng...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary Cards - 3 card mỗi dòng */}
          <div className="row g-4 mb-5">
            <SummaryCard color="primary" icon="bi-receipt-cutoff" title="Tổng đơn nhập" value={report.summary.totalPO} />
            <SummaryCard color="success" icon="bi-box-seam-fill" title="Tổng số lượng" value={report.summary.totalQuantityReceived} />
            <SummaryCard color="warning" icon="bi-building-fill" title="Nhà cung cấp" value={report.summary.totalSuppliers} />
            <SummaryCard color="info" icon="bi-grid-3x3-gap-fill" title="Sản phẩm riêng biệt" value={report.summary.totalProducts} />
            <SummaryCard color="danger" icon="bi-currency-dollar" title="Tổng giá trị" value={report.summary.totalAmount} isCurrency={true} />
            <SummaryCard color="dark" icon="bi-calculator" title="Giá trị TB/đơn" value={Math.round(report.summary.avgPOValue || 0)} isCurrency={true} />
          </div>

          {/* Phần biểu đồ - Biểu đồ tròn lên đầu + nội dung bổ sung */}
          <div className="row g-4 mb-5">
            {/* Card biểu đồ tròn + Top NCC */}
            <div className="col-lg-5">
              <div className="card shadow border-0 rounded-4 h-100">
                <div className="card-body p-4 d-flex flex-column">
                  <h5 className="fw-bold mb-4 text-success">
                    <i className="bi bi-pie-chart-fill me-2"></i>
                    Phân bổ giá trị theo nhà cung cấp
                  </h5>

                  {/* Biểu đồ tròn */}
                  <div style={{ height: "320px" }}>
                    {supplierAmountData && (
                      <Doughnut
                        data={supplierAmountData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: { font: { size: 13 }, padding: 20 },
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((context.raw / total) * 100).toFixed(1);
                                  return `${context.label}: ${formatCurrency(context.raw)} (${percentage}%)`;
                                },
                              },
                            },
                          },
                          cutout: "65%",
                        }}
                      />
                    )}
                  </div>

                  {/* Top 3 NCC + % để lấp chỗ trống */}
                  <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-semibold mb-3 text-dark">Top nhà cung cấp chiếm tỷ lệ cao</h6>
                    <div className="list-group list-group-flush">
                      {report?.supplierStats
                        ?.sort((a, b) => b.totalAmount - a.totalAmount)
                        .slice(0, 3)
                        .map((sup, index) => {
                          const percentage = getPercentage(sup.totalAmount);
                          return (
                            <div
                              key={sup.id}
                              className="list-group-item d-flex justify-content-between align-items-center px-0 py-2"
                            >
                              <div className="d-flex align-items-center">
                                <span
                                  className="badge rounded-pill me-3"
                                  style={{
                                    backgroundColor: supplierAmountData?.datasets?.[0]?.backgroundColor?.[index] || "#ccc",
                                    width: "24px",
                                    height: "24px",
                                  }}
                                ></span>
                                <span className="fw-medium text-truncate" style={{ maxWidth: "180px" }}>
                                  {sup.name}
                                </span>
                              </div>
                              <div className="text-end">
                                <div className="fw-bold text-primary">{formatCurrency(sup.totalAmount)}</div>
                                <small className="text-muted">{percentage}</small>
                              </div>
                            </div>
                          );
                        }) || (
                          <div className="text-center text-muted py-3">Không có dữ liệu nhà cung cấp</div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hai biểu đồ cột bên phải */}
            <div className="col-lg-7">
              <div className="row g-4">
                <div className="col-12">
                  <div className="card shadow border-0 rounded-4">
                    <div className="card-body p-4">
                      <h5 className="fw-bold mb-4 text-primary">
                        <i className="bi bi-graph-up me-2"></i>
                        Số lượng nhập theo ngày
                      </h5>
                      <div style={{ height: "320px" }}>
                        {dailyQuantityData && <Bar data={dailyQuantityData} options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: "top" } },
                          scales: { y: { beginAtZero: true } },
                        }} />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card shadow border-0 rounded-4">
                    <div className="card-body p-4">
                      <h5 className="fw-bold mb-4 text-warning">
                        <i className="bi bi-currency-dollar me-2"></i>
                        Giá trị nhập theo ngày
                      </h5>
                      <div style={{ height: "320px" }}>
                        {dailyAmountData && <Bar data={dailyAmountData} options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: "top" } },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: { callback: (v) => v.toLocaleString("vi-VN") },
                            },
                          },
                        }} />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top sản phẩm */}
          <div className="row g-4 mb-5">
            <div className="col-12">
              <div className="card shadow border-0 rounded-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4 text-warning">
                    <i className="bi bi-star-fill me-2"></i>
                    Top sản phẩm nhập nhiều nhất
                  </h5>
                  <div className="table-responsive">
                    <table className="table table-hover table-striped">
                      <thead className="table-warning">
                        <tr>
                          <th>Sản phẩm</th>
                          <th className="text-center">Số lượng</th>
                          <th className="text-end">Giá trị</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.topProducts?.map((p) => (
                          <tr key={p.id}>
                            <td className="fw-medium">{p.name}</td>
                            <td className="text-center">{p.totalQuantity}</td>
                            <td className="text-end fw-bold text-danger">
                              {formatCurrency(p.totalAmount)}
                            </td>
                          </tr>
                        )) || (
                            <tr>
                              <td colSpan={3} className="text-center py-4">
                                Không có dữ liệu
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bảng Nhà cung cấp */}
          <div className="card shadow border-0 rounded-4 mb-5">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4 text-primary">
                <i className="bi bi-building me-2"></i>
                Thống kê Nhà cung cấp
              </h5>
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>Nhà cung cấp</th>
                      <th className="text-center">Số đơn</th>
                      <th className="text-center">Số lượng</th>
                      <th className="text-end">Tổng giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.supplierStats.map((s) => (
                      <tr key={s.id}>
                        <td className="fw-medium">{s.name}</td>
                        <td className="text-center">{s.totalPO}</td>
                        <td className="text-center">{s.totalQuantity}</td>
                        <td className="text-end fw-bold text-primary">
                          {formatCurrency(s.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bảng theo ngày */}
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4 text-info">
                <i className="bi bi-calendar3 me-2"></i>
                Thống kê theo ngày
              </h5>
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="table-primary">
                    <tr>
                      <th className="text-center">Ngày</th>
                      <th className="text-center">Số lượng đơn nhập</th>
                      <th className="text-end">Giá trị nhập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.dailyStats.map((d) => (
                      <tr key={d.day}>
                        <td className="text-center fw-medium">{d.day}</td>
                        <td className="text-center">{d.totalPO}</td>
                        <td className="text-end fw-bold text-success">
                          {formatCurrency(d.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info text-center py-5 my-5 fs-5">
          Chưa có dữ liệu báo cáo. Vui lòng chọn tháng/năm và nhấn "Xem báo cáo".
        </div>
      )}
    </div>
  );
}

export default PurchaseOrderReport;