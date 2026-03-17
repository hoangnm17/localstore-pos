import Order from "./Order/Order";
import Product from "./Product/Product";
import { useState, useEffect, useRef } from "react"
import { useInvoiceTabs } from "hooks/pos/useInvoice";
import { useOrderItems } from "hooks/pos/useOrderItems";
import useHotkeys from "hooks/pos/useHotKeys";
import useTitle from "hooks/common/useTitle";
import { useLocation, useNavigate } from "react-router-dom";
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
    accessError
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

  const currentInvIndex = invoices.findIndex(inv => inv.id === activeInvoiceId) + 1;
  const customerName = activeInvoice?.customer?.name || "Khách lẻ";

  useTitle(
    activeInvoice
      ? `HĐ ${currentInvIndex} - ${customerName}`
      : "Đang tải hóa đơn..."
  );

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
    {
      enabled: !isModalOpen
    }
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddItem = (product) => {
    if (!activeInvoice) return;

    const result = addItem(activeInvoice.items, product);

    updateInvoiceItems(activeInvoice.id, result.items);
    setActiveItemId(result.activeId);
    setFocusSignal(prev => prev + 1);
  };

  const handleIncrease = (id) => {
    if (!activeInvoice) return;

    const newItems = increase(activeInvoice.items, id);
    updateInvoiceItems(activeInvoice.id, newItems);
  };

  const handleDecrease = (id) => {
    if (!activeInvoice) return;

    const newItems = decrease(activeInvoice.items, id);
    updateInvoiceItems(activeInvoice.id, newItems);
  };

  const handleRemove = (id) => {
    if (!activeInvoice) return;

    const newItems = remove(activeInvoice.items, id);
    updateInvoiceItems(activeInvoice.id, newItems);
  };

  const handleSelectCustomer = async (customer) => {
    if (!activeInvoice) return;

    if (activeInvoice.customer?.id === customer?.id) return;

    try {
      await updateInvoiceCustomer(activeInvoice.id, customer);
    } catch (error) {
      console.error("Lỗi cập nhật khách hàng:", error);
    }
  };

  const total = calculateTotal(activeInvoice?.items || []);
  const totalQuantity = calculateTotalQuantity(
    activeInvoice?.items || []
  );

  const handleChangeQty = (id, quantity) => {
    if (!activeInvoice) return;

    const newItems = activeInvoice.items.map(it => {
      if (it.id !== id) return it;

      if (quantity === "" || quantity === ".") {
        return { ...it, quantity: quantity };
      }

      let num = parseFloat(quantity);

      if (isNaN(num)) return it;

      const maxQty = it.quantityOnHand ?? Infinity;

      if (num > maxQty) {
        return { ...it, quantity: maxQty };
      }

      if (num < 0) return { ...it, quantity: 0 };
      if (typeof quantity === 'string' && quantity.endsWith('.') && it.unitType !== "PIECE") {
        return { ...it, quantity: quantity };
      }
      return { ...it, quantity: quantity };
    });

    updateInvoiceItems(activeInvoice.id, newItems);
  };

  // if (accessError) {
  //   return (
  //     <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
  //       <div className="text-danger mb-4" style={{ fontSize: '5rem', lineHeight: 1 }}>
  //          <i className="bi bi-exclamation-triangle-fill"></i>
  //       </div>
  //       <h2 className="fw-bold text-dark mb-3">Truy Cập Bị Từ Chối</h2>
  //       <p className="text-muted fs-5 text-center px-4" style={{ maxWidth: '600px', whiteSpace: 'pre-line' }}>
  //           {accessError}
  //       </p>
  //       <button 
  //           className="btn btn-primary mt-4 px-4 py-3 fw-bold rounded-3 shadow-sm" 
  //           onClick={() => window.location.href = '/my-schedule'} 
  //       >
  //           <i className="bi bi-arrow-left me-2"></i> Quay lại trang chủ
  //       </button>
  //     </div>
  //   );
  // }
  if (!activeInvoice) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
        <span className="text-muted fw-medium fs-5">Đang khởi tạo máy thu ngân...</span>
      </div>
    );
  }

  return (
    <div className="vh-100 d-flex bg-light flex-column overflow-hidden">

      <div className="d-flex align-items-center border-bottom bg-white px-2 flex-shrink-0" style={{ height: '50px' }}>
        <div className="d-flex align-items-center flex-grow-1 overflow-auto no-scrollbar h-100">
          {invoices.map((inv, index) => {
            const isActive = inv.id === activeInvoiceId;
            const tabTotal = calculateTotal(inv.items);

            return (
              <div
                key={inv.id}
                onClick={() => setActiveInvoiceId(inv.id)}
                className={`px-3 py-2 me-2 rounded-top d-flex align-items-center gap-2 ${isActive
                  ? "bg-primary text-white"
                  : "bg-light"
                  }`}
                style={{ cursor: "pointer", whiteSpace: 'nowrap' }}
              >
                <span>
                  Hoá đơn {index + 1}
                  {tabTotal > 0 &&
                    ` (${tabTotal.toLocaleString()})`}
                  {inv.isSaving}
                </span>

                {invoices.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(inv.id);
                    }}
                    style={{ cursor: "pointer" }}
                    className="ms-2"
                  >
                    X
                  </span>
                )}
              </div>
            );
          })}

          <button
            className="btn btn-sm btn-outline-primary flex-shrink-0"
            onClick={createInvoiceTab}
          >
            + Thêm tab
          </button>
        </div>

        {/* MENU DROPDOWN GÓC PHẢI */}
        <div className="position-relative ms-auto h-100 border-start" ref={menuRef}>
          <button
            className={`btn h-100 rounded-0 px-3 border-0 shadow-none ${showMenu ? 'bg-light text-primary' : 'text-secondary'}`}
            onClick={() => setShowMenu(!showMenu)}
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          {showMenu && (
            <div className="position-absolute bg-white shadow-lg border rounded-3 py-2"
              style={{ top: '100%', right: '5px', width: '250px', zIndex: 3000 }}>
              <div className="px-3 py-2 border-bottom mb-2">
                <div className="fw-bold text-dark text-truncate small">Admin: {currentUser?.fullName || 'Nhân viên'}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>Chi nhánh trung tâm</div>
              </div>

              <button className="dropdown-item py-2 px-3 d-flex align-items-center border-0 bg-transparent w-100 text-start" onClick={() => navigate('/invoices')}>
                <i className="bi bi-receipt me-3"></i> Lịch sử đơn hàng
              </button>
              <button className="dropdown-item py-2 px-3 d-flex align-items-center border-0 bg-transparent w-100 text-start" onClick={() => navigate('/shift-report')}>
                <i className="bi bi-box-arrow-in-right me-3"></i> Phiếu bàn giao ca
              </button>
              <button className="dropdown-item py-2 px-3 d-flex align-items-center border-0 bg-transparent w-100 text-start" onClick={() => navigate('/my-schedule')}>
                <i className="bi bi-arrow-counterclockwise me-3"></i> Lịch làm việc
              </button>
              <div className="border-top my-2"></div>
              <button className="dropdown-item py-2 px-3 d-flex align-items-center border-0 bg-transparent w-100 text-start text-danger" onClick={logout}>
                <i className="bi bi-power me-3"></i> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="d-flex flex-grow-1 overflow-hidden">

        {/* ORDER */}
        <div
          className="bg-white border-end d-flex flex-column"
          style={{ flex: 4 }}
        >
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
        </div>
        <div style={{ flex: 6 }} className="d-flex flex-column bg-white">
          <Product
            addItem={handleAddItem}
            focusSignal={focusSignal}
          />
        </div>

      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .dropdown-item:hover { background-color: #f8f9fa; color: #0d6efd; }
      `}</style>
    </div>
  );
}