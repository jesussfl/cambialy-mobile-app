## Why

The amount keypad feeds its own **formatted output** back in as **input**, and the two ends of that loop speak different number grammars. On the comparison screen the loop terminates in a state where the field is welded to `0,01` and no keystroke can move it.

Two incompatible string dialects share the type `string`:

| Dialect | Example | Meaning | Read by |
|---|---|---|---|
| **A — keypad buffer** | `"1234"` | `12.34` in `automatic` (cents) mode | `sanitizeKeypadInput`, `parseSegmentToNumber` |
| **B — canonical** | `"12.34"` | `12.34` | `formatDotDecimalString`, the comparison math |

`expression` is dialect A. `amount` is dialect B. The code seeds one from the other in three places
(`input-comparison-block.tsx:60`, `:72`, `:103`), and the round trip corrupts the value.

**The `0,01` lock, reproduced.** Any of *reopen the sheet* (`:121`), *press `=`* (`:85`), or *switch Monto↔Tasa* (`:188`) sets `expression = ""` while `amount` is still populated. `handleValueDelete` then falls through to `:102-105` and slices a **dialect B** string, re-reading it as **dialect A**:

| press | `amount` before | `.slice(0,-1)` | re-read as cents | `amount` after |
|---|---|---|---|---|
| 1 | `"12.34"` | `"12.3"` | digits `123` | `"1.23"` |
| 2 | `"1.23"` | `"1.2"` | digits `12` | `"0.12"` |
| 3 | `"0.12"` | `"0.1"` | digits `01`→`1` | `"0.01"` |
| 4 | `"0.01"` | `"0.0"` | digits `00`→`0` | `"0.00"` |
| 5+ | `"0.00"` | `"0.0"` | digits `00`→`0` | `"0.00"` ← **fixed point** |

Delete **divides by ten** instead of removing a character, and can never reach `""`. The field then reads `0,00`, byte-identical to the placeholder, so it looks empty while holding a value. Typing any digit from there (`:60`) builds `"0.00" + "5" = "0.005"`, which `parseSegmentToNumber` sees as a decimal, `parseFloat`s to `0.005`, and `evaluateExpression` rounds to **`0.01`**. Every subsequent keystroke re-rounds to `0.01`. Only `C` escapes.

**Adjacent defects in the same loop:**

- `price-comparison-screen.tsx:41,48` call `sanitizeKeypadInput(value)` with **no mode argument**, pinning it to `automatic` while `input-comparison-block.tsx:64` evaluates with the user's real `amountInputMode`. For a `manual`-mode user the two halves disagree on every keystroke.
- `utils.ts:8,10` — `getComparisonOption` never receives the mode either, so a `manual` user's `"25"` is read as `0.25`. A **100× error in a financial comparison**.
- `price-comparison-screen.tsx:20` seeds `amount: "1"`, which displays as `1` and computes as `0.01`. The screen is wrong on first paint, before any input.
- `input-comparison-block.tsx:40` uses **one** `hasTyped` boolean for both Monto and Tasa. `SwapInputBlock` correctly uses `{amount, customRate}` (`swap-input-block.tsx:60`); the copy lost it. Switching to Tasa appends the first digit onto the existing rate, and `C` on one field resets the other's typed state.
- Pressing the decimal key in `manual` mode appears to do nothing: `"12,"` evaluates to `12` and re-renders as `12,00`, discarding the pending decimal.
- `evaluateExpression` (`utils/index.ts:367`) hard-rounds every result to 2 decimals, including the **custom rate** field — a real rate such as `36,4523` cannot be entered.

**The exchange screen shares this state machine.** `input-comparison-block.tsx` is a copy of `swap-input-block.tsx` produced by `changes/adapt-calculator-ui`, described there as "a pure UI refactoring" — it carried ~90 lines of state machine along with the layout and dropped the per-field flag. `SwapInputBlock` has the same slice-the-canonical-string delete path (`swap-input-block.tsx:153-155`). With no OTA channel, shipping a fix for one screen and leaving the identical defect in the primary screen costs a second store review.

The root cause is architectural, so the fix is: **one pure state machine, one grammar, one direction of flow**, consumed by both screens.

## What Changes

- Introduce `src/features/amount-input/` — a shared module owning a single **`AmountDraft`** value object and a **pure keypad reducer**. The raw keypress buffer becomes the only mutable state; the displayed number and the numeric value become pure, one-way projections of it. Formatted output can never re-enter as input.
- Make `delete` exactly `buffer.slice(0, -1)` on the raw buffer, so *n* presses on an *n*-character buffer reach empty. Termination is structural, not incidental.
- Give every field its own draft, eliminating the shared `hasTyped` flag and the cross-field `C`.
- Thread the user's `amountInputMode` through every read and write, including `getComparisonOption`, and re-encode the buffer when the setting changes.
- Rewrite `SwapInputBlock` and `InputComparisonBlock` to consume the shared hook, deleting the duplicated handler block from both.
- Collapse the exchange store's parallel `inputAmount` / `inputAmountDisplay` pair into drafts with derived mirrors written by a single code path.
- Make the comparison screen list-driven over a `PRICE_SIDES` config instead of branching on `"first" | "second"`.
- Add a per-field precision policy so the custom-rate field accepts 4 decimal places.

## User Impact

Today a user on the comparison screen who deletes their way back can reach a state where the amount is stuck at `0,01` and typing does nothing — the screen appears frozen and the only recovery is a button they have no reason to suspect. Users who chose **manual** entry in settings are worse off: their amounts are silently read 100× too small, so the app confidently reports that the wrong price is cheaper. That is a financial recommendation derived from a number the user never entered.

After this change, backspace removes one character and reaches an empty field, typing after clearing starts a fresh number, the decimal key visibly registers, both entry modes agree end-to-end, and a custom rate like `36,4523` can be entered at full precision. The same corrections land on the exchange screen, where the identical delete path exists today.

Nothing about the visual design, layout, copy, or interaction vocabulary changes. A user who never hits the broken path sees an identical app.

## Technical Scope

**New — `src/features/amount-input/`**

- `model/amount-draft.ts` — the `AmountDraft` value object, a branded `KeypadBuffer` type, and the pure projections `toNumber`, `toDisplay`, `toExpressionPreview`, `draftFromValue`.
- `model/keypad-reducer.ts` — the pure `(draft, action, config) => draft` state machine.
- `model/types.ts` — `KeypadAction`, `PrecisionPolicy`, `AmountInputMode` re-export.
- `hooks/use-keypad-fields.ts` — binds the reducer to a set of named fields, the settings store, and sheet presentation.
- `hooks/use-amount-sheet.ts` — the only place that touches the `TrueSheet` static API.

**Modified**

- `src/features/exchange/store/exchange-store.ts` — drafts become the source of truth; `inputAmount` / `inputAmountDisplay` / `customRateInput` become mirrors written from one place; `resetKey` remount hack retired.
- `src/features/exchange/components/swap-input-block.tsx` — duplicated handler block replaced by the shared hook.
- `src/features/exchange/hooks/use-exchange-input.ts` — quick-amount and swap-direction writes go through `draftFromValue`.
- `src/features/exchange/hooks/use-paste-amount.ts` — paste writes go through `draftFromValue`; the two uncleaned `setTimeout` calls gain cleanup.
- `src/features/exchange/utils/index.ts` — `evaluateExpression` takes a precision policy instead of a hardcoded 2.
- `src/features/calculator/components/input-comparison-block.tsx` — becomes presentational over the shared hook.
- `src/features/calculator/screens/price-comparison-screen.tsx` — list-driven state; mode threaded; no hardcoded `"automatic"`.
- `src/features/calculator/utils.ts` — `getComparisonOption` becomes mode-aware.
- `src/features/calculator/types.ts` — `PriceSideId` derived from the `PRICE_SIDES` config.

**Deleted**

- `src/features/calculator/data/mock-rates.ts` — zero importers, and hardcoded rate values are forbidden by project convention.
- The dead `valueInVes` prop, and the unused `header` / `headerTitle` styles on the comparison screen.

## Non-Goals

- **Consolidating the rates data layer.** `src/features/calculator/api/rates-api.ts` stays as-is; that is `changes/consolidate-rates-data-layer`. This change does not touch fetching, mapping, endpoints, or query keys.
- **The all-zero `fallbackRates` problem** (audit §P1-5). A failed fetch still yields rate `0`; the explicit unavailable state belongs with the data-layer change.
- **Installing a test runner.** The reducer is designed to be pure and directly unit-testable, but `jest` + `jest-expo` wiring is a separate chore; verification here is typecheck, lint, and scripted on-device keystroke sequences.
- **Moving `AmountKeypad` / `AmountKeypadSheet`** into the new module. They stay in `src/features/exchange/components/` to avoid colliding with `changes/refactor-keypad-buttons`.
- **Generalising `ComparisonResult` to N prices.** State and rendering become list-driven; the result model stays two-way. A third price would still need summary work.
- **Any visual, layout, copy, theming, or animation change.**
- **Redesigning the settings surface** for `amountInputMode` / `decimalSeparator`.
- **Reducing the five call sites of `useExchangeRatesList`** (audit item, unrelated axis).

## Capabilities

### New Capabilities
- `amount-keypad-input`: Numeric amount entry through the on-screen keypad behaves as a deterministic, terminating state machine — a single raw keypress buffer with one-way projections to the displayed and computed value — so that every keystroke is reversible, the field can always be emptied, and the number the user reads is exactly the number the app computes with, in both entry modes and under both decimal separators.

### Modified Capabilities

## Impact

- `src/features/amount-input/**`: new shared module — value object, pure reducer, binding hooks.
- `src/features/exchange/store/exchange-store.ts`: drafts as source of truth; mirrors written by one path; `resetKey` removed.
- `src/features/exchange/components/swap-input-block.tsx`: ~90 duplicated lines removed, replaced by the shared hook.
- `src/features/exchange/hooks/use-exchange-input.ts`, `use-paste-amount.ts`: external writes converted to `draftFromValue`; timer cleanup added.
- `src/features/exchange/utils/index.ts`: `evaluateExpression` accepts a precision policy.
- `src/features/calculator/components/input-comparison-block.tsx`: reduced to presentation over the shared hook.
- `src/features/calculator/screens/price-comparison-screen.tsx`, `utils.ts`, `types.ts`: list-driven sides, mode threading, empty initial drafts.
- `src/features/calculator/data/mock-rates.ts`: deleted.

**Ordering with pending changes.** `changes/fix-exchange-amount-parsing-and-comparison-symbol` edits `parseLocalizedAmountToNumber` and `use-exchange-conversion.ts`; this change removes the exchange input path's dependency on re-parsing a formatted string, but that fix is still required for the clipboard path and should land first if both are queued. `changes/refactor-keypad-buttons` and `changes/paste-text-exchange-screen` touch the keypad's presentation and the paste button respectively; neither overlaps the state machine, but `use-paste-amount.ts` is shared with the latter.

**Release risk: medium.** No signing, permission, native-module, or API-contract surface is touched, so the store-review profile is unchanged. The risk is behavioural: this rewrites the input path of the app's two primary screens, and a regression here produces a wrong number rather than a crash. The mitigations are that the reducer is pure and exhaustively specified below with worked examples, that the visual layer is untouched, and that verification includes a fixed keystroke matrix run on device across both `amountInputMode` values and both `decimalSeparator` values.
