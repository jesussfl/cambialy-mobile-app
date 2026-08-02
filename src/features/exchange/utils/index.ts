import { formatNumber as formatCurrencyNumber } from "react-native-currency-input";
import type { DecimalSeparator } from "@/features/settings/context/settings-context";
import type { TargetCurrencyOption } from "../types";

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
 * Gets the final formatted string to display on the keypad screen based on user input.
 */
export const formatKeypadInputForDisplay = (amount: string, mode: "automatic" | "manual" = "automatic", decimalSeparator: DecimalSeparator = "comma"): string => {
  if (!amount) return "";
  const sanitizedAmount = sanitizeKeypadInput(amount, mode);
  if (!sanitizedAmount) return "";
  return formatDotDecimalString(sanitizedAmount, decimalSeparator);
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
export const sanitizeKeypadInput = (value: string, mode: "automatic" | "manual" = "automatic"): string => {
  if (mode === "manual") {
    const normalized = value.replace(/,/g, ".");
    const firstDot = normalized.indexOf(".");
    const digits = firstDot === -1
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

// --- CALCULATOR LOGIC ---

export type AmountInputMode = "automatic" | "manual";
export type MathOperator = "+" | "-" | "×" | "÷";

/**
 * Parses raw typed expression segment into a number, respecting the input mode.
 */
export function parseSegmentToNumber(rawSegment: string, mode: AmountInputMode = "automatic"): number {
  if (!rawSegment) return 0;

  if (mode === "manual") {
    const num = parseFloat(rawSegment.replace(/,/g, "."));
    return isNaN(num) ? 0 : num;
  }

  if (rawSegment.includes(".") || rawSegment.includes(",")) {
    const num = parseFloat(rawSegment.replace(/,/g, "."));
    return isNaN(num) ? 0 : num;
  }

  const sanitized = sanitizeKeypadInput(rawSegment, "automatic");
  const num = parseFloat(sanitized);
  return isNaN(num) ? 0 : num;
}

/**
 * Tokenizes a raw expression string (e.g. "23+23" or "500×20") into an array of numbers and operators.
 */
export function tokenizeExpression(expression: string, mode: AmountInputMode = "automatic"): (number | MathOperator)[] {
  const tokens: (number | MathOperator)[] = [];
  let currentSegment = "";

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (["+", "-", "×", "÷", "*", "/"].includes(char)) {
      if (currentSegment.length > 0) {
        tokens.push(parseSegmentToNumber(currentSegment, mode));
        currentSegment = "";
      } else if (char === "-" && (tokens.length === 0 || typeof tokens[tokens.length - 1] !== "number")) {
        currentSegment += char;
        continue;
      }

      const opMap: Record<string, MathOperator> = {
        "+": "+",
        "-": "-",
        "×": "×",
        "*": "×",
        "÷": "÷",
        "/": "÷",
      };
      tokens.push(opMap[char]);
    } else if (char === " ") {
      continue;
    } else {
      currentSegment += char;
    }
  }

  if (currentSegment.length > 0) {
    tokens.push(parseSegmentToNumber(currentSegment, mode));
  }

  return tokens;
}

/**
 * Evaluates token list according to standard BODMAS / PEMDAS rules (* / before + -).
 */
export function evaluateTokens(tokens: (number | MathOperator)[]): number | null {
  if (tokens.length === 0) return null;

  let currentTokens = [...tokens];

  if (typeof currentTokens[currentTokens.length - 1] !== "number") {
    currentTokens.pop();
  }

  if (currentTokens.length === 0) return null;

  const pass1: (number | MathOperator)[] = [];
  let i = 0;

  while (i < currentTokens.length) {
    const token = currentTokens[i];

    if (token === "×" || token === "÷") {
      const prev = pass1.pop();
      const next = currentTokens[i + 1];

      if (typeof prev !== "number" || typeof next !== "number") {
        return null;
      }

      if (token === "÷" && next === 0) {
        return null;
      }

      const result = token === "×" ? prev * next : prev / next;
      pass1.push(result);
      i += 2;
    } else {
      pass1.push(token);
      i++;
    }
  }

  let finalResult = pass1[0];
  if (typeof finalResult !== "number") return null;

  let j = 1;
  while (j < pass1.length) {
    const op = pass1[j];
    const next = pass1[j + 1];

    if (typeof op !== "string" || typeof next !== "number") {
      return null;
    }

    if (op === "+") {
      finalResult += next;
    } else if (op === "-") {
      finalResult -= next;
    }

    j += 2;
  }

  return finalResult;
}

/**
 * Evaluates a raw expression string and returns a formatted result string.
 */
export function evaluateExpression(
  expression: string,
  mode: AmountInputMode = "automatic",
  decimalSeparator: DecimalSeparator = "comma",
): { result: string | null; formattedResult: string } {
  if (!expression.trim()) {
    return { result: null, formattedResult: "" };
  }

  const tokens = tokenizeExpression(expression, mode);
  const numResult = evaluateTokens(tokens);

  if (numResult === null || !isFinite(numResult)) {
    return { result: null, formattedResult: "" };
  }

  const rounded = Math.round(numResult * 100) / 100;
  const separatorChar = decimalSeparator === "comma" ? "," : ".";
  const resultStr = rounded.toFixed(2).replace(/\./g, separatorChar);

  return { result: rounded.toFixed(2), formattedResult: resultStr };
}

/**
 * Appends operator to an expression string safely (replaces last operator if multiple chained).
 */
export function appendOperatorToExpression(expression: string, operator: MathOperator): string {
  if (!expression) return "";

  const trimmed = expression.trimEnd();
  const lastChar = trimmed[trimmed.length - 1];

  if (["+", "-", "×", "÷"].includes(lastChar)) {
    return `${trimmed.slice(0, -1)}${operator}`;
  }

  return `${expression}${operator}`;
}

/**
 * Formats a raw math expression string for visual presentation on the keypad preview.
 */
export function formatExpressionForDisplay(expression: string, mode: AmountInputMode = "automatic", decimalSeparator: DecimalSeparator = "comma"): string {
  if (!expression) return "";

  const separatorChar = decimalSeparator === "comma" ? "," : ".";
  const parts: string[] = [];
  let currentSegment = "";

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (["+", "-", "×", "÷"].includes(char)) {
      if (currentSegment) {
        if (mode === "manual") {
          parts.push(currentSegment.replace(/\./g, separatorChar));
        } else {
          const numStr = sanitizeKeypadInput(currentSegment, "automatic").replace(/\./g, separatorChar);
          parts.push(numStr);
        }
        currentSegment = "";
      }
      parts.push(char);
    } else {
      currentSegment += char;
    }
  }

  if (currentSegment) {
    if (mode === "manual") {
      parts.push(currentSegment.replace(/\./g, separatorChar));
    } else {
      const numStr = sanitizeKeypadInput(currentSegment, "automatic").replace(/\./g, separatorChar);
      parts.push(numStr);
    }
  }

  return parts.join(" ");
}
