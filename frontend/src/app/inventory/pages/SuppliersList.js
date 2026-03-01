import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supplierService from "../../../services/Inventory/supplierService";
import CreateSupplierModal from "../InventoryModal/CreateSupplierModal";

function SupplierList() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSuppliers = async (keyword = "") => {
    try {
      setLoading(true);
      const res = await supplierService.getSupplierList(keyword);
      setSuppliers(res.data.data || []);
    } catch (error) {
      console.error("Fetch supplier error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSuppliers(search.trim());
  };

  return (
  <div className="min-vh-100 bg-light">
    {/* Header - Minimal, Clean & Professional */}
    <header className="bg-white border-bottom shadow-sm">
      <div className="container-fluid px-3 px-md-4">
        <div className="d-flex align-items-center justify-content-between py-3">
          {/* Left: Title */}
          <h1 className="fs-3 fw-bold text-dark mb-0">
            Quản lý nhà cung cấp
          </h1>

          {/* Right: Actions */}
          <div className="d-flex align-items-center gap-3 gap-md-4">
            {/* Search - Compact & Elegant */}
            <form onSubmit={handleSearch} className="position-relative d-none d-md-block">
              <input
                type="search"
                className="form-control form-control-md ps-4 pe-5 bg-light border-0 shadow-none"
                placeholder="Tìm nhà cung cấp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "280px", borderRadius: "2rem" }}
              />
              <button
                type="submit"
                className="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"
                style={{ border: "none", background: "none" }}
              >
                <i className="bi bi-search fs-5"></i>
              </button>
            </form>

            {/* Mobile search toggle (nếu muốn, có thể thêm icon search riêng cho mobile) */}
            <button
              className="btn btn-outline-secondary d-md-none rounded-circle p-2"
              onClick={() => {
                // Có thể mở modal search hoặc focus input ẩn nếu cần
                document.querySelector('input[type="search"]')?.focus();
              }}
            >
              <i className="bi bi-search"></i>
            </button>

            {/* Create Button - Nổi bật nhưng gọn */}
            <button
              className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 fw-medium shadow-sm"
              onClick={() => setIsModalOpen(true)}
              style={{ borderRadius: "2rem" }}
            >
              <i className="bi bi-plus-lg fs-5"></i>
              Thêm mới
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Main Content */}
    <main className="container-fluid px-3 px-md-4 py-4 pt-4">
      {/* Phần loading / empty / grid giữ nguyên như trước */}
      {loading ? (
        <div className="text-center py-5 my-5">
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted fs-5">Đang tải...</p>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-5 my-5 bg-white rounded-4 shadow-sm border border-light">
          <i className="bi bi-building-slash display-1 text-muted opacity-50"></i>
          <h5 className="mt-4 fw-semibold text-dark">Chưa có nhà cung cấp</h5>
          <p className="text-muted mb-4">Bắt đầu bằng cách thêm mới</p>
          <button
            className="btn btn-primary px-5 py-2"
            onClick={() => setIsModalOpen(true)}
          >
            Thêm nhà cung cấp
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {suppliers.map((supplier) => (
            <div className="col" key={supplier.id}>
              <div
                className="card h-100 shadow-sm border-0 hover-lift rounded-4 overflow-hidden cursor-pointer bg-white"
                onClick={() => navigate(`/inventory/suppliers/${supplier.id}`)}
              >
                <div className="card-body p-4 d-flex flex-column">
                  <h5 className="card-title fw-bold text-dark mb-3 line-clamp-2">
                    {supplier.name}
                  </h5>
                  <div className="mt-auto">
                    <p className="mb-2 text-muted small d-flex align-items-center">
                      <i className="bi bi-telephone me-2 text-primary"></i>
                      {supplier.contactInfo || "—"}
                    </p>
                    <p className="mb-0 text-muted small d-flex align-items-center">
                      <i className="bi bi-geo-alt me-2 text-danger"></i>
                      {supplier.address || "—"}
                    </p>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 pt-0 px-4 pb-4">
                  <button className="btn btn-sm btn-outline-primary w-100 rounded-pill fw-medium">
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>

    <CreateSupplierModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onCreated={() => fetchSuppliers(search.trim())}
    />
  </div>
);
}

export default SupplierList;