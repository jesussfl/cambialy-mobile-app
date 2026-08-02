## 1. Core Component Updates

- [x] 1.1 Create a shared Reanimated + RNGH Pressable wrapper that replicates the `PressableOpacity` effect on the UI thread.
- [x] 1.2 Refactor `AppButton` to use this new wrapper, preserving existing visual logic and adding a ghost variant if necessary.
- [x] 1.3 Refactor `IconButton` to use this new wrapper.
- [x] 1.4 Create a new `TouchZone` component in `src/components/ui/button.tsx` using this new wrapper for arbitrary flex layouts without button styling constraints.

## 2. Refactoring App Screens

- [x] 2.1 Refactor `copy-icon-button.tsx` to use the unified `IconButton`.
- [x] 2.2 Refactor `conversion-detail-row.tsx` to use `TouchZone` instead of inline `PressableOpacity`.
- [x] 2.3 Refactor `rate-history-sheet.tsx` to use `TouchZone` or `AppButton` for its list items and tabs.
- [x] 2.4 Refactor `onboarding-screen.tsx` and `pagination-item.tsx` to use `AppButton` or `TouchZone`.
- [x] 2.5 Refactor `exchange-screen.tsx` usages of `Pressable` into `TouchZone` or `IconButton`.
- [x] 2.6 Refactor `custom-tabbar.tsx` usages of `Pressable` into `TouchZone`.
- [x] 2.7 Refactor `price-comparison-block.tsx` to use `TouchZone`.

## 3. Cleanup & Verification

- [x] 3.1 Check for any remaining scattered `Pressable` imports from `react-native` or `pressto` across the codebase and migrate them.
- [x] 3.2 Verify touch interactions on both iOS and Android (especially checking performance and hitSlops).
- [x] 3.3 Uninstall `pressto` and clean up `package.json`.
