## Context

See proposal.md for motivation and problem background.

Currently, `SwapInputBlock` allows numeric input through `AmountKeypadSheet` or quick amount pills. Users want to paste numbers or currency strings directly from the clipboard.

## Goals / Non-Goals

**Goals:**
- Provide a Paste button / action in the exchange input UI or keypad sheet.
- Integrate `expo-clipboard` to safely read string content asynchronously.
- Parse and sanitize clipboard text: remove currency codes/symbols ($, USD, Bs., €), spaces, separators, and normalize decimal notation (comma to dot or localized format).
- Seamlessly update `inputAmount` in `useExchangeInput` / `useExchangeStore`.

**Non-Goals:**
- Support pasting rich formatted objects or non-text MIME types.
- Auto-pasting background clipboard without explicit user trigger (privacy & platform consent considerations).

## Decisions

### 1. Dedicated Paste Trigger Button in UI
- Place a paste action button near the exchange input amount display or within the keypad sheet options.
- When pressed, `Clipboard.getStringAsync()` is invoked.

### 2. Sanitization & Normalization Strategy
- Extract digits and a single decimal separator from the pasted string.
- Convert comma `,` to dot `.` if comma is used as decimal separator or match user settings (`amountInputMode` / `decimalSeparator`).
- Fallback: If no valid numeric digits are found in the pasted string, ignore or inform the user gracefully without mutating current input amount.

### 3. Component & Hook Architecture
- Create/extend paste utility or hook `usePasteAmount` in `src/features/exchange/hooks/` or `src/features/exchange/utils/`.
- Wire the paste action into `SwapInputBlock` / `useExchangeInput` so it cleans and sets input amount directly.

## Risks / Trade-offs

- [Pasting non-numeric strings] → Sanitization regex validates and filters numeric content; if no valid numbers are detected, paste is ignored safely.
- [Platform Clipboard Permissions] → On iOS/Android, reading clipboard requires user interaction; calling `Clipboard.getStringAsync()` directly on tap guarantees iOS paste banner compliance.
