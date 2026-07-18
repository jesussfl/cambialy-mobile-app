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

const formatAmountNumber = (sanitizedAmount: string) => {
  if (!sanitizedAmount) {
    return "";
  }

  const [wholePart, decimalPart] = sanitizedAmount.split(".");
  const numberValue = Number(`${wholePart}${decimalPart !== undefined ? `.${decimalPart}` : ""}`);

  if (!Number.isFinite(numberValue)) {
    return "";
  }

  const formatOptions = decimalPart !== undefined ? { minimumFractionDigits: decimalPart.length, maximumFractionDigits: decimalPart.length } : {};

  return new Intl.NumberFormat("es-VE", formatOptions).format(numberValue).replace(/\u202F/g, ".");
};

export const getDisplayAmount = (amount: string) => {
  if (!amount) {
    return "";
  }

  const sanitizedAmount = sanitizeAmountInput(amount);

  if (!sanitizedAmount) {
    return "";
  }

  return formatAmountNumber(sanitizedAmount).replace(",", ",");
};

export const sanitizeAmountInput = (value: string) => {
  const digits = value.replace(/[^\d]/g, "");

  if (!digits) {
    return "";
  }

  const trimmedDigits = digits.replace(/^0+(?=\d)/, "");

  if (!trimmedDigits) {
    return "0";
  }

  if (trimmedDigits.length <= 2) {
    return trimmedDigits;
  }

  return `${trimmedDigits.slice(0, -2)}.${trimmedDigits.slice(-2)}`;
};

export const formatQuickAmountLabel = (value: string) => {
  const sanitizedAmount = sanitizeAmountInput(value);

  if (!sanitizedAmount) {
    return "";
  }

  const [wholePart, decimalPart] = sanitizedAmount.split(".");
  const numberValue = Number(wholePart);

  if (!Number.isFinite(numberValue)) {
    return "";
  }

  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 0 }).format(numberValue).replace(/\u202F/g, ".");
};

export const normalizeAmountInputChange = (value: string, previousAmount: string) => {
  void previousAmount;

  if (!value) {
    return "";
  }

  return sanitizeAmountInput(value);
};
