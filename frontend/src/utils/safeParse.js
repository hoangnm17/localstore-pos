export const safeParse = (value, fallback = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  
  const cleanValue = typeof value === "string" ? value.trim() : value;

  const num = parseFloat(cleanValue);

  if (isNaN(num) || !Number.isFinite(num)) {
    return fallback;
  }

  return num;
};