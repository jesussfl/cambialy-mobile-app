import { evaluateTokens, formatExpressionForDisplay, parseSegmentToNumber, tokenizeExpression } from "./arithmetic";
import { formatDotDecimalString, sanitizeKeypadInput, toDotDecimalString } from "./number-format";
import {
  createBuffer,
  EMPTY_DRAFT,
  hasOperator,
  roundToPrecision,
  type AmountDraft,
  type DecimalSeparator,
  type KeypadConfig,
} from "./types";

export { EMPTY_DRAFT } from "./types";

export const placeholderFor = (decimalSeparator: DecimalSeparator): string => (decimalSeparator === "comma" ? "0,00" : "0.00");

/**
 * Evaluates a buffer, falling back to the longest prefix that *does* evaluate.
 *
 * This is what keeps a partially typed or momentarily invalid expression showing its last sensible
 * reading instead of blanking: `"100÷0"` falls back to `"100÷"`, which drops its dangling operator and
 * yields `100`. Bounded by the buffer length, and a no-op (one pass) for any valid buffer.
 */
export function evaluateBuffer(buffer: string, mode: KeypadConfig["mode"]): number | null {
  for (let end = buffer.length; end > 0; end -= 1) {
    const value = evaluateTokens(tokenizeExpression(buffer.slice(0, end), mode));
    if (value !== null && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
}

/**
 * The numeric value of a draft, or `null` when the field is empty or holds nothing evaluable.
 *
 * Direct entry is returned exactly as typed; only an arithmetic result is rounded to the field's
 * precision. This is the single reading used by every calculation — no consumer re-parses a display
 * string.
 */
export function toNumber(draft: AmountDraft, config: KeypadConfig): number | null {
  const raw = draft.buffer;
  if (!raw) return null;

  if (!hasOperator(raw)) {
    return parseSegmentToNumber(raw, config.mode);
  }

  const value = evaluateBuffer(raw, config.mode);
  return value === null ? null : roundToPrecision(value, config.precision);
}

function formatSegment(segment: string, config: KeypadConfig): string {
  if (config.mode === "manual") {
    // A trailing separator and trailing zeros are preserved exactly as typed: "12," must not collapse
    // to "12", and "12,50" must not collapse to "12,5".
    const separatorChar = config.decimalSeparator === "comma" ? "," : ".";
    const endsWithSeparator = segment.endsWith(".");
    const base = endsWithSeparator ? segment.slice(0, -1) : segment;
    const formatted = formatDotDecimalString(base === "" ? "0" : base, config.decimalSeparator);
    return endsWithSeparator ? `${formatted}${separatorChar}` : formatted;
  }

  return formatDotDecimalString(sanitizeKeypadInput(segment, "automatic"), config.decimalSeparator);
}

/**
 * The string shown in the amount field. Empty when the field is empty, so the caller renders its
 * placeholder — an empty field is now genuinely reachable and must look like one.
 */
export function toDisplay(draft: AmountDraft, config: KeypadConfig): string {
  const raw = draft.buffer;
  if (!raw) return "";

  if (!hasOperator(raw)) {
    return formatSegment(raw, config);
  }

  const value = evaluateBuffer(raw, config.mode);
  if (value === null) return "";

  return formatDotDecimalString(toDotDecimalString(roundToPrecision(value, config.precision)), config.decimalSeparator);
}

/** The small preview line above the field. Empty unless an operator is pending. */
export function toExpressionPreview(draft: AmountDraft, config: KeypadConfig): string {
  if (!hasOperator(draft.buffer)) return "";
  return formatExpressionForDisplay(draft.buffer, config.mode, config.decimalSeparator);
}

/**
 * The one sanctioned conversion from a number back into a keypress buffer, for values arriving from
 * outside the keypad (a pill, the clipboard, a swap, an evaluated result) and for re-encoding when the
 * entry mode changes.
 *
 * Doing this implicitly — by concatenating a canonical string onto a keypress buffer — is precisely the
 * defect this module replaces, so the conversion is named, explicit, and mode-aware.
 */
export function draftFromValue(value: number, config: KeypadConfig): AmountDraft {
  if (!Number.isFinite(value)) return EMPTY_DRAFT;

  // Amounts and rates are non-negative in this domain; a negative result collapses to zero rather than
  // silently losing its sign the way string sanitising used to.
  const safeValue = Math.max(0, roundToPrecision(value, config.precision));

  if (config.mode === "automatic") {
    // Cents entry: the buffer is a right-to-left digit stack, so 12.34 is the digits "1234".
    return { buffer: createBuffer(String(Math.round(safeValue * 100))), sealed: true };
  }

  return { buffer: createBuffer(toDotDecimalString(safeValue)), sealed: true };
}
