## Purpose

Guarantees that the Android home-screen widget presents exchange rates from the same backend and the same environment as the application itself, so a user reading a rate from the widget reads the same number the app would show.

## ADDED Requirements

### Requirement: Single Rate Source Across App and Widget

The Android rates widget SHALL obtain its rate data from the API base URL configured for the running build variant, and SHALL NOT contain any hardcoded API host.

#### Scenario: Production build targets the configured production API

- **WHEN** a release build is produced with `EXPO_PUBLIC_API_URL` set to `https://cambialy-backend-production.up.railway.app/api/v2`
- **THEN** the widget SHALL request rates from `https://cambialy-backend-production.up.railway.app/api/v2/rates/usd`, `/rates/eur`, and `/rates/usdt`
- **AND** the widget SHALL NOT issue any request to `ahorrave-api.onrender.com`

#### Scenario: Staging build targets the configured staging API

- **WHEN** a staging build is produced with `EXPO_PUBLIC_API_URL` set to the staging host
- **THEN** the widget SHALL request rates from that staging host
- **AND** the resolved host SHALL match the host used by the application's own rate requests in the same build

#### Scenario: No API host literal remains in native widget sources

- **WHEN** the files under `modules/rates-widget/` are searched for the literal `https://`
- **THEN** no Kotlin, Gradle, or resource file SHALL contain an API host literal

### Requirement: Widget and Application Rate Parity

The rate value displayed by the Android widget SHALL be derived from the same API response contract as the value displayed in the application, for the same rate identifier.

#### Scenario: USD BCV parity between widget and app

- **WHEN** the API reports a USD BCV rate of `533.19` and both the app and the widget have refreshed successfully
- **THEN** the widget SHALL display `Bs. 533,19` for USD BCV
- **AND** the application's BCV USD rate SHALL resolve to the same `533.19` numeric value

#### Scenario: Unsupported legacy payload is rejected rather than misread

- **WHEN** a rate response omits both `rate_value` and a usable `rates` object
- **THEN** the widget SHALL treat the refresh as failed and render its stale or empty state
- **AND** the widget SHALL NOT display a fabricated, zero, or placeholder rate value

### Requirement: Refresh Resilience Preservation

The widget SHALL preserve its existing caching and refresh behaviour while changing its rate source.

#### Scenario: Cached rates survive a failed refresh

- **WHEN** a scheduled refresh fails because the API is unreachable and a previously cached rate set exists
- **THEN** the widget SHALL continue to display the cached values marked as stale
- **AND** the worker SHALL request a retry

#### Scenario: Periodic refresh interval is unchanged

- **WHEN** the widget is placed on the home screen
- **THEN** a unique periodic refresh SHALL remain scheduled at a 30-minute interval, constrained to a connected network
