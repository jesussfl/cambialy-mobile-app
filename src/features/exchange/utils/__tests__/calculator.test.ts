import { appendOperatorToExpression, evaluateExpression, formatExpressionForDisplay, tokenizeExpression } from "../index";

jest.mock("react-native-currency-input", () => ({
  formatNumber: jest.fn(),
}));

describe("Calculator Utility (Cents-based)", () => {
  it("tokenizes cents-based numbers (e.g. 23 -> 0.23)", () => {
    expect(tokenizeExpression("23+23")).toEqual([0.23, "+", 0.23]);
    expect(tokenizeExpression("500×20")).toEqual([5.0, "×", 0.2]);
  });

  it("evaluates 23+23 as 0.46", () => {
    const res = evaluateExpression("23+23");
    expect(res.formattedResult).toBe("0,46");
  });

  it("formats expression for display with comma cents (e.g. 23+23 -> 0,23 + 0,23)", () => {
    expect(formatExpressionForDisplay("23+23")).toBe("0,23 + 0,23");
  });

  it("replaces last operator when appending operator", () => {
    expect(appendOperatorToExpression("23+", "×")).toBe("23×");
  });
});
