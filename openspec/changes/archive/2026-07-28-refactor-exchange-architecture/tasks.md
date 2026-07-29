## 1. Store Consolidation

- [x] 1.1 Migrate state from `exchange-context.tsx` into `exchange-store.ts`
- [x] 1.2 Remove `exchange-context.tsx` and its provider from the component tree
- [x] 1.3 Move calculations and logic from `use-exchange-actions.ts` and `use-exchange-conversion.ts` into store actions
- [x] 1.4 Refactor remaining custom hooks (e.g., `use-exchange-history.ts`, `use-exchange-input.ts`) into Zustand selectors or store actions

## 2. Utils Unification

- [x] 2.1 Merge `utils.ts` and `utils/calculator.ts` into a single module
- [x] 2.2 Update imports across the exchange feature to point to the unified utils module
- [x] 2.3 Run tests in `utils/__tests__/calculator.test.ts` to ensure nothing broke

## 3. UI Refactoring

- [x] 3.1 Update `exchange-screen.tsx` to consume Zustand state directly instead of local hooks
- [x] 3.2 Update `amount-keypad.tsx`, `swap-input-block.tsx`, and other components to use Zustand store
- [x] 3.3 Delete orphaned hook files in `hooks/` directory

## 4. Verification

- [ ] 4.1 Verify exchange calculations work correctly
- [ ] 4.2 Verify currency swapping and history views function properly
