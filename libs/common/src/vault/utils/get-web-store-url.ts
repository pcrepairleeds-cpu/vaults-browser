import { DeviceType } from "../../enums";

/**
 *  Returns the web store URL for the QLine Vaults browser extension.
 *
 *  QLine Vaults ships a Chrome extension only, so every browser gets the same
 *  listing. Do not restore the per-browser upstream URLs: sending staff to
 *  Bitwarden's own listing installs Bitwarden, which connects to our server
 *  quite happily and then shows Bitwarden branding throughout.
 */
export const getWebStoreUrl = (_deviceType: DeviceType): string =>
  "https://chromewebstore.google.com/detail/qline-vaults/gmagkeeimjghckmnjmfeaeaddifpkhfh";
