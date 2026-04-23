export const getMonday = (inputDate) => {
  const date = new Date(inputDate);
  const day = date.getDay(); // CN=0, T2=1, ..., T7=6
  const diffToMonday = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + diffToMonday);
  date.setHours(0, 0, 0, 0);

  return date;
};

export const formatDate = (inputDate) => {
  const date = new Date(inputDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatTime = (timeValue) => {
  if (!timeValue) return '';
  return String(timeValue).slice(0, 5);
};

export const getDatesInRange = (startDate, endDate) => {
  const result = [];
  const current = new Date(startDate);
  const last = new Date(endDate);

  while (current <= last) {
    result.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return result;
};

export const getTodayString = () => {
  return formatDate(new Date());
};

export const isTodayOrFuture = (dateStr) => {
  return dateStr >= getTodayString();
};

export const isActiveShift = (shift) => {
  return shift?.isActive === 1 || shift?.isActive === true;
};

export const isCashierRole = (roleName) => {
  return String(roleName || '').trim().toLowerCase() === 'cashier';
};