# Chrome Web Store: Privacy tab, permission justifications

For manifest version 1.3.0. Paste each block into the matching box. Limit is 1,000 characters each.

Two boxes are empty and required: `scripting` and `activeTab`. Two already have text that is now
false or imprecise and must be replaced: `storage` and `Host permission`.

---

## scripting justification  (EMPTY - required)

The extension calls chrome.scripting.executeScript for one purpose: to inject its own content script into a tab that does not already have it.

A content script declared in the manifest is only injected into pages loaded after the extension is installed or updated. Tabs the user already had open are inert, so clicking the toolbar icon in them did nothing and users reported the extension as broken. The service worker now sends a PING message to the tab first and calls executeScript only when nothing answers.

It injects our own bundled content.js file, listed in the "files" parameter. It never executes a code string, never uses remotely hosted or generated code, and only ever runs after the user invokes the extension by clicking the toolbar icon, choosing one of our context menu items, or pressing one of our keyboard shortcuts.

---

## activeTab justification  (EMPTY - required)

activeTab gives the extension temporary access to the single tab the user has just acted on, and only for the duration of that action.

It is what allows chrome.scripting.executeScript to inject our content script into a tab that was open before the extension was installed. Chrome grants activeTab on exactly the three gestures this extension supports: clicking the toolbar icon, choosing one of our context menu items, and pressing one of our keyboard shortcuts.

activeTab was chosen deliberately in place of a broad host_permissions entry. The extension holds no standing access to any site. Until the user actively invokes it on a specific tab, it can read nothing and change nothing.

---

## storage justification  (REPLACE - the current text describes a removed feature)

The extension stores exactly one user preference: whether transform animations are enabled. It is written to chrome.storage.sync so the setting follows the user across their signed-in Chrome profile, and read back when the control panel loads. The stored value is a single boolean.

No browsing history, page content, URLs, form data or personal information is stored. Nothing is transmitted anywhere: the extension makes no network requests of any kind.

The previously submitted justification for this permission described storing a "Whitelist" of sites. That feature has been removed in this version and the extension no longer stores anything of the kind.

---

## Host permission justification  (REPLACE - the current text is imprecise)

The <all_urls> match pattern appears only in the content_scripts field. This extension declares no host_permissions entry at all.

It is a general purpose page transform tool: the user points at any element on any page and flips, rotates or zooms it using a CSS transform. There is no finite list of sites that could be named instead, because the site the user wants to fix is whichever one they are looking at.

The content script attaches event listeners and applies CSS transforms to the page. It does not read page text, form data, cookies or credentials, and it transmits nothing. The extension makes no network requests.

Host access for injecting into tabs that were already open comes from activeTab on a user gesture, not from a standing host permission.

---

## Are you using remote code?

No, I am not using remote code.

Everything the extension runs is bundled in the uploaded package. There is no remote script tag, no
eval of fetched text, and no network request of any kind.
