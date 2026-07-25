const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = function withHermesMmap(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let contents = config.modResults.contents;

      if (!contents.includes("androidResources")) {
        contents = contents.replace(/defaultConfig\s*\{[^}]*\}/, (match) => {
          return `${match}\n\n    androidResources {\n        noCompress += ["bundle"]\n    }`;
        });
      } else if (!contents.includes('noCompress')) {
        contents = contents.replace(/androidResources\s*\{/, `androidResources {\n        noCompress += ["bundle"]`);
      }

      config.modResults.contents = contents;
    }
    return config;
  });
};
