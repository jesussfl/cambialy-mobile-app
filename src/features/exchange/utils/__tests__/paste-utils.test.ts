import { sanitizePastedAmount } from "../paste-utils";

jest.mock("expo-clipboard", () => ({
  getStringAsync: jest.fn(),
  hasStringAsync: jest.fn(),
}));

describe("paste-utils - sanitizePastedAmount", () => {
  it("returns null for empty or invalid text", () => {
    expect(sanitizePastedAmount("")).toBeNull();
    expect(sanitizePastedAmount("   ")).toBeNull();
    expect(sanitizePastedAmount("no digits here")).toBeNull();
  });

  it("sanitizes plain integers", () => {
    expect(sanitizePastedAmount("150")).toBe("150");
    expect(sanitizePastedAmount(" $ 1250 ")).toBe("1250");
  });

  it("sanitizes amounts with currency symbols and spaces", () => {
    expect(sanitizePastedAmount("$1,250.50")).toBe("1250.50");
    expect(sanitizePastedAmount("1.250,50 Bs.")).toBe("1250.50");
    expect(sanitizePastedAmount("USD 50,25")).toBe("50.25");
  });

  it("handles European comma decimal format", () => {
    expect(sanitizePastedAmount("1250,50", "comma")).toBe("1250.50");
    expect(sanitizePastedAmount("45,5", "comma")).toBe("45.5");
  });

  it("handles US dot decimal format", () => {
    expect(sanitizePastedAmount("1250.50", "dot")).toBe("1250.50");
    expect(sanitizePastedAmount("45.5", "dot")).toBe("45.5");
  });
});
