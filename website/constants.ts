/**
 * Single source of truth for outbound links.
 *
 * WEB-01: five components previously hardcoded
 * "https://chrome.google.com/webstore", which 301s to the Chrome Web Store
 * homepage rather than our listing. Every install call to action on the live
 * site was a dead end. Keep exactly one copy of this URL.
 */
export const STORE_URL =
  'https://chromewebstore.google.com/detail/flip-rotate-ultimate/nlbnapelehjkadekmfghljagafhbobhp';

export const GITHUB_URL = 'https://github.com/PalWorks/Flip-and-Rotate-Ultimate';

/** Keep in step with public/manifest.json. */
export const EXTENSION_VERSION = '1.3.0';
