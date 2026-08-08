# Cambialy — Production Readiness Audit

**App**: Cambialy — currency exchange & rate calculator (Venezuela)
**Stack**: Expo SDK 57 · React Native 0.86 (New Architecture) · React 19.2 + React Compiler · TypeScript 6 · Expo Router
**Store status**: Live on Google Play (`com.cambialy.app`, version `1.1.1`, `versionCode 7`)
**Audit date**: 8 August 2026
**Branch audited**: `develop` @ `44dc71f`

---

## 1. Method

Every finding below is backed by a command that was run or a file that was read — no inference from filenames. Static checks executed against the working tree:

| Check | Command | Result |
|---|---|---|
| Type safety | `npx tsc --noEmit` | **0 errors** ✅ |
| Lint | `npx eslint .` | **0 errors, 10 warnings** ⚠️ |
| Unit tests | *no runner installed* | **cannot execute** ❌ |
| Secret history scan | `git log --all --diff-filter=A --name-only` | keystore **never committed** ✅ |
| Shipped Android permissions | generated `android/app/src/main/AndroidManifest.xml` | 1 policy-sensitive permission ⚠️ |
| Env resolution | `@expo/env@2.4.2` source | 2 confirmed misroutings ❌ |
| Dependency usage | import graph over `src/` + peer-dep resolution | 9 unused runtime deps ⚠️ |

Source coverage: all 80 files under `src/`, the local Expo module (`modules/rates-widget`, Kotlin), all 5 config plugins, `app.config.ts`, `eas.json`, env files, and the generated native manifests.

---

## 2. Verdict

> **Ships today, but with three defects that reach production users — one of which serves wrong financial data.**

The codebase is genuinely above average for a solo-built store app: strict TypeScript passes clean, the React Compiler is correctly enabled, styling is consistently Unistyles, the feature-folder architecture is real (not aspirational), and the release pipeline already does R8 minification and Hermes bundle `mmap`. The team has a documented convention system (`openspec/config.yaml`) and a real interop troubleshooting doc.

What blocks a confident "production-ready" verdict is not code style — it is **three correctness defects that only manifest in the release configuration**, plus a **near-total absence of production observability**. Because there is no OTA channel (`expo-updates` is not installed) and no crash reporting, every one of these is currently invisible to you and un-hotfixable without a full Play review cycle. That combination is the real risk multiplier.

### Scorecard

| Dimension | Score | Status | Headline |
|---|:---:|:---:|---|
| Correctness & Data Integrity | **58** | 🔴 | Android widget reads a *different, legacy* backend in production |
| Observability & Support | **20** | 🔴 | No crash reporting, no error boundary, no OTA, `console.log` in release |
| Testing & QA | **25** | 🔴 | 2 test files exist; Jest is not installed, so they cannot run |
| Expo & Build Configuration | **64** | 🟡 | `start:staging` silently hits the production API; manual `versionCode` |
| Security & Secrets | **70** | 🟡 | Keystore safe, but weak inline passwords + `SYSTEM_ALERT_WINDOW` shipping |
| Architecture & SOLID | **70** | 🟡 | Solid feature layout undermined by a fully duplicated rates data layer |
| Performance & RN Practices | **74** | 🟡 | Compiler + R8 + FlashList ✅; 5× duplicated query subscriptions; dead native deps |
| Maintainability & Scalability | **70** | 🟡 | Clean conventions, but two sources of truth for the core domain |
| TypeScript & Type Safety | **80** | 🟢 | `strict` clean; 28 `any` escapes concentrated in one prop pattern |
| Unistyles Configuration | **82** | 🟢 | Correct and well-documented; theme never follows the system scheme |
| Documentation | **74** | 🟢 | `troubleshooting.md` + OpenSpec are strong; README is still the Expo template |
| **Overall** | **63 / 100** | 🟡 | **Conditionally production-ready — clear P0 list, all cheap to fix** |

---

## 3. P0 — Release blockers

### P0-1 · The production Android widget fetches from a different, legacy backend 🔴

**Evidence** — `modules/rates-widget/android/src/main/java/expo/modules/rateswidget/RatesWidgetRepository.kt:19-25`

```kotlin
private fun getBaseUrl(context: Context): String {
  return if (context.packageName.contains("staging")) {
    "https://cambialy-backend.onrender.com/api/v2"   // staging → current-ish backend
  } else {
    "https://ahorrave-api.onrender.com/api/v1"        // PRODUCTION → legacy v1, different domain
  }
}
```

The production package is `com.cambialy.app`, which does not contain `"staging"`, so **every Play Store install's home-screen widget calls `ahorrave-api.onrender.com/api/v1`** — a different project's API from a previous iteration. Meanwhile the app itself calls `https://cambialy-backend-production.up.railway.app/api/v2` (`.env`), and the **iOS** widget correctly reads `process.env.EXPO_PUBLIC_API_URL` (`src/modules/rates-widget.ios.ts:14`).

**Why this is P0, not P1**: this is a currency app. If that legacy host is dead, the widget shows a permanent error state. If it is alive but no longer updated, users read **stale exchange rates off their home screen and act on them financially**. Silent wrong data is worse than a visible failure.

**Compounding**: the URL is hardcoded in Kotlin, so it is invisible to `EXPO_PUBLIC_API_URL` and to every env file. The two platforms' widgets can drift indefinitely.

**Fix**: pass the resolved API base URL from JS into the module (or inject it at build time via `BuildConfig`), delete the `v1` branch, and make the Kotlin repository a single-URL consumer. → OpenSpec change `fix-android-widget-rate-endpoint`.

---

### P0-2 · `SYSTEM_ALERT_WINDOW` ships in the release manifest 🔴

**Evidence** — `android/app/src/main/AndroidManifest.xml:4`, confirmed present in the *release* merge report (`manifest_merge_blame_file/release/.../manifest-merger-blame-release-report.txt:12`):

```xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
```

It is declared in `src/main/` (not `src/debug/`), so it merges into the release APK/AAB. `SYSTEM_ALERT_WINDOW` — "Display over other apps" — is a permission Google Play actively scrutinizes; it is a common trigger for policy review, and it presents users with an alarming permission on the store listing for an app that never draws overlays. Nothing in `src/` uses it. `VIBRATE` is likewise declared with no haptics dependency installed (`expo-haptics` is absent).

**Fix**: both are removable declaratively without touching native code — the project already uses this exact mechanism for storage permissions (`app.config.ts:32`):

```ts
android: {
  blockedPermissions: [
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.SYSTEM_ALERT_WINDOW",   // add
    "android.permission.VIBRATE",               // add (verify no lib needs it)
  ],
}
```

→ OpenSpec change `harden-release-configuration`.

---

### P0-3 · A saved dark-theme preference is lost on every cold start 🔴

**Evidence** — `src/theme/theme-preference.tsx:17-38, 49-58`

`useThemeStore` persists `themeName` through `createJSONStorage(() => AsyncStorage)` — an **asynchronous** backend, so Zustand's `persist` rehydrates on a later tick. But the provider applies the theme exactly once, on mount, with an empty dependency array:

```tsx
export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const stored = useThemeStore.getState().themeName;  // still "light" — rehydration hasn't landed
    if (stored) UnistylesRuntime.setTheme(stored);
  }, []);                                               // ← never re-runs
  return children;
}
```

At mount, `getState().themeName` is the initializer default `"light"`. When rehydration completes and sets `themeName: "dark"`, **nothing calls `UnistylesRuntime.setTheme` again** — the effect has already run and will not re-fire. The store also declares `isHydrated: false` and never sets it to `true`, which is the exact flag that would fix this; it is dead state.

**User-visible symptom**: a user selects dark mode, closes the app, reopens it, and gets light mode — with the settings toggle still reading "dark", because the store *did* rehydrate. The UI and the store disagree.

**Two related theme gaps** in the same area:
- `src/theme/unistyles.ts:20` hardcodes `initialTheme: 'light'` and does not enable `adaptiveThemes`, so the app **never** follows the OS colour scheme — despite `app.config.ts:14` declaring `userInterfaceStyle: "automatic"`. Those two settings contradict each other.
- `src/theme/theme-preference.tsx:9` still uses the storage key `"paga-claro:theme"` — a previous product name — while every other key is `cambialy:*`.

**Fix**: use `persist`'s `onRehydrateStorage` to apply the theme when hydration actually lands, and set the existing `isHydrated` flag. → OpenSpec change `fix-theme-preference-hydration`.

---

## 4. P1 — High (fix before the next release)

### P1-1 · No crash reporting, no error boundary, no OTA channel

There is **no** Sentry / Crashlytics / Bugsnag integration anywhere (`grep -rniE "sentry|crashlytics|bugsnag" src app.config.ts package.json` → 0 hits), **no** React error boundary, and **no** `expo-updates`. Concretely:

- A render throw anywhere below `RootLayout` white-screens the app with no recovery path and no report.
- `src/api/mapper.ts:46` *throws* on a malformed rate payload — a backend regression turns straight into a crash you never hear about.
- Without `expo-updates`, every fix — including the three P0s above — requires a full Play Store submission and review.

For a live financial app, this is the single highest-leverage gap: the P0 defects above have presumably been in production for some time precisely because nothing reports them.

### P1-2 · Debug logging ships to production

`console.log` / `console.error` run in release builds on hot paths:

| File | Line | Content |
|---|---|---|
| `src/api/queries/history.queries.ts` | 37, 41, 46 | Logs **every** history request URL, HTTP status, cursor, and item count |
| `src/features/exchange/components/rate-history-sheet.tsx` | 34, 146, 148 | Logs on **every `onEndReached`** while the user scrolls |

The `onEndReached` logs fire repeatedly during scroll on a `FlashList`, adding JS-thread work to the exact interaction that must stay at 60fps. There is no `babel-plugin-transform-remove-console` in `babel.config.js`.

### P1-3 · The rates data layer exists twice, and the copies have already diverged

`src/features/calculator/api/rates-api.ts` is a **near-complete duplicate** of `src/api/mapper.ts` + `src/api/queries/exchange.queries.ts`: it redeclares `ExchangeRateId`, `ExchangeRate`, `ExchangeRateHistoryOption`, `API_BASE_URL`, the endpoint map, the rate metadata table, and the mapping function.

They have **already drifted**:

| Capability | `src/api/mapper.ts` | `features/calculator/api/rates-api.ts` |
|---|:---:|:---:|
| Reads legacy `rate` field | ✅ | ❌ |
| Reads `timestamp` fallback for `updatedAt` | ✅ | ❌ |
| Handles `next_cursor` pagination | ✅ | ❌ |

They also cache under **different React Query keys** — `["exchange","usd",…]` vs `["exchange-rates"]` (`price-comparison-screen.tsx:24`) — so switching to the Compare tab re-fetches data the app already holds. This is a textbook DRY/SRP violation and it is the codebase's largest maintenance liability: a backend field change must be fixed in two places, and forgetting one produces wrong money math in only one tab.

`src/features/calculator/data/mock-rates.ts` compounds this — hardcoded rate strings (`'723.29 Bs.'`) sitting unused in a finance app, one import away from shipping fake rates.

### P1-4 · `start:staging` and `android:staging` silently use the **production** backend

Verified against `@expo/env@2.4.2` source (`build/index.js:102-116`) — env files are selected by `NODE_ENV`, not `APP_ENV`:

| Script | Sets `NODE_ENV`? | Env file loaded | Backend actually used |
|---|:---:|---|---|
| `start:staging` | ❌ (only `APP_ENV`) | `.env` | 🔴 **production Railway** |
| `android:staging` | ❌ (only `APP_ENV`) | `.env` | 🔴 **production Railway** |
| `ios:staging` | ✅ `NODE_ENV=staging` | `.env.staging` | ✅ staging |
| `android:staging:release` | ✅ `NODE_ENV=staging` | `.env.staging` | ✅ staging |

So half the staging entry points point at production. Worse, the half that "work" set `NODE_ENV=staging`, and Expo's own loader warns about exactly this:

> `NODE_ENV="staging" is non-conventional and might cause development code to run in production.`

`NODE_ENV` drives React's dev-vs-production build selection, so `android:staging:release` produces a "release" build running **development-mode React** — dev warnings, unminified React, measurably slower. Staging should be `NODE_ENV=production` + `APP_ENV=staging`, with the env file selected by `APP_ENV` explicitly.

### P1-5 · No offline capability for the app's core data

`new QueryClient()` (`src/app/_layout.tsx:21`) is constructed with no `defaultOptions` and no persistence layer. Nothing writes rates to storage. On a cold start without connectivity, `mergeWithFallbackRates` supplies `fallbackRates`, whose `value` is **`0`** for every rate (`src/features/exchange/constants.ts:6-25`) — so the screen renders "Sin datos" and the conversion silently computes against a zero rate.

The irony: the **Android widget already caches** rates to `SharedPreferences` (`RatesWidgetRepository.kt:73-81`), so the home-screen widget survives offline better than the app does. Adding `@tanstack/react-query-persist-client` over AsyncStorage would close this with ~15 lines.

### P1-6 · Keystore passwords are committed in `package.json`

`package.json:70-72` inlines the signing credentials:

```
ANDROID_KEYSTORE_PASSWORD=android ANDROID_KEY_ALIAS=androidreleasekey ANDROID_KEY_PASSWORD=android
```

**Good news, and a correction to the prior audit** (`docs/react-native-best-practices-audit.md` claimed "keystore file checked into git"): a full history scan — `git log --all --diff-filter=A --name-only | grep -iE "keystore|jks"` — shows **`release.keystore` was never committed**, and `.gitignore:16` covers `*.keystore`. The upload key itself is safe.

What remains is still worth fixing: the passwords are literally `"android"`, and they are in a tracked file, so anyone who ever obtains the keystore file gets it unlocked for free. Move them to a gitignored `android/keystore.properties` or CI secrets.

---

## 5. P2 — Medium

### P2-1 · The same query stack is subscribed five times over

`useExchangeRatesList()` is called independently in **five** components, each of which internally calls `useExchangeRates()` (3 × `useQueries`) **and** `useExchangeHistory()` (1 × `useQuery`):

```
ExchangeScreen ─────────────┐
ExchangeHeader ─────────────┤
SwapDivider ────────────────┼──▶ useExchangeRatesList()
SwapInputBlock(Inner) ──────┤        ├─▶ useExchangeRates()   → 3 queries
SwapOutputBlock ────────────┘        └─▶ useExchangeHistory() → 1 query
                                     = 20 subscriptions for 4 distinct queries
```

`useExchangeConversion` is likewise recomputed in 3 components and `useExchangeInput` in 3. React Query deduplicates the *network*, so this is not 20 HTTP requests — but every one of those 5 components re-renders on **every** query state transition, and each independently rebuilds the `rates` array and re-runs the full conversion math.

This is prop-drilling avoided by re-deriving global state everywhere. The React Compiler memoizes within each component but cannot share work across them. The idiomatic fix is one `useExchangeViewModel()` at the screen, passed down — or a selector-based store — rather than five parallel derivations.

### P2-2 · Nine unused runtime dependencies, several with native code

Verified by import graph over `src/` **and** cross-checked against peer-dependency requirements (so `@gorhom/bottom-sheet`, `react-native-svg`, `tailwind-merge`, `tailwind-variants`, `expo-linking`, `react-dom`, `react-native-web` are correctly retained as peers of `heroui-native` / `expo-router` / `react-native-remix-icon`).

Genuinely unreferenced:

| Dependency | Native? | Note |
|---|:---:|---|
| `@shopify/react-native-skia` | ✅ **large** | Not a peer of anything installed; pure APK/IPA weight |
| `react-native-keyboard-controller` | ✅ | Native module, never imported |
| `expo-image` | ✅ | Registered as a plugin, never imported |
| `expo-web-browser` | ✅ | Registered as a plugin, never imported |
| `expo-glass-effect`, `expo-symbols`, `expo-device` | ✅ | Never imported |
| `react-hook-form`, `@hookform/resolvers`, `zod` | ❌ | No forms exist in the app |

Skia alone is a meaningful download-size cost for a rates calculator. Removing these shrinks the binary, the native build time, and the upgrade surface for the next SDK bump.

### P2-3 · Accessibility is thin

12 accessibility props across 38 interactive elements. Notably, the entire numeric keypad (`KeypadButton`, `KeypadIconButton`) and every currency-picker row expose no `accessibilityLabel`. For a keypad, TalkBack/VoiceOver reads the raw glyph — `"÷"` announces poorly, and the delete icon button announces nothing at all. Given this app's audience often uses it while transacting, this is worth a pass.

### P2-4 · `react-native-performance` instrumentation goes nowhere

`performance.mark("screenInteractive")` (`src/app/_layout.tsx:58`) is the only usage. Marks are recorded into an in-memory buffer that is never read or reported — the dependency is paying for itself in bundle size and delivering zero signal. Either wire it to an analytics sink or drop it.

### P2-5 · Two competing splash-hide paths

`RootLayout.onLayoutRootView` calls `SplashScreen.hideAsync()` (`_layout.tsx:52`) while `OnboardingGate` independently calls `SplashScreen.hide()` (`onboarding-gate.tsx:44`). Whichever wins is a race. Consolidate to one owner.

### P2-6 · `buildReactNativeFromSource = true` on iOS

`plugins/withIosBuildReactNativeFromSource.js` forces React Native to compile from source on every clean iOS build. That is a large, recurring build-time cost (tens of minutes) normally reserved for projects patching RN internals. If there is no such patch, removing it restores prebuilt artifacts.

---

## 6. P3 — Low / polish

- **10 ESLint warnings**: 4 × missing `useEffect` deps on Reanimated shared values (safe in practice — shared values are stable — but silence them explicitly rather than leaving noise), 3 × unused `withUnistyles` imports (`copy-icon-button.tsx:4`, `quick-amount-pills.tsx:2`, `swap-output-block.tsx:2`), 3 × empty-object-type.
- **28 `any` escapes**, ~26 of them the identical pattern `uniProps={(theme: any) => …}`. This is a single fixable idiom — Unistyles exports the theme type, and the codebase already types it correctly in two places (`button.tsx:112`, `custom-tabbar.tsx:107` use `(theme) =>` with inference). Normalizing this removes almost all `any` from the project in one pass.
- **Dead files**: `src/features/calculator/data/mock-rates.ts` (0 refs), `src/components/ui/text-field.tsx` (0 refs), `src/components/ui/safe-area-view.tsx` (0 refs).
- **Timers without cleanup**: `use-paste-amount.ts:16,21` fire `setTimeout` with no `clearTimeout` on unmount. Every other timer in the codebase (`use-copy-result.ts`, `conversion-details.tsx`, `copy-icon-button.tsx`) is correctly cleaned up — this one is the outlier.
- **`useSettingsStore()` called without a selector** in `settings-screen.tsx:17`, violating the project's own granular-selector rule from `openspec/config.yaml`.
- **`versionCode` is manual** (`app.config.ts:36`). `eas.json` declares `autoIncrement: true`, but releases are built locally via Gradle, so that setting never applies — a forgotten bump means a rejected Play upload.
- **`FlashList` has no `keyExtractor`** (`rate-history-sheet.tsx:139`); it falls back to index while items carry a natural `updatedAt` key.
- **`android:allowBackup="true"`** (template default) means user settings sync to Google Backup. Harmless here — no secrets are stored — but worth a deliberate decision.
- **README is still the `create-expo-app` template**, describing `npm install` and `npx expo start` for a project that uses pnpm and has 20+ custom scripts.
- **No `.nvmrc` / `packageManager` field** — nothing pins the Node or pnpm version for reproducible builds.

---

## 7. What is genuinely well built

Worth stating plainly, because it is why the overall score is 63 and not 35:

- **The React 19 setup is correct and disciplined.** `babel-plugin-react-compiler` is enabled with the right plugin ordering (Unistyles **before** the compiler), `eslint-plugin-react-compiler` is in the lint config, and the codebase genuinely contains **zero** manual `useMemo`/`useCallback`/`React.memo` — the convention is followed, not just written down.
- **`troubleshooting.md` is a real engineering artifact.** The Reanimated 4.5 × Unistyles `unistyles_*` interop bug is diagnosed to root cause, with a per-library table of which components need `withUnistyles()` and the `Animated.View` restructuring workaround. This is the kind of institutional knowledge most projects lose.
- **The Unistyles integration is correct**: `src/theme/unistyles.ts` is imported first from `index.ts` before anything else touches it, module augmentation gives full theme typing, breakpoints are declared, and `withUnistyles` is applied consistently to third-party components. Runtime insets are used properly (`custom-tabbar.tsx` `rt.insets.bottom`).
- **Performance groundwork is already laid**: R8 + `shrinkResources` via a custom plugin, Hermes bundle `noCompress` for `mmap` loading, FlashList for the long history list, New Architecture enabled, `useQueries` with a `combine` selector.
- **Domain modelling is clean**: `src/api/mapper.ts` correctly normalizes a genuinely messy backend contract (`rate_value` | `rate` | `rates.USD`, `last_updated` | `timestamp`) into one typed domain shape, and fails loudly on unusable data.
- **The amount/locale logic is the hard part of this app, and it is handled carefully** — dual `inputAmount` (canonical) / `inputAmountDisplay` (localized) representation, comma-vs-dot decimal detection, cents-based vs manual entry modes, and a BODMAS expression evaluator. It even has tests written for it.
- **The OpenSpec workflow is in active use** — seven changes with proposals, designs, specs, and task lists, six complete. Convention is encoded in `openspec/config.yaml` rather than living in someone's head.

---

## 8. Remediation roadmap

### Sprint 1 — unblock production (est. 1–2 days)

| # | Item | Effort | OpenSpec change |
|---|---|:---:|---|
| 1 | Point the Android widget at the real API, driven by env | M | `fix-android-widget-rate-endpoint` |
| 2 | Block `SYSTEM_ALERT_WINDOW` + `VIBRATE`; move keystore creds out of `package.json`; automate `versionCode` | S | `harden-release-configuration` |
| 3 | Apply persisted theme on rehydration; enable `adaptiveThemes` | S | `fix-theme-preference-hydration` |
| 4 | Add error boundary + Sentry; strip `console.*` in release | M | `add-production-observability` |

### Sprint 2 — make problems visible and fixable (est. 3–5 days)

| # | Item | Effort |
|---|---|:---:|
| 5 | Add `expo-updates` for an OTA hotfix channel | M |
| 6 | Install `jest` + `jest-expo`, add `test` and `typecheck` scripts, get the 2 existing suites green | M |
| 7 | Persist React Query cache to AsyncStorage for offline rates | S |
| 8 | Fix staging env resolution (`NODE_ENV=production` + `APP_ENV`-selected env file) | S |

### Sprint 3 — structural health (est. 3–5 days)

| # | Item | Effort | OpenSpec change |
|---|---|:---:|---|
| 9 | Delete `features/calculator/api/rates-api.ts` + `mock-rates.ts`; consume the shared data layer | M | `consolidate-rates-data-layer` |
| 10 | Collapse the 5× hook fan-out into one screen-level view model | M | — |
| 11 | Remove 9 unused deps (Skia first) | S | — |
| 12 | Type `uniProps` properly, clearing ~26 `any` | S | — |
| 13 | Accessibility pass over keypad + pickers | M | — |

---

## 9. Appendix — verification commands

```bash
npx tsc --noEmit                                  # 0 errors
npx eslint .                                      # 0 errors, 10 warnings
git log --all --diff-filter=A --name-only --pretty=format: \
  | sort -u | grep -iE "keystore|jks"             # empty → never committed
grep -rn "SYSTEM_ALERT_WINDOW" android/app/src/   # main/ + debug/ + debugOptimized/
grep -rn "console\.\(log\|warn\|error\)" src/     # 7 hits
grep -rniE "sentry|crashlytics|bugsnag" src package.json app.config.ts   # 0 hits
```

---

*This audit supersedes `docs/react-native-best-practices-audit.md`, whose "keystore file checked into git" finding does not hold against a full history scan.*
