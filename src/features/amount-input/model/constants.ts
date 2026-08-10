import type { PrecisionPolicy } from "./types";

/** Money amounts settle at two decimals. */
export const AMOUNT_PRECISION: PrecisionPolicy = { maxFractionDigits: 2 };

/**
 * Exchange rates need more than two: real BCV/Binance rates carry four (e.g. 36,4523), and rounding
 * them to two silently changes every conversion that uses them.
 */
export const RATE_PRECISION: PrecisionPolicy = { maxFractionDigits: 4 };
