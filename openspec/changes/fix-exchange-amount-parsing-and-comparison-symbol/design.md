## Context

See `proposal.md` for motivation. Currently, `parseLocalizedAmountToNumber` prioritizes comma indices over dot indices regardless of their relative order, leading to broken numeric values when formatted inputs like `"7,487.90"` are parsed. Additionally, comparison row items in `useExchangeConversion` hardcode `rate.info.symbol`, displaying foreign currency symbols even when converting to Bolivars (VES).

## Goals / Non-Goals

**Goals:**
- Fix `parseLocalizedAmountToNumber` to accurately determine decimal separators in localized currency strings containing multiple punctuation marks.
- Update `buildConversionDetails` to display `targetCurrency.symbol` in standard conversion direction and `rate.info.symbol` in reversed direction.

**Non-Goals:**
- Altering the user's selected `decimalSeparator` setting or keypad input mode behavior.
- Modifying rate fetching, TanStack React Query logic, or store structure.

## Decisions

### Decision 1: Rightmost Separator Selection for Dual-Punctuation Numbers
In `parseLocalizedAmountToNumber`:
- Compute `lastCommaIndex = trimmedValue.lastIndexOf(",")` and `lastDotIndex = trimmedValue.lastIndexOf(".")`.
- When both `lastCommaIndex > -1` and `lastDotIndex > -1`, set `decimalSeparatorIndex = Math.max(lastCommaIndex, lastDotIndex)`.
- When only one is present, set `decimalSeparatorIndex` to that index.
- If no separator exists, `decimalSeparatorIndex` is `-1`.
- Rationale: Standard international currency formats (e.g., US `"7,487.90"` or ES/VE `"7.487,90"`) always place the decimal separator after thousands separators.

### Decision 2: Direction-Aware Symbol Selection in Conversion Details
In `buildConversionDetails`:
- Set `displaySymbol = isReversed ? rate.info.symbol : targetCurrency.symbol`.
- In standard mode (USD -> VES), the output unit is VES, so `displaySymbol` is `"Bs."`.
- In reversed mode (VES -> USD), the output unit is the respective base currency (USDT, EUR, etc.), so `displaySymbol` is `"$"`, `"€"`, etc.

## Risks / Trade-offs

- **[Risk]** Single separator strings without decimals (e.g. `"1,234"`) might be parsed with decimal part if comma is interpreted as decimal separator.
  - **Mitigation**: Existing keypad inputs pass formatted decimals (`"1234.00"` or `"1234,00"`). For single commas, existing fallback maintains backwards-compatible behavior.
