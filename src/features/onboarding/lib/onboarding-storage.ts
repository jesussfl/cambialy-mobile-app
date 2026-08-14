import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_STORAGE_KEY = "cambialy:onboarding:v1";
const ONBOARDING_SEEN_VALUE = "seen";

/**
 * Persistence boundary for the onboarding gate. Neither read nor write throws:
 * onboarding is replayable state, so a storage failure degrades to showing the
 * flow again rather than blocking the app from starting.
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const storedValue = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    return storedValue === ONBOARDING_SEEN_VALUE;
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, ONBOARDING_SEEN_VALUE);
  } catch {
    // Failing to persist only means the flow replays on the next launch.
  }
}
