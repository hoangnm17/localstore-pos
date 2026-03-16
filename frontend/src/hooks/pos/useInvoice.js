import { useEffect, useState, useRef, useCallback } from "react";
import {
  invoiceCreate,
  payCash,
  invoiceGetDrafts,
  invoiceGetDetail,
  invoiceUpdateCustomer,
  invoiceCancel,
  invoiceUpdateItems
} from "../../services/Invoices/invoice.service";
import { useNotification } from "components/global/Notification/NotificationContext";

export const useInvoiceTabs = () => {

  const { showNotification } = useNotification();
  const [invoices, setInvoices] = useState([]);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const saveTimeouts = useRef({});

  /* =====================================================
     HELPERS
  ===================================================== */

  const clearAutoSave = (id) => {
    if (saveTimeouts.current[id]) {
      clearTimeout(saveTimeouts.current[id]);
      delete saveTimeouts.current[id];
    }
  };

  const createLocalInvoice = () => ({
    id: "local-" + crypto.randomUUID(),
    items: [],
    status: "LOCAL",
    isSaving: false,
    itemsLoaded: true
  });

  const setAsActive = (id) => {
    setActiveInvoiceId(id);
  };

  /* =====================================================
     LOAD DRAFTS ON MOUNT
  ===================================================== */

  useEffect(() => {
    const loadDrafts = async () => {
      try {
        const res = await invoiceGetDrafts();
        if (res && res.success === false) {
          showNotification(res.message
             || "Lỗi truy cập ca làm việc!", "error");
          const local = createLocalInvoice();
          setInvoices([local]);
          setAsActive(local.id);
          return;
        }

        const drafts = res?.data || [];

        if (drafts.length === 0) {
          const local = createLocalInvoice();
          setInvoices([local]);
          setAsActive(local.id);
          return;
        }

        const formatted = drafts.map(inv => ({
          ...inv,
          items: [],
          itemsLoaded: false,
          isSaving: false
        }));

        setInvoices(formatted);
        setAsActive(formatted[0].id);

      } catch (err) {
        console.error("Load drafts failed:", err);
        const local = createLocalInvoice();
        setInvoices([local]);
        setAsActive(local.id);
      }
    };

    loadDrafts();
  }, []);

  /* =====================================================
     ACTIVE INVOICE
  ===================================================== */

  const activeInvoice =
    invoices.find(i => i.id === activeInvoiceId) || null;

  /* =====================================================
     LAZY LOAD DETAIL
  ===================================================== */

  useEffect(() => {
    if (!activeInvoice) return;
    if (activeInvoice.status === "LOCAL") return;
    if (activeInvoice.itemsLoaded) return;

    const loadDetail = async () => {
      try {
        const res = await invoiceGetDetail(activeInvoice.id);
        const detail = res?.data;
        setInvoices(prev =>
          prev.map(inv =>
            inv.id === activeInvoice.id
              ? {
                ...inv,
                items: detail?.items ?? [],
                itemsLoaded: true
              }
              : inv
          )
        );

      } catch (err) {
        console.error("Load invoice detail failed:", err);
      }
    };

    loadDetail();

  }, [activeInvoiceId]);

  /* =====================================================
     CREATE TAB
  ===================================================== */

  const createInvoiceTab = useCallback(() => {
    const local = createLocalInvoice();
    setInvoices(prev => [...prev, local]);
    setAsActive(local.id);
  }, []);

  /* =====================================================
     UPDATE ITEMS
  ===================================================== */

  const updateInvoiceItems = async (invoiceId, newItems = []) => {

    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? { ...inv, items: newItems }
          : inv
      )
    );

    /* ========= LOCAL → CREATE ========= */

    if (invoice.status === "LOCAL" && newItems.length > 0) {
      try {

        setInvoices(prev =>
          prev.map(inv =>
            inv.id === invoiceId
              ? { ...inv, isSaving: true }
              : inv
          )
        );

        const res = await invoiceCreate({ items: newItems });

        if (res && res.success === false) {
          showNotification(res.message || "Bạn đang ngồi sai Quầy!", "error");
          setInvoices(prev => 
            prev.map(inv => 
              inv.id === invoiceId ? 
              { ...inv, 
                isSaving: false, 
                items: [] }
                 : inv
                ));
          return;
        }
        const newDbId = res?.data?.id;
        if (!newDbId) return;

        clearAutoSave(invoiceId);

        setInvoices(prev =>
          prev.map(inv =>
            inv.id === invoiceId
              ? {
                ...inv,
                id: newDbId,
                status: "UNPAID",
                isSaving: false,
                itemsLoaded: true
              }
              : inv
          )
        );

        setAsActive(newDbId);

      } catch (err) {
        console.error("Create invoice failed:", err);
      }

      return;
    }

    /* ========= UNPAID → AUTOSAVE ========= */

    if (invoice.status === "UNPAID") {

      clearAutoSave(invoiceId);

      saveTimeouts.current[invoiceId] = setTimeout(async () => {
        try {

          setInvoices(prev =>
            prev.map(inv =>
              inv.id === invoiceId
                ? { ...inv, isSaving: true }
                : inv
            )
          );

          await invoiceUpdateItems(invoiceId, { items: newItems });

        } catch (err) {
          console.error("Auto save failed:", err);
        } finally {
          setInvoices(prev =>
            prev.map(inv =>
              inv.id === invoiceId
                ? { ...inv, isSaving: false }
                : inv
            )
          );
        }
      }, 1000);
    }
  };

  /* =====================================================
   UPDATE CUSTOMER
===================================================== */

  const updateInvoiceCustomer = async (invoiceId, customer) => {
    const id = String(invoiceId);
    const invoice = invoices.find(i => String(i.id) === id);
    if (!invoice) return;

    try {
      if (invoice.status === "LOCAL") {
        setInvoices(prev => prev.map(inv =>
          inv.id === id ? { ...inv, isSaving: true } : inv
        ));

        const res = await invoiceCreate({
          items: invoice.items,
          customerId: customer?.id ?? null
        });
        if (res && res.success === false) {
          showNotification(res.message || "Lỗi tạo hóa đơn!", "error");
          setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, isSaving: false } : inv));
          return;
        }
        const newDbId = res?.data?.id;
        if (newDbId) {
          setInvoices(prev => prev.map(inv =>
            inv.id === id ? {
              ...inv,
              id: newDbId,
              status: "UNPAID",
              customer,
              isSaving: false,
              itemsLoaded: true
            } : inv
          ));
          setActiveInvoiceId(newDbId);
        }
        return;
      }

      if (invoice.status !== "LOCAL") {
        await invoiceUpdateCustomer(id, {
          customerId: customer?.id ?? null
        });

        setInvoices(prev => prev.map(inv =>
          String(inv.id) === id ? { ...inv, customer } : inv
        ));
      }
    } catch (err) {
      console.error("Update customer failed:", err);
      setInvoices(prev => prev.map(inv =>
        inv.id === id ? { ...inv, isSaving: false } : inv
      ));
    }
  };

  /* =====================================================
     PAY
  ===================================================== */

  const pay = async (paymentInfo) => {
    if (!activeInvoice || activeInvoice.status !== "UNPAID") return;

    const invoiceId = activeInvoice.id;

    try {
      clearAutoSave(invoiceId);

      let res;

      switch (paymentInfo.method) {
        case "CASH":
          res = await payCash(invoiceId, { payment: paymentInfo });
          break;

        case "BANK":
          return { pending: true };
        default:
          throw new Error("Unsupported payment method");
      }

      const data = res?.data?.data || res?.data || res;
      
      if (!data?.paid) {
        showNotification(res || "Thanh toán thất bại!", "error");
        return res;
      }

      showNotification("Thanh toán thành công!", "success");

      let nextActiveId = null;

      setInvoices((prev) => {
        const remaining = prev.filter((inv) => inv.id !== invoiceId);

        const nextUnpaid = [...remaining]
          .reverse()
          .find((inv) => inv.status === "UNPAID");

        if (nextUnpaid) {
          nextActiveId = nextUnpaid.id;
          return remaining;
        }

        const local = createLocalInvoice();
        nextActiveId = local.id;
        return [...remaining, local];
      });

      if (nextActiveId) setActiveInvoiceId(nextActiveId);

      return data;
    } catch (err) {
      console.error("Payment failed:", err);
      showNotification("Thanh toán thất bại!", "error");
      throw err;
    }
  };
  /* =====================================================
     CLOSE TAB
  ===================================================== */

  const closeTab = async (id, shouldCancel = true) => {

    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;

    clearAutoSave(id);

    if (invoice.status === "LOCAL") {
      removeTab(id);
      return;
    }

    if (shouldCancel && invoice.status === "UNPAID") {
      try {
        await invoiceCancel(id);
      } catch (err) {
        console.error("Cancel invoice failed:", err);
        return;
      }
    }

    removeTab(id);
  };

  const removeTab = (id) => {
    const remaining = invoices.filter(i => i.id !== id);

    if (remaining.length === 0) {
      const local = createLocalInvoice();
      setInvoices([local]);
      setAsActive(local.id);
    } else {
      setInvoices(remaining);
      setAsActive(remaining[0].id);
    }
  };

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    const timeouts = saveTimeouts.current;
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, []);

  return {
    invoices,
    activeInvoice,
    activeInvoiceId,
    setInvoices,
    setActiveInvoiceId: setAsActive,
    createInvoiceTab,
    updateInvoiceItems,
    pay,
    closeTab,
    updateInvoiceCustomer,
  };
};