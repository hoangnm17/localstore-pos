import Order from "./Order/Order";
import Product from "./Product/Product";
import { useInvoiceTabs } from "hooks/pos/useInvoice";
import { useOrderItems } from "hooks/pos/useOrderItems";

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
  } = useInvoiceTabs();

  const {
    addItem,
    increase,
    decrease,
    remove,
    calculateTotal,
    calculateTotalQuantity,
  } = useOrderItems();


  const handleAddItem = (product) => {
    if (!activeInvoice) return;

    const newItems = addItem(activeInvoice.items, product);
    updateInvoiceItems(activeInvoice.id, newItems);
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

    await updateInvoiceCustomer(activeInvoice.id, customer);
  };

  const total = calculateTotal(activeInvoice?.items || []);
  const totalQuantity = calculateTotalQuantity(
    activeInvoice?.items || []
  );


  if (!activeInvoice) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        Loading invoice...
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