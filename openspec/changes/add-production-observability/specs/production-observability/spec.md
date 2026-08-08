## Purpose

Ensures that failures in the released application are visible to the team and recoverable for the user: unhandled errors are reported with diagnostic context, the user is never left on a blank screen, and release builds emit no debug output and transmit no financially sensitive input.

## ADDED Requirements

### Requirement: Unhandled Errors Are Reported

The application SHALL report unhandled errors, including those occurring before the component tree mounts, to an error reporting service.

#### Scenario: A render error is reported with a stack trace

- **WHEN** a component throws during render in a release build
- **THEN** the error SHALL be reported with a stack trace and the name of the screen in which it occurred

#### Scenario: A startup error is reported

- **WHEN** an error occurs during application initialisation, before any screen has mounted
- **THEN** the error SHALL be reported

#### Scenario: Reports identify the build

- **WHEN** any error is reported
- **THEN** the report SHALL carry a release identifier corresponding to the shipped application version and version code
- **AND** the report SHALL identify the environment as production or staging

#### Scenario: Reporter failure does not break the app

- **WHEN** the reporting service cannot be initialised
- **THEN** the application SHALL start and function normally without reporting
- **AND** the application SHALL NOT crash or enter a restart loop

### Requirement: No Blank Screen On Failure

The application SHALL present a recoverable error state instead of an unrendered screen when a component tree fails.

#### Scenario: A screen error preserves navigation

- **WHEN** a screen throws during render
- **THEN** the application SHALL display an error message in Spanish with a retry action
- **AND** the tab bar SHALL remain usable so the user can navigate to another screen

#### Scenario: A provider-level error still renders a fallback

- **WHEN** an error occurs above the screen level, including in theme configuration
- **THEN** the application SHALL display a full-screen fallback with a restart action
- **AND** the fallback SHALL render without depending on the theming system

#### Scenario: Retry recovers without a restart

- **WHEN** the user activates the retry action after a transient failure
- **THEN** the application SHALL re-attempt rendering the failed subtree
- **AND** a successful retry SHALL restore normal operation without terminating the app

### Requirement: Handled Data Contract Failures Are Reported

Failures that are already handled in the user interface SHALL still produce a diagnostic signal.

#### Scenario: An unusable rate payload is reported before rethrow

- **WHEN** a rate response omits every recognised rate field and mapping throws
- **THEN** the failure SHALL be reported as a non-fatal event including the rate identifier and the responding endpoint
- **AND** the existing user-facing error state SHALL be unchanged

#### Scenario: Transient network failures do not alert

- **WHEN** a rate request fails because the device is offline
- **THEN** the event SHALL NOT be escalated at the same severity as a data contract failure

### Requirement: Release Builds Emit No Debug Output

Release builds SHALL NOT execute debug console output on any user-reachable code path.

#### Scenario: No console output during rate history pagination

- **WHEN** the user scrolls the rate history list and triggers pagination in a release build
- **THEN** no debug console output SHALL be produced

#### Scenario: No console output during rate requests

- **WHEN** rate or history requests are issued in a release build
- **THEN** no request URL, response status, or pagination cursor SHALL be written to the console

#### Scenario: Scroll-path logging is removed at the source

- **WHEN** the rate history component and the history query module are inspected
- **THEN** no debug console call SHALL remain on the render or pagination path in any build configuration

### Requirement: No Sensitive Input Is Transmitted

Reported diagnostics SHALL NOT contain values the user has entered.

#### Scenario: Entered amounts are excluded from reports

- **WHEN** an error is reported while the user has typed an amount or a custom rate
- **THEN** the transmitted report SHALL NOT contain the entered amount, its display form, the custom rate input, or clipboard content

#### Scenario: API-sourced rate values remain available as context

- **WHEN** a data contract failure is reported
- **THEN** the report MAY include the rate identifier and the API-sourced values needed to diagnose the failure
