## Why

The application needs to be submitted to Google Play Console, which requires a signed Android App Bundle (.aab). The project root already contains `release.keystore`, and we need to clarify and verify how to generate the AAB bundle using `pnpm run android:bundle`.

## What Changes

- Clarify and document the AAB build process using `pnpm run android:bundle`.
- Verify the Android signing configuration in `android/app/build.gradle`.
- Execute `pnpm run android:bundle` to produce `app-release.aab` signed with the local `release.keystore`.

## Capabilities

### New Capabilities
- `android-release-bundling`: Build signed Android App Bundles (AAB) using the local `release.keystore` for Google Play deployment.

### Modified Capabilities
*(None)*

## Impact

- Builds `android/app/build/outputs/bundle/release/app-release.aab`.
- Uses environment variables `ANDROID_KEYSTORE_FILE`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD` during Gradle execution.
