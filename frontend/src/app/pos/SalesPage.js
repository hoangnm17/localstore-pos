import Order from "./Order/Order";
import Product from "./Product/Product";
import { useState, useEffect, useRef } from "react";
import { useInvoiceTabs } from "hooks/pos/useInvoice";
import { useOrderItems } from "hooks/pos/useOrderItems";
import useHotkeys from "hooks/pos/useHotKeys";
import useTitle from "hooks/common/useTitle";
import { useNavigate } from "react-router-dom";
import { logout } from "services/Auth/auth.service";
import { POS_HOTKEYS } from "config/HotKey";

export default function SalesHome() {
  const {
    invoices,
    activeInvoice,
    activeInvoiceId,
    setActiveInvoiceId,
    createInvoiceTab,
    updateInvoiceItems,
    updateInvoiceCustomer,
    closeTab,
    pay,
    handlePaymentSuccess,
    goToNextInvoice,
    goToPrevInvoice,
    accessError,
  } = useInvoiceTabs();

  const {
    addItem,
    increase,
    decrease,
    remove,
    calculateTotal,
    calculateTotalQuantity,
  } = useOrderItems();

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const currentInvIndex = invoices.findIndex((inv) => inv.id === activeInvoiceId) + 1;
  const customerName = activeInvoice?.customer?.name || "Khách lẻ";

  useTitle(activeInvoice ? `HĐ ${currentInvIndex} - ${customerName}` : "Đang tải...");

  const [openPaymentSignal, setOpenPaymentSignal] = useState(0);
  const [activeItemId, setActiveItemId] = useState(null);
  const [focusSignal, setFocusSignal] = useState(0);

  const isModalOpen = openPaymentSignal > 0;
  useHotkeys(
    {
      [POS_HOTKEYS.NEXT_INVOICE_TAB]: goToNextInvoice,
      [POS_HOTKEYS.PREV_INVOICE_TAB]: goToPrevInvoice,
      [POS_HOTKEYS.NEW_INVOICE_TAB]: createInvoiceTab,
      [POS_HOTKEYS.CLOSE_INVOICE_TAB]: () => {
        if (activeInvoiceId) closeTab(activeInvoiceId);
      },
      [POS_HOTKEYS.CLEAR_ACTIVE_ITEM]: () => setActiveItemId(null),
      [POS_HOTKEYS.OPEN_PAYMENT]: () => {
        if (!activeInvoice?.items?.length) return;
        setOpenPaymentSignal((s) => s + 1);
      },
    },
    { enabled: !isModalOpen }
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddItem = (product) => {
    if (!activeInvoice) return;
    const result = addItem(activeInvoice.items, product);
    updateInvoiceItems(activeInvoice.id, result.items);
    setActiveItemId(result.activeId);
    setFocusSignal((prev) => prev + 1);
  };
  const handleIncrease = (id) => { if (activeInvoice) updateInvoiceItems(activeInvoice.id, increase(activeInvoice.items, id)); };
  const handleDecrease = (id) => { if (activeInvoice) updateInvoiceItems(activeInvoice.id, decrease(activeInvoice.items, id)); };
  const handleRemove = (id) => { if (activeInvoice) updateInvoiceItems(activeInvoice.id, remove(activeInvoice.items, id)); };
  const handleSelectCustomer = async (customer) => {
    if (activeInvoice && activeInvoice.customer?.id !== customer?.id) {
      try { await updateInvoiceCustomer(activeInvoice.id, customer); } catch (e) { console.error(e); }
    }
  };
  const handleChangeQty = (id, quantity) => {
    if (!activeInvoice) return;
    const newItems = activeInvoice.items.map(it => {
      if (it.id !== id) return it;
      if (quantity === "" || quantity === ".") return { ...it, quantity };
      let num = parseFloat(quantity);
      if (isNaN(num)) return it;
      const maxQty = it.quantityOnHand ?? Infinity;
      num = Math.max(0, Math.min(num, maxQty));
      return { ...it, quantity: num };
    });
    updateInvoiceItems(activeInvoice.id, newItems);
  };

  const total = calculateTotal(activeInvoice?.items || []);
  const totalQuantity = calculateTotalQuantity(activeInvoice?.items || []);

  // MÀN HÌNH TRUY CẬP BỊ TỪ CHỐI
  if (accessError) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="card shadow-lg border-0 text-center p-5" style={{ maxWidth: "500px", borderRadius: "20px" }}>
          <div className="card-body">
            <div className="text-danger mb-4">
              <i className="bi bi-shield-lock-fill" style={{ fontSize: "4rem" }}></i>
            </div>
            <h2 className="fw-bold mb-3">Truy Cập Bị Từ Chối</h2>
            <p className="text-muted mb-4">{accessError}</p>
            <button className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm" onClick={() => (window.location.href = "/my-schedule")}>
              <i className="bi bi-house-door me-2"></i> Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MÀN HÌNH ĐANG TẢI
  if (!activeInvoice) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-white">
        <div className="spinner-grow text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status"></div>
        <span className="text-primary fw-bold letter-spacing-1">ĐANG KHỞI TẠO HỆ THỐNG POS...</span>
      </div>
    );
  }

  return (
    <div className="vh-100 d-flex flex-column overflow-hidden bg-light text-dark">
      {/* HEADER / TAB BAR */}
      <header className="d-flex align-items-center bg-white border-bottom flex-shrink-0 pe-2" style={{ height: "55px" }}>
        <div className="d-flex align-items-end flex-grow-1 overflow-auto no-scrollbar h-100 pt-2 px-2">
          {invoices.map((inv, index) => {
            const isActive = inv.id === activeInvoiceId;
            const tabTotal = calculateTotal(inv.items);
            return (
              <div
                key={inv.id}
                onClick={() => setActiveInvoiceId(inv.id)}
                className={`chrome-tab d-flex align-items-center gap-2 px-4 ${isActive ? "active" : ""}`}
              >
                <i className={`bi ${isActive ? "bi-file-earmark-text-fill" : "bi-file-earmark-text"}`}></i>
                <span className="small fw-bold">
                  HĐ {index + 1} {tabTotal > 0 && `· ${tabTotal.toLocaleString()}`}
                </span>
                {invoices.length > 1 && (
                  <i className="bi bi-x-circle-fill close-icon ms-2" onClick={(e) => { e.stopPropagation(); closeTab(inv.id); }}></i>
                )}
              </div>
            );
          })}

          <button className="btn-add-tab mb-2 ms-2" onClick={createInvoiceTab} title="Thêm hóa đơn mới (F2)">
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>

        {/* USER MENU */}
        <div className="ms-auto position-relative" ref={menuRef}>
          <button className={`btn border-0 d-flex align-items-center gap-2 px-3 py-2 rounded-3 ${showMenu ? "bg-primary-subtle" : ""}`} onClick={() => setShowMenu(!showMenu)}>
            <div className="text-end d-none d-sm-block">
              <div className="fw-bold small leading-1 text-primary">{currentUser?.fullName}</div>
            </div>
            <i className="bi bi-person-circle fs-4 text-primary"></i>
          </button>

          {showMenu && (
            <div className="dropdown-custom shadow-lg border rounded-3 overflow-hidden">
              <button className="dropdown-item py-2 px-3 border-0" onClick={() => navigate("/invoices")}>
                <i className="bi bi-receipt me-3 text-primary"></i> Lịch sử đơn hàng
              </button>
              <button className="dropdown-item py-2 px-3 border-0" onClick={() => navigate("/handover-report")}>
                <i className="bi bi-arrow-counterclockwise me-3 text-success"></i> Bàn giao ca
              </button>
              <button className="dropdown-item py-2 px-3 border-0" onClick={() => navigate("/my-schedule")}>
                <i className="bi bi-box-arrow-in-right me-3 text-success"></i> Lịch làm việc
              </button>
              <div className="border-top my-1"></div>
              <button className="dropdown-item py-2 px-3 border-0 text-danger" onClick={logout}>
                <i className="bi bi-power me-3"></i> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="d-flex flex-grow-1 overflow-hidden">
        {/* SIDEBAR ORDER (40%) */}
        <aside className="d-flex flex-column border-end bg-white glass-effect shadow-sm" style={{ flex: "0 0 40%", zIndex: 5 }}>
          <Order
            key={activeInvoice.id}
            orderId={activeInvoice.id}
            orderItems={activeInvoice.items}
            customer={activeInvoice.customer}
            total={total}
            totalQuantity={totalQuantity}
            increase={handleIncrease}
            decrease={handleDecrease}
            remove={handleRemove}
            onSelectCustomer={handleSelectCustomer}
            isSaving={activeInvoice.isSaving}
            onPay={pay}
            onBankPaid={handlePaymentSuccess}
            activeItemId={activeItemId}
            onChangeQty={handleChangeQty}
            focusSignal={focusSignal}
            openPaymentSignal={openPaymentSignal}
          />
        </aside>

        {/* PRODUCT GRID (60%) */}
        <section className="d-flex flex-column bg-light" style={{ flex: "0 0 60%" }}>
          <Product addItem={handleAddItem} focusSignal={focusSignal} />
        </section>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        /* Chrome Tabs Style */
        .chrome-tab {
          height: 38px;
          background: #e9ecef;
          border-radius: 12px 12px 0 0;
          margin-right: -8px;
          cursor: pointer;
          color: #5f6368;
          transition: all 0.2s;
          position: relative;
          border: 1px solid #dee2e6;
          border-bottom: none;
        }
        .chrome-tab:hover { background: #f1f3f4; z-index: 2; }
        .chrome-tab.active {
          background: linear-gradient(45deg, #007bff, #0056b3);
          color: white;
          z-index: 3;
          border-color: transparent;
        }
        .close-icon { font-size: 14px; opacity: 0.6; }
        .close-icon:hover { opacity: 1; color: #ff4d4f; }

        /* Add Tab Button */
        .btn-add-tab {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: #f8f9fa;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }
        .btn-add-tab:hover { background: #dee2e6; color: #000; }

        /* Glassmorphism Sidebar */
        .glass-effect {
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(10px);
        }

        /* User Menu */
        .dropdown-custom {
          position: absolute;
          top: 100%;
          right: 0;
          width: 220px;
          background: white;
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }
        .dropdown-item { transition: 0.2s; font-size: 0.9rem; background: transparent; width: 100%; text-align: left;}
        .dropdown-item:hover { background: #f8f9fa; transform: translateX(5px); }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Scrollbar tinh tế cho Order list (Inject vào component Order nếu cần) */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
      `}</style>
    </div>
  );
}