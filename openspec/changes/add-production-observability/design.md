## Context

See `proposal.md`. Three gaps are addressed together because they share one failure mode: **a production problem produces no signal**. Splitting them would leave the boundary reporting to nowhere, or the reporter catching errors the boundary has already swallowed.

## Goals / Non-Goals

**Goals:**
- Every unhandled error is reported with a stack trace and enough context to identify the screen.
- No white screen: the user always has a path back.
- No debug output and no PII in release builds.
- Startup failures are captured, not just post-mount ones.

**Non-Goals:** as listed in `proposal.md`.

## Component Hierarchy & Placement

```
index.ts
  ├─ import "../global.css"
  ├─ import "@/theme/unistyles"
  └─ import "expo-router/entry"

RootLayout  (src/app/_layout.tsx)
  │
  ├─ initReporter()                   ← module scope, BEFORE the tree renders
  │
  └─ <RootErrorBoundary>              ← NEW · outermost, catches provider failures too
       └─ QueryClientProvider
           └─ GestureHandlerRootView
               └─ HeroUINativeProvider
                   └─ ThemePreferenceProvider
                       └─ <ScreenErrorBoundary>    ← NEW · per-screen, keeps chrome alive
                           └─ OnboardingGate
                               └─ Tabs → screens
```

Two boundaries, deliberately:

| Boundary | Catches | Fallback |
|---|---|---|
| `RootErrorBoundary` | provider construction, theme setup, anything above the tabs | Full-screen fallback, app restart action |
| `ScreenErrorBoundary` | a screen's render | In-place fallback; tab bar stays usable so the user can navigate away |

The root boundary cannot use Unistyles theme tokens safely — it must render even when theme configuration is what failed. Its fallback uses literal colours drawn from `tokens.ts` values rather than a live `theme.*` lookup. The screen boundary sits below `ThemePreferenceProvider` and uses tokens normally.

## Error Flow

```
                   ┌────────────────────────────────────────┐
   render throw ──▶│ ScreenErrorBoundary.componentDidCatch   │──▶ reporter.captureException
                   └────────────────────────────────────────┘        │
                                    │                                 │
                                    ▼                                 ▼
                        in-place fallback + retry              dashboard alert
                        (tab bar still usable)

                   ┌────────────────────────────────────────┐
   provider throw ▶│ RootErrorBoundary                       │──▶ reporter.captureException
                   └────────────────────────────────────────┘
                                    ▼
                        full-screen fallback + restart

                   ┌────────────────────────────────────────┐
   mapper throw  ──▶│ mapRateResponse                        │──▶ reporter.captureException (non-fatal)
   (api/mapper.ts)  └────────────────────────────────────────┘        │
                                    │ rethrow                          │
                                    ▼                                  ▼
                        React Query error state                  dashboard alert
                        (existing UI, unchanged)
```

Mapping failures are reported **and** rethrown: the existing React Query error handling stays the user-facing behaviour, and the reporter gains the signal that the backend contract changed. This is the difference between "users complain rates stopped loading" and "we were alerted when the field was renamed".

## Decisions

### 1. Two boundaries rather than one

A single root boundary means any screen error kills the whole shell, including navigation. Nesting a second boundary below the providers lets a broken Compare tab leave the Exchange tab reachable — for an app whose core value is one screen, keeping that screen alive matters.

### 2. Strip `console` in Babel *and* delete the hot-path calls

`babel-plugin-transform-remove-console` guarded to production handles the general case. The `onEndReached` and query-path logs are deleted at the source anyway, because relying on stripping means the cost is still paid in every development and staging build — and staging builds are what QA measures scroll performance on.

Plugin ordering in `babel.config.js` must stay: `react-native-unistyles/plugin` → `babel-plugin-react-compiler` → `transform-remove-console`. The Unistyles-before-compiler constraint is already documented in `troubleshooting.md` and must not be disturbed.

### 3. No user input is ever transmitted

The amounts a user types are financially sensitive. The reporter is configured to strip breadcrumbs containing input values, and no `captureException` call may include `inputAmount`, `inputAmountDisplay`, `customRateInput`, or clipboard content. Rate *values from the API* are safe and useful context; user-entered values are not.

### 4. Initialise at module scope

Startup crashes — a failed Unistyles configuration, a bad native module link — occur before any component mounts. Initialising inside a `useEffect` would miss exactly the class of failure that is hardest to diagnose remotely.

## Unistyles Theme Tokens & Dynamic Layout Integration

The fallback screens are the only new UI. Token usage:

| Element | Screen fallback (`ScreenErrorBoundary`) | Root fallback (`RootErrorBoundary`) |
|---|---|---|
| Background | `theme.colors.background` | literal `gray[0]` / `gray[1000]` from `tokens.ts` |
| Title | `AppText variant="title"`, `theme.colors.textPrimary` | inline style, literal token value |
| Body copy | `AppText variant="body"`, `theme.colors.textSecondary` | inline style, literal token value |
| Retry button | existing `AppButton variant="primary"` | minimal `Pressable`, literal `brand.blue` |
| Spacing | `theme.spacing.md` / `.lg` | literal values from `spacing` |
| Radius | `theme.radius.pill` | literal `999` |

The screen fallback reuses `AppText` and `AppButton` so it inherits typography and theming automatically. The root fallback deliberately depends on **nothing** — not Unistyles, not HeroUI, not the theme store — because it must render when those are the failure. Both are vertically centred with `flex: 1` and safe-area padding; neither needs a breakpoint variant, since the layout is a centred single column at every width.

All copy is Spanish, consistent with the rest of the app.

## Cross-Boundary Sync Contract

| Side | Owns | Reads |
|---|---|---|
| `app.config.ts` | reporter plugin registration, environment tag | `APP_ENV` |
| `babel.config.js` | console stripping in production | `NODE_ENV` |
| Reporter init (JS) | DSN, environment, release identifier | `EXPO_PUBLIC_*` config |
| Native (via plugin) | crash handler installation | plugin-written config |

Invariant: the release identifier reported must match the app `version` + `versionCode` actually shipped, or stack traces cannot be symbolicated against the right build.

## Risks / Trade-offs

- **The reporter can crash startup.** Initialisation is wrapped so a reporter failure degrades to no reporting rather than to a boot loop.
- **Bundle and binary size** grow by the SDK. Accepted: the alternative is permanent blindness on a live financial app.
- **Alert fatigue** if every transient network failure is reported. Network errors are reported at a lower severity or sampled; only mapping/contract failures and unhandled exceptions alert.
- **Symbolication requires uploading source maps** at build time, which adds a step to the release scripts that must not silently fail.
