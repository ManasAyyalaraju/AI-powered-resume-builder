// Stable ID derived from the extension's fixed manifest key (extension/manifest.json)
// so it survives being reloaded/rebuilt during development.
export const EXTENSION_ID = 'aomocihaolmbpggelipjehmjjbhfacfi';

// The extension isn't published to the Chrome Web Store yet, so this points
// at `extension-release` - a branch kept as a pre-built, ready-to-load copy
// of the extension. GitHub serves any branch as a plain .zip with no git
// required, which is friendlier for a general visitor than the branch's own
// git-clone-based README (written for testers).
export const EXTENSION_DOWNLOAD_URL =
  'https://github.com/ManasAyyalaraju/refactr/archive/refs/heads/extension-release.zip';
