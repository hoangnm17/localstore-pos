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
      isDirty: false,
      isSaving: false
    };

    setInvoices(prev => [...prev, newInvoice]);
    setActiveInvoiceId(localId);
  }, []);

  /* INIT FIRST TAB */
  useEffect(() => {
    createInvoiceTab();
  }, [createInvoiceTab]);

  /* ACTIVE INVOICE */
  const activeInvoice =
    invoices.find(i => i.id === activeInvoiceId) || null;

  /* =====================================================
     UPDATE ITEMS (FIXED)
  ===================================================== */
  const updateInvoiceItems = async (invoiceId, newItems) => {

    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    // ===============================
    // 1️⃣ UPDATE UI FIRST (OPTIMISTIC)
    // ===============================
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? {
            ...inv,
            items: newItems,
            isDirty: true,
            isSaving: inv.status === "LOCAL" // chỉ show saving nếu LOCAL
          }
          : inv
      )
    );

    // ===============================
    // 2️⃣ IF LOCAL → CREATE DB RECORD
    // ===============================
    if (invoice.status === "LOCAL") {
      try {

        const res = await invoiceCreate({
          items: newItems,
          status: "DRAFT"
        });

        if (!res?.data?.id) return;

        const newDbId = res.data.id;

        setInvoices(prev =>
          prev.map(inv =>
            inv.id === invoiceId
              ? {
                ...inv,
                id: newDbId,
                status: "DRAFT",
                isDirty: false,
                isSaving: false
              }
              : inv
          )
        );

        setActiveInvoiceId(newDbId);

      } catch (err) {
        console.error("Create invoice failed:", err);

        // rollback saving state
        setInvoices(prev =>
          prev.map(inv =>
            inv.id === invoiceId
              ? { ...inv, isSaving: false }
              : inv
          )
        );
      }
    }

    // Nếu là DRAFT → autosave sẽ xử lý
  };

  const updateInvoiceCustomer = (invoiceId, customer) => {
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? { ...inv, customer }
          : inv
      )
    );
  };

  /* =====================================================
     AUTOSAVE (DEBOUNCED PER INVOICE)
  ===================================================== */
  useEffect(() => {

    invoices.forEach(inv => {

      if (!inv.isDirty || inv.status !== "DRAFT") return;

      if (saveTimeouts.current[inv.id]) {
        clearTimeout(saveTimeouts.current[inv.id]);
      }

      saveTimeouts.current[inv.id] = setTimeout(async () => {

        const latest = invoices.find(i => i.id === inv.id);
        if (!latest) return;

        try {
          setInvoices(prev =>
            prev.map(i =>
              i.id === inv.id
                ? { ...i, isSaving: true }
                : i
            )
          );

          await invoiceUpdate(inv.id, {
            items: latest.items
          });

          setInvoices(prev =>
            prev.map(i =>
              i.id === inv.id
                ? { ...i, isDirty: false, isSaving: false }
                : i
            )
          );

        } catch (error) {
          console.error("Auto save failed:", error);

          setInvoices(prev =>
            prev.map(i =>
              i.id === inv.id
                ? { ...i, isSaving: false }
                : i
            )
          );
        }

      }, 2000);
    });

  }, [invoices]);

  /* =====================================================
     PAY
  ===================================================== */
  const pay = async (paymentInfo) => {

    if (!activeInvoice || activeInvoice.status !== "DRAFT")
      return;

    try {

      await invoiceUpdate(activeInvoice.id, {
        items: activeInvoice.items,
        status: "PAID",
        payment: paymentInfo
      });

      const remaining = invoices.filter(
        i => i.id !== activeInvoice.id
      );

      setInvoices(remaining);

      if (remaining.length > 0) {
        setActiveInvoiceId(remaining[0].id);
      } else {
        createInvoiceTab();
      }

    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  /* =====================================================
     CLOSE TAB
  ===================================================== */
  const closeTab = (id) => {

    if (invoices.length === 1) return;

    if (saveTimeouts.current[id]) {
      clearTimeout(saveTimeouts.current[id]);
      delete saveTimeouts.current[id];
    }

    const remaining = invoices.filter(i => i.id !== id);

    setInvoices(remaining);

    if (id === activeInvoiceId) {
      setActiveInvoiceId(remaining[0]?.id || null);
    }
  };

  /* CLEANUP */
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
    updateInvoiceCustomer,
    closeTab
  };
};