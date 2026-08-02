## Why

The Calculator screen currently uses a different visual structure (`PriceComparisonBlock`) compared to the Exchange screen, which leads to UI inconsistency and harder maintenance. Unifying the design by adapting the Exchange screen UI (with a stacked panel and a static swap icon) and introducing a dedicated `InputComparisonBlock` will improve consistency, maintainability, and user experience.

## What Changes

- Replace the `PriceComparisonBlock` component with a new custom component: `InputComparisonBlock`.
- Adapt the `CalculatorScreen` to use a layout similar to `ExchangeScreen` (e.g., using `TopNavbar`, a `ScrollView` with a panel for the input blocks).
- Use `InputComparisonBlock` for both Price A and Price B since they both accept independent inputs.
- Keep the `arrow-left-right-line` icon between the two blocks as a static visual separator (non-functional).

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
<!-- None -->
*(No functional requirements are changing. This is a pure UI refactoring. `skip_specs: true` has been set in `.openspec.yaml`.)*

## Impact

- `src/features/calculator/screens/calculator-screen.tsx`: Will be rewritten to match the new UI layout.
- `src/features/calculator/components/price-comparison-block.tsx`: Will be deleted.
- `src/features/calculator/components/input-comparison-block.tsx`: Will be created to replace `price-comparison-block.tsx`.
