const fs = require("fs");
const path = require("path");
const { withAppBuildGradle, withProjectBuildGradle } = require("expo/config-plugins");

const APP_DISTRIBUTION_CLASSPATH = "classpath 'com.google.firebase:firebase-appdistribution-gradle:5.2.1'";
const APP_DISTRIBUTION_PLUGIN = 'apply plugin: "com.google.firebase.appdistribution"';
const AUTO_UPLOAD_BLOCK = `
afterEvaluate {
    tasks.matching { it.name == "assembleRelease" }.configureEach {
        finalizedBy("appDistributionUploadRelease")
    }
}
`;

function readFirebaseAppId(projectRoot, googleServicesFile) {
  const servicesPath = path.resolve(projectRoot, googleServicesFile || "google-services.json");
  const services = JSON.parse(fs.readFileSync(servicesPath, "utf8"));

  return services.client?.[0]?.client_info?.mobilesdk_app_id;
}

function addProjectClasspath(contents) {
  if (contents.includes("com.google.firebase:firebase-appdistribution-gradle")) {
    return contents;
  }

  return contents.replace(
    /dependencies\s*\{/,
    (match) => `${match}\n    ${APP_DISTRIBUTION_CLASSPATH}`
  );
}

function addAppPlugin(contents) {
  if (contents.includes(APP_DISTRIBUTION_PLUGIN)) {
    return contents;
  }

  return contents.replace(
    'apply plugin: "com.facebook.react"',
    `apply plugin: "com.facebook.react"\n${APP_DISTRIBUTION_PLUGIN}`
  );
}

function addDistributionVariables(contents) {
  if (contents.includes("firebaseAppDistributionGroups")) {
    return contents;
  }

  const variables = `def firebaseAppDistributionGroups = findProperty("firebaseAppDistributionGroups") ?: System.getenv("FIREBASE_APP_DISTRIBUTION_GROUPS")
def firebaseAppDistributionTesters = findProperty("firebaseAppDistributionTesters") ?: System.getenv("FIREBASE_APP_DISTRIBUTION_TESTERS")
def firebaseAppDistributionReleaseNotes = findProperty("firebaseAppDistributionReleaseNotes") ?: System.getenv("FIREBASE_APP_DISTRIBUTION_RELEASE_NOTES") ?: "Cambialy Android release"
def firebaseAppDistributionServiceCredentialsFile = findProperty("firebaseAppDistributionServiceCredentialsFile") ?: System.getenv("FIREBASE_APP_DISTRIBUTION_SERVICE_CREDENTIALS_FILE")`;

  return contents.replace(
    /def projectRoot = .*/,
    (match) => `${match}\n${variables}`
  );
}

function addReleaseConfig(contents, appId) {
  if (contents.includes("firebaseAppDistribution {")) {
    return contents;
  }

  const block = `            firebaseAppDistribution {
                appId = "${appId}"
                artifactType = "APK"
                releaseNotes = firebaseAppDistributionReleaseNotes
                if (firebaseAppDistributionGroups != null && firebaseAppDistributionGroups.trim()) {
                    groups = firebaseAppDistributionGroups
                }
                if (firebaseAppDistributionTesters != null && firebaseAppDistributionTesters.trim()) {
                    testers = firebaseAppDistributionTesters
                }
                if (firebaseAppDistributionServiceCredentialsFile != null && firebaseAppDistributionServiceCredentialsFile.trim()) {
                    serviceCredentialsFile = firebaseAppDistributionServiceCredentialsFile
                }
            }`;

  return contents.replace(
    /(\s+crunchPngs enablePngCrunchInRelease\.toBoolean\(\)\n)/,
    `$1${block}\n`
  );
}

function addAutoUpload(contents) {
  if (contents.includes('finalizedBy("appDistributionUploadRelease")')) {
    return contents;
  }

  return `${contents.trimEnd()}\n${AUTO_UPLOAD_BLOCK}`;
}

module.exports = function withFirebaseAppDistribution(config, options = {}) {
  const googleServicesFile = config.android?.googleServicesFile;

  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      config.modResults.contents = addProjectClasspath(config.modResults.contents);
    }
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      const appId = options.appId || readFirebaseAppId(config.modRequest.projectRoot, googleServicesFile);

      config.modResults.contents = addAutoUpload(
        addReleaseConfig(
          addDistributionVariables(addAppPlugin(config.modResults.contents)),
          appId
        )
      );
    }
    return config;
  });

  return config;
};
