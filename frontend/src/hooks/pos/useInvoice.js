import { useEffect, useState, useRef, useCallback } from "react";
import {
  invoiceCreate,
  invoiceUpdate
} from "../../services/Invoices/invoice.service";

export const useInvoiceTabs = () => {

  const [invoices, setInvoices] = useState([]);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const saveTimeouts = useRef({});

  /* =====================================================
     CREATE LOCAL TAB
  ===================================================== */
  const createInvoiceTab = useCallback(() => {
    const localId = "local-" + crypto.randomUUID();

    const newInvoice = {
      id: localId,
      items: [],
      status: "LOCAL",
      isSaving: false
    };

    setInvoices(prev => [...prev, newInvoice]);
    setActiveInvoiceId(localId);
  }, []);

  useEffect(() => {
    createInvoiceTab();
  }, [createInvoiceTab]);

  /* =====================================================
     ACTIVE INVOICE
  ===================================================== */
  const activeInvoice =
    invoices.find(i => i.id === activeInvoiceId) || null;

  /* =====================================================
     CLEAR AUTOSAVE
  ===================================================== */
  const clearAutoSave = (id) => {
    if (saveTimeouts.current[id]) {
      clearTimeout(saveTimeouts.current[id]);
      delete saveTimeouts.current[id];
    }
  };

  /* =====================================================
     UPDATE ITEMS
  ===================================================== */
  const updateInvoiceItems = async (invoiceId, newItems) => {

    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    // Update UI immediately (optimistic)
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? { ...inv, items: newItems }
          : inv
      )
    );

    /* ========= LOCAL → CREATE DB ========= */
    if (invoice.status === "LOCAL" && newItems.length > 0) {

      try {

        setInvoices(prev =>
          prev.map(inv =>
            inv.id === invoiceId
              ? { ...inv, isSaving: true }
              : inv
          )
        );

        const res = await invoiceCreate({
          items: newItems
        });

        const newDbId = res?.data?.id;
        if (!newDbId) return;

        // Replace local invoice with DB invoice
        setInvoices(prev =>
          prev.map(inv =>
            inv.id === invoiceId
              ? {
                  ...inv,
                  id: newDbId,
                  status: "UNPAID",
                  isSaving: false
                }
              : inv
          )
        );

        setActiveInvoiceId(newDbId);

      } catch (err) {
        console.error("Create invoice failed:", err);

        setInvoices(prev =>
          prev.map(inv =>
            inv.id === invoiceId
              ? { ...inv, isSaving: false }
              : inv
          )
        );
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

          await invoiceUpdate(invoiceId, {
            items: newItems
          });

        } catch (error) {
          console.error("Auto save failed:", error);
        } finally {
          setInvoices(prev =>
            prev.map(inv =>
              inv.id === invoiceId
                ? { ...inv, isSaving: false }
                : inv
            )
          );
        }

      }, 800);
    }
  };

  /* =====================================================
     PAY → AUTO CLOSE TAB
  ===================================================== */
  const pay = async (paymentInfo) => {

    const invoice = invoices.find(i => i.id === activeInvoiceId);
    if (!invoice || invoice.status !== "UNPAID") return;

    try {

      clearAutoSave(invoice.id);

      await invoiceUpdate(invoice.id, {
        status: "PAID",
        payment: paymentInfo
      });

      // Remove tab after successful payment
      setInvoices(prev => {
        const remaining = prev.filter(i => i.id !== invoice.id);

        if (remaining.length === 0) {
          const newLocalId = "local-" + crypto.randomUUID();
          setActiveInvoiceId(newLocalId);
          return [{
            id: newLocalId,
            items: [],
            status: "LOCAL",
            isSaving: false
          }];
        }

        setActiveInvoiceId(remaining[0].id);
        return remaining;
      });

    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  /* =====================================================
     CLOSE TAB → CANCEL IF NEEDED
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
    setInvoices(prev => {
      const remaining = prev.filter(i => i.id !== id);

      if (id === activeInvoiceId) {
        setActiveInvoiceId(remaining[0]?.id || null);
      }

      return remaining;
    });
  };

  /* =====================================================
     CLEANUP
  ===================================================== */
  useEffect(() => {
    return () => {
      Object.values(saveTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  return {
    invoices,
    activeInvoice,
    activeInvoiceId,
    setActiveInvoiceId,
    createInvoiceTab,
    updateInvoiceItems,
    pay,
    closeTab
  };
};