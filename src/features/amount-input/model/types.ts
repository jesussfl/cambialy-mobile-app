import type { AmountInputMode, DecimalSeparator } from "@/features/settings/context/settings-context";

export type { AmountInputMode, DecimalSeparator };

export type MathOperator = "+" | "-" | "×" | "÷";

declare const keypadBufferBrand: unique symbol;

/**
 * The raw keypress buffer — the *only* mutable representation of an entered amount.
 *
 * It contains exactly what the keypad can emit: digits, `.` as the decimal marker, and the four
 * operators. It is never a localized string (`"1.234,56"`) and never a canonical decimal string
 * (`"12.34"`), because those mean different things and mixing the two is the defect this module exists
 * to prevent. The brand makes that mix a compile error rather than a silent 100x error.
 *
 * Meaning depends on the active mode:
 * - `automatic` (cents): `"1234"` is `12.34`
 * - `manual`:            `"1234"` is `1234`
 */
export type KeypadBuffer = string & { readonly [keypadBufferBrand]: true };

export type AmountDraft = {
  readonly buffer: KeypadBuffer;
  /**
   * The buffer holds a *completed* value — one produced by `=`, a quick-amount pill, a paste, or a
   * direction swap — rather than one mid-entry. The next digit starts a new number; an operator
   * continues from it. This replaces the per-component `hasTyped` flags, which were duplicated across
   * the two screens and shared across two fields on one of them.
   */
  readonly sealed: boolean;
};

/** How many fraction digits an *evaluated* result keeps. Direct entry is never rounded. */
export type PrecisionPolicy = { readonly maxFractionDigits: number };

export type KeypadConfig = {
  readonly mode: AmountInputMode;
  readonly decimalSeparator: DecimalSeparator;
  readonly precision: PrecisionPolicy;
};

export type KeypadAction =
  | { readonly type: "digit"; readonly digit: string }
  | { readonly type: "decimal" }
  | { readonly type: "operator"; readonly operator: MathOperator }
  | { readonly type: "delete" }
  | { readonly type: "clear" }
  | { readonly type: "evaluate" }
  /** An amount arriving from somewhere other than the keypad: a pill, the clipboard, a swap. */
  | { readonly type: "setValue"; readonly value: number }
  | { readonly type: "setMode"; readonly mode: AmountInputMode };

const DISALLOWED_IN_BUFFER = /[^0-9.+\-×÷]/g;

/**
 * The single sanctioned way to produce a `KeypadBuffer`. It enforces the grammar rather than merely
 * asserting it, so no caller can smuggle a formatted string in through a cast.
 */
export const createBuffer = (raw: string): KeypadBuffer => raw.replace(DISALLOWED_IN_BUFFER, "") as KeypadBuffer;

export const EMPTY_BUFFER = createBuffer("");

export const EMPTY_DRAFT: AmountDraft = { buffer: EMPTY_BUFFER, sealed: false };

export const OPERATORS: readonly MathOperator[] = ["+", "-", "×", "÷"];

export const isOperatorChar = (char: string): char is MathOperator => (OPERATORS as readonly string[]).includes(char);

export const hasOperator = (buffer: string): boolean => buffer.split("").some(isOperatorChar);

/** The portion of the buffer after the last operator — the number currently being typed. */
export const trailingSegment = (buffer: string): string => {
  for (let index = buffer.length - 1; index >= 0; index -= 1) {
    if (isOperatorChar(buffer[index])) {
      return buffer.slice(index + 1);
    }
  }
  return buffer;
};

export const roundToPrecision = (value: number, precision: PrecisionPolicy): number => {
  const factor = 10 ** precision.maxFractionDigits;
  return Math.round(value * factor) / factor;
};
