export const isNotEmpty = (value) => {
  return value && value.trim().length > 0;
};

export const isValidPhone = (phone) => {
  if (!phone) return false;

  return /^0\d{9}$/.test(phone);
};