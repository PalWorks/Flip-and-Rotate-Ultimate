import { describe, it, expect } from 'vitest';
import { isRestrictedUrl, classifyInjectionFailure, FAILURE_MESSAGES } from '../urls';
import { InjectionFailure } from '../../../types';

describe('isRestrictedUrl', () => {
  it.each([
    'chrome://extensions',
    'chrome://newtab',
    'chrome-extension://abcdef/options.html',
    'devtools://devtools/bundled/inspector.html',
    'edge://settings',
    'about:blank',
    'view-source:https://example.com',
  ])('treats %s as restricted', (url) => {
    expect(isRestrictedUrl(url)).toBe(true);
  });

  it('treats both Chrome Web Store hosts as restricted', () => {
    expect(isRestrictedUrl('https://chromewebstore.google.com/detail/abc')).toBe(true);
    expect(isRestrictedUrl('https://chrome.google.com/webstore/category/extensions')).toBe(true);
  });

  it.each([
    'https://example.com',
    'http://localhost:3000',
    'https://www.youtube.com/watch?v=abc',
    'file:///home/user/page.html',
  ])('treats %s as injectable', (url) => {
    expect(isRestrictedUrl(url)).toBe(false);
  });

  it('is case insensitive', () => {
    expect(isRestrictedUrl('CHROME://EXTENSIONS')).toBe(true);
  });

  // Deliberate. Skipping injection on an unknown URL would break the extension
  // on ordinary pages, which is a worse failure than attempting and failing.
  it('does not treat an unknown URL as restricted', () => {
    expect(isRestrictedUrl(undefined)).toBe(false);
    expect(isRestrictedUrl('')).toBe(false);
  });
});

describe('classifyInjectionFailure', () => {
  it('returns RESTRICTED for browser pages', () => {
    expect(classifyInjectionFailure('chrome://extensions')).toBe(InjectionFailure.RESTRICTED);
  });

  it('returns UNAVAILABLE for ordinary pages', () => {
    expect(classifyInjectionFailure('https://example.com')).toBe(InjectionFailure.UNAVAILABLE);
  });

  it('returns UNAVAILABLE when the URL is unknown', () => {
    expect(classifyInjectionFailure(undefined)).toBe(InjectionFailure.UNAVAILABLE);
  });
});

describe('FAILURE_MESSAGES', () => {
  it('only tells the user to refresh when refreshing can actually help', () => {
    expect(FAILURE_MESSAGES[InjectionFailure.UNAVAILABLE]).toMatch(/refresh/i);
    expect(FAILURE_MESSAGES[InjectionFailure.RESTRICTED]).not.toMatch(/refresh/i);
  });

  it('covers every failure reason', () => {
    for (const reason of Object.values(InjectionFailure)) {
      expect(FAILURE_MESSAGES[reason]).toBeTruthy();
    }
  });
});
