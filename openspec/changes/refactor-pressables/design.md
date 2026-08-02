## Context

See `proposal.md` for the motivation of this change. Currently, the app uses a variety of `Pressable` components, including raw `react-native` `Pressable`s and `pressto`'s `PressableOpacity` / `PressableScale`, distributed across multiple feature screens and components. The `AppButton` and `IconButton` already exist in `src/components/ui/button.tsx` but do not utilize RNGH's `Pressable`, nor do all touchable elements use these UI components. The scattered usages make it difficult to uniformly maintain styles, hit slops, and performance characteristics (especially on low-end devices, where standard JS-based Pressable feedback can stutter or drop frames).

## Goals / Non-Goals

**Goals:**
- Replace raw `Pressable` instances across the app with `AppButton`, `IconButton`, or a new unified `TouchZone` (if semantic button styling is unnecessary).
- Use React Native Gesture Handler (RNGH) underlying `Pressable` or its principles to handle touch events for improved performance on the UI thread, bypassing the JS bridge for interaction state changes on low-end devices.
- Extend `AppButton` to cleanly support ghost variants or text-only buttons that are used in headers, paginators, etc.
- Unify Unistyles wrapper logic (`withUnistyles`) around these core touchables.

**Non-Goals:**
- Completely redesigning the app's visual aesthetics; this is a pure refactor of the underlying component structure.
- Modifying complex gesture handling (e.g. `PanGestureHandler`) that isn't related to simple taps/presses.

## Decisions

- **Decision 1: Drop Pressto for RNGH + Reanimated.** 
  - *Rationale*: RNGH provides interactions running on the UI thread, minimizing jank. The user wants to perfectly replicate the `PressableOpacity` from `pressto` without the dependency. We will build a custom wrapper using `Pressable` from RNGH and `useAnimatedStyle` from Reanimated to run opacity animations on the UI thread.
  - *Alternative Considered*: Keeping `pressto`. The problem is Pressto runs animations via JS thread callbacks or standard animated API if not careful, which might lag on Android low-end devices compared to pure RNGH + Reanimated.

- **Decision 2: Introduction of a `TouchZone` component.**
  - *Rationale*: Not all pressables are visual buttons. E.g., clicking a whole row (like `conversion-detail-row.tsx`) shouldn't use `AppButton` because `AppButton` carries specific layout (row, gap, radius) and text styling. A `TouchZone` component will wrap RNGH Pressable + Unistyles purely for wrapping rows without enforcing button-like visual constraints, while standardizing `hitSlop` and feedback (opacity).

## Risks / Trade-offs

- **Risk: Breaking existing layouts** → *Mitigation*: Ensure `AppButton` and the new `TouchZone` accept arbitrary `style` arrays via Unistyles and pass them down correctly. Test heavily on major screens (Onboarding, Exchange).
- **Risk: Gesture overlap with RNGH** → *Mitigation*: Since we're moving to RNGH, nested touchables (e.g., inside a TrueSheet or a ScrollView) might need `simultaneousHandlers` or careful consideration if RNGH intercepts touches too aggressively. 

## Migration Plan

1. Create/Update the core button primitives (`AppButton`, `IconButton`, `TouchZone`) in `src/components/ui/button.tsx`.
2. Migrate generic Pressables (e.g. `copy-icon-button.tsx`) to `IconButton`.
3. Migrate layout-based Pressables (e.g. `conversion-detail-row.tsx`, `rate-history-sheet.tsx` rows) to `TouchZone`.
4. Migrate header/skip buttons (e.g. `onboarding-screen.tsx`) to `AppButton` (ghost variant).
5. Uninstall `pressto` and remove it from `package.json` completely.
