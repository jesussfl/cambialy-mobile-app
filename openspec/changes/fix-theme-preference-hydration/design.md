## Context

See `proposal.md`. The defect is a race between two asynchronous startup steps that are not sequenced: Unistyles is configured **synchronously** at module load (`index.ts` imports `@/theme/unistyles` before anything else), while the persisted preference arrives **asynchronously** from AsyncStorage some ticks later.

## Goals / Non-Goals

**Goals:**
- A stored preference is always applied, regardless of rehydration timing.
- No stored preference means the OS scheme is honoured.
- No visible theme flash between first paint and rehydration.
- An existing user's saved preference survives the storage-key rename.

**Non-Goals:** as listed in `proposal.md`.

## Current vs. Target Startup Sequence

```
CURRENT (racy)
  t0  index.ts        → import "@/theme/unistyles"
                        StyleSheet.configure({ initialTheme: "light" })   ← always light
  t1  RootLayout mount
  t2  ThemePreferenceProvider useEffect([])
                        getState().themeName === "light"  (default)
                        UnistylesRuntime.setTheme("light")                ← no-op
  t3  AsyncStorage resolves → persist sets themeName = "dark"
                        (nothing calls setTheme)                          ← DEFECT
      result: store says "dark", screen renders light, toggle disagrees

TARGET (sequenced)
  t0  index.ts        → import "@/theme/unistyles"
                        initialTheme = OS colour scheme                   ← sensible default
  t1  RootLayout mount
  t2  AsyncStorage resolves → persist onRehydrateStorage(state)
                        if (state.themeName) UnistylesRuntime.setTheme(state.themeName)
                        state.isHydrated = true                           ← FIX
      result: stored preference wins; otherwise OS scheme persists
```

## Component Hierarchy & State Flow

```
index.ts
  └─ import "@/theme/unistyles"            ← StyleSheet.configure (synchronous, module load)
       │  initialTheme ← OS colour scheme
       ▼
RootLayout  (src/app/_layout.tsx)
  └─ QueryClientProvider
      └─ GestureHandlerRootView
          └─ HeroUINativeProvider
              └─ ThemePreferenceProvider   ← no longer owns theme application
                  └─ OnboardingGate
                      └─ Tabs → screens

useThemeStore (zustand + persist, AsyncStorage)
  ├─ themeName: "light" | "dark"           ← authoritative user preference
  ├─ isHydrated: boolean                   ← set true in onRehydrateStorage (currently dead)
  ├─ setThemeName() ─┐
  └─ toggleTheme() ──┴─▶ UnistylesRuntime.setTheme(next)  (user-initiated path, already correct)

onRehydrateStorage(state) ─────────────────▶ UnistylesRuntime.setTheme(state.themeName)  (NEW)
```

Two write paths reach `UnistylesRuntime.setTheme`: the user-initiated one (`setThemeName` / `toggleTheme`, already correct) and the rehydration one (missing today). `ThemePreferenceProvider`'s mount effect is removed rather than repaired — it can only ever observe pre-rehydration state.

## Decisions

### 1. Apply on rehydration, not on mount

`persist`'s `onRehydrateStorage` fires exactly when the stored value becomes available, which is the only correct moment. This replaces the `useEffect([])`, which is guaranteed to observe the initializer default.

### 2. Resolve `initialTheme` from the OS scheme

`StyleSheet.configure` runs before any storage read, so its `initialTheme` decides the very first painted frame. Reading the OS colour scheme there means:
- a user with no stored preference gets the system theme, honouring `userInterfaceStyle: "automatic"`;
- a user whose stored preference matches the system theme sees **no** flash;
- only the mismatched case flashes, and it resolves within the rehydration tick.

`adaptiveThemes` is enabled so a system-scheme change is followed while no explicit preference exists; an explicit `setTheme` call takes precedence.

### 3. Migrate the storage key without data loss

The `persist` config gains a `version` and a `migrate` step that reads the legacy `paga-claro:theme` entry once and rewrites it under `cambialy:theme`. Renaming without migration would silently reset every existing user to the default — the same class of defect this change exists to fix.

## Unistyles Theme Tokens & Dynamic Layout Integration

This change alters **which** theme is active, never what a theme contains. `themes.ts` and `tokens.ts` are untouched, so every consumer of `theme.colors.*`, `theme.spacing.*`, `theme.typography.*`, `theme.radius.*`, and `theme.shadows.*` keeps its current values.

Relevant Unistyles surfaces:

| Surface | Role in this change |
|---|---|
| `StyleSheet.configure({ settings: { initialTheme } })` | First-frame theme; changes from a hardcoded `'light'` to an OS-derived value |
| `settings.adaptiveThemes` | Newly enabled; follows the OS scheme while no explicit preference exists |
| `UnistylesRuntime.setTheme(name)` | The single imperative switch; now also called from `onRehydrateStorage` |
| `UnistylesRuntime.themeName` | Already read by `AmountKeypadSheet` to drive the Android navigation-bar button colour — must stay correct at the moment the sheet opens |
| `useUnistyles().rt.themeName` | Already read by `AppTabs` to pick the `StatusBar` style — re-renders on theme change, no change needed |

Both existing runtime readers benefit directly: today, a dark-preference user whose theme silently reverted to light also got the wrong status-bar and navigation-bar treatment. No breakpoint or responsive behaviour is affected; the `phone` / `tablet` breakpoints are unchanged.

## Risks / Trade-offs

- **Brief flash on mismatch**: a user whose stored preference differs from their OS scheme sees one frame of the OS theme. Accepted — it is strictly better than today's outcome, where the stored preference never applies at all. Gating first paint on storage would delay startup for every user to spare a single frame for a minority.
- **`adaptiveThemes` interaction**: it must not override an explicit preference. Verification includes toggling the OS theme with an explicit preference stored and confirming the app does not follow.
- **Migration runs once**: if it fails, the user falls back to the OS scheme rather than crashing.
