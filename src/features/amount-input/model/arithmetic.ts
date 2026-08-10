import { AMOUNT_PRECISION } from "./constants";
import { sanitizeKeypadInput } from "./number-format";
import { isOperatorChar, roundToPrecision, type AmountInputMode, type DecimalSeparator, type MathOperator, type PrecisionPolicy } from "./types";

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

  const currentTokens = [...tokens];

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
 *
 * `precision` decides how many fraction digits an evaluated result keeps — two for money amounts,
 * four for exchange rates. It is *not* applied to direct entry, only to arithmetic results.
 */
export function evaluateExpression(
  expression: string,
  mode: AmountInputMode = "automatic",
  decimalSeparator: DecimalSeparator = "comma",
  precision: PrecisionPolicy = AMOUNT_PRECISION,
): { result: string | null; formattedResult: string } {
  if (!expression.trim()) {
    return { result: null, formattedResult: "" };
  }

  const tokens = tokenizeExpression(expression, mode);
  const numResult = evaluateTokens(tokens);

  if (numResult === null || !isFinite(numResult)) {
    return { result: null, formattedResult: "" };
  }

  const rounded = roundToPrecision(numResult, precision);
  const separatorChar = decimalSeparator === "comma" ? "," : ".";
  const fixed = rounded.toFixed(precision.maxFractionDigits);

  return { result: fixed, formattedResult: fixed.replace(/\./g, separatorChar) };
}

/**
 * Appends operator to an expression string safely (replaces last operator if multiple chained).
 */
export function appendOperatorToExpression(expression: string, operator: MathOperator): string {
  if (!expression) return "";

  const trimmed = expression.trimEnd();
  const lastChar = trimmed[trimmed.length - 1];

  if (isOperatorChar(lastChar)) {
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

  const pushSegment = (segment: string) => {
    if (mode === "manual") {
      parts.push(segment.replace(/\./g, separatorChar));
      return;
    }
    parts.push(sanitizeKeypadInput(segment, "automatic").replace(/\./g, separatorChar));
  };

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (isOperatorChar(char)) {
      if (currentSegment) {
        pushSegment(currentSegment);
        currentSegment = "";
      }
      parts.push(char);
    } else {
      currentSegment += char;
    }
  }

  if (currentSegment) {
    pushSegment(currentSegment);
  }

  return parts.join(" ");
}
