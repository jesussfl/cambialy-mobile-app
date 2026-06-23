const { withPodfileProperties } = require("expo/config-plugins");

module.exports = function withIosBuildReactNativeFromSource(config) {
  return withPodfileProperties(config, (config) => {
    config.modResults["ios.buildReactNativeFromSource"] = "true";
    return config;
  });
};
