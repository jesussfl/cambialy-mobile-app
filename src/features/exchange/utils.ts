import { formatNumber as formatCurrencyNumber } from "react-native-currency-input";

import type { TargetCurrencyOption } from "./types";

export const parseCurrencyAmount = (value: string) => {
  const trimmedValue = value.trim();
  const lastCommaIndex = trimmedValue.lastIndexOf(",");
  const lastDotIndex = trimmedValue.lastIndexOf(".");
  const decimalSeparatorIndex = lastCommaIndex > -1 ? lastCommaIndex : lastDotIndex;
  const wholePart = decimalSeparatorIndex > -1 ? trimmedValue.slice(0, decimalSeparatorIndex) : trimmedValue;
  const decimalPart = decimalSeparatorIndex > -1 ? trimmedValue.slice(decimalSeparatorIndex + 1) : "";
  const normalizedValue = `${wholePart.replace(/\D/g, "")}${decimalSeparatorIndex > -1 ? `.${decimalPart.replace(/\D/g, "")}` : ""}`;

  return Number(normalizedValue);
};

export const formatNumber = (value: number, digits = 2) =>
  formatCurrencyNumber(Number.isFinite(value) ? value : 0, {
    delimiter: ".",
    separator: ",",
    precision: digits,
  });

export const formatCompactAmount = (value: number) => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatRate = (value: number) => (value > 0 ? `${formatNumber(value)} Bs.` : "Sin datos");

/**
 * Gets the conversion rate to VES for a given currency ID.
 * VES is the base unit (rate = 1).
 */
export const getCurrencyRate = (id: string, bcvRate: number) => (id === "ves" ? 1 : bcvRate);

/**
 * Converts an amount to VES based on the provided rate.
 */
export const toVes = (amount: number, rate: number) => amount * rate;

/**
 * Converts an amount from VES to a target currency based on the provided rate.
 */
export const fromVes = (vesAmount: number, rate: number) => (rate > 0 ? vesAmount / rate : 0);

/**
 * Formats an exchange rate label (e.g., "Bs. 60,00" or "1,20 BCV").
 */
export const formatExchangeRate = (baseRate: number, targetCurrency: TargetCurrencyOption, bcvRate: number) => {
  const targetRate = getCurrencyRate(targetCurrency.id, bcvRate);

  if (targetRate <= 0 || baseRate <= 0) {
    return "Sin datos";
  }

  const value = baseRate / targetRate;
  const formattedValue = formatNumber(value);

  return targetCurrency.id === "ves" ? `${targetCurrency.symbol} ${formattedValue}` : `${formattedValue} ${targetCurrency.code}`;
};

export const formatUpdatedAt = (value?: string) => {
  if (!value) {
    return "Actualizacion pendiente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Actualizacion pendiente";
  }

  return `Actualizado ${new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
};

export const formatHistoryDate = (value?: string) => {
  if (!value) {
    return "Fecha pendiente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha pendiente";
  }

  const day = date.getDate();
  const month = new Intl.DateTimeFormat("es-VE", { month: "short" }).format(date).replace(".", "");
  const hours = date.getHours();
  const hour = hours % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const meridiem = hours >= 12 ? "pm" : "am";

  return `${day} ${month} - ${hour}:${minutes} ${meridiem}`;
};

export const getDisplayAmount = (amount: string) => {
  if (!amount) {
    return "";
  }

  const parsedAmount = parseCurrencyAmount(amount);

  if (!Number.isFinite(parsedAmount)) {
    return "";
  }

  return formatNumber(parsedAmount);
};

export const sanitizeAmountInput = (value: string) => {
  const numericValue = value.replace(/[^\d.,]/g, "");
  const lastCommaIndex = numericValue.lastIndexOf(",");
  const lastDotIndex = numericValue.lastIndexOf(".");
  const hasCommaDecimal = lastCommaIndex > -1;
  const hasDotDecimal = !hasCommaDecimal && lastDotIndex > -1 && /\.\d{0,2}$/.test(numericValue);
  const decimalSeparatorIndex = hasCommaDecimal ? lastCommaIndex : hasDotDecimal ? lastDotIndex : -1;
  const wholeInput = decimalSeparatorIndex > -1 ? numericValue.slice(0, decimalSeparatorIndex) : numericValue;
  const decimalInput = decimalSeparatorIndex > -1 ? numericValue.slice(decimalSeparatorIndex + 1) : "";
  const wholePart = wholeInput.replace(/\D/g, "");
  const decimals = decimalInput.replace(/\D/g, "").slice(0, 2);
  const trimmedWholePart = wholePart.replace(/^0+(?=\d)/, "").slice(0, 9);

  if (decimalSeparatorIndex > -1) {
    return `${trimmedWholePart || "0"}.${decimals}`;
  }

  return trimmedWholePart;
};

export const normalizeAmountInputChange = (value: string, previousAmount: string) => {
  if (!value) {
    return "";
  }

  const previousDisplayAmount = getDisplayAmount(previousAmount);
  const appendedValue = previousDisplayAmount && value.startsWith(previousDisplayAmount) ? value.slice(previousDisplayAmount.length) : "";

  if (previousDisplayAmount.startsWith(value) && value.length < previousDisplayAmount.length) {
    const [previousWholePart = "", previousDecimalPart] = previousAmount.split(".");

    if (previousDecimalPart !== undefined) {
      if (!previousDecimalPart) {
        return previousWholePart.slice(0, -1);
      }

      const nextDecimalPart = previousDecimalPart.slice(0, -1);
      return nextDecimalPart ? `${previousWholePart || "0"}.${nextDecimalPart}` : `${previousWholePart || "0"}.`;
    }

    return previousWholePart.slice(0, -1);
  }

  if (/^\d+$/.test(appendedValue)) {
    const [previousWholePart = "", previousDecimalPart] = previousAmount.split(".");

    if (previousDecimalPart !== undefined) {
      return `${previousWholePart || "0"}.${`${previousDecimalPart}${appendedValue}`.slice(0, 2)}`;
    }

    return `${previousWholePart}${appendedValue}`;
  }

  if (appendedValue === "," || appendedValue === ".") {
    const [previousWholePart = "0"] = previousAmount.split(".");
    return `${previousWholePart}.`;
  }

  return value;
};
