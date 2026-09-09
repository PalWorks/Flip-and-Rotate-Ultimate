import {
  ActionType,
  TargetScope,
  TransformPayload,
  InjectionFailure,
} from './types';
import { isRestrictedUrl, classifyInjectionFailure, FAILURE_MESSAGES } from './src/lib/urls';

const CONTENT_SCRIPT = 'content.js';
const DEFAULT_TITLE = 'Flip Control';

type InjectResult =
  | { ok: true; injected: boolean }
  | { ok: false; reason: InjectionFailure };

/**
 * EXT-01. A content script declared in the manifest is only injected into pages
 * loaded after install or update. Tabs the user already had open are inert, and
 * sendMessage to them rejects.
 *
 * Probe first, inject only on failure. Injecting blindly would duplicate every
 * DOM listener, re-append the stylesheet and orphan the existing overlays.
 *
 * Host access comes from activeTab, which Chrome grants for all three of our
 * entry points: action click, context menu item, and commands shortcut. That is
 * why no host_permissions entry is needed. See DECISIONS.md D7.
 */
async function ensureInjected(tabId: number, url?: string): Promise<InjectResult> {
  if (isRestrictedUrl(url)) {
    return { ok: false, reason: InjectionFailure.RESTRICTED };
  }

  try {
    await chrome.tabs.sendMessage(tabId, { type: ActionType.PING, scope: TargetScope.PAGE });
    return { ok: true, injected: false };
  } catch {
    // No receiver. Fall through and inject.
  }

  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: [CONTENT_SCRIPT] });
    return { ok: true, injected: true };
  } catch {
    return { ok: false, reason: classifyInjectionFailure(url) };
  }
}

/** EXT-02. Badge and tooltip are scoped to the tab so they never leak across tabs. */
async function reportFailure(tabId: number, reason: InjectionFailure): Promise<void> {
  try {
    await chrome.action.setBadgeText({ tabId, text: '!' });
    await chrome.action.setBadgeBackgroundColor({ tabId, color: '#f43f5e' });
    await chrome.action.setTitle({ tabId, title: FAILURE_MESSAGES[reason] });
  } catch {
    // The tab may have closed between the failure and this call. Nothing to do.
  }
}

async function clearFailure(tabId: number): Promise<void> {
  try {
    await chrome.action.setBadgeText({ tabId, text: '' });
    await chrome.action.setTitle({ tabId, title: DEFAULT_TITLE });
  } catch {
    // As above.
  }
}

/**
 * Single dispatch path for every entry point. Guarantees a content script is
 * present, or reports why it cannot be, before sending anything.
 */
async function dispatch(
  tabId: number,
  url: string | undefined,
  type: ActionType,
  scope: TargetScope,
  payload?: TransformPayload,
): Promise<void> {
  const result = await ensureInjected(tabId, url);

  if (!result.ok) {
    await reportFailure(tabId, result.reason);
    return;
  }

  await clearFailure(tabId);

  try {
    await chrome.tabs.sendMessage(tabId, { type, scope, payload });
  } catch {
    // The script was present a moment ago and is not now, e.g. the page
    // navigated mid dispatch. Surfacing a badge here would be noise.
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.setUninstallURL('https://palworks.github.io/Flip-and-Rotate-Ultimate/#/uninstall');

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'flip-root', title: 'Flip, Rotate and Mirror', contexts: ['all'] });

    const items: Array<[string, string]> = [
      ['flip-x', 'Flip Horizontally'],
      ['flip-y', 'Flip Vertically'],
      ['rotate-90', 'Rotate 90°'],
      ['rotate-180', 'Rotate 180°'],
      ['rotate-270', 'Rotate 270°'],
      ['reset', 'Reset Element'],
      ['open-panel', 'Show more settings'],
    ];

    for (const [id, title] of items) {
      chrome.contextMenus.create({ parentId: 'flip-root', id, title, contexts: ['all'] });
    }
  });
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) return;
  void dispatch(tab.id, tab.url, ActionType.OPEN_PANEL, TargetScope.PAGE);
});

chrome.runtime.onMessage.addListener((message: { type: ActionType }) => {
  if (message.type === ActionType.OPEN_EXT_MANAGEMENT) {
    chrome.tabs.create({ url: `chrome://extensions/?id=${chrome.runtime.id}` });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  let action: ActionType | null = null;
  let payload: TransformPayload = {};

  switch (info.menuItemId) {
    case 'flip-x':
      action = ActionType.FLIP_X;
      break;
    case 'flip-y':
      action = ActionType.FLIP_Y;
      break;
    case 'rotate-90':
      action = ActionType.ROTATE;
      payload = { degrees: 90, relative: true };
      break;
    case 'rotate-180':
      action = ActionType.ROTATE;
      payload = { degrees: 180, relative: true };
      break;
    case 'rotate-270':
      action = ActionType.ROTATE;
      payload = { degrees: 270, relative: true };
      break;
    case 'reset':
      action = ActionType.RESET;
      break;
    case 'open-panel':
      action = ActionType.OPEN_PANEL;
      break;
  }

  if (action) {
    void dispatch(tab.id, tab.url, action, TargetScope.ELEMENT, payload);
  }
});

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) return;

    let action: ActionType | null = null;
    let payload: TransformPayload = {};

    switch (command) {
      case 'flip-x':
        action = ActionType.FLIP_X;
        break;
      case 'flip-y':
        action = ActionType.FLIP_Y;
        break;
      case 'rotate':
        action = ActionType.ROTATE;
        payload = { degrees: 90, relative: true };
        break;
    }

    // Shortcuts carry no cursor position, so page scope is the only defensible
    // default. See DECISIONS.md D5.
    if (action) {
      void dispatch(tab.id, tab.url, action, TargetScope.PAGE, payload);
    }
  });
});

/** Clear a stale failure badge when the tab navigates. */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    void clearFailure(tabId);
  }
});
