## Purpose

Provides automated script configuration to build signed Android App Bundles (.aab) ready for Google Play Store upload using local keystore credentials.

## ADDED Requirements

### Requirement: Android App Bundle generation script
The build process SHALL provide an npm script `android:bundle` that compiles the React Native Expo project, executes Gradle `bundleRelease`, and outputs a signed AAB file using the configured `release.keystore`.

#### Scenario: Generate signed release bundle
- **WHEN** the user executes `pnpm run android:bundle`
- **THEN** Expo prebuild runs for Android, Gradle builds the release bundle, and the signed `.aab` file is output to `android/app/build/outputs/bundle/release/app-release.aab`
