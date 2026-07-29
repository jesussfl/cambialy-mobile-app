## Context

The exchange feature currently relies on a mix of Zustand (`exchange-store.ts`), React Context (`exchange-context.tsx`), and a sprawling set of 8 custom hooks. See `proposal.md` for the motivation to consolidate this. The feature has many moving parts (inputs, histories, rate calculations) which makes managing the source of truth difficult.

## Goals / Non-Goals

**Goals:**
- Consolidate all exchange state into the Zustand store.
- Eliminate `exchange-context.tsx`.
- Fold the logic from the 8 custom hooks directly into the Zustand store actions or inline them where they are trivial, drastically reducing the hook surface area.
- Unify utility functions from `utils.ts` and `utils/calculator.ts` into a cohesive `utils/` structure or a single file.

**Non-Goals:**
- Rewriting the UI components or altering the visual design.
- Altering the business logic or calculations (the math remains exactly the same).

## Decisions

**1. Consolidate on Zustand**
- *Rationale*: Zustand is already in use (`exchange-store.ts`), it does not suffer from Context re-render issues, and it's easy to read. It allows us to encapsulate actions (e.g. `setAmount`, `swapCurrencies`) alongside the state.
- *Alternatives Considered*: Consolidating on React Context. Rejected because Context often leads to unnecessary re-renders when state changes frequently (like typing an exchange amount), and Zustand is more performant for this.

**2. Flatten custom hooks into store actions or selectors**
- *Rationale*: Most of the custom hooks (e.g., `use-exchange-actions.ts`, `use-exchange-conversion.ts`) are just wrappers around state mutations. Moving these mutations directly into the Zustand store (`store.getState().calculateConversion()`) keeps the logic unified and easy to test.

**3. Unify `utils.ts` and `utils/calculator.ts`**
- *Rationale*: Having both is confusing. We will merge `utils.ts` into `utils/calculator.ts` (if it's math-heavy) or keep a single `utils/index.ts` that exports clearly grouped functions.

## Risks / Trade-offs

- **Risk: Breaking existing calculations during refactor** → *Mitigation*: We will ensure existing unit tests (e.g., `utils/__tests__/calculator.test.ts`) continue to pass and manually test the exchange flow end-to-end after consolidation.
- **Risk: Large diff size** → *Mitigation*: The refactor is isolated to `src/features/exchange`, minimizing impact on the rest of the app.
