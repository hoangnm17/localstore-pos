import { useEffect, useState, useRef, useCallback } from "react";
import {
  invoiceCreate,
  invoiceGetDrafts,
  invoiceGetDetail,
  invoiceUpdateCustomer,
  invoiceCancel,
  invoiceUpdateItems
} from "../../services/Invoices/invoice.service";

import { payCash, createBankPayment } from "services/Payment/payment.service";
import { useNotification } from "components/global/Notification/NotificationContext";

export const useInvoiceTabs = () => {

  const { showNotification } = useNotification();
  const [invoices, setInvoices] = useState([]);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const saveTimeouts = useRef({});


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

  const activeInvoice = invoices.find(i => i.id === activeInvoiceId) || null;

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

  const createInvoiceTab = useCallback(() => {
    const local = createLocalInvoice();
    setInvoices(prev => [...prev, local]);
    setAsActive(local.id);
  }, []);


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

  const handlePaymentSuccess = useCallback((invoiceId) => {
    showNotification("Thanh toán thành công!", "success");

    let nextActiveId = null;
    setInvoices((prev) => {
      const remaining = prev.filter((inv) => String(inv.id) !== String(invoiceId));

      // Tìm hóa đơn UNPAID khác để nhảy sang
      const nextUnpaid = [...remaining].reverse().find((inv) => inv.status === "UNPAID");

      if (nextUnpaid) {
        nextActiveId = nextUnpaid.id;
        return remaining;
      }

      // Nếu không còn đơn nào thì tạo đơn mới
      const local = createLocalInvoice();
      nextActiveId = local.id;
      return [...remaining, local];
    });

    if (nextActiveId) setActiveInvoiceId(nextActiveId);
  }, [showNotification]);

  const pay = async (paymentInfo) => {
    if (!activeInvoice || activeInvoice.status !== "UNPAID") return;
    const invoiceId = activeInvoice.id;

    try {
      clearAutoSave(invoiceId);
      if (paymentInfo.method === "CASH") {
        const res = await payCash(invoiceId, { payment: paymentInfo });
        const data = res?.data?.data || res?.data || res;
        return data;
      } else if (paymentInfo.method === "BANK") {
        const qrRes = await createBankPayment(invoiceId, { discount: paymentInfo.discount });
        const qr = qrRes?.data?.data?.qr;
        if (!qr) throw new Error("QR generation failed");
        return { pending: true, qr };
      }
    } catch (err) {
      showNotification("Thanh toán thất bại!", "error");
      throw err;
    }
  };


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

  const goToNextInvoice = useCallback(() => {
    if (!invoices.length || !activeInvoiceId) return;

    const currentIndex = invoices.findIndex(
      (inv) => String(inv.id) === String(activeInvoiceId)
    );

    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % invoices.length;
    setAsActive(invoices[nextIndex].id);
  }, [invoices, activeInvoiceId]);

  const goToPrevInvoice = useCallback(() => {
    if (!invoices.length || !activeInvoiceId) return;

    const currentIndex = invoices.findIndex(
      (inv) => String(inv.id) === String(activeInvoiceId)
    );

    if (currentIndex === -1) return;

    const prevIndex = (currentIndex - 1 + invoices.length) % invoices.length;
    setAsActive(invoices[prevIndex].id);
  }, [invoices, activeInvoiceId]);


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
    handlePaymentSuccess,
    goToNextInvoice,
    goToPrevInvoice,
  };
};