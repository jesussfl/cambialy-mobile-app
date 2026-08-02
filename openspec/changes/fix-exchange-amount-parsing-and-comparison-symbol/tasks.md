## 1. Core Logic Fixes

- [x] 1.1 Update `parseLocalizedAmountToNumber` in `src/features/exchange/utils/index.ts` to pick the rightmost separator when both dot and comma are present.
- [x] 1.2 Update `buildConversionDetails` in `src/features/exchange/hooks/use-exchange-conversion.ts` to choose `targetCurrency.symbol` in standard direction and `rate.info.symbol` in reversed direction.

## 2. Verification

- [x] 2.1 Run TypeScript typecheck to verify there are no compile errors.
- [x] 2.2 Verify parsing logic for both `"7,487.90"` and `"7.487,90"` and check conversion symbol formatting.
