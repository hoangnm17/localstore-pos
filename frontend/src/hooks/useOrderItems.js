export const useOrderItems = () => {

  const addItem = (items, product) => {
    const existed = items.find(
      p =>
        p.productId === product.productId &&
        p.unitPrice === product.unitPrice
    );

    if (existed) {
      return items.map(p =>
        p.id === existed.id
          ? { ...p, quantity: p.quantity + 1 }
          : p
      );
    }

    return [
      ...items,
      {
        id: crypto.randomUUID(),
        productId: product.productId,
        productName: product.productName,
        variantId: product.variantId,
        variantName: product.variantName,
        unitPrice: product.unitPrice,
        quantity: 1
      }
    ];
  };

  const increase = (items, id) =>
    items.map(item =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

  const decrease = (items, id) =>
    items
      .map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter(item => item.quantity > 0);

  const remove = (items, id) =>
    items.filter(item => item.id !== id);

  const calculateTotal = (items) =>
    items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );

  return {
    addItem,
    increase,
    decrease,
    remove,
    calculateTotal
  };
};