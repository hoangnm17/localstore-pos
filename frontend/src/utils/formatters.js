export const formatCurrency = (value) => {
  if (value == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value));
};

export const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

export const formatQuantity = (value, allowDecimal = false) => {
  const num = Number(value || 0);
  if (allowDecimal) {
    return num.toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  }
  return Math.round(num).toLocaleString("vi-VN");
};

export const formatNumber = (value, digits = 0) =>
  Number(value || 0).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });

export const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN");
};
