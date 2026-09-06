# QLine Vaults

This is a fork of [bitwarden/clients](https://github.com/bitwarden/clients),
rebranded as **QLine Vaults** for QLine IT (PC Repair Leeds LTD) and built by
Precinct Software.

**QLine Vaults is not associated with Bitwarden Inc. or the Bitwarden project.**

## What is different from upstream

Branding only. There are **no functional or cryptographic changes**:

- Application name, description and UI strings across all 63 locales
- Logo and toolbar icons
- Removal of menu entries advertising other Bitwarden products

The encryption, the protocol and the security model are Bitwarden's, unmodified.

## Licence

The browser extension is licensed **GPL-3.0**, as upstream. This repository is
public so that anyone who receives a build of QLine Vaults can obtain the
corresponding source, as GPL-3.0 requires.

Bitwarden's trademarks are not used in the built product. Code under
`/bitwarden_license` remains under the Bitwarden Licence and is not part of the
browser extension.

## Branches

- `main` — tracks upstream `bitwarden/clients` unmodified
- `qline-vaults-branding` — our changes

Upstream security fixes are absorbed by merging `upstream/main` into the
branding branch. **This must be done promptly** — a password manager running
behind on security fixes is worse than no rebrand at all.

## Contact

QLine IT — support@qlineit.com
