## Why

When converting currencies or swapping direction on the exchange screen, localized currency string parsing (`parseLocalizedAmountToNumber`) misinterprets numbers that contain both thousand and decimal separators (e.g. `"7,487.90"` or `"7.487,90"`). It incorrectly assumes the comma is always the decimal separator regardless of its position relative to a dot, causing values like `7,487.90 Bs` to parse as `7.48790`, producing `$0.01` output. Additionally, the comparison section ("Otros cambios") displays the base currency's rate symbol (e.g., `$`) instead of the target currency's symbol (`Bs.`) in standard conversion mode.

## What Changes

- Update `parseLocalizedAmountToNumber` to identify the rightmost separator (`Math.max(lastCommaIndex, lastDotIndex)`) as the decimal separator when both dot and comma are present in the input string.
- Update `buildConversionDetails` in `use-exchange-conversion.ts` to use `targetCurrency.symbol` in standard conversion mode and `rate.info.symbol` in reversed mode.

## Capabilities

### New Capabilities
- `currency-exchange-conversion`: Correct parsing of multi-separator localized currency strings and accurate currency symbol display for conversion comparison details.

### Modified Capabilities

## Impact

- `src/features/exchange/utils/index.ts`: Fix `parseLocalizedAmountToNumber` separator detection logic.
- `src/features/exchange/hooks/use-exchange-conversion.ts`: Correct symbol selection in `buildConversionDetails`.
