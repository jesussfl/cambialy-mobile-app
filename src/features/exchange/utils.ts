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

export const getDisplayAmount = (amount: string, mode: "automatic" | "manual" = "automatic") => {
  if (!amount) {
    return "";
  }

  const sanitizedAmount = sanitizeAmountInput(amount, mode);

  if (!sanitizedAmount) {
    return "";
  }

  return formatAmountNumber(sanitizedAmount).replace(",", ",");
};

/**
 * Sanitizes an input string to be a valid decimal amount string.
 *
 * - "automatic" mode (default): cents-based fixed decimal entry from the right.
 *   E.g., "5" -> "0.05", "55" -> "0.55", "555" -> "5.55"
 *
 * - "manual" mode: the user types digits and optionally a comma/dot as the decimal
 *   separator. The raw entry is returned as a dot-decimal string.
 *   E.g., "23" -> "23", "235" -> "235", "23,5" -> "23.5", "23,50" -> "23.50"
 */
export const sanitizeAmountInput = (value: string, mode: "automatic" | "manual" = "automatic"): string => {
  if (mode === "manual") {
    // Allow digits and at most one decimal separator (comma or dot)
    const normalized = value.replace(/,/g, ".");
    // Keep only digits and the first dot
    const firstDot = normalized.indexOf(".");
    const digits =
      firstDot === -1
        ? normalized.replace(/[^\d]/g, "")
        : normalized.slice(0, firstDot).replace(/[^\d]/g, "") + "." + normalized.slice(firstDot + 1).replace(/[^\d]/g, "");

    if (!digits || digits === ".") {
      return "";
    }

    // Remove leading zeros unless followed by a decimal point
    const trimmed = digits.replace(/^0+(\d)/, "$1");
    return trimmed;
  }

  // --- automatic (cents-based) ---
  // Extract all digit characters from the input string
  const digits = value.replace(/[^\d]/g, "");

  if (!digits) {
    return "";
  }

  // Remove leading zeros, preserving at least one digit (e.g., "005" -> "5", "000" -> "0")
  const trimmedDigits = digits.replace(/^0+(?=\d)/, "");

  if (!trimmedDigits) {
    return "0.00";
  }

  // Format the digits as a fixed-point decimal string with 2 decimal places
  if (trimmedDigits.length === 1) {
    return `0.0${trimmedDigits}`;
  }

  if (trimmedDigits.length === 2) {
    return `0.${trimmedDigits}`;
  }

  return `${trimmedDigits.slice(0, -2)}.${trimmedDigits.slice(-2)}`;
};

/**
 * Formats a quick amount label for display, displaying it as a whole integer representation.
 * E.g., "5" -> "5", "10000" -> "10.000"
 */
export const formatQuickAmountLabel = (value: string): string => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return "";
  }

  return new Intl.NumberFormat("es-VE", { maximumFractionDigits: 0 }).format(numberValue);
};

export const normalizeAmountInputChange = (value: string, previousAmount: string, mode: "automatic" | "manual" = "automatic") => {
  void previousAmount;

  if (!value) {
    return "";
  }

  return sanitizeAmountInput(value, mode);
};
