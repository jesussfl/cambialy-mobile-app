# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Cambialy — a Venezuelan currency exchange / rate calculator app (Expo SDK 57, React Native 0.86 New Architecture, React 19.2, TypeScript 6, Expo Router with typed routes). All user-facing copy is **Spanish**. Package manager is **pnpm**.

**This app is live on Google Play** (`com.cambialy.app`, `1.1.1` / `versionCode 7`) and there is **no OTA channel** (`expo-updates` is not installed), so any defect that ships needs a full store review to fix. Treat the numbers this app renders as financial output: a wrong rate is a user-harming bug, not a cosmetic one.

## Commands

```bash
pnpm install
pnpm start                    # Metro (dev). start:staging / start:prod set APP_ENV
pnpm ios                      # expo run:ios --device
pnpm android                  # expo run:android
pnpm lint                     # expo lint (eslint-config-expo + eslint-plugin-react-compiler)
npx tsc --noEmit              # typecheck — there is no `typecheck` script
```

Release builds (`android:release`, `android:bundle`, `ios:release`, and the `:staging` variants) run `expo prebuild` first, which **regenerates `ios/` and `android/`** — both are gitignored, so never hand-edit them; change `app.config.ts` or a config plugin in `plugins/` instead.

### Testing

`src/features/exchange/utils/__tests__/*.test.ts` exist and are written for Jest, but **Jest is not installed and there is no `test` script** — the suite cannot currently run. Adding a test runner requires installing `jest` + `jest-expo` and wiring a preset before those files execute.

## Environment / build variants

`app.config.ts` owns variant *identity*: `APP_ENV=staging` switches app name, `bundleIdentifier`/`package` (`com.cambialy.app` → `.staging`), URL scheme, and the widget's app-group id. `EXPO_PUBLIC_API_URL` points at the backend; every query file also hardcodes an onrender.com fallback URL.

**`APP_ENV` does not select the env file — `NODE_ENV` does.** `@expo/env` loads `.env.${NODE_ENV}`, so scripts that set only `APP_ENV=staging` (`start:staging`, `android:staging`) fall through to `.env` and hit the **production** backend. Scripts that set `NODE_ENV=staging` do load `.env.staging`, but Expo warns that a non-conventional `NODE_ENV` "might cause development code to run in production" — and it does: those release builds ship development-mode React. Verify which backend a script actually resolves before trusting it (`npx expo config --type public --json`). Tracked in `openspec/changes/harden-release-configuration/`.

## Architecture

**Routing is a thin shell.** `src/app/` contains only Expo Router files; each route delegates immediately to a feature screen (`src/app/index.tsx` → `ExchangeScreen`). `src/app/_layout.tsx` is the single composition root: `QueryClientProvider` → `GestureHandlerRootView` → `HeroUINativeProvider` → `ThemePreferenceProvider` → `OnboardingGate` → `Tabs` (custom tab bar). Splash is held manually until first paint.

**Feature-driven layout.** Code lives in `src/features/<feature>/` with `screens/ components/ hooks/ store/ utils/ types.ts constants.ts`. Features: `exchange` (main), `calculator` (price comparison), `settings`, `onboarding`. Cross-feature primitives go in `src/components/ui/`.

**Server state** — TanStack Query only, never fetched ad-hoc in components:
`src/api/queries/*.queries.ts` export `queryOptions` factories → `src/api/mapper.ts` normalizes the loosely-typed backend payloads (`ExchangeRateAPIResponse` has multiple optional shapes: `rate_value` | `rate` | `rates.USD`) into domain types from `src/models/exchange.models.ts`. Mapping throws on an unusable rate; hooks like `use-exchange-rates.ts` merge in `fallbackRates` and combine parallel queries via `useQueries({ combine })`. Some endpoints keep a v1 legacy fallback fetch.

⚠️ **This layer currently exists twice.** `src/features/calculator/api/rates-api.ts` is a divergent duplicate — its own domain types, endpoint map, mapper, and cache key (`["exchange-rates"]`). It does *not* read the legacy `rate` field or the `timestamp` fallback that `src/api/mapper.ts` does. Always extend `src/api/`; never add a feature-local API client. Consolidation is specified in `openspec/changes/consolidate-rates-data-layer/`.

**Client state** — Zustand. `useExchangeStore` (`src/features/exchange/store/exchange-store.ts`) holds the amount/rate/currency selection; `useSettingsStore` and `useThemeStore` are `persist`-wrapped over AsyncStorage. Note the cross-store coupling: the exchange store reads settings via `useSettingsStore.getState()` inside actions and re-derives `inputAmountDisplay` through a module-level `useSettingsStore.subscribe(...)` so formatting follows the user's decimal-separator preference without a React render.

**Amount handling is locale-sensitive and easy to break.** `src/features/exchange/utils/index.ts` owns `parseLocalizedAmountToNumber` (detects `,` vs `.` as decimal by last-occurrence), `sanitizeKeypadInput`, `formatKeypadInputForDisplay`, and the `Bs.` formatters. The store keeps two parallel values: `inputAmount` (canonical dot-decimal string) and `inputAmountDisplay` (localized). Changing one without the other desynchronizes the keypad.

**Native rates widget.** `src/modules/rates-widget.ts` is a platform-split facade — `.ios.ts` drives the SwiftUI widget declared in `src/widgets/rates-widget.tsx` (`@expo/ui/swift-ui` + `expo-widgets`, function body marked `"widget"`), `.android.ts` calls the local Expo module in `modules/rates-widget/` (Kotlin AppWidgetProvider + WorkManager), and the base `.ts` is a web/no-op stub. The root layout refreshes it on mount and on every `AppState` → `active`.

⚠️ **The two platforms resolve different API hosts.** iOS reads `EXPO_PUBLIC_API_URL`; Android hardcodes hosts in `RatesWidgetRepository.kt:19-25` and its production branch points at a **legacy backend from a previous product** (`ahorrave-api.onrender.com/api/v1`). Never hardcode an endpoint in native code. Fix specified in `openspec/changes/fix-android-widget-rate-endpoint/`.

**Config plugins** in `plugins/` patch the generated native projects: R8/proguard, Hermes bundle mmap (`noCompress`), Firebase App Distribution, iOS build-RN-from-source, and `.xcode.env.local` env propagation.

## Conventions (enforced; see `openspec/config.yaml`)

- **Styling: Unistyles only.** `StyleSheet.create((theme) => ({...}))` from `react-native-unistyles`. Despite `global.css` / `uniwind` / `tailwindcss` being wired into Metro, **never use `className` or Tailwind utilities anywhere.** Theme tokens live in `src/theme/tokens.ts` + `themes.ts`; `src/theme/unistyles.ts` must stay imported first (it is, from `index.ts`).
- **Reanimated × Unistyles interop** — any component that internally uses Reanimated must be wrapped with `withUnistyles()` before receiving a Unistyles style, and Unistyles styles must not be array-merged with animated styles on `Animated.View`. Read `troubleshooting.md` before touching animated styled components; the `unistyles_*` "empty object is not a valid style value" crash is this.
- **React Compiler is on** (`babel-plugin-react-compiler`, `experiments.reactCompiler`). Do not add `useMemo` / `useCallback` / `React.memo` unless fixing a verified third-party reference-identity bug. The Babel plugin order (`react-native-unistyles/plugin` **before** the compiler) matters.
- **Named exports** for components, screens, hooks. Default exports only where Expo Router requires them.
- **Granular Zustand selectors** — `useExchangeStore((s) => s.field)`, one per field; never select the whole store.
- Hooks own state/business logic; components stay presentational.
- Path aliases: `@/*` → `src/*`, `@/assets/*` → `assets/*`.
- **One source of truth per domain concept.** One rates mapper, one domain type, one React Query key per resource. Never fabricate a rate value — no mocks, no placeholders, no zero-default that renders as if it were live data. Unavailable means an explicit empty/error state.
- **Derive shared screen state once, at the screen.** Do not call the same data hook in sibling components to avoid passing props — `useExchangeRatesList` is currently called in **5** components (`ExchangeScreen`, `ExchangeHeader`, `SwapDivider`, `SwapInputBlock`, `SwapOutputBlock`), each spinning up 4 query subscriptions and re-deriving the whole conversion. React Query dedupes the network; it does not dedupe the re-renders. Don't add a 6th.
- **No `console.*` on a user-reachable path**, and clean up every timer/subscription an effect creates.
- **Native code never hardcodes an API host or an environment branch** — it must receive the value from config/build injection.
- `ios/` and `android/` are generated and gitignored; native changes go in `app.config.ts` or `plugins/`.

## OpenSpec workflow

This repo uses OpenSpec (`openspec/`) for spec-driven changes; skills are installed under `.claude/skills/` and invoked via `/opsx:*` (propose, apply, sync, archive, update, explore). Active proposals live in `openspec/changes/<name>/` (`proposal.md`, `design.md`, `tasks.md`, `specs/`), archived ones under `changes/archive/`. `openspec/config.yaml` carries the project context and per-artifact rules those skills enforce — keep it in sync if conventions change.

## Known state

`docs/production-readiness-audit.md` (8 Aug 2026) is the current audit — read it before planning work. Baseline: `npx tsc --noEmit` is **clean**, `npx eslint .` has **0 errors / 10 warnings**. Keep both true.

Live defects a change is likely to touch:

| | Issue | Spec'd in |
|---|---|---|
| P0 | Production Android widget reads a legacy backend | `changes/fix-android-widget-rate-endpoint/` |
| P0 | `SYSTEM_ALERT_WINDOW` ships in the release manifest | `changes/harden-release-configuration/` |
| P0 | Saved dark-theme preference lost on cold start (AsyncStorage rehydration race in `theme-preference.tsx:49-58`) | `changes/fix-theme-preference-hydration/` |
| P1 | No crash reporting, no error boundary, `console.log` in release | `changes/add-production-observability/` |
| P1 | Duplicated rates data layer | `changes/consolidate-rates-data-layer/` |
| P1 | No offline cache — `fallbackRates` are all `value: 0` | audit §P1-5 |
| P2 | 9 unused runtime deps (Skia is the largest) | audit §P2-2 |

`docs/react-native-best-practices-audit.md` is superseded; its "keystore checked into git" claim does **not** hold — a full history scan shows `release.keystore` was never committed. The passwords in `package.json:70-72` are real and still need moving.
