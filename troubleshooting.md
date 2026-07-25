# Troubleshooting

## Expo SDK 57 + Reanimated 4.5.0 rejects Unistyles-bound styles on animated components

### Error
```
[Error: [Reanimated] Invalid value for "unistyles_<hash>": an empty object is not a valid style value.]
```

### Root cause
Reanimated 4.5.0 (shipped with Expo SDK 57) iterates over style object properties and rejects internal Unistyles C++ binding keys (`unistyles_*`). This happens when a Unistyles-bound style object (from `StyleSheet.create`) is passed to any component that internally uses `Animated.View` or other Reanimated primitives.

### Fix
Wrap the animated component with `withUnistyles()` so Unistyles resolves the bindings before the style reaches Reanimated.

```tsx
import { StyleSheet, withUnistyles } from "react-native-unistyles";
import { PressableOpacity } from "pressto";

const UniPressableOpacity = withUnistyles(PressableOpacity);

// ✅ Works
<UniPressableOpacity style={styles.myStyle} />
```

### Components known to need wrapping
| Library | Components |
|---|---|
| `pressto` | `PressableOpacity`, `PressableScale` |
| `heroui-native` | `Popover.Content`, `Select.Trigger`, `Select.Overlay`, `Select.Content` |
| Any component using Reanimated internally | Any component receiving `style` prop with Unistyles-bound values |

### For `Animated.View` directly
Do NOT put Unistyles styles in the same array as Reanimated animated styles on `Animated.View`:

```tsx
// ❌ Breaks on Expo SDK 57
<Animated.View style={[styles.tabBarContent, pillStyle]} />

// ✅ Restructure: put Unistyles style on a regular View child
<Animated.View style={pillStyle}>
  <View style={styles.tabBarContent}>
    {children}
  </View>
</Animated.View>
```

### For heroui-native `styles` prop (plural)
The `styles` prop (e.g. `styles={{ content: styles.dialogContent }}`) is NOT intercepted by `withUnistyles`. Inline the style as a plain object if it doesn't use theme values, or use `useUnistyles` to resolve theme-dependent values manually.

### Babel plugin ordering
Ensure `react-native-unistyles/plugin` runs **before** `babel-plugin-react-compiler` in `babel.config.js`:

```js
plugins: [
  ["react-native-unistyles/plugin", { root: "src" }],
  ["babel-plugin-react-compiler", { target: "19" }],
]
```
