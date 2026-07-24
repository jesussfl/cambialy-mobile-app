import { sanitizeAmountInput } from "../utils";

export type MathOperator = "+" | "-" | "×" | "÷";

/**
 * Parses raw typed expression string where number segments are raw digit entries
 * formatted via the cents-based system (e.g. "23" -> 0.23, "500" -> 5.00).
 */
export function parseSegmentToNumber(rawSegment: string): number {
  if (!rawSegment) return 0;

  // If segment already contains a decimal dot/comma (e.g. calculated result), parse directly
  if (rawSegment.includes(".") || rawSegment.includes(",")) {
    const num = parseFloat(rawSegment.replace(/,/g, "."));
    return isNaN(num) ? 0 : num;
  }

  const sanitized = sanitizeAmountInput(rawSegment);
  const num = parseFloat(sanitized);
  return isNaN(num) ? 0 : num;
}

/**
 * Tokenize a raw expression string (e.g. "23+23" or "500×20") into numbers and operators.
 */
export function tokenizeExpression(expression: string): (number | MathOperator)[] {
  const tokens: (number | MathOperator)[] = [];
  let currentSegment = "";

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (["+", "-", "×", "÷", "*", "/"].includes(char)) {
      if (currentSegment.length > 0) {
        tokens.push(parseSegmentToNumber(currentSegment));
        currentSegment = "";
      } else if (char === "-" && (tokens.length === 0 || typeof tokens[tokens.length - 1] !== "number")) {
        // Negative sign
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
    tokens.push(parseSegmentToNumber(currentSegment));
  }

  return tokens;
}

/**
 * Evaluates token list according to standard BODMAS / PEMDAS rules (* / before + -).
 */
export function evaluateTokens(tokens: (number | MathOperator)[]): number | null {
  if (tokens.length === 0) return null;

  let currentTokens = [...tokens];

  // If last token is an operator, ignore it for live evaluation
  if (typeof currentTokens[currentTokens.length - 1] !== "number") {
    currentTokens.pop();
  }

  if (currentTokens.length === 0) return null;

  // Pass 1: Multiplication & Division
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
        return null; // Division by zero
      }

      const result = token === "×" ? prev * next : prev / next;
      pass1.push(result);
      i += 2;
    } else {
      pass1.push(token);
      i++;
    }
  }

  // Pass 2: Addition & Subtraction
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
 * Evaluates a raw expression string and returns formatted cents-based string for app inputs.
 */
export function evaluateExpression(expression: string): { result: string | null; formattedResult: string } {
  if (!expression.trim()) {
    return { result: null, formattedResult: "" };
  }

  const tokens = tokenizeExpression(expression);
  const numResult = evaluateTokens(tokens);

  if (numResult === null || !isFinite(numResult)) {
    return { result: null, formattedResult: "" };
  }

  const rounded = Math.round(numResult * 100) / 100;
  const resultStr = rounded.toFixed(2).replace(/\./g, ",");

  return { result: rounded.toFixed(2), formattedResult: resultStr };
}

/**
 * Appends operator to an expression string safely.
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
 * Formats a raw expression string for visual presentation (e.g. "23+23" -> "0,23 + 0,23").
 */
export function formatExpressionForDisplay(expression: string): string {
  if (!expression) return "";

  const parts: string[] = [];
  let currentSegment = "";

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (["+", "-", "×", "÷"].includes(char)) {
      if (currentSegment) {
        const numStr = sanitizeAmountInput(currentSegment).replace(".", ",");
        parts.push(numStr);
        currentSegment = "";
      }
      parts.push(char);
    } else {
      currentSegment += char;
    }
  }

  if (currentSegment) {
    const numStr = sanitizeAmountInput(currentSegment).replace(".", ",");
    parts.push(numStr);
  }

  return parts.join(" ");
}
