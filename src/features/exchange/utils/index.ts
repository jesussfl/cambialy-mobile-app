import { formatNumber as formatCurrencyNumber } from "react-native-currency-input";
import type { DecimalSeparator } from "@/features/settings/context/settings-context";
import { formatDotDecimalString, sanitizeKeypadInput } from "@/features/amount-input/model/number-format";
import type { TargetCurrencyOption } from "../types";

/**
 * Amount entry lives in `@/features/amount-input` — one implementation, shared by the exchange and
 * price-comparison screens. These re-exports keep existing import sites working.
 */
export { formatDotDecimalString, sanitizeKeypadInput } from "@/features/amount-input/model/number-format";
export {
  appendOperatorToExpression,
  evaluateExpression,
  evaluateTokens,
  formatExpressionForDisplay,
  parseSegmentToNumber,
  tokenizeExpression,
} from "@/features/amount-input/model/arithmetic";
export type { AmountInputMode, MathOperator } from "@/features/amount-input/model/types";

/**
 * Parses a localized currency string (e.g., "1.234,56" or "1,234.56") into a native JavaScript number.
 * It intelligently detects the decimal separator by looking at the last dot or comma.
 */
export const parseLocalizedAmountToNumber = (value: string): number => {
  const trimmedValue = value.trim();
  const lastCommaIndex = trimmedValue.lastIndexOf(",");
  const lastDotIndex = trimmedValue.lastIndexOf(".");

  let decimalSeparatorIndex = -1;
  if (lastCommaIndex > -1 && lastDotIndex > -1) {
    decimalSeparatorIndex = Math.max(lastCommaIndex, lastDotIndex);
  } else if (lastCommaIndex > -1) {
    decimalSeparatorIndex = lastCommaIndex;
  } else if (lastDotIndex > -1) {
    decimalSeparatorIndex = lastDotIndex;
  }

  const wholePart = decimalSeparatorIndex > -1 ? trimmedValue.slice(0, decimalSeparatorIndex) : trimmedValue;
  const decimalPart = decimalSeparatorIndex > -1 ? trimmedValue.slice(decimalSeparatorIndex + 1) : "";
  const normalizedValue = `${wholePart.replace(/\D/g, "")}${decimalSeparatorIndex > -1 ? `.${decimalPart.replace(/\D/g, "")}` : ""}`;

  return Number(normalizedValue);
};

/**
 * Formats a native number into a localized string with a fixed number of decimal digits (default 2).
 * e.g., 1234.56 -> "1.234,56"
 */
export const formatDecimalNumber = (value: number, digits = 2, decimalSeparator: DecimalSeparator = "comma"): string =>
  formatCurrencyNumber(Number.isFinite(value) ? value : 0, {
    delimiter: decimalSeparator === "comma" ? "." : ",",
    separator: decimalSeparator === "comma" ? "," : ".",
    precision: digits,
  });

/**
 * Formats a native number into a localized compact string, omitting decimals if it is a whole integer.
 * e.g., 1200.00 -> "1.200", 1200.50 -> "1.200,50"
 */
export const formatCompactAmount = (value: number, decimalSeparator: DecimalSeparator = "comma"): string => {
  if (!Number.isFinite(value)) {
    return "0";
  }
  const locale = decimalSeparator === "comma" ? "es-VE" : "en-US";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a rate specifically for the Venezuelan Bolivar (VES), appending "Bs." at the end.
 * e.g., 60.5 -> "60,50 Bs."
 */
export const formatVesRateString = (value: number, decimalSeparator: DecimalSeparator = "comma"): string =>
  value > 0 ? `${formatDecimalNumber(value, 2, decimalSeparator)} Bs.` : "Sin datos";

/**
 * Gets the relative conversion rate factor compared to VES (which is always 1).
 * If the target is VES, it returns 1; otherwise, it returns the provided BCV rate for that currency.
 */
export const getRateRelativeToVes = (currencyId: string, bcvRate: number): number => 
  (currencyId === "ves" ? 1 : bcvRate);

/**
 * Converts a foreign currency amount into Venezuelan Bolivars (VES) using the specified rate.
 */
export const convertCurrencyToVes = (amount: number, rate: number): number => amount * rate;

/**
 * Converts a Venezuelan Bolivars (VES) amount into a foreign currency using the specified rate.
 */
export const convertVesToCurrency = (vesAmount: number, rate: number): number => 
  (rate > 0 ? vesAmount / rate : 0);

/**
 * Formats a complete conversion rate label comparing a base currency to a target currency.
 * e.g., "Bs. 60,00" (if target is VES) or "1,20 EUR" (if target is EUR).
 */
export const formatConversionRateLabel = (baseRate: number, targetCurrency: TargetCurrencyOption, bcvRate: number, decimalSeparator: DecimalSeparator = "comma"): string => {
  const targetRate = getRateRelativeToVes(targetCurrency.id, bcvRate);

  if (targetRate <= 0 || baseRate <= 0) {
    return "Sin datos";
  }

  const value = baseRate / targetRate;
  const formattedValue = formatDecimalNumber(value, 2, decimalSeparator);

  return targetCurrency.id === "ves" ? `${targetCurrency.symbol} ${formattedValue}` : `${formattedValue} ${targetCurrency.code}`;
};

/**
 * Formats an ISO date string into a localized "Last Updated" text.
 */
export const formatLastUpdatedDate = (value?: string): string => {
  if (!value) return "Actualizacion pendiente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Actualizacion pendiente";

  return `Actualizado ${new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
};

/**
 * Formats an ISO date string into a historical rate date text.
 */
export const formatHistoricalDate = (value?: string): string => {
  if (!value) return "Fecha pendiente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha pendiente";

  const day = date.getDate();
  const month = new Intl.DateTimeFormat("es-VE", { month: "short" }).format(date).replace(".", "");
  const hours = date.getHours();
  const hour = hours % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const meridiem = hours >= 12 ? "pm" : "am";

  return `${day} ${month} - ${hour}:${minutes} ${meridiem}`;
};

/**
 * Gets the final formatted string to display on the keypad screen based on user input.
 */
export const formatKeypadInputForDisplay = (amount: string, mode: "automatic" | "manual" = "automatic", decimalSeparator: DecimalSeparator = "comma"): string => {
  if (!amount) return "";
  const sanitizedAmount = sanitizeKeypadInput(amount, mode);
  if (!sanitizedAmount) return "";
  return formatDotDecimalString(sanitizedAmount, decimalSeparator);
};

/**
 * Formats a predefined quick action amount (e.g. "10", "50") as a whole integer for the pill button.
 */
export const formatQuickActionAmount = (value: string, decimalSeparator: DecimalSeparator = "comma"): string => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return "";

  const locale = decimalSeparator === "comma" ? "es-VE" : "en-US";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(numberValue);
};

/**
 * Handles normalizations for when the keypad input changes.
 */
export const normalizeKeypadInput = (value: string, previousAmount: string, mode: "automatic" | "manual" = "automatic"): string => {
  void previousAmount;
  if (!value) return "";
  return sanitizeKeypadInput(value, mode);
};
