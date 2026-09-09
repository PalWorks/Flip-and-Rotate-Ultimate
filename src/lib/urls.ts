import { InjectionFailure } from '../../types';

/**
 * URL prefixes no extension can ever inject into, regardless of permissions.
 * Telling a user to refresh one of these would send them into a loop, so EXT-02
 * shows a different message for them.
 */
const RESTRICTED_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'chrome-untrusted://',
  'devtools://',
  'edge://',
  'about:',
  'view-source:',
  'data:',
  'blob:',
];

const RESTRICTED_HOSTS = [
  'chromewebstore.google.com',
  'chrome.google.com/webstore',
];

export function isRestrictedUrl(url: string | undefined): boolean {
  // An unknown URL is deliberately NOT treated as restricted. Skipping injection
  // on an unknown URL would break the extension on ordinary pages, which is a
  // worse failure than attempting an injection that then fails cleanly.
  if (!url) return false;
  const lower = url.toLowerCase();
  if (RESTRICTED_PREFIXES.some((p) => lower.startsWith(p))) return true;
  return RESTRICTED_HOSTS.some((h) => lower.includes(h));
}

export function classifyInjectionFailure(url: string | undefined): InjectionFailure {
  return isRestrictedUrl(url) ? InjectionFailure.RESTRICTED : InjectionFailure.UNAVAILABLE;
}

export const FAILURE_MESSAGES: Record<InjectionFailure, string> = {
  [InjectionFailure.RESTRICTED]:
    "Flip & Rotate can't run on this page. Chrome blocks extensions on browser and Web Store pages.",
  [InjectionFailure.UNAVAILABLE]:
    'Please refresh this page for Flip & Rotate to work here.',
};
