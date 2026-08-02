## Purpose

Ensures accurate conversion rate calculations, robust parsing of localized currency inputs, and correct currency symbol presentation across exchange directions.

## ADDED Requirements

### Requirement: Localized Currency String Parsing
The system SHALL correctly parse formatted currency strings containing both thousands separators and decimal separators into native floating point numbers by treating the rightmost separator as the decimal separator.

#### Scenario: Parse currency string with thousands comma and decimal dot
- **WHEN** a formatted currency string such as "7,487.90" is parsed into a number
- **THEN** the system SHALL return 7487.90 without misinterpreting the comma as a decimal point

#### Scenario: Parse currency string with thousands dot and decimal comma
- **WHEN** a formatted currency string such as "7.487,90" is parsed into a number
- **THEN** the system SHALL return 7487.90 without misinterpreting the dot as a decimal point

### Requirement: Comparison Row Currency Symbol Display
The system SHALL display the target currency's symbol for comparison rate rows when in standard conversion mode, and display each rate's currency symbol when in reversed conversion mode.

#### Scenario: Display target currency symbol in standard conversion mode
- **WHEN** converting from a base currency (e.g. USD) to a target currency (e.g. VES) in standard mode
- **THEN** each alternative rate comparison row SHALL display the target currency symbol ("Bs.") alongside the calculated equivalent amount

#### Scenario: Display rate currency symbol in reversed conversion mode
- **WHEN** converting from a target currency (e.g. VES) to a base currency (e.g. USD) in reversed mode
- **THEN** each alternative rate comparison row SHALL display that rate's respective currency symbol (e.g. "$", "€") alongside the calculated equivalent amount

### Requirement: Output Result Copy Formatting
The system SHALL construct the copyable result text using the output currency's symbol and currency code corresponding to the current exchange direction.

#### Scenario: Copy result text in standard conversion mode
- **WHEN** user copies the conversion output result while in standard conversion mode (e.g. USD -> VES)
- **THEN** the copied text SHALL include the target currency symbol ("Bs.") and code ("VES")

#### Scenario: Copy result text in reversed conversion mode
- **WHEN** user copies the conversion output result while in reversed conversion mode (e.g. VES -> USD)
- **THEN** the copied text SHALL include the base rate currency symbol ("$") and code ("USD")
