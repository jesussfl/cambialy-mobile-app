## 1. Component Refactoring

- [x] 1.1 Create `input-comparison-block.tsx` in `src/features/calculator/components/` based on the UI style of Exchange's input blocks.
- [x] 1.2 Remove the old `price-comparison-block.tsx` component.


## 2. Calculator Screen Adaptation

- [x] 2.1 Update the imports in `calculator-screen.tsx` to use `InputComparisonBlock`.
- [x] 2.2 Refactor the UI layout of `calculator-screen.tsx` (the `comparePanel`) to match the structural padding and layout of `ExchangeScreen`'s `swapPanel`.
- [x] 2.3 Replace both instances of `PriceComparisonBlock` with the new `InputComparisonBlock`, mapping the props correctly (for Price A and Price B).
- [x] 2.4 Ensure the static `arrow-left-right-line` icon remains in the divider between the two blocks.

