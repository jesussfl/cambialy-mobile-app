## Why

The exchange feature currently suffers from severe state management fragmentation. Logic is scattered across a Zustand store, a React context, and 8 different custom hooks. This makes tracing data flow incredibly difficult, creates blurry boundaries of responsibility, and results in heavy prop/hook drilling in the main screens. Consolidating this architecture will make the code legible, maintainable, and less prone to bugs when modifying exchange flows.

## What Changes

- Consolidate exchange state management into a single source of truth (Zustand).
- Remove the redundant React context for exchange state.
- Refactor the 8 custom hooks in `src/features/exchange/hooks/` to group related logic and eliminate unnecessary indirection.
- Unify utility functions from `src/features/exchange/utils.ts` and `src/features/exchange/utils/calculator.ts`.
- Simplify `exchange-screen.tsx` by reducing the number of hooks it needs to call directly.

## Capabilities

### New Capabilities
None

### Modified Capabilities
None

## Impact

- `src/features/exchange/screens/exchange-screen.tsx` will be drastically simplified.
- All exchange components will consume state directly from the consolidated Zustand store.
- Existing custom hooks will either be deleted or folded into the store actions.
