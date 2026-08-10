import type { AmountInputMode, DecimalSeparator } from "./types";

/**
 * Formats a raw dot-decimal string into a localized number string, retaining exact decimal places typed.
 * E.g., "12.5" -> "12,5"
 */
export const formatDotDecimalString = (sanitizedAmount: string, decimalSeparator: DecimalSeparator = "comma"): string => {
  if (!sanitizedAmount) return "";

  const [wholePart, decimalPart] = sanitizedAmount.split(".");
  const numberValue = Number(`${wholePart}${decimalPart !== undefined ? `.${decimalPart}` : ""}`);

  if (!Number.isFinite(numberValue)) return "";

  const locale = decimalSeparator === "comma" ? "es-VE" : "en-US";
  const formatOptions = decimalPart !== undefined ? { minimumFractionDigits: decimalPart.length, maximumFractionDigits: decimalPart.length } : {};

  return new Intl.NumberFormat(locale, formatOptions).format(numberValue);
};

/**
 * Sanitizes a raw input string from the keypad into a valid dot-decimal string (e.g. "12.50").
 *
 * - "automatic" mode (default): cents-based fixed decimal entry from the right.
 *   E.g., "5" -> "0.05", "55" -> "0.55", "555" -> "5.55"
 *
 * - "manual" mode: the user types digits and optionally a comma/dot as the decimal
 *   separator. The raw entry is returned as a dot-decimal string.
 *   E.g., "23" -> "23", "235" -> "235", "23,5" -> "23.5", "23,50" -> "23.50"
 */
export const sanitizeKeypadInput = (value: string, mode: AmountInputMode = "automatic"): string => {
  if (mode === "manual") {
    const normalized = value.replace(/,/g, ".");
    const firstDot = normalized.indexOf(".");
    const digits =
      firstDot === -1
        ? normalized.replace(/[^\d]/g, "")
        : normalized.slice(0, firstDot).replace(/[^\d]/g, "") + "." + normalized.slice(firstDot + 1).replace(/[^\d]/g, "");

    if (!digits || digits === ".") return "";
    return digits.replace(/^0+(\d)/, "$1");
  }

  // Automatic cents-based mode
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";

  const trimmedDigits = digits.replace(/^0+(?=\d)/, "");
  if (!trimmedDigits) return "0.00";

  if (trimmedDigits.length === 1) return `0.0${trimmedDigits}`;
  if (trimmedDigits.length === 2) return `0.${trimmedDigits}`;

  return `${trimmedDigits.slice(0, -2)}.${trimmedDigits.slice(-2)}`;
};

/**
 * Renders a number as a plain dot-decimal string with no grouping and no forced trailing zeros,
 * suitable as input to `formatDotDecimalString`.
 */
export const toDotDecimalString = (value: number): string => {
  if (!Number.isFinite(value)) return "";
  return String(value);
};
