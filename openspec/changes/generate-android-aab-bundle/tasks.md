## 1. Setup & Verification

- [ ] 1.1 Verify presence of `release.keystore` in project root and signing parameters in `package.json`
- [ ] 1.2 Verify `android/app/build.gradle` signing configuration for `release` build type

## 2. AAB Bundle Generation

- [ ] 2.1 Run `pnpm run android:bundle` to prebuild and generate the Android App Bundle
- [ ] 2.2 Verify output AAB file at `android/app/build/outputs/bundle/release/app-release.aab`
