const fs = require("fs");
const path = require("path");
const { withAppBuildGradle, withProjectBuildGradle } = require("expo/config-plugins");

const APP_DISTRIBUTION_CLASSPATH = "classpath 'com.google.firebase:firebase-appdistribution-gradle:5.2.1'";
const APP_DISTRIBUTION_PLUGIN = 'apply plugin: "com.google.firebase.appdistribution"';
const AUTO_UPLOAD_BLOCK_PATTERN =
  /\n?afterEvaluate\s*\{\s*tasks\.matching\s*\{\s*it\.name\s*==\s*"assembleRelease"\s*\}\.configureEach\s*\{\s*finalizedBy\("appDistributionUploadRelease"\)\s*\}\s*\}\s*/;

function readFirebaseAppId(projectRoot, googleServicesFile) {
  const servicesPath = path.resolve(projectRoot, googleServicesFile || "google-services.json");
  const services = JSON.parse(fs.readFileSync(servicesPath, "utf8"));

  return services.client?.[0]?.client_info?.mobilesdk_app_id;
}

function addProjectClasspath(contents) {
  if (contents.includes("com.google.firebase:firebase-appdistribution-gradle")) {
    return contents;
  }

  return contents.replace(/dependencies\s*\{/, (match) => `${match}\n    ${APP_DISTRIBUTION_CLASSPATH}`);
}

function addAppPlugin(contents) {
  if (contents.includes(APP_DISTRIBUTION_PLUGIN)) {
    return contents;
  }

  return contents.replace('apply plugin: "com.facebook.react"', `apply plugin: "com.facebook.react"\n${APP_DISTRIBUTION_PLUGIN}`);
}

function addDistributionVariables(contents) {
  if (contents.includes("firebaseAppDistributionGroups")) {
    return contents;
  }

  const variables = `def firebaseAppDistributionGroups = findProperty("firebaseAppDistributionGroups") ?: System.getenv("FIREBASE_APP_DISTRIBUTION_GROUPS")
def firebaseAppDistributionTesters = findProperty("firebaseAppDistributionTesters") ?: System.getenv("FIREBASE_APP_DISTRIBUTION_TESTERS")
def firebaseAppDistributionReleaseNotes = findProperty("firebaseAppDistributionReleaseNotes") ?: System.getenv("FIREBASE_APP_DISTRIBUTION_RELEASE_NOTES") ?: "Cambialy Android release"
def firebaseAppDistributionServiceCredentialsFile = findProperty("firebaseAppDistributionServiceCredentialsFile") ?: System.getenv("FIREBASE_APP_DISTRIBUTION_SERVICE_CREDENTIALS_FILE")`;

  return contents.replace(/def projectRoot = .*/, (match) => `${match}\n${variables}`);
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

  return contents.replace(/(\s+crunchPngs enablePngCrunchInRelease\.toBoolean\(\)\n)/, `$1${block}\n`);
}

function addReleaseSigningConfig(contents) {
  if (contents.includes("def releaseStoreFilePath") || contents.includes("signingConfigs.release")) {
    return contents;
  }

  const block = `        release {
            def releaseStoreFilePath = findProperty('android.injected.signing.store.file') ?: System.getenv('ANDROID_KEYSTORE_FILE')
            def releaseStorePassword = findProperty('android.injected.signing.store.password') ?: System.getenv('ANDROID_KEYSTORE_PASSWORD')
            def releaseKeyAlias = findProperty('android.injected.signing.key.alias') ?: System.getenv('ANDROID_KEY_ALIAS')
            def releaseKeyPassword = findProperty('android.injected.signing.key.password') ?: System.getenv('ANDROID_KEY_PASSWORD')

            if (releaseStoreFilePath != null && releaseStoreFilePath.trim() && releaseStorePassword != null && releaseKeyAlias != null && releaseKeyPassword != null) {
                def resolvedStoreFile = new File(releaseStoreFilePath)
                if (!resolvedStoreFile.isAbsolute()) {
                    resolvedStoreFile = new File(rootDir, releaseStoreFilePath)
                }
                storeFile resolvedStoreFile
                storePassword releaseStorePassword
                keyAlias releaseKeyAlias
                keyPassword releaseKeyPassword
            }
        }`;

  return contents.replace(
    /(signingConfigs\s*\{[\s\S]*?debug\s*\{[\s\S]*?\n\s*\})/,
    `$1\n${block}`
  );
}

function useReleaseSigningConfig(contents) {
  if (contents.includes("signingConfig signingConfigs.release")) {
    return contents;
  }

  return contents.replace(
    /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
    "$1signingConfig signingConfigs.release"
  );
}

function removeAutoUpload(contents) {
  return contents.replace(AUTO_UPLOAD_BLOCK_PATTERN, "\n");
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

      config.modResults.contents = removeAutoUpload(
        useReleaseSigningConfig(addReleaseSigningConfig(addReleaseConfig(addDistributionVariables(addAppPlugin(config.modResults.contents)), appId))),
      );
    }
    return config;
  });

  return config;
};
