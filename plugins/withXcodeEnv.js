const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withXcodeEnv(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const appEnv = process.env.APP_ENV;
      const nodeEnv = process.env.NODE_ENV;
      if (appEnv || nodeEnv) {
        const xcodeEnvLocalPath = path.join(config.modRequest.platformProjectRoot, ".xcode.env.local");
        let content = "";
        if (fs.existsSync(xcodeEnvLocalPath)) {
          content = fs.readFileSync(xcodeEnvLocalPath, "utf8");
        }
        content = content
          .replace(/^export APP_ENV=.*$/gm, "")
          .replace(/^export NODE_ENV=.*$/gm, "")
          .trim();
        if (appEnv) content += `\nexport APP_ENV=${appEnv}`;
        if (nodeEnv) content += `\nexport NODE_ENV=${nodeEnv}`;
        content += "\n";
        fs.writeFileSync(xcodeEnvLocalPath, content);
      }
      return config;
    },
  ]);
};
