import { MenuItemConstructorOptions, app } from "electron";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { UrlType } from "@bitwarden/common/platform/misc/safe-urls";

import { SafeShell } from "../../platform/main/safe-shell.main";
import { DesktopSettingsService } from "../../platform/services/desktop-settings.service";
import { isMacAppStore, isWindowsStore } from "../platform-utils.main";

import { AboutMenu } from "./menu.about";
import { IMenubarMenu } from "./menubar";

export class HelpMenu implements IMenubarMenu {
  readonly id: string = "help";

  get label(): string {
    return this.localize("help");
  }

  get items(): MenuItemConstructorOptions[] {
    const items = [
      this.helpAndFeedback,
      this.fileBugReport,
      this.legal,
      this.separator,
      this.goToWebVault,
      this.separator,
      this.getMobileApp,
      this.getBrowserExtension,
      this.separator,
      this.troubleshooting,
    ];

    if (this.aboutMenu != null) {
      items.push(...this.aboutMenu.items);
    }
    return items;
  }

  constructor(
    private i18nService: I18nService,
    private messagingService: MessagingService,
    private desktopSettingsService: DesktopSettingsService,
    private webVaultUrl: string,
    private hardwareAccelerationEnabled: boolean,
    private aboutMenu: AboutMenu,
    private shell: SafeShell,
  ) {}

  private get helpAndFeedback(): MenuItemConstructorOptions {
    return {
      id: "helpAndFeedback",
      label: this.localize("helpAndFeedback"),
      click: () =>
        this.shell.openExternal(
          "mailto:support@qlineit.com?subject=QLine%20Vaults%20help",
          UrlType.WebUrl,
        ),
    };
  }

  private get fileBugReport(): MenuItemConstructorOptions {
    return {
      id: "fileBugReport",
      label: this.localize("fileBugReport"),
      click: () =>
        this.shell.openExternal(
          "mailto:support@qlineit.com?subject=QLine%20Vaults%20issue",
          UrlType.WebUrl,
        ),
    };
  }

  private get legal(): MenuItemConstructorOptions {
    return {
      id: "legal",
      label: this.localize("legal"),
      visible: isMacAppStore(),
      submenu: this.legalSubmenu,
    };
  }

  private get legalSubmenu(): MenuItemConstructorOptions[] {
    return [
      {
        id: "privacyPolicy",
        label: this.localize("privacyPolicy"),
        click: () =>
          this.shell.openExternal(
            "https://github.com/pcrepairleeds-cpu/vaults-browser/blob/qline-vaults-branding/PRIVACY.md",
            UrlType.WebUrl,
          ),
      },
    ];
  }

  private get separator(): MenuItemConstructorOptions {
    return { type: "separator" };
  }

  private get goToWebVault(): MenuItemConstructorOptions {
    return {
      id: "goToWebVault",
      label: this.localize("goToWebVault"),
      click: () => this.shell.openExternal(this.webVaultUrl, UrlType.WebUrl),
    };
  }

  private get getMobileApp(): MenuItemConstructorOptions {
    return {
      id: "getMobileApp",
      label: this.localize("getMobileApp"),
      visible: !isWindowsStore(),
      submenu: this.getMobileAppSubmenu,
    };
  }

  private get getMobileAppSubmenu(): MenuItemConstructorOptions[] {
    return [
      {
        id: "android",
        label: "Android",
        visible: !isMacAppStore(), // Apple Guideline 2.3.10 - Accurate Metadata
        click: () =>
          this.shell.openExternal(
            "https://play.google.com/store/apps/details?id=uk.qlineit.vaults",
            UrlType.WebUrl,
          ),
      },
    ];
  }

  private get getBrowserExtension(): MenuItemConstructorOptions {
    return {
      id: "getBrowserExtension",
      label: this.localize("getBrowserExtension"),
      visible: !isWindowsStore(),
      submenu: this.getBrowserExtensionSubmenu,
    };
  }

  private get getBrowserExtensionSubmenu(): MenuItemConstructorOptions[] {
    // QLine Vaults ships a Chrome extension only. Edge and Opera install from
    // the Chrome Web Store; Firefox and Safari are not supported, so they are
    // not offered rather than pointed at somebody else's add-on.
    return [
      {
        id: "chrome",
        label: "Chrome, Edge and Opera",
        click: () =>
          this.shell.openExternal(
            "https://chromewebstore.google.com/detail/qline-vaults/" +
              "gmagkeeimjghckmnjmfeaeaddifpkhfh",
            UrlType.WebUrl,
          ),
      },
    ];
  }

  private get troubleshooting(): MenuItemConstructorOptions {
    return {
      id: "troubleshooting",
      label: this.localize("troubleshooting"),
      submenu: this.troubleshootingSubmenu,
    };
  }

  private get troubleshootingSubmenu(): MenuItemConstructorOptions[] {
    return [
      {
        id: "hardwareAcceleration",
        label: this.localize(
          this.hardwareAccelerationEnabled
            ? "disableHardwareAccelerationRestart"
            : "enableHardwareAccelerationRestart",
        ),
        click: async () => {
          await this.desktopSettingsService.setHardwareAcceleration(
            !this.hardwareAccelerationEnabled,
          );
          // `app.relaunch` crashes the app on Mac Store builds. Disabling it for now.
          // https://github.com/electron/electron/issues/41690
          if (!isMacAppStore()) {
            app.relaunch();
          }
          app.exit();
        },
      },
      {
        id: "downloadDiagnosticReport",
        label: this.localize("downloadDiagnosticReport"),
        click: () => this.messagingService.send("openTroubleshootingDialog"),
      },
    ];
  }

  private localize(s: string) {
    return this.i18nService.t(s);
  }
}
