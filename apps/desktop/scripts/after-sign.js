/* eslint-disable @typescript-eslint/no-require-imports, no-console */
require("dotenv").config();
const path = require("path");

const { notarize } = require("@electron/notarize");
const { deepAssign } = require("builder-util");
const fse = require("fs-extra");

exports.default = run;

async function run(context) {
  console.log("## After sign");
  // console.log(context);

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${context.appOutDir}/${appName}.app`;
  const macBuild = context.electronPlatformName === "darwin";
  const copySafariExtension = ["darwin", "mas"].includes(context.electronPlatformName);

  let shouldResign = false;

  if (copySafariExtension) {
    console.log("### Copying safari extension");
    // Copy Safari plugin to work-around https://github.com/electron-userland/electron-builder/issues/5552
    const plugIn = path.join(__dirname, "../PlugIns");
    if (!fse.existsSync(plugIn)) {
      console.log("### Safari extension not found - skipping");
    } else {
      if (!fse.existsSync(path.join(appPath, "Contents/PlugIns"))) {
        fse.mkdirSync(path.join(appPath, "Contents/PlugIns"));
      }
      fse.copySync(
        path.join(plugIn, "safari.appex"),
        path.join(appPath, "Contents/PlugIns/safari.appex"),
      );
      shouldResign = true;
    }
  }

  if (shouldResign) {
    // Resign to sign safari extension
    if (context.electronPlatformName === "mas") {
      const masBuildOptions = deepAssign(
        {},
        context.packager.platformSpecificBuildOptions,
        context.packager.config.mas,
      );
      if (context.targets.some((e) => e.name === "mas-dev")) {
        deepAssign(masBuildOptions, {
          type: "development",
        });
      }
      if (context.packager.packagerOptions.prepackaged == null) {
        await context.packager.sign(appPath, context.appOutDir, masBuildOptions, context.arch);
      }
    } else {
      await context.packager.signApp(context, true);
    }
  }

  if (macBuild) {
    // Upstream assumes CI always supplies Apple credentials. A local build - or any
    // build made with signing switched off - has none, and notarization then fails
    // the whole package. Skip it instead: an unsigned .app is a valid local artifact.
    const signingDisabled = process.env.CSC_IDENTITY_AUTO_DISCOVERY === "false";
    const hasCredentials =
      !!process.env.APP_STORE_CONNECT_TEAM_ISSUER ||
      !!(process.env.APPLE_ID_USERNAME || process.env.APPLEID);
    if (signingDisabled || !hasCredentials) {
      console.log("### Skipping notarization - no Apple credentials in the environment");
      return;
    }

    console.log("### Notarizing " + appPath);
    if (process.env.APP_STORE_CONNECT_TEAM_ISSUER) {
      const appleApiIssuer = process.env.APP_STORE_CONNECT_TEAM_ISSUER;
      const appleApiKey = process.env.APP_STORE_CONNECT_AUTH_KEY_PATH;
      const appleApiKeyId = process.env.APP_STORE_CONNECT_AUTH_KEY_ID;
      return await notarize({
        tool: "notarytool",
        appPath: appPath,
        appleApiIssuer: appleApiIssuer,
        appleApiKey: appleApiKey,
        appleApiKeyId: appleApiKeyId,
      });
    } else {
      const appleId = process.env.APPLE_ID_USERNAME || process.env.APPLEID;
      const appleIdPassword = process.env.APPLE_ID_PASSWORD || `@keychain:AC_PASSWORD`;
      return await notarize({
        tool: "notarytool",
        appPath: appPath,
        teamId: "958AT6N3BC",
        appleId: appleId,
        appleIdPassword: appleIdPassword,
      });
    }
  }
}
