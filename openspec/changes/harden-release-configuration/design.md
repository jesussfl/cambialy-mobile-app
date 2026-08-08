## Context

See `proposal.md`. All four defects share one root cause: **release-time configuration is expressed in places that are not the single source of truth** — permissions in a generated manifest, credentials in a tracked script, environment in a variable Expo does not read, and version code in a hand-edited literal.

## Goals / Non-Goals

**Goals:**
- The AAB declares only permissions the app uses.
- No credential is recoverable from the repository.
- Each script deterministically resolves one environment, with React built in production mode for every release artifact.
- `versionCode` cannot be silently reused.

**Non-Goals:** as listed in `proposal.md`.

## Environment Resolution — current vs. target

`@expo/env@2.4.2` (`build/index.js:102-116`) selects `.env.${NODE_ENV}`; `APP_ENV` is read only by `app.config.ts` for app identity.

```
CURRENT
script                    NODE_ENV       APP_ENV    env file loaded   backend hit
────────────────────────  ─────────────  ─────────  ────────────────  ──────────────
start:staging             (development)  staging    .env              PRODUCTION ✗
android:staging           (development)  staging    .env              PRODUCTION ✗
ios:staging               staging        staging    .env.staging      staging  ~   ← dev-mode React
android:staging:release   staging        staging    .env.staging      staging  ~   ← dev-mode React
android:release           production     (unset)    .env.production   production ✓

TARGET
script                    NODE_ENV       APP_ENV    env file loaded   backend hit
────────────────────────  ─────────────  ─────────  ────────────────  ──────────────
start:staging             development    staging    .env.staging *    staging  ✓
android:staging           development    staging    .env.staging *    staging  ✓
ios:staging               development    staging    .env.staging *    staging  ✓
android:staging:release   production     staging    .env.staging *    staging  ✓
android:release           production     production  .env.production   production ✓

* selected explicitly by APP_ENV via dotenv preload, not by NODE_ENV
```

### Decision: select the env file by `APP_ENV`, keep `NODE_ENV` conventional

`NODE_ENV` must remain `development` | `production` | `test` because Babel, Metro, and React key their dev-vs-production builds off it. Staging is a *deployment target*, not a build mode: a staging release is a production-mode build pointed at a staging backend.

The env file is therefore selected explicitly (a small `--require dotenv/config` preload or an `envFile` resolution inside `app.config.ts`) rather than relying on Expo's `NODE_ENV` convention. `app.config.ts` already branches on `APP_ENV` for name/bundle id/scheme, so `APP_ENV` becomes the single environment switch for both identity and endpoints.

## Permission Blocking

`app.config.ts` already demonstrates the mechanism:

```ts
android: {
  blockedPermissions: [
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.SYSTEM_ALERT_WINDOW",   // added
    "android.permission.VIBRATE",               // added
  ],
}
```

This emits `tools:node="remove"` into the merged manifest — the same treatment the storage permissions already receive, verifiable in the generated manifest. `VIBRATE` is blocked only after confirming no installed library requires it at runtime; if a dependency turns out to need it, `VIBRATE` is kept and `SYSTEM_ALERT_WINDOW` is blocked alone.

## Signing Credential Flow

```
BEFORE                                   AFTER
package.json (tracked)                   android/keystore.properties (gitignored)
  ANDROID_KEYSTORE_PASSWORD=android        storePassword=…
  ANDROID_KEY_PASSWORD=android             keyPassword=…
        │                                  keyAlias=…
        ▼                                        │
   gradlew assembleRelease                       ▼
                                    signingConfigs.release reads properties file
                                                 │
                                    android/keystore.properties.example (tracked)
                                      documents required keys, no values
```

## Unistyles / Layout Integration

Not applicable — this change touches no rendering code and reads no theme token. It is confined to `app.config.ts`, `package.json`, `.gitignore`, and Gradle configuration. The only user-visible surface is the Play Store permission list.

## Cross-Boundary Sync Contract

| Side | Owns | Reads |
|---|---|---|
| `APP_ENV` | environment selection (identity + endpoints) | — |
| `NODE_ENV` | build mode only (`development` \| `production`) | — |
| `app.config.ts` | app identity, blocked permissions, `versionCode` | `APP_ENV` |
| `android/keystore.properties` | signing credentials (never tracked) | — |
| Gradle `signingConfigs.release` | artifact signing | properties file |

Invariant: no credential literal appears in any tracked file, and `NODE_ENV` never holds a value outside the conventional set. Both are mechanically checkable and become task verification steps.

## Risks / Trade-offs

- **Blocking `VIBRATE` could break a library** that vibrates without declaring the permission itself. Mitigated by verifying against installed dependencies first and by keeping the two permissions independently revertible.
- **A wrong signing config is a hard failure** — Play rejects an artifact signed with a different key, and the upload key cannot be changed without a Play support reset. The keystore file and its passwords must be confirmed working on a local `assembleRelease` before any upload, and the existing keystore must be backed up outside the repository first.
- **Explicit env preload adds a small amount of script complexity** in exchange for removing an entire class of silent misrouting.
