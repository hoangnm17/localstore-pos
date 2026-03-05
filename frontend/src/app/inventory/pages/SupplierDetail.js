import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supplierService from "../../../services/Inventory/supplierService";
import AddProductModal from "../InventoryModal/AddProductModal";
import UpdateProductModal from "../InventoryModal/UpdateProductModal";
import PriceHistoryModal from "../InventoryModal/PriceHistoryModal";

function SupplierDetail() {
  const user = JSON.parse(localStorage.getItem("user"));
  const canUpdateProduct = user?.features?.includes("UPDATE_SUPPLIER_PRODUCT");

  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);

  const limit = 10;

  //Load supplier detail
  useEffect(() => {
    const loadSupplier = async () => {
      try {
        const res = await supplierService.getSupplierById(id);
        if (res?.data?.success) {
          setSupplier(res.data.data);
        }
      } catch (err) {
        console.error("Lỗi load supplier:", err);
      }
    };

    loadSupplier();
  }, [id]);
  // Load products of supplier
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await supplierService.getProductsBySupplier(id);
      if (res?.data?.success) {
        setAllProducts(res.data.data || []);
      } else {
        setAllProducts([]);
      }
    } catch (err) {
      console.error("Lỗi load products:", err);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [id]);

  // Pagination
  const totalPages = Math.ceil(allProducts.length / limit);

  const currentProducts = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return allProducts.slice(start, end);
  }, [allProducts, page]);

  useEffect(() => {
    setInputPage(page);
  }, [page]);

  const jumpToPage = () => {
    let p = parseInt(inputPage, 10);
    if (isNaN(p) || p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setPage(p);
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-lg border-0 rounded-4">

        {/* HEADER */}
        <div className="card-header bg-white border-bottom py-4">
          <div className="d-flex justify-content-between align-items-center">

            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-outline-secondary btn-sm rounded-circle"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left"></i>
              </button>

              <div>
                <h4 className="fw-bold mb-1">
                  {supplier?.name || "Supplier Detail"}
                </h4>
                <div className="text-muted small">
                  Tổng sản phẩm: {allProducts.length}
                </div>
              </div>
            </div>

            {canUpdateProduct && (<button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              + Thêm sản phẩm
            </button>)}

          </div>
        </div>

        {/* BODY */}
        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-secondary"></div>
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="text-center text-muted py-5">
              Không có sản phẩm nào.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Code</th>
                    <th>Đơn vị</th>
                    <th>Giá nhập</th>
                    <th>Giá bán</th>
                    <th>Giá bán lẻ theo sản phẩm</th>
                    <th>Trạng thái</th>
                    {canUpdateProduct && <th>Chỉnh sửa</th>}
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((p) => (
                    <tr
                      key={p.id}
                      className={
                        p.status === "INACTIVE" ? "table-danger" : ""
                      }
                    >
                      <td style={{ width: 80 }}>
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "contain"
                          }}
                        />
                      </td>

                      <td>{p.name}</td>
                      <td>{p.code}</td>
                      <td>{p.unitName}</td>
                      <td>{p.supplyPrice?.toLocaleString()} đ</td>
                      <td>{p.salePrice?.toLocaleString()} đ</td>
                      <td>{p.price?.toLocaleString()} đ <span>/{p.baseUnit}</span></td>

                      <td>
                        <span
                          className={`badge ${p.status === "ACTIVE"
                            ? "bg-success"
                            : "bg-danger"
                            }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {canUpdateProduct && (<td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setEditingProduct(p)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-info btn-sm ms-2"
                          onClick={() => {
                            setSelectedProduct(p);
                            setShowHistoryModal(true);
                          }}
                        >
                          Lịch sử giá
                        </button>
                      </td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="card-footer bg-white border-top py-3">
            <div className="d-flex justify-content-between align-items-center">

              <div className="text-muted small">
                Trang {page} / {totalPages}
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ‹
                </button>

                <input
                  type="number"
                  className="form-control form-control-sm text-center"
                  style={{ width: "70px" }}
                  value={inputPage}
                  onChange={(e) => setInputPage(e.target.value)}
                  onBlur={jumpToPage}
                />

                <span className="small text-muted">
                  / {totalPages}
                </span>

                <button
                  className="btn btn-outline-secondary btn-sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  ›
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      <AddProductModal
        show={showAddModal}
        supplierId={id}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadProducts}
      />

      <UpdateProductModal
        show={!!editingProduct}
        supplierId={id}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={loadProducts}
      />
      
      <PriceHistoryModal
        show={showHistoryModal}
        supplierId={id}
        product={selectedProduct}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
}

export default SupplierDetail;