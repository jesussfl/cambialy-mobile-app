import type { TargetCurrencyOption } from "./types";

export const parseCurrencyAmount = (value: string) => {
  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.includes(",") && trimmedValue.includes(".") ? trimmedValue.replace(/,/g, "") : trimmedValue.replace(",", ".");

  return Number(normalizedValue);
};

export const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

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

  return amount.replace(".", ",");
};

export const sanitizeAmountInput = (value: string) => {
  const normalizedValue = value.replace(",", ".").replace(/[^\d.]/g, "");
  const [wholePart = "", ...decimalParts] = normalizedValue.split(".");
  const decimals = decimalParts.join("").slice(0, 2);
  const trimmedWholePart = wholePart.replace(/^0+(?=\d)/, "").slice(0, 9);

  if (normalizedValue.includes(".")) {
    return `${trimmedWholePart || "0"}.${decimals}`;
  }

  return trimmedWholePart;
};
