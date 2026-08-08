## Why

Four defects in the release configuration reach the Play Store artifact:

1. **`SYSTEM_ALERT_WINDOW` ships in the release manifest.** It is declared in `android/app/src/main/AndroidManifest.xml:4` (confirmed present in the release merge report), not in `src/debug/`, so it merges into the AAB. "Display over other apps" is a permission Google Play actively scrutinizes and displays prominently to users. Nothing in `src/` draws overlays. `VIBRATE` is declared with no haptics dependency installed.

2. **Signing credentials are committed.** `package.json:70-72` inlines `ANDROID_KEYSTORE_PASSWORD=android` and `ANDROID_KEY_PASSWORD=android` in the release scripts. (The keystore *file* was verified as never committed — `git log --all --diff-filter=A` finds no `.keystore` blob — so this is a hardening item, not an active compromise.)

3. **Staging scripts resolve to the production backend.** `@expo/env@2.4.2` selects env files by `NODE_ENV`, not `APP_ENV`. `start:staging` and `android:staging` set only `APP_ENV`, so `NODE_ENV` defaults to `development`, `.env.staging` is never read, and `.env` — the production Railway URL — is loaded instead. The scripts that do set `NODE_ENV=staging` trigger Expo's own warning that a non-conventional `NODE_ENV` "might cause development code to run in production", and produce release builds running development-mode React.

4. **`versionCode` is bumped by hand.** `app.config.ts:36` hardcodes `versionCode: 7`. `eas.json` declares `autoIncrement: true`, but releases are built locally through Gradle, so that setting never applies. A forgotten bump is a rejected Play upload.

## What Changes

- Add `SYSTEM_ALERT_WINDOW` and `VIBRATE` to `android.blockedPermissions` in `app.config.ts`, using the mechanism already proven there for the storage permissions.
- Move keystore credentials out of `package.json` into a gitignored `android/keystore.properties` (with a committed `.example` template), read by the Gradle signing config.
- Correct staging env resolution: set `NODE_ENV=production` for staging *release* builds and select the env file explicitly by `APP_ENV`, so staging never runs development-mode React and never silently targets production.
- Derive `versionCode` from a single declared source so it cannot be forgotten.

## User Impact

Users see a smaller, less alarming permission list on the Play listing and stop granting an overlay capability the app never uses — reducing both privacy exposure and the chance of a policy hold that blocks shipping a fix. Staging testers stop unknowingly exercising the production backend, which today means QA traffic and QA-entered values hit the live rate API. The build performance of the staging track improves once React is built in production mode.

## Technical Scope

- `app.config.ts` — `blockedPermissions` additions; `versionCode` sourced from one declaration.
- `package.json` — remove inline credentials; correct `NODE_ENV` / `APP_ENV` on all staging scripts.
- `android/keystore.properties.example` (new, committed) and `android/keystore.properties` (gitignored).
- `.gitignore` — cover `keystore.properties`.
- A Gradle signing-config plugin under `plugins/`, or documented `gradle.properties` wiring, to read the properties file.

## Non-Goals

- Rotating the existing upload key or changing Play App Signing enrolment.
- Migrating release builds to EAS Build (local Gradle remains the release path).
- Adding new build variants or product flavours beyond the existing production/staging split.
- Changing the iOS signing or release flow.
- Introducing a CI pipeline (secrets management should be compatible with one, but building it is separate work).

## Capabilities

### New Capabilities
- `android-release-hardening`: The Android release artifact declares only permissions the app actually uses, signing credentials are absent from version control, and each build variant deterministically resolves the intended environment and an unused version code.

### Modified Capabilities

## Impact

- `app.config.ts`: extend `blockedPermissions`; single-source `versionCode`.
- `package.json`: strip `ANDROID_KEYSTORE_PASSWORD` / `ANDROID_KEY_PASSWORD` / `ANDROID_KEY_ALIAS` from scripts; fix `NODE_ENV` on `start:staging`, `android:staging`, `android:staging:release`, `ios:staging`.
- `.gitignore`: add `android/keystore.properties`.
- `plugins/withReleaseSigning.js` (new) or equivalent Gradle wiring.

**Release risk**: touches signing and permissions. A mis-wired signing config produces an unsignable or wrongly-signed artifact that Play will reject. Verification must inspect the **generated AAB/APK** — merged manifest and signer certificate — not only the source files.
