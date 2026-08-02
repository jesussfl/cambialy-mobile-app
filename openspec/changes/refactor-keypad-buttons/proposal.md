## Why

The current keypad implementation has visible borders on buttons due to the default secondary button variant styling, presents all key types inline within a single monolithic component, and renders the delete button with different styling and layout props compared to the digit and operator keys. Standardizing button size, eliminating button borders, and extracting modular button components will make the keypad design cleaner, more cohesive, and easier to maintain.

## What Changes

- **Remove Button Borders**: Remove border strokes (`borderWidth: 0`) from all keypad buttons, including number keys, operator keys, decimal separator key, and the delete/backspace key.
- **Modularize Keypad Buttons**: Extract dedicated keypad button components (e.g. `KeypadKey`, `KeypadDeleteKey`, `KeypadOperatorKey`) under `src/features/exchange/components/keypad/` to centralize button rendering, touch handling, and styling.
- **Consistent Layout & Dimensions**: Enforce equal height, flex ratio, border radius, and icon/label centering across all keypad grid cells so that the delete key matches the exact dimensions and layout of the number and operator buttons.

## Capabilities

### New Capabilities
- `keypad-button-ui`: Modular, borderless keypad buttons with uniform grid dimensions and centralized component structure.

### Modified Capabilities

## Impact

- **Affected Components**: `src/features/exchange/components/amount-keypad.tsx` and new subcomponents under `src/features/exchange/components/keypad/`.
- **UI & Layout**: Seamless 4x4 grid alignment with borderless pill-shaped buttons and identical key sizing.
