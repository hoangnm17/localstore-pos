import { safeParse } from "utils/safeParse";

export const useOrderItems = () => {

  const addItem = (items, product) => {
    const existed = items.find(
      p =>
        p.productId === product.productId &&
        p.productUnitId === product.productUnitId
    );

    if (existed) {

      const maxQty = existed.quantityOnHand ?? Infinity;

      const updated = items.map(p =>
        p.id === existed.id
          ? {
            ...p,
            quantity: Math.min(Math.round((safeParse(p.quantity) + 1) * 1000) / 1000, maxQty)
          }
          : p
      );
      return {
        items: updated,
        activeId: existed.id
      };
    }

    let qty = 1;
    if (product.unitType === "WEIGHT") {
      qty = product.quantityOnHand < 1 ? product.quantityOnHand : 1; 
    }

    const newItem = {
      id: crypto.randomUUID(),
      productId: Number(product.productId),
      productName: product.productName,
      productUnitId: product.productUnitId,
      productStock: product.productStock,
      unitPrice: product.unitPrice,
      unitName: product.unitName,
      quantity: qty,
      quantityOnHand: product.quantityOnHand,
      factor: product.factor,
      unitType: product.unitType,
    };
    return {
      items: [...items, newItem],
      activeId: newItem.id
    };
  };

  const increase = (items, id) => {
    let changed = false;

    const updated = items.map(item => {
      if (item.id !== id) return item;

      const newQty = Math.min(
        safeParse(item.quantity) + 1,
        item.quantityOnHand
      );

      if (newQty !== item.quantity) {
        changed = true;
        return { ...item, quantity: newQty };
      }

      return item;
    });

    return changed ? updated : items;
  };

  const decrease = (items, id) =>
    items.map(item => {
      if (item.id !== id) return item;

      const current = safeParse(item.quantity);

      return {
        ...item,
        quantity: current > 1 ? current - 1 : 1
      };
    });

  const remove = (items, id) =>
    items.filter(item => item.id !== id);

  const calculateTotal = (items) =>
    items.reduce(
      (sum, i) => sum + i.unitPrice * safeParse(i.quantity),
      0
    );

  const calculateTotalQuantity = (items = []) => {
    const total = items.reduce(
      (sum, item) => sum + safeParse(item.quantity),
      0
    );
    return Math.round(total * 1000) / 1000;
  };

  return {
    addItem,
    increase,
    decrease,
    remove,
    calculateTotal,
    calculateTotalQuantity
  };
};