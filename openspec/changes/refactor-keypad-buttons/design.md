## Context

See `proposal.md` for background and motivation.

Currently, `AmountKeypad` directly instantiates `AppButton` and `IconButton` with `variant="secondary"`. In the project's button system (`src/components/ui/button.tsx`), `variant="secondary"` sets `borderWidth: 1` and `borderColor: theme.colors.borderSubtle`. Furthermore, the backspace button uses `IconButton` with an extra style block overriding width and background, creating visual dissimilarity and size mismatch.

## Goals / Non-Goals

**Goals:**
- Eliminate border outlines from all keypad buttons.
- Centralize keypad key presentation into clean modular subcomponents under `src/features/exchange/components/keypad/`.
- Ensure uniform height (`52px`), flex distribution (`flex: 1`), pill shape (`theme.radius.pill`), and center alignment across all 16 buttons in the 4x4 keypad grid.

**Non-Goals:**
- Changing touch gesture logic or calculator expression evaluation.
- Refactoring `AmountKeypadSheet` or sheet dismiss handling.

## Decisions

### 1. Component Architecture & Modular Subcomponents
Extract dedicated keypad button components into `src/features/exchange/components/keypad/`:
- **`KeypadButton`** (`keypad-button.tsx`): Extends `TouchZone` to render text keys (digits `0-9`, `.`, operators `+`, `-`, `×`, `÷`). Uses borderless styling (`borderWidth: 0`), explicit height (`52px`), `flex: 1`, and Unistyles theme color variants (`keyButton` vs `operatorButton`).
- **`KeypadIconButton`** (`keypad-icon-button.tsx`): Extends `TouchZone` to render icon keys (delete/backspace key `delete-back-2-line`). Shares exact base layout, height (`52px`), `flex: 1`, and borderless styling with `KeypadButton` to guarantee perfect grid symmetry.

### 2. Unistyles Theme Tokens & Layout Rules
- **Height & Flex**: Every button uses `height: 52`, `flex: 1`, and `borderRadius: theme.radius.pill`.
- **Backgrounds**:
  - Number keys & decimal separator: `theme.gray[700]`
  - Operator keys (`÷`, `×`, `-`, `+`): `theme.gray[800]`
  - Delete key: `theme.gray[800]` (matching operator buttons or dark contrast background, borderless)
- **Borders**: Explicitly ensure `borderWidth: 0` or omit border properties to remove all outlines.

## Risks / Trade-offs

- [Risk] Layout shift if parent container flex changes.
  → Mitigation: Keep the 4x4 `keypadRow` layout with `flexDirection: "row"` and `gap: theme.spacing.sm` intact in `AmountKeypad`.
