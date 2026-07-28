const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = function withAndroidR8(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let contents = config.modResults.contents;

      if (!contents.includes("minifyEnabled")) {
        contents = contents.replace(
          /buildTypes\s*\{/,
          `def enableProguardInReleaseBuilds = true\n\n    buildTypes {`,
        );
      }

      if (!contents.includes("proguard-rules.pro")) {
        contents = contents.replace(
          /release\s*\{/,
          `release {\n            minifyEnabled enableProguardInReleaseBuilds\n            shrinkResources true\n            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'`,
        );
      }

      config.modResults.contents = contents;
    }
    return config;
  });
};
