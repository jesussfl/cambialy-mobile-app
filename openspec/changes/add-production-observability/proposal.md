## Why

The app is live on Google Play and is currently **blind in production**:

- **No crash reporting.** `grep -rniE "sentry|crashlytics|bugsnag" src package.json app.config.ts` returns zero hits. No crash, no unhandled rejection, and no failed rate fetch is ever reported.
- **No error boundary.** A render throw anywhere below `RootLayout` white-screens the app with no recovery path. This is not hypothetical: `src/api/mapper.ts:46` deliberately throws when a rate payload is unusable, so a backend contract change becomes a crash rather than a handled error state.
- **Debug logging ships.** `console.log` / `console.error` run in release builds — `src/api/queries/history.queries.ts:37,41,46` logs every history request URL, status, and cursor; `src/features/exchange/components/rate-history-sheet.tsx:34,146,148` logs on **every `onEndReached`**, adding JS-thread work during the exact scroll interaction that must hold 60fps. `babel.config.js` has no console-stripping plugin.

The consequence compounds with the absence of an OTA channel: defects that reach production are both invisible and slow to fix. The three P0 defects identified in `docs/production-readiness-audit.md` have plausibly been live for some time precisely because nothing reports them.

## What Changes

- Add a crash and error reporting SDK, initialised early enough to capture startup failures, with release/staging environments distinguished.
- Add a root error boundary that renders a recoverable Spanish-language fallback screen and reports the error, instead of white-screening.
- Strip `console.*` from release bundles via Babel, and remove the scroll-path logging outright rather than relying on stripping alone.
- Report handled failures that currently vanish — rate-mapping errors and query failures — as non-fatal events with enough context to diagnose.

## User Impact

Today a user who hits a crash sees a white screen and must force-quit; nobody learns it happened. After this change the user sees a Spanish error state with a retry action, and the failure is reported with a stack trace, so the defect can actually be fixed. Removing scroll-path logging measurably reduces JS work while paginating rate history on lower-end Android devices, which is a meaningful share of this app's audience.

## Technical Scope

- `src/app/_layout.tsx` — SDK initialisation and error-boundary placement in the provider stack.
- `src/components/error-boundary/` (new) — boundary component and fallback UI, styled with Unistyles.
- `babel.config.js` — release-only `console.*` removal, ordered correctly against the existing Unistyles and React Compiler plugins.
- `src/api/queries/history.queries.ts`, `src/features/exchange/components/rate-history-sheet.tsx` — remove logging; route genuine failures to the reporter.
- `src/api/mapper.ts` — report mapping failures as non-fatal before rethrowing.
- `app.config.ts` — plugin registration and environment tagging.

## Non-Goals

- Product analytics, funnels, or user behaviour tracking — this change covers error and crash reporting only.
- Performance monitoring / tracing (a candidate follow-up, but it changes the sampling and cost profile).
- Session replay or any feature that captures user input; amounts a user types are financially sensitive and must not be transmitted.
- Adding `expo-updates` / OTA delivery, which is tracked separately.
- Building an in-app feedback or bug-report form.
- Replacing the existing `react-native-performance` mark, whose disposition is a separate cleanup.

## Capabilities

### New Capabilities
- `production-observability`: Unhandled errors are captured, reported with diagnostic context, and presented to the user as a recoverable state rather than a blank screen; release builds emit no debug console output.

### Modified Capabilities

## Impact

- `src/app/_layout.tsx`: initialise the reporter before the provider tree; wrap the tree in the boundary.
- `src/components/error-boundary/error-boundary.tsx` + `error-fallback.tsx` (new).
- `babel.config.js`: add `transform-remove-console` guarded to production, after the Unistyles plugin and the React Compiler plugin.
- `src/api/queries/history.queries.ts`: delete three `console` calls; report failures.
- `src/features/exchange/components/rate-history-sheet.tsx`: delete three `console` calls from the render and `onEndReached` paths.
- `src/api/mapper.ts`: report before rethrowing on unusable payloads.

**Release risk**: the reporting SDK adds native code and initialises before the app tree, so a misconfiguration can itself crash startup. Verification must confirm a clean release-configuration launch on both platforms, and must confirm no user-entered amount appears in any transmitted payload.
