## Purpose

Ensures the Android artifact uploaded to Google Play requests only the permissions the app uses, is signed with credentials that exist nowhere in version control, and is built from a deterministically resolved environment with a version code that has never been published.

## ADDED Requirements

### Requirement: Minimal Declared Permissions

The release Android artifact SHALL declare only permissions required by functionality present in the application.

#### Scenario: Overlay permission is absent from the release manifest

- **WHEN** the merged release manifest of the generated artifact is inspected
- **THEN** `android.permission.SYSTEM_ALERT_WINDOW` SHALL NOT be present as an effective permission

#### Scenario: Only network access remains as a normal permission

- **WHEN** the merged release manifest is inspected
- **THEN** `android.permission.INTERNET` SHALL be present
- **AND** every other declared permission SHALL correspond to a capability implemented in the application or required by an installed dependency

#### Scenario: Debug-only permissions do not leak into release

- **WHEN** the release and debug merged manifests are compared
- **THEN** any permission required solely by development tooling SHALL appear in the debug manifest only

### Requirement: Signing Credentials Excluded From Version Control

Signing credentials SHALL NOT be recoverable from the repository, in the working tree or in history.

#### Scenario: No credential literal in tracked files

- **WHEN** all git-tracked files are searched for the keystore password, key password, and key alias values
- **THEN** no match SHALL be found

#### Scenario: Release build succeeds from an untracked credentials file

- **WHEN** `android/keystore.properties` is present with valid values and a release build is run
- **THEN** the build SHALL produce a signed artifact
- **AND** the signing certificate SHALL match the certificate of the currently published application

#### Scenario: Missing credentials fail loudly

- **WHEN** a release build is attempted with `android/keystore.properties` absent
- **THEN** the build SHALL fail with a message naming the missing file
- **AND** the build SHALL NOT silently fall back to a debug signing key

#### Scenario: A committed template documents the required keys

- **WHEN** a new developer clones the repository
- **THEN** a tracked example file SHALL enumerate every required property key with placeholder values and no real credentials

### Requirement: Deterministic Environment Resolution Per Build Variant

Each build script SHALL resolve exactly one API environment, and every release artifact SHALL be built in production mode.

#### Scenario: Staging development server uses the staging backend

- **WHEN** the staging development script is run
- **THEN** the resolved `EXPO_PUBLIC_API_URL` SHALL be the staging host
- **AND** it SHALL NOT be the production host

#### Scenario: Staging release build runs production-mode React

- **WHEN** a staging release artifact is built
- **THEN** `NODE_ENV` SHALL be `production`
- **AND** the resolved `EXPO_PUBLIC_API_URL` SHALL be the staging host

#### Scenario: NODE_ENV never holds a non-conventional value

- **WHEN** any script in `package.json` is inspected
- **THEN** `NODE_ENV` SHALL only ever be assigned `development`, `production`, or `test`

#### Scenario: Production release targets the production backend

- **WHEN** a production release artifact is built
- **THEN** the resolved `EXPO_PUBLIC_API_URL` SHALL be the production host
- **AND** the application identity SHALL be `com.cambialy.app` with the display name `Cambialy`

### Requirement: Non-Reusable Version Code

The Android `versionCode` SHALL be resolved from a single declaration and SHALL exceed the version code of the currently published release.

#### Scenario: Version code is declared once

- **WHEN** the project is searched for Android version code declarations
- **THEN** exactly one authoritative declaration SHALL exist

#### Scenario: Publishing a build below the published version code is prevented

- **WHEN** a release artifact is produced whose version code is less than or equal to the last published value
- **THEN** the release process SHALL surface this before upload rather than at Play Console rejection
