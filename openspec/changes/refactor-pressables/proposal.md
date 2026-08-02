## Why

The codebase currently uses a mix of different Pressable components (`Pressable` from `react-native`, `PressableOpacity` and `PressableScale` from `pressto`) scattered across various files. This leads to inconsistent interaction states (e.g. some buttons lack press feedback), duplicated styling logic, and harder maintenance. Furthermore, for low-end devices, we need a highly performant touch interaction. Consolidating all these into centralized Button variants powered by React Native Gesture Handler (RNGH) `Pressable`s and `react-native-reanimated` for smooth opacity animations will improve consistency, maintainability, and user experience. 

## What Changes

- Consolidate inline `Pressable`, `PressableOpacity`, and `PressableScale` implementations into a central `<Button />` (and `<IconButton />`) component with clear visual variants (`primary`, `secondary`, `ghost`, etc.).
- Update `Button`, `IconButton`, and `TouchZone` to internally use RNGH's `Pressable` with Reanimated to replicate the `PressableOpacity` feel without using the `pressto` library.
- Refactor all scattered `Pressable` usages (e.g., in `exchange-screen.tsx`, `rate-history-sheet.tsx`, `onboarding-screen.tsx`) to use the new `Button` component or a domain-specific unified component.
- Ensure unified Unistyles integration across all touchable areas without recreating HOC wrappers like `withUnistyles(PressableOpacity)` in multiple files.

## Capabilities

### New Capabilities

### Modified Capabilities

## Impact

- **UI Components:** Widespread updates to screens and components to replace native `Pressable` with the unified `Button` component.
- **Performance:** Improved response times and reduced JS thread blocking during touch events if migrating to RNGH Pressables under the hood.
- **Maintenance:** Easier to apply app-wide touch feedback changes by modifying a single `Button` component.
