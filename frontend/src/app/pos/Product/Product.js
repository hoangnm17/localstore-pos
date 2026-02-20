import { useEffect, useState, useMemo } from "react";
import FilterBar from "./Filter/FilterBar";
import ProductList from "./ProductList/ProductList";
import ProductVariant from "./ProductList/ProductVariantModal";
import Pagination from "../../../components/Pagination/Pagination";

// Cấu hình tập trung, dễ dàng thay đổi mà không cần tìm trong code
const PAGE_CONFIG = {
  ITEMS_PER_PAGE: 8,
};

export default function Product({ addItem }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // State quản lý trang hiện tại
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Giả sử lấy dữ liệu từ API
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 500);
  }, []);

  // 1. Logic Lọc (Filter) - Sử dụng useMemo để tối ưu hiệu năng
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // 2. Reset về trang 1 mỗi khi người dùng tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // 3. Tính toán phân trang (Logic không code cứng)
  const totalPages = Math.ceil(filteredProducts.length / PAGE_CONFIG.ITEMS_PER_PAGE);

  // Cắt mảng sản phẩm để chỉ hiển thị đúng số lượng của trang hiện tại
  const displayItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_CONFIG.ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PAGE_CONFIG.ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-12" style={{ maxWidth: "1200px" }}>

          <div className="bg-white p-4 shadow-sm rounded-4 border-0">

            <div className="mb-4 border-bottom pb-4">
              <FilterBar keyword={search} onKeywordChange={setSearch} />
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary border-3" role="status"></div>
                <p className="mt-3 text-secondary fw-medium">Đang cập nhật danh sách...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                {/* ProductList chỉ nhận danh sách ĐÃ PHÂN TRANG */}
                <ProductList
                  products={displayItems}
                  onSelect={(product) => {

                    // ✅ SỬA: nếu chỉ có 1 variant → thêm luôn
                    if (product.variants?.length === 1) {
                      const variant = product.variants[0];

                      addItem({
                        productId: product.id,
                        productName: product.name,
                        variantId: variant.id ?? variant.name,
                        variantName: variant.name,
                        unitPrice: variant.price ?? product.salePrice ?? 0,
                      });

                      return;
                    }

                    setSelectedProduct(product);
                  }}
                />

                {/* Pagination điều khiển số trang của cha */}
                <div className="mt-4 border-top pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      // Tự động cuộn nhẹ lên đầu danh sách sản phẩm khi đổi trang
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-search fs-1 text-muted opacity-25"></i>
                <p className="mt-3 text-secondary fs-5">Không tìm thấy món "{search}"</p>
                <button className="btn btn-outline-primary btn-sm rounded-pill px-4" onClick={() => setSearch("")}>
                  Hiển thị tất cả sản phẩm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductVariant
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={(itemData) => {
            addItem(itemData);
          }}
        />
      )}

      <style>{`
        .bg-light { background-color: #f8f9fa !important; }
        .rounded-4 { border-radius: 1.25rem !important; }
        .card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none !important; border-radius: 1rem !important; }
        .card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important; }
      `}</style>
    </div>
  );
}

const MOCK_PRODUCTS = [
  { id: 1, name: "Cà phê sữa đá", code: "CF001", url: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=500", salePrice: 20000, variants: [{ name: "Size S" }, { name: "Size M" }] },
  { id: 2, name: "Trà đào miếng", code: "TD001", url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=500", salePrice: 25000, variants: [{ name: "Ít đá" }, { name: "Nhiều đá" }] },
  { id: 3, name: "Trà đào cam sả", code: "TD002", url: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=500", salePrice: 30000, variants: [{ name: "Bình thường" }] },
  { id: 4, name: "Trà đào chanh sả", code: "TD003", url: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=500", salePrice: 30000, variants: [{ name: "Bình thường" }] },
  { id: 5, name: "Nước cam ép", code: "NC001", url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=500", salePrice: 30000, variants: [{ name: "Bình thường" }] },
  { id: 6, name: "Sữa tươi trân châu", code: "ST001", url: "https://images.unsplash.com/photo-1551046710-22c2ea30245d?q=80&w=500", salePrice: 35000, variants: [{ name: "Size M" }] },
  { id: 7, name: "Nước cam ép", code: "NC001", url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=500", salePrice: 30000, variants: [{ name: "Bình thường" }] },
  { id: 8, name: "Sữa tươi trân châu", code: "ST001", url: "https://images.unsplash.com/photo-1551046710-22c2ea30245d?q=80&w=500", salePrice: 35000, variants: [{ name: "Size M" }] },
  { id: 9, name: "Nước cam ép", code: "NC001", url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=500", salePrice: 30000, variants: [{ name: "Bình thường" }] },
  { id: 10, name: "Sữa tươi trân châu", code: "ST001", url: "https://images.unsplash.com/photo-1551046710-22c2ea30245d?q=80&w=500", salePrice: 35000, variants: [{ name: "Size M" }] },
];