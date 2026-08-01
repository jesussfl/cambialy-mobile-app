## 1. Remove Permissions

- [x] 1.1 Add `android.blockedPermissions` to `app.json` to explicitly block `android.permission.READ_EXTERNAL_STORAGE` and `android.permission.WRITE_EXTERNAL_STORAGE`.
- [x] 1.2 Ensure no other plugins (e.g. `expo-image-picker`) in `app.json` are implicitly adding these permissions, and configure them to exclude storage permissions if necessary.

## 2. Verification

- [x] 2.1 Run `npx expo prebuild --clean` and inspect the generated `android/app/src/main/AndroidManifest.xml` to confirm the permissions are removed, or verify the manifest through a local EAS build.
