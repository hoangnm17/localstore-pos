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
import { useNotification } from "components/global/Notification/NotificationContext";
import 'style/POS/SalePage.css'

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
    updateSearchText,
    handleFinishOrder
  } = useInvoiceTabs();

  const {
    addItem,
    increase,
    decrease,
    remove,
    calculateTotal,
    calculateTotalQuantity,
  } = useOrderItems();

  const { showNotification } = useNotification();
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

  useEffect(() => {
    const es = new EventSource(`${process.env.REACT_APP_API_BASE_URL}/sse`);

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === "PAYMENT_SUCCESS") {
          handlePaymentSuccess(payload);
        }
      } catch (err) {
        console.error("SSE Parse Error:", err);
      }
    };

    es.onerror = () => {
      console.warn("SSE Lost connection. Reconnecting...");
    };

    return () => es.close();
  }, [handlePaymentSuccess]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (e.key === "ArrowRight") goToNextInvoice();
        else goToPrevInvoice();
        return;
      }

      if (e.key === "F2") {
        e.preventDefault();
        createInvoiceTab();
      }

      if (e.ctrlKey && e.key === "Delete") {
        e.preventDefault();
        if (invoices.length > 1) {
          closeTab(activeInvoiceId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [invoices.length, activeInvoiceId, goToNextInvoice, goToPrevInvoice]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddItem = (product) => {
    if (!activeInvoice) return;

    const oldItems = activeInvoice.items;
    const result = addItem(oldItems, product);

    const sameProductItems = result.items.filter(
      (it) => Number(it.productId) === Number(product.productId || product.id)
    );

    const totalRequestedQuantity = sameProductItems.reduce((total, item) => {
      const itemFactor = item.factor || 1;
      return total + (Number(item.quantity) * itemFactor);
    }, 0);

    const stockLimit = product.productStock || 0;

    if (totalRequestedQuantity > stockLimit) {
      const currentQtyInCart = totalRequestedQuantity - (product.factor || 1); // Số lượng trước khi cộng thêm phát này
      showNotification(
        `Không đủ tồn kho! Tổng nhập quy đổi: ${totalRequestedQuantity}, Kho chỉ còn: ${stockLimit}`,
        "warning"
      );
      return;
    }

    updateInvoiceItems(activeInvoice.id, result.items);
    setActiveItemId(result.activeId);

    showNotification(`Đã thêm ${product.productName}`, "success");
    window.dispatchEvent(new Event("RE_FOCUS_SEARCH"));
  };

  const handleIncrease = (id) => {
    if (!activeInvoice) return;

    const targetItem = activeInvoice.items.find(it => it.id === id);
    if (!targetItem) return;

    const sameProductItems = activeInvoice.items.filter(it => it.productId === targetItem.productId);
    const totalConvertedQty = sameProductItems.reduce((sum, it) => sum + (it.quantity * (it.factor || 1)), 0);

    if (totalConvertedQty + (targetItem.factor || 1) > targetItem.productStock) {
      showNotification(`Không thể tăng! Đã đạt giới hạn tồn kho tổng (${targetItem.productStock})`, "warning");
      return;
    }
    updateInvoiceItems(activeInvoice.id, increase(activeInvoice.items, id));
  };
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

      if (quantity === "" || quantity === "." || (typeof quantity === 'string' && quantity.endsWith('.'))) {
        return { ...it, quantity };
      }

      let num = parseFloat(quantity);
      if (isNaN(num)) return it;

      const otherItemsQty = activeInvoice.items
        .filter(item => item.productId === it.productId && item.id !== id)
        .reduce((sum, item) => sum + (Number(item.quantity) * (item.factor || 1)), 0);

      const remainingStock = it.productStock - otherItemsQty;
      const maxQtyForThisUnit = remainingStock / (it.factor || 1);

      if (num > maxQtyForThisUnit) {
        num = maxQtyForThisUnit;
        return { ...it, quantity: num };
      }

      if (num < 0) num = 0;
      return { ...it, quantity: quantity };
    });

    updateInvoiceItems(activeInvoice.id, newItems);
  };

  const total = calculateTotal(activeInvoice?.items || []);
  const totalQuantity = calculateTotalQuantity(activeInvoice?.items || []);

  if (accessError) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
        <div className="text-danger mb-4" style={{ fontSize: '5rem', lineHeight: 1 }}>
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h2 className="fw-bold text-dark mb-3">Truy Cập Bị Từ Chối</h2>
        <p className="text-muted fs-5 text-center px-4" style={{ maxWidth: '600px', whiteSpace: 'pre-line' }}>
          {accessError}
        </p>
        <button
          className="btn btn-primary mt-4 px-4 py-3 fw-bold rounded-3 shadow-sm"
          onClick={() => window.location.href = '/my-schedule'}
        >
          <i className="bi bi-arrow-left me-2"></i> Quay lại trang chủ
        </button>
      </div>
    );
  }

  if (!activeInvoice && invoices.length === 0) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-white">
        <div className="spinner-grow text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status"></div>
        <span className="text-primary fw-bold letter-spacing-1">ĐANG KHỞI TẠO HỆ THỐNG POS...</span>
      </div>
    );
  }

  if (!activeInvoice) return null;

  return (
    <div className="vh-100 d-flex flex-column overflow-hidden bg-light text-dark">
      {/* HEADER / TAB BAR */}
      <header className="d-flex align-items-center bg-white border-bottom flex-shrink-0 pe-2" style={{ height: "55px" }}>
        <div className="d-flex align-items-end flex-grow-1 overflow-auto no-scrollbar h-100 pt-2 px-2">
          {invoices.map((inv, index) => {
            const isActive = inv.id === activeInvoiceId;
            const isPaid = inv.status === "PAID"; // Kiểm tra trạng thái mới
            const tabTotal = calculateTotal(inv.items);

            return (
              <div
                key={inv.id}
                onClick={() => setActiveInvoiceId(inv.id)}
                className={`chrome-tab d-flex align-items-center gap-2 px-4 
        ${isActive ? "active" : ""} 
        ${isPaid ? "bg-success text-white border-success" : ""}`} // Thêm màu xanh nếu đã thanh toán
              >
                <i className={`bi ${isPaid ? "bi-check-circle-fill" : (isActive ? "bi-file-earmark-text-fill" : "bi-file-earmark-text")}`}></i>
                <span className="small fw-bold">
                  HĐ {index + 1} {isPaid ? "(Đã xong)" : ""}
                </span>
                {/* Nút đóng Tab luôn hiển thị để thu ngân tự dọn dẹp sau khi in xong */}
                <i className="bi bi-x-circle-fill close-icon ms-2" onClick={(e) => { e.stopPropagation(); closeTab(inv.id, !isPaid); }}></i>
              </div>
            );
          })}

          <button className="btn-add-tab mb-2 ms-2" onClick={createInvoiceTab} title="Thêm hóa đơn mới (F2)">
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>

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

      <main className="d-flex flex-grow-1 overflow-hidden">
        <aside className="d-flex flex-column border-end bg-white glass-effect shadow-sm" style={{ flex: "0 0 45%", zIndex: 5 }}>
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
            onBankPaid={handleFinishOrder}
            activeItemId={activeItemId}
            onChangeQty={handleChangeQty}
            focusSignal={focusSignal}
            openPaymentSignal={openPaymentSignal}
            status={activeInvoice.status}
          />
        </aside>

        <section className="d-flex flex-column bg-light" style={{ flex: "0 0 55%" }}>
          <Product
            addItem={handleAddItem}
            invoiceId={activeInvoiceId}
            isModalOpen={isModalOpen}
            searchText={activeInvoice?.searchText || ""}
            onSearchChange={(txt) => updateSearchText(activeInvoiceId, txt)}
          />
        </section>
      </main>
    </div>
  );
}