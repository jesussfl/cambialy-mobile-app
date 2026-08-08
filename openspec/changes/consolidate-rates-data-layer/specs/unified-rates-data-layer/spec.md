## Purpose

Guarantees that every screen in the application derives exchange rates from one domain model, one response mapper, and one cache entry per resource, so two screens can never display divergent values for the same rate and a backend contract change can never be fixed in only half the app.

## ADDED Requirements

### Requirement: Single Rate Mapping Implementation

The application SHALL contain exactly one implementation that maps an exchange rate API response into the domain model.

#### Scenario: Only one mapper exists

- **WHEN** the source tree is searched for functions mapping a rate API response to a domain rate
- **THEN** exactly one implementation SHALL exist, under the shared API layer

#### Scenario: Features do not redefine domain types

- **WHEN** a feature module declares types
- **THEN** it SHALL import `ExchangeRate`, `ExchangeRateId`, and `ExchangeRateHistoryOption` from the shared domain model
- **AND** it SHALL NOT declare its own definitions of those types

#### Scenario: Features do not declare their own API endpoints

- **WHEN** a feature module is inspected
- **THEN** it SHALL NOT declare an API base URL or a rate endpoint map

### Requirement: Shared Rate Cache Across Screens

Rates fetched for one screen SHALL be reused by any other screen requesting the same resource.

#### Scenario: Compare tab reuses rates already loaded by the exchange screen

- **WHEN** the user loads the exchange screen, waits for rates to resolve, and then navigates to the price comparison screen within the cache freshness window
- **THEN** the comparison screen SHALL render rates immediately from cache
- **AND** no additional rate request SHALL be issued

#### Scenario: Both screens display the same value for the same rate

- **WHEN** the exchange screen and the price comparison screen are both showing the BCV USD rate
- **THEN** both SHALL display the same numeric value

#### Scenario: One cache key per resource

- **WHEN** the React Query cache is inspected after both screens have been visited
- **THEN** each rate resource SHALL be represented by a single cache entry

### Requirement: Comparison Results Are Unchanged By Consolidation

Consolidating the data layer SHALL NOT alter any value the price comparison screen displays for a given input.

#### Scenario: Identical inputs produce identical comparison output

- **WHEN** the price comparison screen is given a first price of `1` USDT and a second price of `500` VES against a fixed set of rate values
- **THEN** the rendered comparison result SHALL be identical to the result produced before consolidation

#### Scenario: Rate ordering is preserved

- **WHEN** the price comparison screen renders its rate list
- **THEN** the rates SHALL appear in the established order: BCV, then USDT, then EUR

#### Scenario: Ambiguous payload resolves by the shared precedence

- **WHEN** a rate response contains both a top-level `rate` field and a `rates` object with differing values
- **THEN** the resolved value SHALL follow the shared mapper's documented field precedence on every screen

### Requirement: No Fabricated Rate Data In The Codebase

The application SHALL NOT contain hardcoded, mocked, or placeholder exchange-rate values.

#### Scenario: No mock rate module remains

- **WHEN** the source tree is searched for literal exchange-rate values
- **THEN** no module SHALL define fixed rate figures for display

#### Scenario: Unavailable rates surface as an explicit state

- **WHEN** rates cannot be loaded and no cached value exists
- **THEN** the affected screen SHALL present an explicit unavailable or error state
- **AND** it SHALL NOT present a fabricated or placeholder rate as if it were live data

### Requirement: Loading And Error States Remain Reachable

Consolidation SHALL NOT hide the price comparison screen's loading or error presentation behind a warm cache.

#### Scenario: Cold start directly into the comparison screen shows a loading state

- **WHEN** the cache is empty and the user opens the price comparison screen first
- **THEN** a loading state SHALL be displayed until rates resolve

#### Scenario: Rate failure on the comparison screen shows an error message

- **WHEN** the rate request fails and no cached value exists while the comparison screen is open
- **THEN** the screen SHALL display its Spanish-language rate error message
