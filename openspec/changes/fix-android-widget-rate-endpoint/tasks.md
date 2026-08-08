## 1. Build-time URL injection

- [ ] 1.1 Create `plugins/withRatesWidgetApiUrl.js` that reads `process.env.EXPO_PUBLIC_API_URL` and writes it as a `buildConfigField` named `RATES_API_BASE_URL` into `modules/rates-widget/android/build.gradle`. Fail the prebuild with a clear error if the variable is unset.
  - *Verify*: `EXPO_PUBLIC_API_URL=https://example.test/api/v2 npx expo prebuild --platform android --clean` then `grep -n "RATES_API_BASE_URL" android/../modules/rates-widget/android/build.gradle` shows the injected value; unsetting the variable aborts prebuild with the intended message.
- [ ] 1.2 Register the plugin in `app.config.ts` alongside the existing native plugins.
  - *Verify*: `npx expo config --type prebuild --json | grep -c withRatesWidgetApiUrl` returns `1`.

## 2. Kotlin repository simplification

- [ ] 2.1 In `RatesWidgetRepository.kt`, delete `getBaseUrl(context)` and read `BuildConfig.RATES_API_BASE_URL` instead.
  - *Verify*: `grep -rn "ahorrave-api\|onrender\|packageName.contains" modules/rates-widget/` returns no matches.
- [ ] 2.2 Delete the legacy v1 branch of `fetchAndCacheRates` (the `/rates/bcv` + `/rates/binance` path) so only the v2 three-endpoint path remains.
  - *Verify*: `grep -n "rates/bcv\|rates/binance" modules/rates-widget/android/src/main/java/expo/modules/rateswidget/RatesWidgetRepository.kt` returns no matches.
- [ ] 2.3 Confirm `extractRate` still satisfies the v2 payload shape (`rate_value`, then `rates[CURRENCY]`) and still throws on unusable data rather than defaulting to `0.0`.
  - *Verify*: read the function and confirm no numeric literal fallback exists on the failure path.

## 3. Invariant enforcement

- [ ] 3.1 Confirm no API host literal remains anywhere in the module.
  - *Verify*: `grep -rn "https://" modules/rates-widget/ --include=*.kt --include=*.gradle --include=*.xml` returns no API host.

## 4. Verification

- [ ] 4.1 Static checks pass.
  - *Verify*: `npx tsc --noEmit` exits 0 and `npx eslint .` reports no new warnings.
- [ ] 4.2 Release-configuration build succeeds with the widget module included.
  - *Verify*: `pnpm android:release` completes and produces the APK.
- [ ] 4.3 Runtime parity confirmed on a device/emulator in release configuration: place the widget, force a refresh, and compare its USD BCV / EUR BCV / USDT values against the app's exchange screen.
  - *Verify*: all three values match; capture a screenshot of the widget and the app side by side for the change record.
- [ ] 4.4 Confirm no traffic reaches the legacy host.
  - *Verify*: inspect network logs during a widget refresh; no request to `ahorrave-api.onrender.com` appears.
