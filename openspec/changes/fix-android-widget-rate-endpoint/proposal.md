## Why

The production Android home-screen widget fetches exchange rates from a **different backend than the app**.

`modules/rates-widget/android/src/main/java/expo/modules/rateswidget/RatesWidgetRepository.kt:19-25` hardcodes:

```kotlin
private fun getBaseUrl(context: Context): String {
  return if (context.packageName.contains("staging")) {
    "https://cambialy-backend.onrender.com/api/v2"
  } else {
    "https://ahorrave-api.onrender.com/api/v1"   // ← every Play Store install
  }
}
```

The production package `com.cambialy.app` does not contain `"staging"`, so all Play Store installs read from `ahorrave-api.onrender.com/api/v1` — a legacy API from a previous product iteration — while the app itself reads `https://cambialy-backend-production.up.railway.app/api/v2` from `EXPO_PUBLIC_API_URL`. The **iOS** widget already resolves the URL correctly from the environment (`src/modules/rates-widget.ios.ts:14`), so the two platforms have silently diverged.

Because the URL lives in Kotlin, it is invisible to every `.env` file and cannot drift back into alignment on its own.

## What Changes

- Remove environment branching and the `v1` request/parse path from `RatesWidgetRepository.kt`.
- Inject the API base URL into the Android module at build time from the same value the JS layer uses, so the widget and the app can never target different backends.
- Keep the existing SharedPreferences cache, WorkManager refresh schedule, and error/stale rendering behaviour unchanged.

## User Impact

Android users with the widget installed currently see rates sourced from an unmaintained API. Depending on that host's state, the widget either shows a permanent error, or — worse — shows **plausible but stale exchange rates on the home screen**, which users act on financially without opening the app. After this change the widget shows the same rates as the app, from the same source, at all times.

## Technical Scope

- `modules/rates-widget/android/src/main/java/expo/modules/rateswidget/RatesWidgetRepository.kt` — single-URL consumer, v2 payload shape only.
- `modules/rates-widget/android/build.gradle` — expose the base URL as a `buildConfigField`.
- `plugins/` — a config plugin (or extension of `withXcodeEnv`) that writes the resolved `EXPO_PUBLIC_API_URL` into the Gradle build so no value is duplicated by hand.
- `src/modules/rates-widget.android.ts` — unchanged public surface (`refreshRatesWidget`, `getCachedRatesWidget`).

## Non-Goals

- Redesigning the widget's visual layout, families, or refresh interval.
- Changing the iOS widget, which already resolves its URL correctly.
- Adding new widget data (only USD BCV, EUR BCV, USDT Binance remain in scope).
- Introducing a shared cross-platform networking layer for native code.
- Migrating the backend or altering any API contract.

## Capabilities

### New Capabilities
- `android-rates-widget-data`: The Android widget resolves its rate source from the application's configured API environment rather than a hardcoded host, guaranteeing parity with the app and with iOS.

### Modified Capabilities

## Impact

- `modules/rates-widget/android/src/main/java/expo/modules/rateswidget/RatesWidgetRepository.kt`: delete `getBaseUrl` branching and the v1 fetch/parse branch; read the injected URL.
- `modules/rates-widget/android/build.gradle`: add `buildConfigField` for the API base URL.
- `plugins/withRatesWidgetApiUrl.js` (new): propagate `EXPO_PUBLIC_API_URL` into the Android build.
- `app.config.ts`: register the new plugin.

**Release risk**: touches a native module and the production data source. Verification must run against an actual release-configuration build with the widget placed on a home screen, not only against a debug build.
