# Known Limitations

Known bugs, technical debt and edge cases. Read this before reporting something as new.
Every entry maps to a ROADMAP.md ID. If you find something not listed here, add it to ROADMAP.md
first, then add it here.

Last reviewed: 2026-09-09

## Known bugs

| ID | Symptom | Cause | Status |
|---|---|---|---|
| EXT-01 | Extension does nothing on tabs that were open before it was installed | Manifest declared content scripts only inject into pages loaded after install. `tabs.sendMessage` rejects and the rejection is swallowed | Open, P0 |
| EXT-02 | No feedback at all when the extension cannot run on a page | Nothing catches or surfaces the injection failure | Open, P0 |
| EXT-03 | After an extension update, open tabs hold an orphaned content script whose `chrome.runtime` handle is invalidated | MV3 lifecycle. Same class as EXT-01, different trigger | Open, P1 |
| EXT-04 | Whitelist cannot be configured by any user | No options page exists, and `Panel.tsx` never renders the `onOpenSettings` control it receives | Open, P0. **Resolution is removal, not a UI.** See DECISIONS.md D10 |
| EXT-12 | `animationsEnabled` has no user interface either | Same missing settings surface | Open, P1 |
| EXT-05 | `window.open` fallback in the `OPEN_SETTINGS` handler would throw | `window` is undefined in an MV3 service worker | Open, P2, unreachable in practice |
| EXT-06 | Page view jumps when rotating or zooming a page that is already flipped | Scroll correction in `applyTransformToElement` runs on every apply, not only on flip transition, so it re-inverts each time | Open, P1 |
| EXT-07 | Typing the letter r or h into a page input while the panel is open resets transforms or toggles the full page panel | `PanelContainer` keydown listener is on `document` in capture phase with no input guard | Open, P1 |
| EXT-11 | Published package contains 207 KB of dead popup code | Build still emits `main.js` and `index.html` from the popup UI deleted in `3e2084a` | Open, P0 |
| WEB-01 | Every "Add to Chrome" button on the marketing site goes to the store homepage, not our listing | Five hardcoded `https://chrome.google.com/webstore` URLs. Our extension ID appears nowhere in the repo | Open, P0 |
| WEB-02 | Live site requests `/index.css` and gets a 404 on every page load | Absolute path in `website/index.html` to a file that does not exist. Vite does not rewrite it | Open, P1 |

## Design debt

| ID | Debt | Consequence |
|---|---|---|
| EXT-08 | `ActionType` and `TargetScope` are declared three times: `types.ts`, `background.ts`, `src/content/content.tsx` | Adding a message type in one place only produces a silent no-op. `types.ts` has already drifted: it lacks the `zoom` field `content.tsx` added to `TransformState` |
| EXT-09 | Zoom is sent as `ActionType.ROTATE` with a `{zoom}` payload | Works only because a special case is checked before the action switch. The action name lies about what it does |
| EXT-10 | `GET_STATE` and `UPDATE_SETTINGS` fall through to `applyTransform` before the `GET_STATE` branch responds | Re-applies the current transform as a side effect of a read. Harmless today because the values are unchanged |
| REL-01 | `extension.zip` is committed to git and also built by CI | Two sources of truth. They have already diverged once: the committed copy was rebuilt in `ddef884` with different internal timestamps |
| QA-02 | Zero automated tests | Every regression is caught by a human or by a user |

## Edge cases and platform constraints

**Pages we can never run on.** No amount of engineering changes these. EXT-02 exists to explain
them to the user rather than fix them.

- `chrome://` and `chrome-extension://` pages
- `edge://` and other browser internal schemes
- The Chrome Web Store itself, both `chromewebstore.google.com` and `chrome.google.com/webstore`
- `view-source:` and `about:` pages
- `file://` URLs unless the user enables "Allow access to file URLs" for this extension
- Chrome's built in PDF viewer
- Cross origin iframes, unless `all_frames` is enabled, which it currently is not

**Transform behaviour.**

- CSS transforms have no effect on inline elements. `applyTransformToElement` forces
  `display: inline-block` as a workaround, which can subtly change layout on the host page.
- Rotating an element inside a container with `overflow: hidden` clips its corners. This is CSS
  behaviour, not a bug we can fix without altering the host page's layout.
- Page scope transforms mutate `document.body` styles: `min-height`, `overflow` and
  `transform-origin`. On a reset these are cleared to empty string, which restores the stylesheet
  value but will not restore an inline value the page itself had set.
- Elements inside a Shadow DOM on the host page are not reachable by `elementsFromPoint` in the way
  `getSmartTarget` expects, so selection may pick the shadow host instead of the intended child.

**State behaviour.**

- Element transform state lives in a `WeakMap`. If a single page application replaces the node, the
  transform is lost and the state is garbage collected. This is intentional, see DECISIONS.md.
- `pageState` is module scoped, so it resets on navigation but survives panel close and reopen.
- An invalid `whitelistRegex` fails open, meaning the extension stays enabled. This is deliberate,
  so a typo cannot silently disable the product everywhere. Moot once EXT-04 removes the feature.

## Store and listing gaps

| ID | Gap |
|---|---|
| STORE-01 | Store privacy policy URL lands on the marketing homepage, not the policy |
| STORE-02 | Zoom slider is implemented and shipped but is not mentioned in the listing |
| STORE-03 | Listing advertises whitelist support that no user can reach. Copy must be removed in the same release as EXT-04 |
| DOC-02 | No `LICENSE` file exists, while the website and store listing both claim open source |
| WEB-03 | Website claims version 2.0 while the store ships 1.0.0 |
| WEB-04 | Privacy policy says no usage analytics while the page itself runs GA4 and Microsoft Clarity |

## Non issues

Things that look wrong and are not. Do not "fix" these. See DECISIONS.md for the reasoning.

- Shadow host attached to `document.documentElement` rather than `body`.
- React 19 in the extension and React 18.3.1 on the website.
- The content script build using IIFE format instead of ESM.
- `typeof chrome !== 'undefined'` guards throughout the content script.
- Context menu invocations using `ELEMENT` scope while keyboard shortcuts use `PAGE` scope.
