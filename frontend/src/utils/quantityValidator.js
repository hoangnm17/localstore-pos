import { UNIT_TYPES, ORDER_CONFIG } from "config/order";

export const formatQuantityInput = (value, unitType, quantityOnHand) => {
  let formattedValue = value;

  if (unitType === UNIT_TYPES.PIECE) {
    formattedValue = value.replace(/\D/g, "");
  } else {
    formattedValue = value.replace(/[^0-9.]/g, "");
    const parts = formattedValue.split(".");
    if (parts.length > 2) {
      formattedValue = parts[0] + "." + parts.slice(1).join("");
    }
    if (parts.length === 2 && parts[1].length > ORDER_CONFIG.MAX_WEIGHT_DECIMALS) {
      formattedValue = parts[0] + "." + parts[1].substring(0, ORDER_CONFIG.MAX_WEIGHT_DECIMALS);
    }
  }
  if (formattedValue === "" || formattedValue === ".") {
    return formattedValue;
  }
  let number = parseFloat(formattedValue);
  if (number > quantityOnHand) {
    number = quantityOnHand;
    formattedValue = number.toString();
  }
  if (number < 0) {
    number = 0;
    formattedValue = "0";
  }

  return (unitType === UNIT_TYPES.WEIGHT && formattedValue.includes("."))
    ? formattedValue
    : number;
};