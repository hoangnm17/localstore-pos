import { useEffect, useState, useRef, useCallback } from "react";
import {
  invoiceCreate,
  invoiceUpdate,
  invoiceGetDrafts,
  invoiceGetDetail,
  invoiceUpdateCustomer
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

    // Optimistic UI update
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

          await invoiceUpdate(invoiceId, { items: newItems });

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

    try {
      // nếu invoice đã có trên DB thì update DB
      const invoice = invoices.find(i => String(i.id) === id);

      if (invoice && invoice.status !== "LOCAL") {
        await invoiceUpdateCustomer(id, {
          customerId: customer?.id ?? null
        });
      }

      setInvoices(prev =>
        prev.map(inv =>
          String(inv.id) === id
            ? { ...inv, customer }   // lưu full object
            : inv
        )
      );

    } catch (err) {
      console.error("Update customer failed:", err);
    }
  };

  /* =====================================================
     PAY
  ===================================================== */

  const pay = async (paymentInfo) => {
    if (!activeInvoice || activeInvoice.status !== "UNPAID") return;

    const paidInvoiceId = activeInvoice.id;

    try {
      clearAutoSave(paidInvoiceId);

      const res = await invoiceUpdate(paidInvoiceId, {
        status: "PAID",
        payment: paymentInfo
      });

      // bắt paid từ nhiều kiểu response khác nhau
      const paid =
        res?.paid ??
        res?.data?.paid ??
        res?.data?.data?.paid ??
        res?.success ??
        res?.data?.success ??
        res?.data?.data?.success;

      // nếu backend trả pending thì xử lý riêng
      if (res?.pending || res?.data?.pending) {
        showNotification("Đang chờ....!", "error");
        return res;
      }
      //  nếu update ok (paid/success) thì cập nhật UI
      if (!paid) {
        showNotification("Thanh toán thất bại!", "success");
        return res;
      }

      showNotification("Thanh toán thành công!", "success");
      let nextActiveId = null;

      setInvoices(prev => {
        const remaining = prev.filter(inv => inv.id !== paidInvoiceId);

        const nextUnpaid = [...remaining].reverse().find(inv => inv.status === "UNPAID");
        if (nextUnpaid) {
          nextActiveId = nextUnpaid.id;
          return remaining;
        }

        const local = createLocalInvoice(); // items: []
        nextActiveId = local.id;
        return [...remaining, local];
      });

      if (nextActiveId) setActiveInvoiceId(nextActiveId);

      return res;
    } catch (err) {
      console.error("Payment failed:", err);
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
        await invoiceUpdate(id, { status: "CANCELLED" });
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