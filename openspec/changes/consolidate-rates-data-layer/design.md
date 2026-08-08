## Context

See `proposal.md`. The duplication is historical: the calculator feature was built with a self-contained API client, and the shared `src/api/` layer was extracted later (see the archived `refactor-exchange-architecture` change) without migrating the calculator.

## Goals / Non-Goals

**Goals:**
- One domain model, one mapper, one cache key per resource.
- The Compare tab reuses rates already fetched by the Exchange tab.
- No change to any displayed comparison result for identical inputs.

**Non-Goals:** as listed in `proposal.md`.

## Current vs. Target Data Flow

```
CURRENT — two parallel stacks over one API

  Exchange tab                              Compare tab
  ────────────                              ───────────
  useExchangeRates()                        useQuery(["exchange-rates"])
    └─ exchangeQueries.getUSDRate()           └─ fetchExchangeRates()
    └─ exchangeQueries.getEURRate()                 └─ fetchRatePayload() ×3
    └─ exchangeQueries.getUSDTRate()                └─ mapRate()          ← duplicate mapper
          └─ mapRateResponse()                            │
                │                                          │
          src/api/mapper.ts                    features/calculator/api/rates-api.ts
                │                                          │
                └──────── same 3 endpoints ────────────────┘
                          different cache keys
                          different mappers  ← already divergent

TARGET — one stack

  Exchange tab            Compare tab
  ────────────            ───────────
        └──────────┬──────────┘
                   ▼
           useExchangeRates()
                   │
           exchangeQueries.*           ← one queryOptions factory
                   │
           mapRateResponse()           ← one mapper
                   │
        models/exchange.models.ts      ← one domain type
                   │
           one cache key per resource  ← second tab is a cache hit
```

## Module Ownership After Consolidation

| Layer | Owner | Consumers |
|---|---|---|
| Domain types | `src/models/exchange.models.ts` | every feature |
| Response mapping | `src/api/mapper.ts` | query layer only |
| Query definitions | `src/api/queries/*.queries.ts` | feature hooks |
| Feature hooks | `src/features/*/hooks/` | feature components |
| Feature-local types | `features/calculator/types.ts` | that feature only — must *extend*, never redefine, domain types |

The boundary rule: a feature may define types describing **its own UI state** (`PriceInputState`, `PriceSide`, `PriceCurrencyId`) but must import anything describing **the API domain** (`ExchangeRate`, `ExchangeRateId`, `ExchangeRateHistoryOption`).

## Decisions

### 1. The calculator consumes the shared hook, not the shared client directly

`price-comparison-screen.tsx` currently owns a `useQuery` call. It moves to `useExchangeRates()`, which already returns sorted rates merged with fallbacks. This means the calculator inherits the `RATE_ORDER` sorting and fallback-merge behaviour it currently re-implements locally (`price-comparison-screen.tsx:30`), removing a third copy of that logic.

### 2. `fetchExchangeRates` is deleted rather than re-exported

Keeping a thin re-export would preserve the second entry point and the temptation to extend it. The proposal's whole purpose is that exactly one path exists.

### 3. Verify equivalence numerically, not structurally

`rates-api.ts` and `mapper.ts` differ in field precedence: `mapper.ts` reads `rate_value` → `rate` → `rates[currency]`, while `rates-api.ts` reads `rate_value` → `rates[currency]`. For a payload where both `rate` and `rates[currency]` are present and unequal, the two produce different numbers. Verification therefore compares **rendered comparison output** for fixed inputs before and after, not just that types line up.

### 4. `mock-rates.ts` is deleted, not relocated

Hardcoded rate strings in a currency app are a latent correctness hazard, and `openspec/config.yaml` now forbids them outright. It has zero imports, so deletion is free.

## Unistyles Theme Tokens & Dynamic Layout Integration

This change is confined to the data layer; no component's styles, tokens, or layout change. `price-comparison-screen.tsx` keeps its existing `StyleSheet.create((theme) => …)` block untouched, and `RateCard`, `InputComparisonBlock`, and `ComparisonSummary` are not modified.

One consequence worth noting for verification: because the Compare tab becomes a cache hit rather than a fresh fetch, its **loading state is exercised less often**. The existing loading and error presentations must still be confirmed to render correctly — by clearing the cache and cold-starting directly into the Compare tab — so that consolidation does not hide a broken empty state behind a warm cache.

## Risks / Trade-offs

- **Mapper precedence difference** is the real regression risk, addressed by numeric before/after comparison in the task list.
- **Shared cache coupling**: a change to the exchange query's `staleTime` now also affects the Compare tab. This is the intended behaviour — both tabs display the same rates and should agree on freshness — but it must be a conscious decision when tuning cache times later.
- **Feature independence**: the calculator now depends on `src/api/` and on the exchange feature's constants. For a domain this small, one correct source outweighs feature isolation; if the calculator ever needs to diverge, the correct move is to extend the shared layer, not to fork it again.
