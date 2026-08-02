## Purpose

Provides seamless clipboard paste capabilities in the currency exchange screen, allowing users to quickly load and sanitize copied financial amounts into the active input.

## ADDED Requirements

### Requirement: Paste text from clipboard into exchange input
The exchange screen SHALL allow users to trigger a paste action that reads plain text from the device clipboard and updates the current input amount with sanitized numerical value.

#### Scenario: User pastes valid numerical string from clipboard
- **WHEN** the user triggers the paste action while the system clipboard contains a string like "1,250.50" or "$150.00"
- **THEN** the system SHALL extract the valid numeric value ("1250.50" or "150.00") and update the exchange store input amount

#### Scenario: User long presses input amount display to reveal HeroUI Native menu
- **WHEN** the user performs a long press gesture on the exchange input display panel
- **THEN** the system SHALL display a HeroUI Native Menu containing a "Pegar" (Paste) action popover item

#### Scenario: User pastes clipboard content with no valid numbers
- **WHEN** the user triggers the paste action while the clipboard contains text with no numeric digits (e.g. "hello world")
- **THEN** the system SHALL preserve the existing input amount and notify the user or gracefully ignore the operation without crashing

#### Scenario: User pastes string with comma decimal separator
- **WHEN** the user triggers the paste action with clipboard text using European/Latin comma decimal format (e.g. "1250,50")
- **THEN** the system SHALL convert the comma to a standard decimal point ("1250.50") before updating the input amount
