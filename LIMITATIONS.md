# Known Limitations

Known bugs, technical debt and edge cases. Read this before reporting something as new.
Every entry maps to a ROADMAP.md ID. If you find something not listed here, add it to ROADMAP.md
first, then add it here.

Last reviewed: 2026-09-09, after the 1.3.0 execution

## Known bugs

**None currently open.** Every bug listed at the 2026-09-09 audit was fixed in 1.3.0.

### Resolved in 1.3.0

| ID | Was | Fixed by |
|---|---|---|
| EXT-01 | Did nothing on tabs opened before install | PING probe then `scripting.executeScript` under `activeTab` |
| EXT-02 | Silent failure with no feedback | Tab scoped badge and tooltip, two distinct messages |
| EXT-03 | Orphaned content script after an extension update | Per page instance marker with an `AbortController` teardown |
| EXT-04 | Whitelist unreachable by any user | Feature removed. See DECISIONS.md D10 |
| EXT-05 | `window.open` fallback would throw in a service worker | Removed with the whole `OPEN_SETTINGS` path |
| EXT-06 | View jumped when transforming an already flipped page | Scroll correction runs only on the flip transition |
| EXT-07 | Typing `r` in a page input reset transforms | Guarded on inputs, contenteditable, IME and modifiers |
| EXT-11 | 952 KB of store artwork shipped inside the package | Artwork moved to `store-assets/`, outside `public/` |
| WEB-01 | Every install button went to the store homepage | One `STORE_URL` constant pointing at the listing |
| WEB-02 | `/index.css` 404 on every page load | Link and the dead importmap removed |

## Design debt

**None currently open.** All resolved in 1.3.0.

| ID | Was | Resolved by |
|---|---|---|
| EXT-08 | `ActionType` declared three times, already drifted | One copy in `types.ts`, imported by both sides |
| EXT-09 | Zoom rode on `ActionType.ROTATE` with a `{zoom}` payload | `ActionType.ZOOM` |
| EXT-10 | `GET_STATE` re-applied the transform as a side effect | Read path returns before dispatch |
| REL-01 | `extension.zip` committed and also built by CI | Untracked. CI is the only producer |
| QA-02 | Zero automated tests | Vitest, 36 tests over `src/lib`, gating every release in CI |

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
- Per site control is now Chrome's own Site access setting rather than anything we implement.
  Point users at `chrome://extensions` for it.

## Store and listing gaps

**All four were submitted on 2026-09-09 and are awaiting Google review.** They remain listed until
the new listing is live, because a rejection sends them back. Submitted copy is in
**STORE_LISTING_COPY.md**.

| ID | Gap | State |
|---|---|---|
| STORE-01 | Privacy policy URL pointed at the marketing homepage, not the policy | Submitted |
| STORE-02 | Zoom slider shipped but unmentioned in the listing | Submitted |
| STORE-03 | Listing advertised whitelist support that the code no longer has | Submitted |
| STORE-04 | Listing name carried the ampersand and none of the search keywords | Submitted |
| STORE-05 | **Store artwork still renders "FLIP & ROTATE ULTIMATE" and screenshots show the old panel header.** Deferred by the owner 2026-09-09 | **Open** |

## Non issues

Things that look wrong and are not. Do not "fix" these. See DECISIONS.md for the reasoning.

- Shadow host attached to `document.documentElement` rather than `body`.
- React 19 in the extension and React 18.3.1 on the website.
- The content script build using IIFE format instead of ESM.
- `typeof chrome !== 'undefined'` guards throughout the content script.
- Context menu invocations using `ELEMENT` scope while keyboard shortcuts use `PAGE` scope.
- The `PING` message type, which exists only so the worker can decide whether to inject.
- The instance marker on `window`, which is how an orphaned script is torn down.
