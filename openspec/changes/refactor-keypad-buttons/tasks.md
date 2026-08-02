## 1. Modular Keypad Subcomponents

- [x] 1.1 Create `KeypadButton` component in `src/features/exchange/components/keypad/keypad-button.tsx` with borderless Unistyles (`borderWidth: 0`), 52px height, pill shape, and text label rendering.
- [x] 1.2 Create `KeypadIconButton` component in `src/features/exchange/components/keypad/keypad-icon-button.tsx` with borderless Unistyles (`borderWidth: 0`), 52px height, pill shape, and remix icon rendering for the delete button.
- [x] 1.3 Create barrel export `src/features/exchange/components/keypad/index.ts` to export keypad subcomponents.

## 2. Refactor Keypad Grid Layout

- [x] 2.1 Refactor `AmountKeypad` in `src/features/exchange/components/amount-keypad.tsx` to compose `KeypadButton` and `KeypadIconButton`, removing inline borders and secondary button variant defaults.
- [x] 2.2 Update Unistyles definitions in `amount-keypad.tsx` to ensure uniform grid cell dimensions across all 16 buttons.

## 3. Verification

- [x] 3.1 Run TypeScript compiler (`pnpm tsc --noEmit`) to verify type safety across modified files.
- [x] 3.2 Run ESLint (`pnpm lint`) to verify codebase standards.
