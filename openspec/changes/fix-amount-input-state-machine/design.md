## Context

See `proposal.md`. The defect is not a bad line of arithmetic — it is a **cycle in the data flow**. Formatted display output is fed back in as raw input, and the two ends of the cycle disagree about what a digit string means. Every symptom (the `0,01` lock, delete dividing by ten, the mode mismatch, the vanishing decimal key) is a consequence of that one cycle.

```
                        THE CYCLE (today)

   keypress ──▶ expression ──evaluateExpression(mode, sep)──▶ "0,01"
                    ▲                                            │
                    │                                            │  a DISPLAY string:
                    │                                            │  localized, always 2dp
                    │                              onAmountChange│
                    │                                            ▼
                    │                              sanitizeKeypadInput(value)
                    │                                   ← mode hardcoded "automatic"
                    │                                            │
                    │                                            ▼
                    └──────────── re-seeded from ──────────── amount
                       input-comparison-block.tsx:60, :72, :103
```

Cutting the cycle is the design. Everything else follows from it.

## Goals / Non-Goals

**Goals**

- One grammar for entered numbers, enforced by the type system rather than by convention.
- A delete operation that provably terminates at the empty string.
- A single state machine shared by both screens, so the two cannot drift again.
- The user's `amountInputMode` honoured on every read and every write.
- Pure, dependency-free core logic that a future test runner can exercise directly.

**Non-Goals:** as listed in `proposal.md`.

## The Core Decision: One Grammar, One Direction

```
                        THE TARGET (acyclic)

                     ┌──────────────────────────────────────┐
   keypress ────────▶│  keypadReducer(draft, action, cfg)   │────▶ draft.buffer
                     │              [pure]                  │      (dialect A only)
                     └──────────────────────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
      toNumber(draft, cfg)   toDisplay(draft, cfg)   toExpressionPreview(draft, cfg)
           [pure]                  [pure]                     [pure]
              │                        │                        │
              ▼                        ▼                        ▼
      conversion / compare        the big number         the small preview line

   No edge points back up. A projection can never become state.
```

`draft.buffer` is the **only** mutable value. It contains exactly the characters the keypad can emit — digits, at most one decimal separator per segment, and operators — never a localized or canonical string.

```ts
/** Opaque so a canonical string cannot be assigned where a keypress buffer is expected. */
type KeypadBuffer = string & { readonly __keypadBuffer: unique symbol };

type AmountDraft = {
  buffer: KeypadBuffer;
  /** The buffer holds a completed value (evaluated, pasted, or pill-selected):
   *  the next digit starts a new entry, an operator continues from it. */
  sealed: boolean;
};
```

`sealed` is the **only** flag, and it lives on the draft — replacing the per-component `hasTyped`, which was duplicated, diverged between the two screens, and shared across two fields on one of them.

### Why the branded type matters

`PriceInputState.amount: string` is the bug wearing a type annotation. Both dialects satisfy `string`, so the compiler cannot object when `"0.00"` is passed to a function that reads `"1234"` as cents. `KeypadBuffer` makes that assignment a compile error, so the class of defect cannot silently return.

The one legitimate conversion between dialects gets an explicit, named function:

```ts
draftFromValue(value: number, cfg: KeypadConfig): AmountDraft
//   automatic → buffer = digits of round(value * 100)   → 12.34 becomes "1234"
//   manual    → buffer = value rendered dot-decimal     → 12.34 becomes "12.34"
//   sealed = true
```

Today's code performs this conversion implicitly, by concatenation, and gets it wrong. Naming it turns an accident into a seam.

### Why delete now terminates

```
  delete:  buffer.slice(0, -1)   and   sealed = false
```

The buffer is a plain character string with no re-interpretation step, so *n* deletes on an *n*-character buffer reach `""`. There is no state at which delete is the identity, which is exactly the property `"0.00" → "0.0" → "0.00"` violated.

## Reducer

```
keypadReducer(draft, action, cfg) → draft            // pure, no imports beyond the model
```

| Action | Effect on `buffer` | `sealed` after |
|---|---|---|
| `digit(d)` | `sealed ? d : buffer + d` | `false` |
| `decimal` | append `.` if the trailing segment has none; ignore otherwise. In `automatic` mode: ignored | `false` |
| `operator(op)` | ignored when `buffer` is empty; replaces a trailing operator; else appends | `false` |
| `delete` | `buffer.slice(0, -1)` | `false` |
| `clear` | `""` | `false` |
| `evaluate` | no-op without an operator; else `draftFromValue(evaluate(buffer), cfg)` | `true` |
| `setValue(n)` | `draftFromValue(n, cfg)` — pill, paste, swap | `true` |
| `setMode(m)` | `draftFromValue(toNumber(draft, cfg), { ...cfg, mode: m })` | `true` |

`evaluate` collapsing back through `draftFromValue` is what makes a result reusable: the post-`=` buffer is still dialect A, so the next operator press extends it correctly instead of producing `"25×"` where `25` is read as cents.

`setMode` is the fix for a latent defect: today the exchange store's module-level `useSettingsStore.subscribe(...)` re-formats the *display* on a settings change but leaves the expression buffer encoded in the old mode.

### Projections

```
toNumber(draft, cfg)            → number
toDisplay(draft, cfg)           → string     the big number
toExpressionPreview(draft, cfg) → string     "" when the buffer has no operator
```

`toDisplay` has one subtlety worth stating, because it is a spec'd behaviour and not an implementation detail:

- **no operator in the buffer** → render the single segment with the precision the user actually typed. This preserves `"12,"` and `"12,50"`, which today collapse to `12,00` and `12,5`.
- **operator present** → render the evaluated running result, with the expression itself shown in the preview line.

Rounding happens only when an evaluated result is produced, and only to the field's declared precision:

```ts
type PrecisionPolicy = { maxFractionDigits: number };
const AMOUNT_PRECISION = { maxFractionDigits: 2 };
const RATE_PRECISION   = { maxFractionDigits: 4 };   // 36,4523 is a real rate
```

`evaluateExpression` currently hardcodes `Math.round(n * 100) / 100`; it gains the policy as a parameter. Direct (non-arithmetic) entry is never rounded — it is whatever the user typed.

## Module Layout

The shared kernel does **not** live inside either consumer. `src/features/calculator/` already imports utils, components, constants, and types from `src/features/exchange/` — a dependency that has no justification beyond history, and the mechanism by which the copy-paste happened. A neutral module inverts it.

```
src/features/amount-input/            ← depends on nothing but settings types
  model/
    types.ts            KeypadAction, KeypadConfig, PrecisionPolicy, KeypadBuffer
    amount-draft.ts     AmountDraft, draftFromValue, toNumber, toDisplay,
                        toExpressionPreview           [pure, no React, no imports]
    keypad-reducer.ts   keypadReducer                 [pure]
  hooks/
    use-keypad-fields.ts   binds the reducer to named fields + the settings store
    use-amount-sheet.ts    the only module that touches the TrueSheet static API

           ▲                              ▲
           │                              │
  src/features/exchange/         src/features/calculator/
```

```
BEFORE                                  AFTER

 calculator ───────▶ exchange            calculator ──┐
     │                  │                             ├──▶ amount-input
     └─ own copy of ────┘                exchange ────┘
        the state machine                    (each keeps its own UI)
```

## Component Hierarchy & State Flow

```
ExchangeScreen                                  PriceComparisonScreen
  └─ SwapInputBlock                               └─ PRICE_SIDES.map(side =>
      │                                                 InputComparisonBlock)
      │                                                   │
      └──────────────┬────────────────────────────────────┘
                     ▼
        useKeypadFields({ fields, mode, separator })
                     │
      ┌──────────────┼───────────────────────────┐
      ▼              ▼                           ▼
  drafts:        activeField              handlers: onKeyPress, onDelete,
  Record<FieldId,                                   onClear, onOperatorPress,
         AmountDraft>                               onEvaluate
      │                                             │
      │  one draft per field ⇒ no shared flag       │  routed to activeField only
      ▼                                             ▼
  keypadReducer(draft, action, cfg)  ◀──────────────┘
      │
      ├─▶ toDisplay            → the field's big number
      ├─▶ toExpressionPreview  → the preview line above it
      └─▶ toNumber             → onValueChange(number) → owning state
                                    │
             ┌──────────────────────┴───────────────────────┐
             ▼                                              ▼
   useExchangeStore                              PriceComparisonScreen
   (persisted app state)                         useState<Record<SideId, …>>
```

Both blocks become presentational: they receive display strings and a handler bag, and render. Neither holds keypad state, neither formats, neither imports arithmetic.

### Where the value lives

The two screens legitimately differ, and the hook does not force them to agree:

| | Exchange | Comparison |
|---|---|---|
| Owner | `useExchangeStore` (Zustand, app-wide) | `useState` in the screen |
| Why | shared with header, divider, output block | local to the screen |

The exchange store's `inputAmount` / `inputAmountDisplay` pair — which CLAUDE.md already flags as desynchronization-prone — becomes a **derived mirror**. The draft is the source of truth; both strings plus a new `amountValue: number` are recomputed from it inside a single private writer, so no action can update one without the others. The public read surface is unchanged, so `use-exchange-conversion.ts`, `swap-divider.tsx`, `swap-output-block.tsx`, and `exchange-screen.tsx` need no edits.

With drafts in the store, `resetExchange` clears them directly and the `key={resetKey}` remount hack in `SwapInputBlock` (whose only purpose was discarding local `expression` state) is removed.

### Comparison screen: list-driven sides

```ts
const PRICE_SIDES = [
  { id: "a", label: "Precio A", defaultCurrencyId: "usdt" },
  { id: "b", label: "Precio B", defaultCurrencyId: "ves"  },
] as const;

type PriceSideId = (typeof PRICE_SIDES)[number]["id"];
type PricesState = Record<PriceSideId, PriceInputState>;
```

Handlers take a `sideId` and index the record. The three `side === "first" ? setFirst : setSecond` ternaries disappear, and `PriceSide = "first" | "second"` stops being hand-maintained in `types.ts`. Both sides start with an **empty** draft, which removes the `"1"`-displays-as-1-computes-as-0.01 mismatch.

## SOLID Mapping

| | Today | After |
|---|---|---|
| **SRP** | `InputComparisonBlock` does settings access, keypad state, arithmetic, formatting, sheet orchestration, currency picking, and layout | reducer = transitions; projections = rendering; hook = binding; component = layout |
| **OCP** | a third price means editing five places in the screen and three ternaries | append to `PRICE_SIDES`; the screen maps over it |
| **LSP** | `amount: string` holds two dialects; substituting one is the bug | `KeypadBuffer` is branded, so the substitution will not compile |
| **ISP** | 11 props mixing value, metadata, and callbacks; `valueInVes` is passed and never read | `{ view, handlers }`; the dead prop is gone |
| **DIP** | depends on the settings singleton, the static `TrueSheet` API, and `@/features/exchange/utils` | the model imports nothing; mode and separator arrive as arguments; sheet access sits behind `use-amount-sheet` |

## Decisions

### 1. Delete backspaces the raw buffer, including in cents mode

In `automatic` mode, `"1234" → "123"` renders `12,34 → 1,23`. That looks like a divide-by-ten, and it is — but it is the **correct** semantics for cents entry, where the buffer is a right-to-left digit stack and backspace pops the rightmost digit. The defect was never the scaling; it was applying that scaling to a canonical string, and having no terminating state. Both are fixed while the familiar cents feel is kept.

### 2. A digit after equals starts a new number

Standard calculator convention, and it removes the last place where a completed value could be re-read as a partial one. An operator after equals still continues from the result. `sealed` encodes exactly this distinction, and pills, paste, and swap reuse it.

### 3. Comparison fields start empty

`amount: "1"` is wrong today in both dialects at once. Empty is also the better default for a comparison screen: a result needs both sides, and Precio B already starts empty, so the preseeded `1` never produced a result anyway. *(Made without confirmation; trivially reversible by seeding `draftFromValue(1, cfg)`, which would at least be internally consistent.)*

### 4. Rate precision is a field property, not a global constant

Amounts round to 2, rates to 4. Encoding it as a per-field `PrecisionPolicy` keeps the reducer closed to modification when a future field needs different precision. *(Also made without confirmation; the current 2-decimal cap makes real BCV/Binance rates unenterable, so leaving it would knowingly ship a limitation.)*

### 5. The model stays free of React and of the settings store

`keypadReducer` and the projections import nothing but their own types. `mode`, `decimalSeparator`, and `precision` arrive as a `KeypadConfig` argument. This is what makes the logic testable the moment a runner exists, and it is why `setMode` can be a normal action rather than the module-level `subscribe` side effect the store uses today.

### 6. Both screens are converted in one change

They share one defect through a copy. Fixing one and leaving the other would mean a second store review — and, given no OTA channel, a second window during which the primary screen still mis-reads amounts. The shared hook also makes a future divergence structurally harder than a copy-paste.

## Unistyles Theme Tokens & Dynamic Layout Integration

This change is behavioural. **No token value, palette entry, breakpoint, or style rule changes**, and no `StyleSheet.create` block is rewritten except to delete two dead entries.

| Surface | Role here |
|---|---|
| `StyleSheet.create((theme) => …)` in `swap-input-block.tsx`, `input-comparison-block.tsx` | retained verbatim; the blocks keep their styles while shedding logic |
| `theme.colors.textPrimary` / `textMuted` / `textSecondary` | `amountPreview`, `expressionPreview`, `customRateDisplay` — unchanged |
| `theme.typography.fontFamily.bold` / `.semibold`, `fontSize`, `fontWeight` | amount and rate typography — unchanged |
| `theme.spacing.*`, `theme.radius.*`, `theme.colors.surfaceSoft`, `borderSubtle`, `shadows.card` | block, divider, and rate-row chrome — unchanged |
| `withUnistyles(AppText)` → `UniAppText` | still required: the amount preview sits inside a horizontal `ScrollView` and receives a Unistyles style. The wrapper is kept exactly as-is per the Reanimated × Unistyles interop rule |
| `UnistylesRuntime.themeName` in `amount-keypad-sheet.tsx` | untouched; the sheet's Android navigation-bar sync is out of scope |
| `styles.header`, `styles.headerTitle` in `price-comparison-screen.tsx` | deleted — no consumer |

**Dynamic layout.** The amount field renders a variable-length string inside a horizontal `ScrollView` with `contentContainerStyle={{ alignItems: "center" }}`, so it already absorbs longer values. Two of this change's behaviours make longer strings reachable — a preserved trailing `,` and 4-decimal rates — and both are text-length changes the existing scroll container handles without a layout edit. The `phone` / `tablet` breakpoints are not referenced by any touched style.

**Placeholder.** `decimalSeparator === "comma" ? "0,00" : "0.00"` stays, but it now means only "the field is empty", because the empty state is genuinely reachable. Today `0,00` is ambiguous between empty and stuck.

## JS / Native Boundary

No new boundary is crossed, and neither widget module is touched.

The one native-adjacent surface is `@lodev09/react-native-true-sheet`, reached today through its **static** API from inside two presentational components:

```
BEFORE   InputComparisonBlock ──▶ TrueSheet.dismissAll() ──▶ TrueSheet.present(name)
         SwapInputBlock       ──▶ TrueSheet.present("amount-keypad-sheet")
              (unguarded async; rapid taps can interleave)

AFTER    both ──▶ useAmountSheet(name).open(field)
                     ├─ sets the active field before presenting
                     ├─ serialises dismiss→present so overlapping taps cannot interleave
                     └─ the single place importing TrueSheet
```

Two sheets are mounted on the comparison screen (one per price block), which is why the calculator needs `dismissAll()` first and the exchange screen does not. Serialising that pair in one hook removes the race without changing which sheets exist or how they are named. The sheet's own `onWillPresent` / `onWillDismiss` navigation-bar sync in `amount-keypad-sheet.tsx` is not modified.

## Risks / Trade-offs

- **This rewrites the input path of both primary screens.** A regression yields a wrong number rather than a crash, which is the harder failure to notice. Mitigated by keeping the reducer pure and fully specified with worked examples, by leaving the visual layer untouched, and by a fixed on-device keystroke matrix across both modes × both separators.
- **No automated tests.** Purity is the whole point of the design, yet nothing can execute it today (`jest` is not installed; the existing `__tests__` files do not run). Verification is manual and scripted. Wiring a runner is the natural follow-up and would make this module its first real subject.
- **Cents-mode backspace still looks like a divide-by-ten.** It is intended (Decision 1), but a user who reported the current bug may read the corrected behaviour as the same bug. Worth confirming against the intended entry model before release.
- **Exchange store shape changes.** Mitigated by keeping the public read surface (`inputAmount`, `inputAmountDisplay`, `customRateInput`) intact as derived mirrors, so the four downstream consumers are untouched. The new `amountValue: number` is additive.
- **Overlap with queued changes.** `refactor-keypad-buttons` (keypad presentation) and `paste-text-exchange-screen` (paste button) touch neighbouring files; `use-paste-amount.ts` is shared with the latter. `fix-exchange-amount-parsing-and-comparison-symbol` should land first — this change removes the exchange input path's reliance on re-parsing a formatted string, but the clipboard path still needs that parser fixed.
- **Scope beyond the reported bug.** Rate precision (Decision 4) and empty initial drafts (Decision 3) were not requested. Both are flagged, and both are one-line reversals if unwanted.
