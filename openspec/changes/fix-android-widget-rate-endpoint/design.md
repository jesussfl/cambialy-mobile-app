## Context

See `proposal.md`. The Android widget runs in a separate process from the React Native runtime — `RatesWidgetProvider` (an `AppWidgetProvider`) and `RatesWidgetWorker` (a `CoroutineWorker`) execute on WorkManager's schedule with no JS runtime alive. It therefore cannot read `process.env` and must obtain the API URL through the native build.

## Goals / Non-Goals

**Goals:**
- One authoritative API base URL for app, iOS widget, and Android widget.
- The URL follows `EXPO_PUBLIC_API_URL` automatically for every variant (dev / staging / production).
- No behavioural change to caching, scheduling, or error rendering.

**Non-Goals:**
- Runtime reconfiguration of the URL (build-time injection is sufficient and avoids a native persistence surface).
- Sharing Kotlin networking code with any other module.

## Current vs. Target Data Flow

```
CURRENT (broken)
┌──────────────────────────────┐        ┌────────────────────────────────────────┐
│ JS app                       │        │ Android widget process                 │
│  EXPO_PUBLIC_API_URL         │        │  RatesWidgetRepository.getBaseUrl()    │
│   → railway.app/api/v2  ─────┼──▶ A   │   packageName.contains("staging")?     │
└──────────────────────────────┘        │     ├ yes → onrender.com/api/v2        │
                                        │     └ no  → ahorrave-api.../api/v1 ─┼─▶ B
┌──────────────────────────────┐        └────────────────────────────────────────┘
│ iOS widget                   │                        A ≠ B  ← the defect
│  EXPO_PUBLIC_API_URL ────────┼──▶ A
└──────────────────────────────┘

TARGET
        app.config.ts / .env
                │
                ▼
      EXPO_PUBLIC_API_URL  ────────────────┬──────────────┬──────────────┐
                │                          │              │              │
                │                withRatesWidgetApiUrl    │              │
                │                          │              │              │
                ▼                          ▼              ▼              ▼
            JS app                 BuildConfig.       iOS widget    (future native
                                   RATES_API_BASE_URL                consumers)
                                          │
                                          ▼
                              RatesWidgetRepository.fetchAndCacheRates()
```

## Decisions

### 1. Build-time injection via `buildConfigField`

The config plugin reads `process.env.EXPO_PUBLIC_API_URL` during `expo prebuild` and writes it into the module's `build.gradle` as a `buildConfigField`. Kotlin then reads `BuildConfig.RATES_API_BASE_URL`.

Rationale: the widget must work on first placement with no app launch, so any runtime hand-off (SharedPreferences written by JS) leaves a window where the URL is unknown. Build-time injection has no such window and cannot be stale.

A build-time fallback constant is retained so a missing env var fails loudly at build time rather than producing an empty URL at runtime.

### 2. Delete the v1 branch entirely

`fetchAndCacheRates` currently carries two payload shapes. The v1 branch (`/rates/bcv`, `/rates/binance`) exists only to serve the legacy host being removed. Keeping it would preserve the ability to silently regress. The v2 path (`/rates/usd`, `/rates/eur`, `/rates/usdt` + `extractRate`) is the only shape retained.

### 3. Cache and scheduling untouched

`SharedPreferences` keys, `Double.fromBits` storage, the 30-minute `PeriodicWorkRequest`, and `renderAll(hasError = true)` stale rendering all remain. A wrong URL is the defect; the resilience layer around it is correct and already outperforms the app's own offline behaviour.

## Unistyles / Layout Integration

Not applicable — the Android widget renders through Android `RemoteViews` (`res/layout/rates_widget*.xml`) and cannot use React Native styling. The widget's colours are defined in `res/values/colors.xml` and `res/values-night/colors.xml`; those files remain the widget's theme surface and are unchanged by this change. No Unistyles theme token is read or affected.

## Cross-Boundary Sync Contract

| Side | Owns | Reads |
|---|---|---|
| `.env` / `app.config.ts` | `EXPO_PUBLIC_API_URL` (authoritative) | — |
| `plugins/withRatesWidgetApiUrl.js` | translation into Gradle | `process.env.EXPO_PUBLIC_API_URL` |
| `build.gradle` (module) | `BuildConfig.RATES_API_BASE_URL` | plugin-written value |
| `RatesWidgetRepository.kt` | request construction | `BuildConfig.RATES_API_BASE_URL` |

Invariant: no `.kt`, `.gradle`, or `.xml` file under `modules/rates-widget/` may contain a literal `https://` API host after this change. This is mechanically checkable and becomes a task verification step.

## Risks / Trade-offs

- **Prebuild dependency**: the URL is baked at prebuild time, so changing `.env` requires a rebuild. Acceptable — the same is already true of every `EXPO_PUBLIC_*` value in the JS bundle.
- **Staging parity**: staging builds now follow `.env.staging` like everything else, which also surfaces the separate staging env-resolution defect tracked in `harden-release-configuration`.
