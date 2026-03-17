import { useEffect, useState } from "react";
import FilterBar from "./Filter/FilterBar";
import ProductList from "./ProductList/ProductList";
import Pagination from "components/Pagination/Pagination";
import { getAllCategories } from "services/Category/category.service";
import { getAllProducts } from "services/Product/product.service";
import ScanBarcode from "components/pos/Sale/ScanBarcode";
import { useNotification } from "components/global/Notification/NotificationContext";
import { getSocket } from "utils/socket";
import { POS_HOTKEYS } from "config/HotKey";
import useHotkeys from "hooks/pos/useHotKeys";

const PAGE_CONFIG = {
  ITEMS_PER_PAGE: 10,
};

export default function Product({ addItem, focusSignal } ) {
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

  useHotkeys({
    [POS_HOTKEYS.OPEN_SCAN]: () => {
      const tag = document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      setShowScan(true);
    },
  });

  const handleAddItem = (product, unit) => {
    if (unit.stock <= 0) {
      showNotification(`Sản phẩm [${unit?.unitName || 'Đơn vị'}] đã hết hàng!`, "error");
      return;
    }
    addItem({
      productId: product.id,
      productUnitId: unit.unitId,
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
    <div className="d-flex flex-column bg-light" style={{ height: "100vh", overflow: "hidden" }}>
      <div className="container-fluid flex-grow-1 d-flex flex-column py-3 overflow-hidden">
        <div className="card border-0 shadow-sm rounded-4 d-flex flex-column flex-grow-1 overflow-hidden">

          {/* HEADER: FilterBar (Cố định chiều cao) */}
          <div className="card-header bg-white border-0 pt-4 px-4 flex-shrink-0">
            <FilterBar
              keyword={search}
              onKeywordChange={setSearch}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              addItem={handleBarcode}
              focusSignal={focusSignal}
            />
          </div>

          {/* BODY: Danh sách sản phẩm (Tự động lấp đầy và cho phép cuộn nội bộ) */}
          <div className="card-body px-4 flex-grow-1 overflow-auto custom-scrollbar">
            {loading ? (
              <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <div className="spinner-border text-primary" role="status"></div>
                <span className="mt-2 text-muted">Đang tải...</span>
              </div>
            ) : products.length > 0 ? (
              <ProductList
                products={products}
                onSelect={handleAddItem}
              />
            ) : (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center">
                <i className="bi bi-search fs-1 text-muted opacity-25"></i>
                <p className="text-secondary mt-2">Không tìm thấy sản phẩm</p>
              </div>
            )}
          </div>

          {/* FOOTER: Pagination (Cố định ở đáy card) */}
          {products.length > 0 && (
            <div className="card-footer bg-white border-top py-3 px-4 flex-shrink-0">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small d-none d-md-inline">
                  Hiển thị {products.length} sản phẩm
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {showScan && <ScanBarcode open={showScan} onClose={() => setShowScan(false)} onDetected={handleBarcode} />}

      <style jsx>{`
        /* Ẩn thanh cuộn toàn trang */
        :global(body) {
          overflow: hidden;
        }

        /* Tùy chỉnh thanh cuộn nội bộ cho đẹp */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bbb;
        }
      `}</style>
    </div>
  );
}