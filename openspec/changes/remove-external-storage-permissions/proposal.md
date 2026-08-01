## Why

Google Play has rejected the latest submission of Cambialy due to a violation of the Personal Loans policy. Specifically, the app requests `READ_EXTERNAL_STORAGE` and `WRITE_EXTERNAL_STORAGE` permissions, which are prohibited for personal loan-related apps (and generally discouraged if not strictly necessary). Removing these permissions is required to publish updates to the Google Play Store.

## What Changes

- Remove `READ_EXTERNAL_STORAGE` permission from the Android manifest / Expo config.
- Remove `WRITE_EXTERNAL_STORAGE` permission from the Android manifest / Expo config.
- Ensure all app bundle (AAB) builds and APKs do not request these permissions.

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

- **Android App**: Will no longer request external storage read/write access. If any feature implicitly relied on these, it will be broken, but given the policy rejection, this is a strict requirement. We will verify if any Expo modules or configurations require modifications to ensure these permissions are completely stripped.
