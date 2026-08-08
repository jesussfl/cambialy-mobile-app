## Purpose

Guarantees that the application's colour theme is resolved deterministically at every launch — an explicit stored preference when one exists, the operating system's scheme otherwise — so the rendered UI, the settings toggle, and the persisted state never disagree.

## ADDED Requirements

### Requirement: Stored Theme Preference Survives Restart

The application SHALL apply a persisted theme preference on every launch, regardless of when asynchronous storage rehydration completes.

#### Scenario: Dark preference is restored on cold start

- **WHEN** a user selects dark mode, fully terminates the app, and relaunches it
- **THEN** the application SHALL render in the dark theme
- **AND** the settings toggle SHALL show dark mode as selected

#### Scenario: Rendered theme matches store state

- **WHEN** storage rehydration has completed following a launch
- **THEN** the active Unistyles runtime theme SHALL equal the persisted `themeName`
- **AND** the two SHALL NOT diverge for any subsequent frame

#### Scenario: Hydration completion is observable

- **WHEN** storage rehydration completes
- **THEN** the theme store's hydration flag SHALL be set to `true`

### Requirement: Operating System Scheme As Default

When no explicit theme preference has been stored, the application SHALL adopt the operating system's colour scheme.

#### Scenario: First launch on a device set to dark

- **WHEN** the app is launched for the first time on a device whose system appearance is dark
- **THEN** the application SHALL render in the dark theme

#### Scenario: First launch on a device set to light

- **WHEN** the app is launched for the first time on a device whose system appearance is light
- **THEN** the application SHALL render in the light theme

#### Scenario: System scheme change is followed while no preference exists

- **WHEN** the user has never chosen a theme and changes the device appearance while the app is running
- **THEN** the application SHALL switch to match the new system scheme

#### Scenario: Explicit preference overrides the system scheme

- **WHEN** the user has explicitly selected light mode and the device appearance is switched to dark
- **THEN** the application SHALL remain in the light theme

### Requirement: Theme-Dependent Runtime Surfaces Follow the Resolved Theme

Native chrome that is driven by the active theme SHALL reflect the resolved theme from first paint.

#### Scenario: Status bar matches the resolved theme on cold start

- **WHEN** the application launches with a stored dark preference
- **THEN** the status bar SHALL use the light content style appropriate to the dark theme

#### Scenario: Android navigation bar matches the resolved theme

- **WHEN** the amount keypad sheet is dismissed while the resolved theme is dark
- **THEN** the Android navigation bar button style SHALL be resolved from the dark theme rather than from a stale default

### Requirement: Preference Migration Without Loss

Renaming the theme storage key SHALL preserve an existing user's stored preference.

#### Scenario: Legacy key is migrated on first launch after upgrade

- **WHEN** a user who stored a dark preference under the legacy `paga-claro:theme` key upgrades to a build using the `cambialy:` namespace
- **THEN** the application SHALL render in the dark theme
- **AND** the preference SHALL subsequently persist under the new key

#### Scenario: Migration failure degrades safely

- **WHEN** the legacy value cannot be read or parsed
- **THEN** the application SHALL fall back to the operating system's colour scheme
- **AND** the application SHALL NOT crash or block startup
