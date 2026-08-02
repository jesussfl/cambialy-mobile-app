## Why

Users often copy numerical values or formatted currency amounts from external apps (banking apps, messaging, notes) and need to quickly input them into Cambialy's currency exchange screen without re-typing digits manually. Adding support for pasting text directly into the Exchange Screen makes converting amounts fast, effortless, and error-free.

## What Changes

- Support reading string content from the system clipboard on demand using `expo-clipboard`.
- Sanitize pasted strings by stripping non-numeric characters (currency symbols, spaces, letter characters) while preserving valid decimal punctuation (comma or period standard).
- Provide a clear UI touch target/button within the Exchange Screen / Swap Input Block for pasting clipboard text.
- Automatically update the exchange input amount state and trigger real-time rate conversion when valid numeric text is pasted.

## Capabilities

### New Capabilities
- `clipboard-paste-exchange`: Ability to paste, sanitize, and load numeric values from system clipboard into the exchange screen input block.

### Modified Capabilities

## Impact

- `src/features/exchange/screens/exchange-screen.tsx`
- `src/features/exchange/components/swap-input-block.tsx`
- `src/features/exchange/store/exchange-store.ts` or paste utility helper
- Native clipboard interaction via `expo-clipboard`
