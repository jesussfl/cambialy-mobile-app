## Why

The rates data layer exists twice, and the two copies have already diverged.

`src/features/calculator/api/rates-api.ts` re-declares `ExchangeRateId`, `ExchangeRate`, `ExchangeRateHistoryOption`, `API_BASE_URL`, the endpoint map, the rate metadata table, and the response mapper — all of which already exist in `src/models/exchange.models.ts`, `src/api/mapper.ts`, and `src/api/queries/exchange.queries.ts`.

They are no longer equivalent:

| Capability | `src/api/mapper.ts` | `features/calculator/api/rates-api.ts` |
|---|:---:|:---:|
| Reads the legacy `rate` field | ✅ | ❌ |
| Falls back to `timestamp` for `updatedAt` | ✅ | ❌ |
| Handles `next_cursor` pagination | ✅ | ❌ |

They also cache under different React Query keys — `["exchange","usd",…]` versus `["exchange-rates"]` (`price-comparison-screen.tsx:24`) — so the Compare tab re-fetches rates the Exchange tab already holds, and the two tabs can display different numbers for the same rate at the same moment.

Alongside this, `src/features/calculator/data/mock-rates.ts` holds hardcoded rate strings (`'723.29 Bs.'`) with zero imports — fabricated financial data sitting one import away from a screen.

The fix is not cosmetic. In a currency app, two mappers for one API contract means a backend field change gets fixed in one place and silently produces wrong money math in the other.

## What Changes

- Delete `src/features/calculator/api/rates-api.ts` and point the calculator feature at the shared query layer.
- Delete `src/features/calculator/data/mock-rates.ts`.
- Ensure both tabs share one React Query cache key per resource, so a rate fetched by one is reused by the other.
- Record the single-source-of-truth rule in `openspec/config.yaml` so the duplicate cannot be reintroduced.

## User Impact

Users stop being able to see two different values for the same rate depending on which tab they are on. Switching to the Compare tab becomes instant and offline-tolerant, because it reuses the cache the Exchange tab has already populated, instead of issuing three fresh network requests. Removing the divergent mapper eliminates a class of defect where a backend change breaks price comparison while leaving conversion apparently fine.

## Technical Scope

- `src/features/calculator/screens/price-comparison-screen.tsx` — consume `exchangeQueries` / `useExchangeRates` instead of `fetchExchangeRates`.
- `src/features/calculator/api/rates-api.ts` — deleted.
- `src/features/calculator/data/mock-rates.ts` — deleted.
- `src/features/calculator/utils.ts`, `types.ts`, `constants.ts` — reconciled against the shared domain types where they shadow them.
- `src/api/queries/exchange.queries.ts` — no behavioural change expected; verify the shared shape covers the calculator's needs.
- `openspec/config.yaml` — single-source-of-truth rule (already added).

## Non-Goals

- Redesigning the Compare tab's UI, layout, or comparison logic.
- Changing the API contract, adding endpoints, or altering any rate calculation.
- Collapsing the five duplicated `useExchangeRatesList` call sites in the exchange feature — a related but separately scoped re-render concern.
- Adding offline cache persistence, tracked separately.
- Migrating the Exchange feature's query keys, which are already correct.

## Capabilities

### New Capabilities
- `unified-rates-data-layer`: Every feature reads exchange rates through one domain model, one response mapper, and one cache key per resource, so no two screens can display divergent values for the same rate.

### Modified Capabilities

## Impact

- `src/features/calculator/screens/price-comparison-screen.tsx`: replace the local `useQuery({ queryKey: ["exchange-rates"], queryFn: fetchExchangeRates })` with the shared rates hook.
- `src/features/calculator/api/rates-api.ts`: deleted (removes ~110 duplicated lines, 3 duplicated types, 2 duplicated endpoint maps).
- `src/features/calculator/data/mock-rates.ts`: deleted.
- `src/features/calculator/types.ts` / `utils.ts`: import domain types from `@/models/exchange.models` rather than redefining them.

**Release risk**: moderate. The Compare tab's numbers are user-visible financial output, so a mapping difference introduced during consolidation would be a correctness regression. Verification must compare rendered comparison results before and after against identical inputs, not merely confirm the screen renders.
