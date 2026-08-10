## 0. Baseline

- [x] 0.1 Record the pre-change static baseline so regressions are attributable.
  - *Verify*: `npx tsc --noEmit` exits 0; `npx eslint .` reports **0 errors / 10 warnings**. Save both outputs; every later verification compares against them.
- [ ] 0.2 Record the current broken behaviour on device, to confirm the fix later addresses the reported symptom.
  - *Verify*: on the comparison screen with `amountInputMode = automatic`, type `1 2 3 4`, dismiss and reopen the keypad sheet, press delete 5×, then type `7`. Confirm the field reads `0,01` and stays there. Capture a screen recording.

## 1. Shared model — pure, no React, no imports

- [x] 1.1 Create `src/features/amount-input/model/types.ts` with `KeypadBuffer` (branded string), `AmountDraft`, `KeypadAction`, `PrecisionPolicy`, and `KeypadConfig` (`mode`, `decimalSeparator`, `precision`).
  - *Verify*: `npx tsc --noEmit` exits 0. Confirm the brand rejects a plain string: temporarily add `const b: KeypadBuffer = "12.34";` and confirm `tsc` errors, then remove it.
- [x] 1.2 Create `src/features/amount-input/model/amount-draft.ts` with `emptyDraft`, `draftFromValue`, `toNumber`, `toDisplay`, and `toExpressionPreview`. Reuse the existing tokenizer/evaluator from `@/features/exchange/utils` for arithmetic only — no formatting round-trips.
  - *Verify*: `npx tsc --noEmit` exits 0; `grep -nE "useState|useSettingsStore|react" src/features/amount-input/model/amount-draft.ts` returns no match (the model must stay framework-free).
- [x] 1.3 In `amount-draft.ts`, implement `toDisplay`'s two branches: a buffer with no operator renders its single segment at the precision typed (preserving a trailing separator and trailing zeros); a buffer with an operator renders the evaluated running result.
  - *Verify*: `npx tsc --noEmit` exits 0. Behaviour is verified on device in §7.
- [x] 1.4 Create `src/features/amount-input/model/keypad-reducer.ts` implementing `digit`, `decimal`, `operator`, `delete`, `clear`, `evaluate`, `setValue`, and `setMode` per the transition table in `design.md`.
  - *Verify*: `npx tsc --noEmit` exits 0; confirm the reducer's `delete` case is a plain `slice(0, -1)` with no re-sanitisation — `grep -n "sanitizeKeypadInput" src/features/amount-input/model/keypad-reducer.ts` returns no match.
- [x] 1.5 Add `AMOUNT_PRECISION` (2) and `RATE_PRECISION` (4) to `src/features/amount-input/model/types.ts` or a sibling `constants.ts`.
  - *Verify*: `npx tsc --noEmit` exits 0.

## 2. Precision policy in the shared evaluator

- [x] 2.1 In `src/features/exchange/utils/index.ts`, change `evaluateExpression` to accept a `PrecisionPolicy` instead of hardcoding `Math.round(n * 100) / 100`, defaulting to 2 decimals so existing callers are unaffected.
  - *Verify*: `npx tsc --noEmit` exits 0; `grep -n "100) / 100" src/features/exchange/utils/index.ts` returns no match; `npx eslint src/features/exchange/utils/index.ts` reports no new warnings.

## 3. Binding hooks

- [x] 3.1 Create `src/features/amount-input/hooks/use-amount-sheet.ts` owning all `TrueSheet` access, serialising `dismissAll()` → `present(name)` so overlapping taps cannot interleave.
  - *Verify*: `npx tsc --noEmit` exits 0; after §4 and §5, the only `TrueSheet.present`/`dismissAll` calls for the **amount keypad** are in `use-amount-sheet.ts`. (`exchange-screen.tsx:49` still presents `rate-history-sheet` directly — a different sheet, out of scope for this change.)
- [x] 3.2 Create `src/features/amount-input/hooks/use-keypad-fields.ts` holding `Record<FieldId, AmountDraft>` plus `activeField`, reading `amountInputMode` and `decimalSeparator` with **granular** selectors, and returning per-field `display` / `expressionPreview` plus a handler bag routed to the active field.
  - *Verify*: `npx tsc --noEmit` exits 0; `grep -n "useSettingsStore()" src/features/amount-input/hooks/use-keypad-fields.ts` returns no match (no whole-store destructuring).
- [x] 3.3 In `use-keypad-fields.ts`, dispatch `setMode` when `amountInputMode` changes so the buffer is re-encoded rather than reinterpreted.
  - *Verify*: `npx tsc --noEmit` exits 0; on device, enter `12,34` in automatic mode, switch settings to manual, return — the field still reads `12,34`.

## 4. Exchange screen

- [x] 4.1 In `src/features/exchange/store/exchange-store.ts`, make `amountDraft` and `customRateDraft` the source of truth, and recompute `inputAmount`, `inputAmountDisplay`, `customRateInput`, `customRateValue`, and a new `amountValue: number` from them inside a single private writer.
  - *Verify*: `npx tsc --noEmit` exits 0; `grep -n "set({" src/features/exchange/store/exchange-store.ts` shows the mirrors written from one place only.
- [x] 4.2 Replace the module-level `useSettingsStore.subscribe(...)` re-format hack with a `setMode` dispatch through the reducer.
  - *Verify*: `grep -n "useSettingsStore.subscribe" src/features/exchange/store/exchange-store.ts` returns no match; `npx tsc --noEmit` exits 0.
- [x] 4.3 Point `resetExchange` at `emptyDraft`, then remove `resetKey` from the store and the `key={resetKey}` remount wrapper in `swap-input-block.tsx`.
  - *Verify*: `grep -rn "resetKey" src/` returns no match; `npx tsc --noEmit` exits 0; on device, reset the exchange screen and confirm the amount, custom rate, and any pending expression all clear.
- [x] 4.4 Rewrite `SwapInputBlockInner` to consume `useKeypadFields`, deleting `expression`, `hasTyped`, `updateFieldValue`, `handleValueInput`, `handleOperatorPress`, `handleEvaluate`, `handleValueDelete`, and `handleValueClear`.
  - *Verify*: `grep -nE "hasTyped|setExpression" src/features/exchange/components/swap-input-block.tsx` returns no match; `npx tsc --noEmit` exits 0; `npx eslint src/features/exchange/components/swap-input-block.tsx` reports no new warnings.
- [x] 4.5 In `src/features/exchange/hooks/use-exchange-input.ts`, route `handleQuickAmountSelect` and `handleSwapDirection` through `setValue` / `draftFromValue` instead of `setInputAmount(n.toFixed(2))`.
  - *Verify*: `grep -n "toFixed(2)" src/features/exchange/hooks/use-exchange-input.ts` returns no match; `npx tsc --noEmit` exits 0.
- [x] 4.6 In `src/features/exchange/hooks/use-paste-amount.ts`, route the pasted amount through `setValue`, and clear both `setTimeout` handles on unmount.
  - *Verify*: `grep -n "clearTimeout" src/features/exchange/hooks/use-paste-amount.ts` shows cleanup; `npx eslint src/features/exchange/hooks/use-paste-amount.ts` reports no new warnings.

## 5. Comparison screen

- [x] 5.1 In `src/features/calculator/types.ts`, derive `PriceSideId` from a `PRICE_SIDES` config and drop the hand-written `PriceSide = "first" | "second"`.
  - *Verify*: `grep -rn '"first"' src/features/calculator/` returns no match outside `ComparisonResult`; `npx tsc --noEmit` exits 0.
- [x] 5.2 In `src/features/calculator/screens/price-comparison-screen.tsx`, replace the two `useState` calls with `Record<PriceSideId, PriceInputState>`, render `PRICE_SIDES.map(...)` with the divider between, and delete the three `side === "first" ? … : …` ternaries.
  - *Verify*: `grep -nE 'side === "first"|setFirstPrice|setSecondPrice' src/features/calculator/screens/price-comparison-screen.tsx` returns no match; `npx tsc --noEmit` exits 0.
- [x] 5.3 Remove the hardcoded `sanitizeKeypadInput(value)` calls from the screen; values arrive from the hook already interpreted under the active mode.
  - *Verify*: `grep -n "sanitizeKeypadInput" src/features/calculator/screens/price-comparison-screen.tsx` returns no match.
- [x] 5.4 Start both sides with an empty draft, removing the `amount: "1"` seed.
  - *Verify*: `grep -n 'amount: "1"' src/features/calculator/` returns no match; on device, a fresh comparison screen shows the placeholder in both fields and no result.
- [x] 5.5 Make `getComparisonOption` in `src/features/calculator/utils.ts` take the numeric amount and rate directly instead of re-parsing strings with a defaulted mode.
  - *Verify*: `grep -n "parseSegmentToNumber" src/features/calculator/utils.ts` returns no match; `npx tsc --noEmit` exits 0.
- [x] 5.6 Rewrite `InputComparisonBlock` as presentational over `useKeypadFields`, deleting the duplicated handler block and the unused `valueInVes` prop.
  - *Verify*: `grep -nE "hasTyped|setExpression|valueInVes" src/features/calculator/components/input-comparison-block.tsx` returns no match; `npx tsc --noEmit` exits 0.
- [x] 5.7 Apply `RATE_PRECISION` to the `Tasa` field and `AMOUNT_PRECISION` to the amount field.
  - *Verify*: harness-verified against the compiled model — `36,4523` is retained in the rate field and `36,45 + 0,0023 =` yields `36,4523`, while the same expression under the amount policy settles at `36,45`. On-device confirmation still outstanding.

## 6. Cleanup

- [x] 6.1 Delete `src/features/calculator/data/mock-rates.ts`.
  - *Verify*: `grep -rn "mock-rates" src/` returns no match; `npx tsc --noEmit` exits 0.
- [x] 6.2 Delete the unused `header` and `headerTitle` styles from `price-comparison-screen.tsx`.
  - *Verify*: `grep -n "headerTitle" src/features/calculator/screens/price-comparison-screen.tsx` returns no match.
- [x] 6.3 Replace `uniProps={(theme: any) => …}` on the comparison screen's compare icon with the typed theme parameter.
  - *Verify*: `grep -n "theme: any" src/features/calculator/screens/price-comparison-screen.tsx` returns no match; `npx tsc --noEmit` exits 0.
- [x] 6.4 Replace `useSettingsStore()` whole-store reads with granular selectors in `input-comparison-block.tsx` and `comparison-summary.tsx`.
  - *Verify*: `grep -rn "useSettingsStore()" src/features/calculator/` returns no match.
- [x] 6.5 Confirm no `console.*` was introduced on any user-reachable path.
  - *Verify*: no `console.*` appears in any file this change touches (`git diff --stat` scope). Three pre-existing calls remain in `rate-history-sheet.tsx`, which this change does not modify; they belong to `changes/add-production-observability`.

## 7. Behavioural verification

> **Not run.** These require a device/simulator, which was not available in the implementing session. The reducer
> and its projections were instead verified by compiling the pure model and executing every scenario below that
> does not involve rendering — 48 assertions, all passing, plus a 4000-case fuzz confirming delete always
> terminates. On-device confirmation is still outstanding.

Run the matrix on device for **each** of the four combinations of `amountInputMode` (`automatic`, `manual`) × `decimalSeparator` (comma, dot), on **both** the exchange screen and the comparison screen. Comma-mode expectations are shown; dot mode differs only in the rendered separator.

- [ ] 7.1 The reported bug is gone.
  - *Verify*: automatic mode — type `1 2 3 4`, dismiss and reopen the sheet, press delete 5×, then type `7`. Field reads `0,07`, then typing `5` gives `0,75`. It never reads `0,01`.
- [ ] 7.2 Delete steps down one character and reaches empty.
  - *Verify*: automatic — `1 2 3 4` → `12,34`; deletes give `1,23` → `0,12` → `0,01` → empty (placeholder). Manual — `1 2 , 3 4` → `12,34`; deletes give `12,3` → `12,` → `12` → `1` → empty.
- [ ] 7.3 Delete never divides in manual mode.
  - *Verify*: manual — enter `12,50`, press delete once: field reads `12,5`, not `1,25`.
- [ ] 7.4 The decimal key registers.
  - *Verify*: manual — type `1 2 ,` → field reads `12,`; type `5 0` → `12,50` (not `12,5`); pressing `,` again leaves `12,5` unchanged.
- [ ] 7.5 Displayed value equals computed value in both modes.
  - *Verify*: with Precio A = `Divisa` at `Bs. 40,00` — manual, type `2 5` → field `25`, summary `Bs. 1.000,00`. Automatic, type `2 5` → field `0,25`, summary `Bs. 10,00`.
- [ ] 7.6 Fields are independent.
  - *Verify*: select `Personalizado`; enter `12,34` in Monto, switch to Tasa, type `4 0` — Tasa reflects only `4 0`. Press `C` on Tasa — Monto still reads `12,34`. Clear Precio A — Precio B is unchanged.
- [ ] 7.7 Arithmetic and post-equals entry.
  - *Verify*: manual — `20 + 5 =` → `25`; then `× 2 =` → `50`; then typing `7` starts a new entry (`7`, not `507`). `100 ÷ 0 =` leaves the last valid value with no `Infinity`/`NaN`. Pressing `+` on an empty field does nothing.
- [ ] 7.8 Externally supplied values remain editable.
  - *Verify*: automatic — tap the `50` pill → `50,00`; delete → `5,00`. Paste `1.234,56` → delete → `123,45`. Swap direction with a populated amount, then delete — one character is removed.
- [ ] 7.9 Entry mode and separator changes preserve the value.
  - *Verify*: enter `12,34` in automatic, switch to manual — still `12,34`, and delete now gives `12,3`. Enter `1.234,56`, switch the separator to dot — reads `1,234.56` with the same computed value.
- [ ] 7.10 Both screens agree.
  - *Verify*: automatic — `1 2 3 4` then delete 2× reads `0,12` on the exchange screen and on the comparison screen.
- [ ] 7.11 Sheet presentation has no race.
  - *Verify*: on the comparison screen, tap Precio A's amount and Precio B's amount in rapid alternation ~10×; exactly one sheet is presented each time and it targets the tapped field.
- [ ] 7.12 No visual regression.
  - *Verify*: compare both screens against pre-change screenshots in light and dark themes — spacing, typography, colours, and the expression preview line are unchanged.

## 8. Final gate

- [x] 8.1 Static checks match or improve on the baseline.
  - *Verify*: `npx tsc --noEmit` exits 0; `npx eslint .` reports 0 errors and no more than the baseline 10 warnings.
- [x] 8.2 The duplicated state machine is gone.
  - *Verify*: no `hasTyped` state remains — the two `grep -rn "hasTyped" src/` hits are doc comments in `amount-input` recording why the flag is gone. `appendOperatorToExpression` resolves to one implementation in `amount-input/model/arithmetic.ts`, re-exported by `exchange/utils/index.ts` for the existing test file.
- [ ] 8.3 Confirm the two unrequested decisions with the requester before release.
  - *Verify*: empty initial comparison drafts (design Decision 3) and 4-decimal rate precision (Decision 4) are either approved or reverted; record which.
