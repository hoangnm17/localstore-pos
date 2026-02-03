import { useState } from "react";

// ✅ MOCK DATA
const mockOrderItems = [
  {
    id: 1,
    productId: 101,
    productName: "Cà phê sữa đá",
    unitPrice: 25000,
    quantity: 2,
    lineTotal: 50000
  },
  {
    id: 2,
    productId: 102,
    productName: "Trà đào",
    unitPrice: 30000,
    quantity: 1,
    lineTotal: 30000
  }
];

export const useOrderItems = () => {
  const [orderItems, setOrderItems] = useState(mockOrderItems);

  // ➕ THÊM SẢN PHẨM
  const addItem = (product) => {
    setOrderItems(prev => {
      const existed = prev.find(
        item => item.productId === product.productId
      );

      // ✅ Đã có → tăng số lượng
      if (existed) {
        return prev.map(item =>
          item.productId === product.productId
            ? {
                ...item,
                quantity: item.quantity + 1,
                lineTotal: (item.quantity + 1) * item.unitPrice
              }
            : item
        );
      }

      // ✅ Chưa có → thêm mới
      return [
        ...prev,
        {
          id: Date.now(), // mock id
          productId: product.productId,
          productName: product.productName,
          unitPrice: product.unitPrice,
          quantity: 1,
          lineTotal: product.unitPrice
        }
      ];
    });
  };

  const increase = (id) => {
    setOrderItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
              lineTotal: (item.quantity + 1) * item.unitPrice
            }
          : item
      )
    );
  };

  const decrease = (id) => {
    setOrderItems(prev =>
      prev.map(item =>
        item.id === id && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1,
              lineTotal: (item.quantity - 1) * item.unitPrice
            }
          : item
      )
    );
  };

  const remove = (id) => {
    setOrderItems(prev =>
      prev.filter(item => item.id !== id)
    );
  };

  return {
    orderItems,
    addItem,
    increase,
    decrease,
    remove
  };
};
