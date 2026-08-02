## 1. Paste Utility & Hooks

- [x] 1.1 Create clipboard paste & sanitization helper (`src/features/exchange/utils/paste-utils.ts` or `src/features/exchange/hooks/use-paste-input.ts`) to extract numeric values from raw strings and handle decimal separators.
- [x] 1.2 Add paste action integration into `useExchangeInput` or paste handler in `SwapInputBlock`.

## 2. UI Component Integration

- [x] 2.1 Add Paste button / trigger to `SwapInputBlock` (or `AmountKeypadSheet`) using Unistyles and `TouchZone`.
- [x] 2.2 Wire paste trigger to read clipboard asynchronously via `expo-clipboard` and update the exchange store input state.

## 3. Verification

- [x] 3.1 Run TypeScript check (`pnpm tsc --noEmit`) to verify zero type errors.
- [x] 3.2 Verify paste functionality handles formatted strings, decimals, and invalid text correctly.
