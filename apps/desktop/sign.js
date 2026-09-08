/* eslint-disable @typescript-eslint/no-require-imports, no-console */
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Windows code signing for QLine Vaults.
 *
 * Upstream signs with azuresigntool against an Azure Key Vault. QLine signs with
 * an EV certificate on a SafeNet hardware token, so this shells out to signtool
 * the same way Sign-QLineBinary.ps1 does for the other QLine binaries.
 *
 * Required, set on the signing machine (BOARDS):
 *   ELECTRON_BUILDER_SIGN=1        turns signing on at all
 *   QLINE_SIGN_THUMBPRINT=<sha1>   which certificate, no spaces
 *
 * The token PIN is typed into the SafeNet prompt. It is never stored here.
 *
 * NOTE: three wrong PIN entries lock the token PERMANENTLY. Enable SafeNet
 * "single logon" before a build, or every file signed will prompt again and a
 * mistyped PIN part-way through a 300-file build is an expensive way to lose a
 * certificate.
 */
function findSigntool() {
  const roots = [
    "C:\\Program Files (x86)\\Windows Kits\\10\\bin",
    "C:\\Program Files\\Windows Kits\\10\\bin",
  ];
  const found = [];
  const walk = (dir, depth) => {
    if (depth > 3) return;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (e.name.toLowerCase() === "signtool.exe" && p.includes("x64")) found.push(p);
    }
  };
  roots.forEach((r) => walk(r, 0));
  if (found.length === 0) {
    throw new Error("signtool.exe not found - install the Windows SDK signing tools");
  }
  return found.sort().reverse()[0];
}

exports.default = async function (configuration) {
  if (parseInt(process.env.ELECTRON_BUILDER_SIGN) !== 1) {
    return;
  }
  const thumbprint = process.env.QLINE_SIGN_THUMBPRINT;
  if (!thumbprint) {
    throw new Error(
      "QLINE_SIGN_THUMBPRINT is not set. Plug in the token and run:\n" +
        "  Get-ChildItem Cert:\\CurrentUser\\My | " +
        "Where-Object { $_.EnhancedKeyUsageList.FriendlyName -contains 'Code Signing' }",
    );
  }

  console.log(`[*] Signing ${configuration.path}`);
  child_process.execFileSync(
    findSigntool(),
    [
      "sign",
      "/sha1",
      thumbprint.replace(/\s/g, ""),
      "/fd",
      "SHA256",
      // Without a timestamp the signature stops being trusted the day the
      // certificate expires, including on copies already installed.
      "/tr",
      "http://timestamp.sectigo.com",
      "/td",
      "SHA256",
      "/d",
      "QLine Vaults",
      configuration.path,
    ],
    { stdio: "inherit" },
  );
};
