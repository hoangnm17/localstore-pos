import { useEffect, useState } from "react";
import FilterBar from "./Filter/FilterBar";
import ProductList from "./ProductList/ProductList";
import Pagination from "components/Pagination/Pagination";
import { getAllCategories } from "services/Category/category.service";
import { getAllProducts } from "services/Product/product.service";
import ScanBarcode from "components/pos/ScanBarcode";
import { useNotification } from "components/global/Notification/NotificationContext";
import { getSocket } from "utils/socket";

const PAGE_CONFIG = {
  ITEMS_PER_PAGE: 10,
};

export default function Product({ addItem }) {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showScan, setShowScan] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    const handleInventoryUpdate = (data) => {

      if (!data?.items) return;

      setProducts((prev) =>
        prev.map((p) => {

          const found = data.items.find(
            (i) => String(i.productId) === String(p.id)
          );

          if (!found) return p;

          return {
            ...p,
            stock: found.stock
          };

        })
      );

    };

    socket.on("inventory:update", handleInventoryUpdate);

    return () => {
      socket.off("inventory:update", handleInventoryUpdate);
    };

  }, []);


  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        setShowScan(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  const handleAddItem = (product, unit) => {
    if (unit.stock <= 0) {
      showNotification(`Sản phẩm [${unit?.unitName || 'Đơn vị'}] đã hết hàng!`, "error");
      return;
    }

    addItem({
      productId: product.id,
      unitId: unit.unitId,
      productName: product.name,
      unitName: unit.unitName,
      unitPrice: unit.price,
      quantityOnHand: unit.stock,
      factor: unit.factor,
      unitType: unit.unitType,
    });

    showNotification(`Đã thêm ${product.name} - (${unit.unitName})`, "success");
  };

  const handleBarcode = async (barcode) => {
    try {
      const res = await getAllProducts({
        search: barcode,
        page: 1,
        limit: 1
      });

      if (res?.success && res.data.length > 0) {
        const product = res.data[0];
        const matchedUnit = product.units?.find(u => u.barcode === barcode);

        if (matchedUnit) {
          handleAddItem(product, matchedUnit);
        } else {
          handleAddItem(product, product.units[0]);
        }
      } else {
        showNotification("Sản phẩm không tồn tại hoặc hết hàng!", "error");
      }
    } catch (err) {
      console.error("Scan error:", err);
      showNotification("Lỗi khi quét mã vạch", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };


  useEffect(() => {
    fetchProductList();
  }, [currentPage, search, selectedCategory]);

  const fetchProductList = async () => {
    setLoading(true);

    try {

      const res = await getAllProducts({
        page: currentPage,
        limit: PAGE_CONFIG.ITEMS_PER_PAGE,
        search: search || "",
        categoryId: selectedCategory?.id || null,
      });
      if (res.success) {
        setProducts(res.data || []);
        setTotalPages(res.totalPages || 1);
      }

    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-12" style={{ maxWidth: "1200px" }}>
          <div className="bg-white p-4 shadow-sm rounded-4 border-0">

            {/* FILTER */}
            <div className="mb-4 border-bottom pb-4">
              <FilterBar
                keyword={search}
                onKeywordChange={setSearch}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                addItem={handleBarcode}
              />
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary border-3"
                  role="status"
                />
                <p className="mt-3 text-secondary fw-medium">
                  Đang cập nhật danh sách...
                </p>
              </div>
            ) : products.length > 0 ? (
              <>
                <ProductList
                  products={products}
                  onSelect={(product, selectedUnit) => {
                    handleAddItem(product, selectedUnit)
                  }}
                />

                {showScan && (
                  <ScanBarcode
                    open={showScan}
                    onClose={() => setShowScan(false)}
                    onDetected={handleBarcode}
                  />
                )}

                {/* PAGINATION */}
                <div className="mt-4 border-top pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                  />
                </div>

              </>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-search fs-1 text-muted opacity-25"></i>
                <p className="mt-3 text-secondary fs-5">
                  Không tìm thấy sản phẩm
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}