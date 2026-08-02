import * as Clipboard from "expo-clipboard";
import type { DecimalSeparator } from "@/features/settings/context/settings-context";

/**
 * Sanitizes a raw pasted string from clipboard into a valid dot-decimal amount string (e.g. "1250.50").
 * Strips currency symbols, letters, spaces, and resolves decimal separators.
 * Returns null if no valid numeric content is found.
 */
export function sanitizePastedAmount(rawText: string, defaultDecimalSeparator: DecimalSeparator = "comma"): string | null {
  if (!rawText || typeof rawText !== "string") {
    return null;
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    return null;
  }

  // Find all digits, dots, and commas
  const lastCommaIndex = trimmed.lastIndexOf(",");
  const lastDotIndex = trimmed.lastIndexOf(".");

  let normalized = "";

  if (lastCommaIndex > -1 && lastDotIndex > -1) {
    // Both comma and dot present. The one appearing later is the decimal separator.
    if (lastCommaIndex > lastDotIndex) {
      // Format like "1.250,50" -> dot is delimiter, comma is decimal
      const whole = trimmed.slice(0, lastCommaIndex).replace(/[^\d]/g, "");
      const decimal = trimmed.slice(lastCommaIndex + 1).replace(/[^\d]/g, "");
      normalized = decimal ? `${whole}.${decimal}` : whole;
    } else {
      // Format like "1,250.50" -> comma is delimiter, dot is decimal
      const whole = trimmed.slice(0, lastDotIndex).replace(/[^\d]/g, "");
      const decimal = trimmed.slice(lastDotIndex + 1).replace(/[^\d]/g, "");
      normalized = decimal ? `${whole}.${decimal}` : whole;
    }
  } else if (lastCommaIndex > -1) {
    // Only comma present, e.g. "1250,50" or "1,250"
    const afterComma = trimmed.slice(lastCommaIndex + 1).replace(/[^\d]/g, "");
    const beforeComma = trimmed.slice(0, lastCommaIndex).replace(/[^\d]/g, "");

    // If default is comma or comma appears near the end (1 or 2 digits after comma)
    if (defaultDecimalSeparator === "comma" || afterComma.length <= 2) {
      normalized = afterComma ? `${beforeComma}.${afterComma}` : beforeComma;
    } else {
      // Treated as thousands delimiter
      normalized = `${beforeComma}${afterComma}`;
    }
  } else if (lastDotIndex > -1) {
    // Only dot present, e.g. "1250.50" or "1.250"
    const afterDot = trimmed.slice(lastDotIndex + 1).replace(/[^\d]/g, "");
    const beforeDot = trimmed.slice(0, lastDotIndex).replace(/[^\d]/g, "");

    if (defaultDecimalSeparator === "dot" || afterDot.length <= 2) {
      normalized = afterDot ? `${beforeDot}.${afterDot}` : beforeDot;
    } else {
      normalized = `${beforeDot}${afterDot}`;
    }
  } else {
    // Only digits or no separators
    normalized = trimmed.replace(/[^\d]/g, "");
  }

  // Strip leading zeroes if present before non-zero digits (e.g., "0012.50" -> "12.50", but "0.5" -> "0.5")
  if (!normalized || normalized === ".") {
    return null;
  }

  const parts = normalized.split(".");
  const integerPart = parts[0].replace(/^0+(?=\d)/, "") || "0";
  const result = parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;

  return Number.isNaN(Number(result)) || Number(result) <= 0 && result !== "0" ? null : result;
}

/**
 * Helper to fetch content from system clipboard and sanitize it.
 */
export async function getSanitizedClipboardAmount(decimalSeparator: DecimalSeparator = "comma"): Promise<string | null> {
  try {
    const hasString = await Clipboard.hasStringAsync();
    if (!hasString) {
      return null;
    }
    const text = await Clipboard.getStringAsync();
    return sanitizePastedAmount(text, decimalSeparator);
  } catch {
    return null;
  }
}
