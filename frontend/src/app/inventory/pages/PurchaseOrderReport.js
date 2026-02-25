import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import purchaseOrderService from "../../../services/purchaseOrderService";
import SummaryCard from "../inventoryComponents/SummaryCard";

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
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const dailyChartData = useMemo(() => {
    if (!report?.dailyStats) return null;
    return {
      labels: report.dailyStats.map((d) => `Ngày ${d.day}`),
      datasets: [
        {
          label: "Số lượng nhập",
          data: report.dailyStats.map((d) => d.totalQuantity),
          backgroundColor: (ctx) => {
            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(54, 162, 235, 0.9)");
            gradient.addColorStop(1, "rgba(54, 162, 235, 0.4)");
            return gradient;
          },
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          borderRadius: 12,
          borderSkipped: false,
          barPercentage: 0.7,
          categoryPercentage: 0.9,
        },
      ],
    };
  }, [report]);

  const supplierChartData = useMemo(() => {
    if (!report?.supplierStats) return null;
    return {
      labels: report.supplierStats.map((s) => s.name),
      datasets: [
        {
          label: "Tổng số lượng",
          data: report.supplierStats.map((s) => s.totalQuantity),
          backgroundColor: [
            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
            "#9966FF", "#FF9F40", "#E7E9ED", "#C9CBCF",
          ],
          hoverOffset: 25,
        },
      ],
    };
  }, [report]);

  return (
    <div className="container-fluid bg-light min-vh-100 py-4 px-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <button
            className="btn btn-outline-secondary me-3 shadow-sm"
            onClick={() => navigate("/inventory/menu")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại Inventory
          </button>
          <h2 className="fw-bold text-primary mb-0">
            <i className="bi bi-bar-chart-line-fill me-3"></i>
            Báo cáo Đơn Nhập Hàng Theo Tháng
          </h2>
        </div>
        <small className="text-muted">
          Tháng {month} / {year}
        </small>
      </div>

      {/* Filter */}
      <div className="card shadow-lg border-0 mb-5 rounded-4 overflow-hidden">
        <div
          className="card-body bg-gradient-primary text-white"
          style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%)" }}
        >
          <form className="row g-3 align-items-end" onSubmit={handleFilter}>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Tháng</label>
              <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Năm</label>
              <input
                type="number"
                className="form-control"
                min="2020"
                max="2030"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>
            <div className="col-md-4">
              <button
                type="submit"
                className="btn btn-light w-100 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <i className="bi bi-funnel-fill me-2"></i>
                    Áp dụng bộ lọc
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && !report ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}></div>
          <p className="mt-3 text-muted">Đang tải dữ liệu báo cáo...</p>
        </div>
      ) : report ? (
        <>
          {/* Summary Cards - Thêm totalDistinctProducts nếu có */}
          <div className="row g-4 mb-5">
            <SummaryCard color="primary" icon="bi-receipt-cutoff" title="Tổng đơn mua" value={report.summary.totalPO} />
            <SummaryCard color="success" icon="bi-box-seam-fill" title="Tổng số lượng" value={report.summary.totalQuantity} />
            <SummaryCard color="warning" icon="bi-building-fill" title="Nhà cung cấp" value={report.summary.totalSuppliers} />
            <SummaryCard color="info" icon="bi-grid-3x3-gap-fill" title="Sản phẩm riêng biệt" value={report.summary.totalProducts} />
          </div>

          {/* Biểu đồ */}
          <div className="row g-4 mb-5">
            <div className="col-lg-8">
              <div className="card shadow border-0 rounded-4 h-100">
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-4">
                    <i className="bi bi-graph-up me-2 text-primary"></i>
                    Số lượng nhập theo ngày trong tháng
                  </h5>
                  <div style={{ height: "340px", position: "relative" }}>
                    {dailyChartData && <Bar data={dailyChartData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "top" } },
                      scales: { y: { beginAtZero: true } },
                      animation: { duration: 1800, easing: "easeOutQuart" },
                    }} />}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow border-0 rounded-4 h-100">
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-4">
                    <i className="bi bi-pie-chart-fill me-2 text-success"></i>
                    Phân bổ số lượng theo nhà cung cấp
                  </h5>
                  <div style={{ height: "340px", position: "relative" }}>
                    {supplierChartData && <Doughnut data={supplierChartData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom" } },
                    }} />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bảng Nhà cung cấp - Thêm cột sản phẩm riêng biệt */}
          <div className="card shadow border-0 rounded-4 mb-5">
            <div className="card-body">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-building me-2 text-primary"></i>
                Thống kê Nhà cung cấp
              </h5>
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Nhà cung cấp</th>
                      <th className="text-center">Số đơn</th>
                      <th className="text-center">Tổng số lượng</th>
                      <th className="text-center">Số sản phẩm nhập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.supplierStats.map((supplier) => (
                      <tr key={supplier.id}>
                        <td className="fw-medium">{supplier.name}</td>
                        <td className="text-center">{supplier.totalPO}</td>
                        <td className="text-center">{supplier.totalQuantity}</td>
                        <td className="text-center">{supplier.totalDistinctProducts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bảng Ngày - Thêm cột sản phẩm riêng biệt */}
          <div className="card shadow border-0 rounded-4">
            <div className="card-body">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-calendar3 me-2 text-info"></i>
                Thống kê theo ngày trong tháng
              </h5>
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle">
                  <thead className="table-primary">
                    <tr>
                      <th className="text-center">Ngày</th>
                      <th className="text-center">Tổng số lượng nhập</th>
                      <th className="text-center">Số sản phẩm nhập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.dailyStats.map((day) => (
                      <tr key={day.day}>
                        <td className="text-center fw-medium">{day.day}</td>
                        <td className="text-center">{day.totalQuantity}</td>
                        <td className="text-center">{day.totalDistinctProducts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-info text-center my-5">
          Chưa có dữ liệu. Vui lòng chọn tháng/năm và áp dụng bộ lọc.
        </div>
      )}
    </div>
  );
}

export default PurchaseOrderReport;