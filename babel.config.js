/** @type {import('react-native-unistyles/plugin').UnistylesPluginOptions} */
const unistylesPluginOptions = {
  root: "src",
};

const ReactCompilerConfig = {
  target: "19",
};

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["babel-plugin-react-compiler", ReactCompilerConfig],
      ["react-native-unistyles/plugin", unistylesPluginOptions],
    ],
  };
};
