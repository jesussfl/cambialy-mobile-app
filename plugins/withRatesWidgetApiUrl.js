const { withGradleProperties } = require("expo/config-plugins");

const GRADLE_PROPERTY_KEY = "cambialyRatesApiBaseUrl";

/**
 * Propagates EXPO_PUBLIC_API_URL into the generated Android project so the rates
 * widget resolves the same backend as the app.
 *
 * The widget runs in its own process (AppWidgetProvider + WorkManager) with no JS
 * runtime alive, so it cannot read process.env. Injecting at build time is the only
 * hand-off with no window in which the URL is unknown — the widget must work on
 * first placement, before the app has ever been launched.
 *
 * Writes to android/gradle.properties, which is generated and gitignored, so
 * `expo prebuild` never mutates a tracked file.
 */
module.exports = function withRatesWidgetApiUrl(config) {
  return withGradleProperties(config, (config) => {
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

    if (!apiBaseUrl) {
      throw new Error(
        "withRatesWidgetApiUrl: EXPO_PUBLIC_API_URL is not set.\n" +
          "The Android rates widget resolves its backend from this value. Prebuilding " +
          "without it would ship a widget that cannot fetch rates, so the build fails here " +
          "rather than at runtime on a user's home screen."
      );
    }

    config.modResults = config.modResults.filter(
      (item) => !(item.type === "property" && item.key === GRADLE_PROPERTY_KEY)
    );

    config.modResults.push({
      type: "property",
      key: GRADLE_PROPERTY_KEY,
      value: apiBaseUrl,
    });

    return config;
  });
};
