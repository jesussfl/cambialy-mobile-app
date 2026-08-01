## Context

The React Native Expo project uses `android/app/build.gradle` with signing configurations that inspect environment variables:
`ANDROID_KEYSTORE_FILE`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD`.

In `package.json`, the script `"android:bundle"` runs:
`NODE_ENV=production expo prebuild --platform android && cd android && ANDROID_KEYSTORE_FILE=$PWD/../release.keystore ANDROID_KEYSTORE_PASSWORD=android ANDROID_KEY_ALIAS=androidreleasekey ANDROID_KEY_PASSWORD=android ./gradlew bundleRelease`

## Goals / Non-Goals

**Goals:**
- Validate that the local keystore `release.keystore` is recognized by `android/app/build.gradle`.
- Execute `pnpm run android:bundle` to compile the Android App Bundle.
- Confirm the generated `.aab` file exists at `android/app/build/outputs/bundle/release/app-release.aab`.

**Non-Goals:**
- Uploading to Google Play Console automatically via EAS or Fastlane.

## Decisions

- **Use `pnpm run android:bundle`**: The existing `package.json` script correctly passes environment variables for `release.keystore` and calls `./gradlew bundleRelease`.
- **Prebuild requirement**: `expo prebuild --platform android` ensures native Android build assets are generated/synced prior to Gradle bundling.

## Risks / Trade-offs

- **Build time**: Running prebuild and gradle bundleRelease may take 1-3 minutes.
- **Environment dependencies**: Requires local Android SDK / Java environment (JDK 17) configured properly.
