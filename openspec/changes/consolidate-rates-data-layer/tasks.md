## 0. Capture the baseline

- [ ] 0.1 Record the current price comparison output for a fixed input set before making any change: first price `1` USDT, second price `500` VES, with the live rate values noted.
  - *Verify*: capture a screenshot and write down the rendered comparison result and each displayed rate value. This is the equivalence baseline for task 4.1.
- [ ] 0.2 Record the exact field precedence of both mappers so the difference is explicit before it is removed.
  - *Verify*: note that `src/api/mapper.ts` resolves `rate_value` → `rate` → `rates[currency]` while `features/calculator/api/rates-api.ts` resolves `rate_value` → `rates[currency]`.

## 1. Migrate the calculator to the shared data layer

- [ ] 1.1 Replace the local `useQuery({ queryKey: ["exchange-rates"], queryFn: fetchExchangeRates })` in `src/features/calculator/screens/price-comparison-screen.tsx` with the shared `useExchangeRates()` hook.
  - *Verify*: `npx tsc --noEmit` exits 0; `grep -n "exchange-rates\"" src/` returns no match.
- [ ] 1.2 Remove the now-redundant local sorting and fallback-merge in the same screen, since `useExchangeRates()` already applies `RATE_ORDER` and `fallbackRates`.
  - *Verify*: the screen no longer contains its own `RATE_ORDER` sort; rendered rate order is still BCV → USDT → EUR.
- [ ] 1.3 Update `src/features/calculator/types.ts` and `utils.ts` to import `ExchangeRate` / `ExchangeRateId` from `@/models/exchange.models` wherever they currently shadow the domain types.
  - *Verify*: `npx tsc --noEmit` exits 0; `grep -rn "type ExchangeRate" src/features/` returns no match.

## 2. Delete the duplicates

- [ ] 2.1 Delete `src/features/calculator/api/rates-api.ts`.
  - *Verify*: `grep -rn "rates-api\|fetchExchangeRates" src/` returns no match; `npx tsc --noEmit` exits 0.
- [ ] 2.2 Delete `src/features/calculator/data/mock-rates.ts`.
  - *Verify*: `grep -rn "mock-rates\|mockRates" src/` returns no match.
- [ ] 2.3 Confirm no feature module declares an API base URL or endpoint map.
  - *Verify*: `grep -rn "API_BASE_URL\|EXPO_PUBLIC_API_URL" src/features/` returns no match.

## 3. Cache verification

- [ ] 3.1 Confirm one cache entry per rate resource after visiting both tabs.
  - *Verify*: with React Query devtools or a logged cache dump, confirm no `["exchange-rates"]` entry exists and each resource appears once.
- [ ] 3.2 Confirm the Compare tab is a cache hit after the Exchange tab has loaded.
  - *Verify*: load Exchange, wait for rates, switch to Compare within the stale window, and confirm no new network request is issued.

## 4. Correctness verification

- [ ] 4.1 Confirm comparison output is unchanged against the task 0.1 baseline.
  - *Verify*: re-enter the identical inputs and confirm the rendered result and every displayed rate value match the baseline exactly.
- [ ] 4.2 Confirm both screens agree on the same rate simultaneously.
  - *Verify*: note the BCV USD value on the exchange screen, switch to Compare, and confirm the identical value.
- [ ] 4.3 Confirm the loading state is still reachable.
  - *Verify*: clear app storage, cold start directly into the Compare tab, and confirm a loading state appears before rates resolve.
- [ ] 4.4 Confirm the error state is still reachable.
  - *Verify*: with no cached rates and the network disabled, open the Compare tab and confirm the Spanish rate error message renders.

## 5. Final checks

- [ ] 5.1 Static checks pass.
  - *Verify*: `npx tsc --noEmit` exits 0; `npx eslint .` reports no new warnings.
- [ ] 5.2 Confirm the single-source-of-truth invariant holds.
  - *Verify*: exactly one rate mapper exists in the tree, and no hardcoded rate literal remains.
