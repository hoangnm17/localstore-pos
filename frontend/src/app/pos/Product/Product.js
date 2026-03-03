import { useEffect, useState } from "react";
import FilterBar from "./Filter/FilterBar";
import ProductList from "./ProductList/ProductList";
import Pagination from "components/Pagination/Pagination";
import { getAllCategories } from "services/Category/category.service";
import { getProducts } from "services/Product/product.service";
import ScanBarcode from "components/pos/ScanBarcode";
import { getProductWithBarcode } from "services/Product/product.service";

const PAGE_CONFIG = {
  ITEMS_PER_PAGE: 8,
};

export default function Product({ addItem }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showScan, setShowScan] = useState(false);

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

  const handleBarcode = async (barcode) => {
    try {
      const res = await getProductWithBarcode(barcode);
      if (!res.success) return;

      const product = res.data;
      addItem({
        productId: product.id,
        productName: product.name,
        unitPrice: product.salePrice,
      });

    } catch (err) {
      console.error("Scan error:", err);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, selectedCategory]);

  const fetchProductList = async () => {
    setLoading(true);

    try {
      const res = await getProducts({
        page: currentPage,
        limit: PAGE_CONFIG.ITEMS_PER_PAGE,
        search: search || "",
        categoryId: selectedCategory?.id || null,
      });


      if (res.data.success) {
        setProducts(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
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
                  onSelect={(product) => {
                    if (product.stockQuantity === 0) return;

                    addItem({
                      productId: product.id,
                      productName: product.name,
                      unitPrice: product.salePrice,
                    });
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

      <style>{`
        .bg-light { background-color: #f8f9fa !important; }
        .rounded-4 { border-radius: 1.25rem !important; }
        .card { 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          border: none !important; 
          border-radius: 1rem !important; 
        }
        .card:hover { 
          transform: translateY(-8px); 
          box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important; 
        }
      `}</style>
    </div>
  );
}