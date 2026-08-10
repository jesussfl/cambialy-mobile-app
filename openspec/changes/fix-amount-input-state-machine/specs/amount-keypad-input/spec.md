## Purpose

Guarantees that entering a number through the on-screen keypad is a deterministic, terminating, and reversible operation on every screen that uses it — so that the amount a user reads is exactly the amount the app computes with, every keystroke can be undone, the field can always be returned to empty, and neither the decimal-separator preference nor the entry-mode preference can change the resulting value.

These requirements apply identically to the exchange screen (`SwapInputBlock`) and the price-comparison screen (`InputComparisonBlock`).

## ADDED Requirements

### Requirement: Backspace Removes Exactly One Keystroke

The delete key SHALL remove exactly one previously entered character from the entry buffer, and SHALL NOT re-interpret, rescale, or reformat the remaining characters.

Deleting a character MUST be the exact inverse of typing it: for any sequence of keystrokes, typing one more key and then pressing delete SHALL leave the field in the state it was in before that key.

#### Scenario: Delete is the inverse of typing, in automatic mode

- **GIVEN** the entry mode is `automatic` (cents) and the decimal separator is comma
- **WHEN** the user types `1`, `2`, `3`, `4` — the field reads `12,34`
- **AND** the user presses delete once
- **THEN** the field SHALL read `1,23`
- **AND** pressing delete again SHALL yield `0,12`, then `0,01`, then an empty field

#### Scenario: Delete is the inverse of typing, in manual mode

- **GIVEN** the entry mode is `manual` and the decimal separator is comma
- **WHEN** the user types `1`, `2`, `,`, `3`, `4` — the field reads `12,34`
- **AND** the user presses delete once
- **THEN** the field SHALL read `12,3`
- **AND** pressing delete again SHALL yield `12,` then `12`, then `1`, then an empty field

#### Scenario: Delete after the entry sheet is reopened

- **GIVEN** the user has entered an amount, dismissed the keypad sheet, and reopened it
- **WHEN** the user presses delete
- **THEN** exactly one character SHALL be removed from the value as entered
- **AND** the value SHALL NOT be divided by ten

#### Scenario: Delete does not divide the value

- **GIVEN** the entry mode is `manual` and the field reads `12,50`
- **WHEN** the user presses delete
- **THEN** the field SHALL read `12,5`
- **AND** the field SHALL NOT read `1,25`

### Requirement: The Field Can Always Be Emptied

Repeated presses of the delete key SHALL always terminate in an empty field, from any reachable state, in a number of presses not exceeding the number of keys the user has pressed.

No value SHALL be a fixed point of the delete operation.

#### Scenario: Repeated delete reaches empty

- **GIVEN** the field holds any entered value
- **WHEN** the user presses delete once for each key previously pressed
- **THEN** the field SHALL be empty
- **AND** the field SHALL show the placeholder (`0,00` for comma, `0.00` for dot)

#### Scenario: A zero value is not a delete fixed point

- **GIVEN** the entry mode is `automatic` and the user has typed `0`, so the field reads `0,00`
- **WHEN** the user presses delete
- **THEN** the field SHALL become empty
- **AND** further presses SHALL leave it empty rather than restoring `0,00`

#### Scenario: An empty field is distinguishable from a zero field in the comparison result

- **GIVEN** Precio A is empty and Precio B holds `100`
- **THEN** the comparison SHALL produce no result, exactly as it does before any input
- **AND** the app SHALL NOT report that either price is cheaper

### Requirement: Entry Resumes Cleanly After the Field Is Emptied

After the field has been emptied — by delete, by the clear key, or on first focus — the next digit pressed SHALL begin a new number, and the field SHALL reflect that digit alone.

The field SHALL NOT become unresponsive to input at any value.

#### Scenario: The 0,01 lock does not occur

- **GIVEN** the entry mode is `automatic`, the decimal separator is comma, and the user has typed `1`, `2`, `3`, `4`
- **WHEN** the user dismisses and reopens the keypad sheet, presses delete five times, and then types `7`
- **THEN** the field SHALL read `0,07`
- **AND** the field SHALL NOT read `0,01`
- **AND** typing `5` after that SHALL yield `0,75`, not `0,01`

#### Scenario: Clear returns the field to empty

- **GIVEN** the field holds any value
- **WHEN** the user presses the clear (`C`) key
- **THEN** the field SHALL be empty
- **AND** any pending arithmetic expression preview SHALL be removed
- **AND** the next digit typed SHALL begin a new number

### Requirement: Displayed Value Equals Computed Value

At every moment, the number rendered in an amount field SHALL be equal to the number used in the conversion and comparison calculations for that field, under the user's active entry mode.

#### Scenario: The comparison screen is correct on first paint

- **GIVEN** the app is opened on the price-comparison screen with no prior input
- **THEN** both price fields SHALL be empty
- **AND** no field SHALL display a value that differs from the value it contributes to the comparison

#### Scenario: A displayed amount contributes its displayed value

- **GIVEN** the entry mode is `automatic`, Precio A is `Divisa` with a rate of `Bs. 40,00`, and the user has typed `1`, `0`, `0` so the field reads `1,00`
- **THEN** the comparison SHALL use `1,00 × 40,00 = Bs. 40,00`
- **AND** it SHALL NOT use `0,01 × 40,00 = Bs. 0,40`

### Requirement: The Entry Mode Preference Is Honoured End-to-End

Every component that reads or writes an amount entered through the keypad SHALL interpret it using the user's configured `amountInputMode`. No code path SHALL assume a fixed mode.

#### Scenario: Manual mode amounts are read at face value

- **GIVEN** the entry mode is `manual` and Precio A is `Divisa` with a rate of `Bs. 40,00`
- **WHEN** the user types `2`, `5` so the field reads `25`
- **THEN** the comparison SHALL use `25 × 40,00 = Bs. 1.000,00`
- **AND** it SHALL NOT use `0,25 × 40,00 = Bs. 10,00`

#### Scenario: Automatic mode amounts are read as cents

- **GIVEN** the entry mode is `automatic` and Precio A is `Divisa` with a rate of `Bs. 40,00`
- **WHEN** the user types `2`, `5` so the field reads `0,25`
- **THEN** the comparison SHALL use `0,25 × 40,00 = Bs. 10,00`

#### Scenario: Changing the entry mode preserves the entered value

- **GIVEN** the entry mode is `automatic` and the field reads `12,34`
- **WHEN** the user switches the entry mode to `manual` in settings and returns to the screen
- **THEN** the field SHALL still read `12,34`
- **AND** subsequent delete presses SHALL follow manual-mode semantics, yielding `12,3`

### Requirement: The Decimal Key Registers Visibly In Manual Mode

In `manual` mode, pressing the decimal-separator key SHALL be reflected in the field, and a trailing decimal separator or trailing zeros SHALL be preserved exactly as typed until further input replaces them.

#### Scenario: A pending decimal separator is shown

- **GIVEN** the entry mode is `manual`, the decimal separator is comma, and the user has typed `1`, `2`
- **WHEN** the user presses the `,` key
- **THEN** the field SHALL read `12,`
- **AND** it SHALL NOT read `12` or `12,00`

#### Scenario: Trailing zeros are preserved as typed

- **GIVEN** the entry mode is `manual` and the user types `1`, `2`, `,`, `5`, `0`
- **THEN** the field SHALL read `12,50`
- **AND** it SHALL NOT collapse to `12,5`
- **AND** the computed value SHALL be `12.5`

#### Scenario: A second decimal separator is rejected

- **GIVEN** the entry mode is `manual` and the field reads `12,5`
- **WHEN** the user presses the decimal key again
- **THEN** the field SHALL still read `12,5`

### Requirement: Each Field Owns Its Own Entry State

Every keypad-backed field SHALL hold its own independent entry state. Input, deletion, or clearing in one field SHALL NOT alter the value or the entry state of any other field.

#### Scenario: Switching to the rate field starts a fresh entry

- **GIVEN** the currency is `Personalizado`, the amount field holds `12,34`, and the rate field is empty
- **WHEN** the user switches to the `Tasa` field and types `4`, `0`
- **THEN** the rate field SHALL reflect only the digits `4` and `0`
- **AND** the digits SHALL NOT be appended to any previously entered rate

#### Scenario: Clearing one field leaves the other intact

- **GIVEN** the amount field holds `12,34` and the rate field holds `40,00`
- **WHEN** the user focuses the rate field and presses clear
- **THEN** the rate field SHALL be empty
- **AND** the amount field SHALL still read `12,34`

#### Scenario: The two comparison prices are independent

- **GIVEN** Precio A holds `100` and Precio B holds `250`
- **WHEN** the user clears Precio A
- **THEN** Precio B SHALL still hold `250`

### Requirement: Arithmetic Evaluation Produces a Reusable Value

Pressing an operator SHALL extend a pending expression; pressing equals SHALL replace the expression with its result as a completed entry. The result SHALL itself be a valid starting point for further arithmetic.

#### Scenario: An expression evaluates and can be extended

- **GIVEN** the entry mode is `manual` and the user enters `20`, `+`, `5`
- **WHEN** the user presses equals
- **THEN** the field SHALL read `25`
- **AND** the expression preview SHALL be removed
- **AND** pressing `×` then `2` then equals SHALL yield `50`

#### Scenario: A digit after equals begins a new number

- **GIVEN** the user has just evaluated an expression and the field reads `25`
- **WHEN** the user types `7`
- **THEN** the field SHALL reflect `7` as a new entry under the active mode
- **AND** it SHALL NOT append `7` to the previous result

#### Scenario: Division by zero leaves the value unchanged

- **GIVEN** the field holds `100` and the user enters `÷`, `0`
- **WHEN** the user presses equals
- **THEN** the field SHALL retain its last valid value
- **AND** the app SHALL NOT display `Infinity`, `NaN`, or an empty result

#### Scenario: An operator cannot begin an expression

- **GIVEN** the field is empty
- **WHEN** the user presses `+`
- **THEN** the field SHALL remain empty and no expression preview SHALL appear

### Requirement: Externally Supplied Amounts Enter as Completed Entries

An amount supplied by a source other than the keypad — a quick-amount pill, a clipboard paste, or a direction swap — SHALL be loaded as a completed entry that is fully editable by the keypad afterwards, under the active entry mode.

#### Scenario: A quick-amount pill is editable afterwards

- **GIVEN** the entry mode is `automatic`
- **WHEN** the user taps the `50` quick-amount pill so the field reads `50,00`
- **AND** the user presses delete
- **THEN** the field SHALL read `5,00`
- **AND** it SHALL NOT read `0,05` or remain at `50,00`

#### Scenario: A pasted amount is editable afterwards

- **GIVEN** the clipboard contains `1.234,56` and the entry mode is `automatic`
- **WHEN** the user pastes it, so the field reads `1.234,56`
- **AND** the user presses delete
- **THEN** the field SHALL read `123,45`

#### Scenario: A swapped amount is editable afterwards

- **GIVEN** the user swaps the conversion direction and the input field is populated with the converted amount
- **WHEN** the user presses delete
- **THEN** exactly one character SHALL be removed from that amount

### Requirement: The Custom Rate Field Accepts Full Rate Precision

A user-supplied exchange rate SHALL preserve at least four decimal places, and SHALL NOT be truncated or rounded to two.

#### Scenario: A four-decimal rate is retained

- **GIVEN** the currency is `Personalizado` and the entry mode is `manual`
- **WHEN** the user enters `36,4523` in the `Tasa` field
- **THEN** the rate field SHALL read `36,4523`
- **AND** an amount of `10` SHALL convert to `Bs. 364,52` using the full rate, not `Bs. 364,50`

#### Scenario: Rate arithmetic keeps four decimals

- **GIVEN** the `Tasa` field is active in `manual` mode
- **WHEN** the user enters `36,45`, `+`, `0,0023` and presses equals
- **THEN** the field SHALL read `36,4523`

### Requirement: The Decimal Separator Preference Affects Presentation Only

The `decimalSeparator` setting SHALL change how a value is rendered and which glyph the decimal key emits, and SHALL NOT change the value a given sequence of keystrokes produces.

#### Scenario: The same keystrokes produce the same value under either separator

- **GIVEN** the entry mode is `manual`
- **WHEN** the user types `1`, `2`, the decimal key, `3`, `4`
- **THEN** the field SHALL read `12,34` when the preference is comma and `12.34` when it is dot
- **AND** the computed value SHALL be `12.34` in both cases

#### Scenario: Changing the separator does not alter a stored amount

- **GIVEN** the field holds `1.234,56` under the comma preference
- **WHEN** the user switches the preference to dot
- **THEN** the field SHALL read `1,234.56`
- **AND** the computed value SHALL be unchanged

### Requirement: Both Keypad Screens Behave Identically

The exchange screen and the price-comparison screen SHALL exhibit the same entry, deletion, clearing, and arithmetic behaviour for the same keystrokes under the same settings.

#### Scenario: The same keystrokes give the same field state on both screens

- **GIVEN** the entry mode is `automatic` and the decimal separator is comma
- **WHEN** the user types `1`, `2`, `3`, `4` and presses delete twice on the exchange screen
- **AND** performs the identical sequence on the price-comparison screen
- **THEN** both fields SHALL read `0,12`

#### Scenario: A fix applied to one screen holds on the other

- **GIVEN** the delete-to-empty behaviour is exercised on the exchange screen
- **THEN** the price-comparison screen SHALL exhibit the same behaviour without a separate implementation
