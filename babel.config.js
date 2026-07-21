/** @type {import('react-native-unistyles/plugin').UnistylesPluginOptions} */
const unistylesPluginOptions = {
  // any component in this folder will be processed
  root: "src",
};

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["react-native-unistyles/plugin", unistylesPluginOptions],
      // other plugins
    ],
  };
};
