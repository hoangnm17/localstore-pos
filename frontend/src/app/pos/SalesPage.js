import Order from "./Order/Order";
import Product from "./Product/Product";
import { useState, useEffect } from "react"
import { useInvoiceTabs } from "hooks/pos/useInvoice";
import { useOrderItems } from "hooks/pos/useOrderItems";
import useHotkeys from "hooks/pos/useHotKeys";
import useTitle from "hooks/common/useTitle";

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

      const safeQty = Math.max(
        1,
        Math.min(quantity, it.quantityOnHand)
      );

      return { ...it, quantity: safeQty };
    });

    updateInvoiceItems(activeInvoice.id, newItems);
  };

  useHotkeys({
    Enter: () => setOpenPaymentSignal((s) => s + 1),
    F3: () => setFocusSignal(prev => prev + 1),
    F4: () => createInvoiceTab(),
    Escape: () => setActiveItemId(null)
  });
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

      {/* TAB BAR */}
      <div className="d-flex align-items-center border-bottom bg-white px-2">
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
              style={{ cursor: "pointer" }}
            >
              <span>
                Hoá đơn {index + 1}
                {tabTotal > 0 &&
                  ` (${tabTotal.toLocaleString()})`}
                {inv.isSaving && " ⏳"}
              </span>

              {invoices.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(inv.id);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  ✕
                </span>
              )}
            </div>
          );
        })}

        <button
          className="btn btn-sm btn-outline-primary ms-2"
          onClick={createInvoiceTab}
        >
          + Thêm tab
        </button>
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
            activeItemId={activeItemId}
            onChangeQty={handleChangeQty}
            focusSignal={focusSignal}
            openPaymentSignal={openPaymentSignal}
          />
        </div>

        {/* PRODUCT */}
        <div style={{ flex: 6 }} className="overflow-auto">
          <Product addItem={handleAddItem} />
        </div>

      </div>
    </div>
  );
}