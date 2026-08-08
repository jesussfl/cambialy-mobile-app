## Why

A user's saved dark-mode preference is lost on every cold start.

`useThemeStore` persists `themeName` through `createJSONStorage(() => AsyncStorage)` — an **asynchronous** backend, so Zustand's `persist` middleware rehydrates on a later tick. But `ThemePreferenceProvider` applies the theme exactly once, on mount, with an empty dependency array (`src/theme/theme-preference.tsx:49-58`):

```tsx
useEffect(() => {
  const stored = useThemeStore.getState().themeName;  // still "light" — rehydration has not landed
  if (stored) UnistylesRuntime.setTheme(stored);
}, []);                                               // never re-runs
```

When rehydration completes and sets `themeName: "dark"`, nothing calls `UnistylesRuntime.setTheme` again. The store reports dark, the UI renders light, and the settings toggle disagrees with the screen. The store already declares an `isHydrated: false` field (`theme-preference.tsx:14`) that is never set to `true` — the intended fix is present but unwired.

Two adjacent defects live in the same area:

- `src/theme/unistyles.ts:20` hardcodes `initialTheme: 'light'` and does not enable `adaptiveThemes`, so the app never follows the OS colour scheme — while `app.config.ts:14` declares `userInterfaceStyle: "automatic"`. The two settings contradict each other.
- The storage key is `"paga-claro:theme"` (`theme-preference.tsx:9`), a previous product name, while every other key is `cambialy:*`.

## What Changes

- Apply the persisted theme when rehydration actually completes, via `persist`'s `onRehydrateStorage` callback, and set the existing `isHydrated` flag.
- Resolve the initial theme from the OS colour scheme when the user has expressed no preference, so `userInterfaceStyle: "automatic"` becomes true in behaviour as well as in configuration.
- Migrate the storage key to the `cambialy:*` namespace without discarding an existing saved preference.

## User Impact

A user who selects dark mode currently gets light mode back on the next cold launch — the app appears to ignore an explicit setting, which reads as a broken app. After this change the chosen theme survives restarts, and a user who has never touched the setting gets the theme their phone is already using instead of an unconditional light screen at night.

## Technical Scope

- `src/theme/theme-preference.tsx` — rehydration-aware theme application, `isHydrated` wiring, key migration.
- `src/theme/unistyles.ts` — initial theme resolution and adaptive-theme configuration.
- No change to `themes.ts` or `tokens.ts`; the palettes themselves are correct.

## Non-Goals

- Adding new themes beyond the existing `light` / `dark` pair.
- Changing any colour value, token, or palette.
- Adding a per-screen or per-component theme override.
- Introducing a system-follow *toggle* in settings (a three-state light/dark/system control is a separate UX decision).
- Reworking the splash-screen sequence, tracked separately.

## Capabilities

### New Capabilities
- `theme-preference-persistence`: The application's colour theme is resolved deterministically at startup — an explicit stored preference when one exists, the operating system's scheme otherwise — and survives asynchronous storage rehydration without a visible flash or a silent reset.

### Modified Capabilities

## Impact

- `src/theme/theme-preference.tsx`: apply theme in `onRehydrateStorage`; set `isHydrated`; migrate `paga-claro:theme` → `cambialy:theme` preserving the stored value.
- `src/theme/unistyles.ts`: derive `initialTheme` from the OS scheme and enable adaptive themes so an unset preference follows the system.

**Release risk**: low. Confined to theme resolution; no data, network, signing, or permission surface. The main regression risk is a visible theme flash if the initial value and the rehydrated value differ, which the verification steps below check explicitly.
