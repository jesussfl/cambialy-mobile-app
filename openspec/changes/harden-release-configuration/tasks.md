## 0. Safety prerequisite

- [ ] 0.1 Back up `release.keystore` and its credentials to a secure location outside the repository before touching any signing configuration. The upload key cannot be regenerated without a Play support reset.
  - *Verify*: confirm the backup exists and that `keytool -list -keystore <backup>` succeeds with the recorded password.

## 1. Permission hardening

- [ ] 1.1 Confirm no installed dependency requires `VIBRATE` at runtime.
  - *Verify*: `grep -rn "VIBRATE\|Vibration\|vibrate" node_modules/*/android/src/main/AndroidManifest.xml src/ 2>/dev/null` — record the result; keep `VIBRATE` if any dependency declares it.
- [ ] 1.2 Add `android.permission.SYSTEM_ALERT_WINDOW` (and `VIBRATE` if 1.1 permits) to `android.blockedPermissions` in `app.config.ts`.
  - *Verify*: `npx expo prebuild --platform android --clean`, then `grep -n "SYSTEM_ALERT_WINDOW" android/app/src/main/AndroidManifest.xml` shows `tools:node="remove"`.
- [ ] 1.3 Confirm the permission is absent from the **generated release artifact**, not just the source manifest.
  - *Verify*: `pnpm android:bundle`, then inspect the AAB's merged manifest (`bundletool dump manifest` or the release merge report) and confirm `SYSTEM_ALERT_WINDOW` is not an effective permission.

## 2. Signing credential extraction

- [ ] 2.1 Create `android/keystore.properties.example` listing `storeFile`, `storePassword`, `keyAlias`, `keyPassword` with placeholder values only.
  - *Verify*: file contains no real credential; `git check-ignore android/keystore.properties.example` returns nothing (it must stay tracked).
- [ ] 2.2 Add `android/keystore.properties` to `.gitignore`.
  - *Verify*: `git check-ignore -v android/keystore.properties` confirms the rule matches.
- [ ] 2.3 Add a config plugin (or Gradle wiring) that loads `keystore.properties` into `signingConfigs.release`, failing the build with a named error when the file is absent.
  - *Verify*: temporarily rename the file and confirm `pnpm android:release` fails with the intended message rather than falling back to debug signing.
- [ ] 2.4 Remove `ANDROID_KEYSTORE_FILE`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD` from every script in `package.json`.
  - *Verify*: `git grep -n "ANDROID_KEY\|KEYSTORE_PASSWORD"` returns no match in tracked files.
- [ ] 2.5 Confirm the rebuilt artifact is signed with the same certificate as the published app.
  - *Verify*: `apksigner verify --print-certs <apk>` and compare the SHA-256 fingerprint against the Play Console upload certificate.

## 3. Environment resolution

- [ ] 3.1 Make the env file selection explicit by `APP_ENV` rather than relying on `NODE_ENV`.
  - *Verify*: document the mechanism in `design.md` terms and confirm it loads `.env.staging` for `APP_ENV=staging`.
- [ ] 3.2 Correct every staging script so `NODE_ENV` is `development` for dev servers and `production` for release builds, with `APP_ENV=staging` throughout.
  - *Verify*: `grep -n "NODE_ENV" package.json` shows only `development` or `production`.
- [ ] 3.3 Confirm each script resolves the intended backend.
  - *Verify*: for each of `start:staging`, `android:staging`, `android:staging:release`, `android:release`, run `npx expo config --type public --json` under that script's env and check the resolved `EXPO_PUBLIC_API_URL`. Record the four values in the change summary.

## 4. Version code

- [ ] 4.1 Resolve `versionCode` from a single declaration and add a pre-upload check that it exceeds the last published value.
  - *Verify*: `npx expo config --type public --json` reports the expected `android.versionCode`; the check rejects a stale value.

## 5. Verification

- [ ] 5.1 Static checks pass.
  - *Verify*: `npx tsc --noEmit` exits 0; `npx eslint .` reports no new warnings.
- [ ] 5.2 Full release path succeeds end to end.
  - *Verify*: `pnpm android:bundle` produces a signed AAB whose merged manifest and signer certificate both satisfy section 1 and section 2.
- [ ] 5.3 Install the signed artifact on a device and confirm the app launches, loads rates, and shows the expected environment identity.
  - *Verify*: app name is `Cambialy`, package is `com.cambialy.app`, rates load from the production host.
