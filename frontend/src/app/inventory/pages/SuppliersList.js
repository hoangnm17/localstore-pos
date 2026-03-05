import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import supplierService from "../../../services/Inventory/supplierService";
import CreateSupplierModal from "../InventoryModal/CreateSupplierModal";
import EditSupplierModal from "../InventoryModal/EditSupplierModal";

function SupplierList() {
  const user = JSON.parse(localStorage.getItem("user"));
  const canUpdateSupplier = user?.features?.includes("UPDATE_SUPPLIER");

  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchSuppliers = useCallback(async (keyword = "") => {
    try {
      setLoading(true);
      const res = await supplierService.getSupplierList(keyword);
      setSuppliers(res.data.data || []);
    } catch (error) {
      console.error("Fetch supplier error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load lần đầu
  useEffect(() => {
    fetchSuppliers("");
  }, [fetchSuppliers]);

  // Load lại khi search thay đổi
  useEffect(() => {
    fetchSuppliers(search);
  }, [search, fetchSuppliers]);

  const handleOpenEdit = (e, supplier) => {
    e.stopPropagation();
    setSelectedSupplier(supplier);
    setIsEditOpen(true);
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* HEADER giữ nguyên UI */}
      <header className="bg-white border-bottom shadow-sm">
        <div className="container-fluid px-3 px-md-4">
          <div className="d-flex align-items-center justify-content-between py-3">
            <h1 className="fs-3 fw-bold text-dark mb-0">
              Quản lý nhà cung cấp
            </h1>

            <div className="d-flex align-items-center gap-3 gap-md-4">

              {/* 🔥 SEARCH debounce */}
              <div className="position-relative d-none d-md-block">
                <input
                  type="search"
                  className="form-control form-control-md ps-4 pe-5 bg-light border-0 shadow-none"
                  placeholder="Tìm nhà cung cấp..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{ width: "280px", borderRadius: "2rem" }}
                />
                <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"></i>
              </div>

              <button
                className="btn btn-outline-secondary d-md-none rounded-circle p-2"
                onClick={() =>
                  document
                    .querySelector('input[type="search"]')
                    ?.focus()
                }
              >
                <i className="bi bi-search"></i>
              </button>

              {canUpdateSupplier && (
                <button
                  className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 fw-medium shadow-sm"
                  onClick={() => setIsModalOpen(true)}
                  style={{ borderRadius: "2rem" }}
                >
                  <i className="bi bi-plus-lg fs-5"></i>
                  Thêm mới
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN giữ nguyên */}
      <main className="container-fluid px-3 px-md-4 py-4 pt-4">
        {loading ? (
          <div className="text-center py-5 my-5">
            <div
              className="spinner-border text-primary"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-3 text-muted fs-5">Đang tải...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-5 my-5 bg-white rounded-4 shadow-sm border border-light">
            <i className="bi bi-building-slash display-1 text-muted opacity-50"></i>
            <h5 className="mt-4 fw-semibold text-dark">
              Không tìm thấy nhà cung cấp
            </h5>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {suppliers.map((supplier) => (
              <div className="col" key={supplier.id}>
                <div
                  className="card h-100 shadow-sm border-0 hover-lift rounded-4 overflow-hidden cursor-pointer bg-white"
                  onClick={() =>
                    navigate(`/inventory/suppliers/${supplier.id}`)
                  }
                >
                  <div className="card-body p-4 d-flex flex-column">

                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="fw-bold text-dark mb-0 pe-2 flex-grow-1">
                        {supplier.name}
                      </h5>

                      {canUpdateSupplier && (
                        <button
                          className="btn btn-sm btn-light rounded-circle shadow-sm flex-shrink-0"
                          onClick={(e) =>
                            handleOpenEdit(e, supplier)
                          }
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      )}
                    </div>

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
        onCreated={() => fetchSuppliers(search)}
      />

      <EditSupplierModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        supplier={selectedSupplier}
        onUpdated={() => fetchSuppliers(search)}
      />
    </div>
  );
}

export default SupplierList;