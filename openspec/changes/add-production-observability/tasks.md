## 1. Reporter integration

- [ ] 1.1 Add the error reporting SDK as a dependency and register its Expo config plugin in `app.config.ts`, tagging the environment from `APP_ENV`.
  - *Verify*: `npx expo config --type prebuild --json` shows the plugin registered; `npx tsc --noEmit` exits 0.
- [ ] 1.2 Initialise the reporter at module scope in `src/app/_layout.tsx`, before the provider tree, wrapped so an initialisation failure degrades to no reporting rather than a crash.
  - *Verify*: temporarily supply an invalid DSN and confirm the app still launches and renders the exchange screen.
- [ ] 1.3 Set the release identifier from the shipped `version` and `versionCode`.
  - *Verify*: trigger a test error and confirm the report's release field matches `1.1.1` / the current version code.

## 2. Error boundaries

- [ ] 2.1 Create `src/components/error-boundary/error-boundary.tsx` exporting `RootErrorBoundary` and `ScreenErrorBoundary`, both reporting via `componentDidCatch`.
  - *Verify*: `npx tsc --noEmit` exits 0; `npx eslint src/components/error-boundary` reports no warnings.
- [ ] 2.2 Create the two fallback UIs in Spanish — the screen fallback using `AppText` / `AppButton` and Unistyles tokens, the root fallback using literal token values with no Unistyles dependency.
  - *Verify*: render each fallback in isolation in both light and dark themes and confirm legibility; confirm the root fallback renders with theme configuration deliberately broken.
- [ ] 2.3 Place `RootErrorBoundary` outermost in `_layout.tsx` and `ScreenErrorBoundary` below `ThemePreferenceProvider`, per `design.md`.
  - *Verify*: throw from a screen component and confirm the tab bar stays usable; throw from a provider and confirm the full-screen fallback appears.
- [ ] 2.4 Confirm retry recovers a transient failure without an app restart.
  - *Verify*: throw once on first render only, activate retry, and confirm the screen renders normally.

## 3. Console removal

- [ ] 3.1 Delete the three `console` calls in `src/features/exchange/components/rate-history-sheet.tsx` (lines 34, 146, 148), routing the genuine query error to the reporter.
  - *Verify*: `grep -n "console\." src/features/exchange/components/rate-history-sheet.tsx` returns no match.
- [ ] 3.2 Delete the three `console` calls in `src/api/queries/history.queries.ts` (lines 37, 41, 46), reporting request failures instead.
  - *Verify*: `grep -n "console\." src/api/queries/history.queries.ts` returns no match.
- [ ] 3.3 Add `babel-plugin-transform-remove-console` to `babel.config.js`, guarded to production, ordered **after** `react-native-unistyles/plugin` and `babel-plugin-react-compiler`.
  - *Verify*: confirm plugin order in the file matches `troubleshooting.md`; build a release bundle and `grep -c "console.log" <bundle>` to confirm removal.
- [ ] 3.4 Confirm no `console.*` remains on any user-reachable path.
  - *Verify*: `grep -rn "console\." src/` returns only the intentional `console.warn` in the startup catch, or nothing.

## 4. Data contract reporting

- [ ] 4.1 Report a non-fatal event in `src/api/mapper.ts` before rethrowing on an unusable payload, including the rate id and endpoint.
  - *Verify*: stub a malformed response and confirm both the report is produced and the existing React Query error state still appears unchanged.
- [ ] 4.2 Configure network errors at a lower severity than contract failures so offline use does not generate alerts.
  - *Verify*: put the device in airplane mode, load the app, and confirm no high-severity alert is raised.

## 5. Privacy

- [ ] 5.1 Configure the reporter to strip user-entered values, and audit every `captureException` call site.
  - *Verify*: `grep -rn "captureException\|captureMessage" src/` — confirm no call passes `inputAmount`, `inputAmountDisplay`, `customRateInput`, or clipboard content.
- [ ] 5.2 Inspect an actual transmitted payload with an amount entered.
  - *Verify*: type a distinctive amount, trigger a test error, and confirm that value appears nowhere in the captured payload.

## 6. Verification

- [ ] 6.1 Static checks pass.
  - *Verify*: `npx tsc --noEmit` exits 0; `npx eslint .` reports no new warnings.
- [ ] 6.2 Release-configuration launch is clean on both platforms.
  - *Verify*: `pnpm android:release` and `pnpm build:ios` install and launch to the exchange screen with rates loaded.
- [ ] 6.3 An intentional test error appears in the reporting dashboard with a symbolicated stack trace.
  - *Verify*: trigger the test error from a release build and confirm the dashboard entry resolves to the correct source file and line.
