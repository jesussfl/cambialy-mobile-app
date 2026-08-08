## 1. Rehydration-aware theme application

- [ ] 1.1 In `src/theme/theme-preference.tsx`, add `onRehydrateStorage` to the `persist` options so the rehydrated `themeName` is passed to `UnistylesRuntime.setTheme` and `isHydrated` is set to `true`.
  - *Verify*: `npx tsc --noEmit` exits 0; confirm `isHydrated` is now written somewhere (`grep -n "isHydrated" src/theme/theme-preference.tsx` shows both the declaration and an assignment).
- [ ] 1.2 Remove the mount-time `useEffect([])` from `ThemePreferenceProvider`, which can only ever observe the pre-rehydration default.
  - *Verify*: `grep -n "useEffect" src/theme/theme-preference.tsx` returns no match; `npx eslint src/theme/theme-preference.tsx` reports no new warnings.

## 2. OS scheme as the default

- [ ] 2.1 In `src/theme/unistyles.ts`, derive `initialTheme` from the device colour scheme instead of the hardcoded `'light'`, and enable `adaptiveThemes` so an unset preference follows the system.
  - *Verify*: `npx tsc --noEmit` exits 0; `grep -n "initialTheme\|adaptiveThemes" src/theme/unistyles.ts` shows the new configuration and no literal `'light'`.
- [ ] 2.2 Confirm an explicit preference still takes precedence over `adaptiveThemes`.
  - *Verify*: with a stored light preference, toggle the OS appearance to dark and confirm the app stays light.

## 3. Storage key migration

- [ ] 3.1 Rename the storage key to `cambialy:theme` and add a `version` + `migrate` step that reads the legacy `paga-claro:theme` entry once and preserves its value.
  - *Verify*: `grep -n "paga-claro" src/` returns only the migration path; no other reference remains.
- [ ] 3.2 Confirm migration failure degrades to the OS scheme rather than crashing.
  - *Verify*: write a malformed value under the legacy key, relaunch, and confirm the app starts in the OS theme with no crash.

## 4. Verification

- [ ] 4.1 Static checks pass.
  - *Verify*: `npx tsc --noEmit` exits 0; `npx eslint .` reports no new warnings.
- [ ] 4.2 Cold-start persistence confirmed on device.
  - *Verify*: select dark, force-stop the app, relaunch — the app renders dark and the settings toggle reads dark. Repeat for light.
- [ ] 4.3 First-launch default confirmed on both OS schemes.
  - *Verify*: clear app storage, set the device to dark, launch — app is dark. Repeat with the device set to light.
- [ ] 4.4 No theme flash when preference and OS scheme agree.
  - *Verify*: with a stored dark preference on a dark device, record a cold start and confirm no light frame appears.
- [ ] 4.5 Theme-dependent native chrome is correct from first paint.
  - *Verify*: cold start with a stored dark preference; confirm the status bar uses light content, and that opening then dismissing the amount keypad sheet on Android leaves the navigation bar buttons resolved from the dark theme.
- [ ] 4.6 Legacy preference migration confirmed.
  - *Verify*: seed `paga-claro:theme` with a dark preference on a build without the new key, upgrade, relaunch, and confirm the app renders dark.
