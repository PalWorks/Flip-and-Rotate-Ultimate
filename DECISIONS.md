# Decision Records

Why things are the way they are. Read this before changing something that looks wrong.
Each record states the decision, the reason, and what would make us revisit it.

---

## D1: The panel's Shadow DOM host attaches to `document.documentElement`, not `body`

**Decision.** `mountPanel` appends the shadow host to `document.documentElement`.

**Reason.** Page scope transforms are applied to `document.body`. A panel mounted inside `body`
would be rotated and flipped along with the page it is supposed to be controlling, which makes it
unusable at exactly the moment the user needs it. Mounting one level up keeps the controls upright
regardless of what the page is doing.

**Trade off.** Slightly unusual placement that linters and reviewers may flag.

**Revisit if.** We move to a popup based UI, which would make the question moot. See ROADMAP v2 themes.

---

## D2: Element transform state lives in a `WeakMap`, not a `Map`

**Decision.** `elementStates: WeakMap<HTMLElement, TransformState>`.

**Reason.** Single page applications create and destroy DOM nodes continuously. A `Map` keyed by
element would hold a strong reference to every element the user ever selected, preventing garbage
collection for the lifetime of the tab. On a long lived tab in a heavy application this is an
unbounded leak. The store listing and the site both advertise "Memory Safe (WeakMap)".

**Trade off.** Transform state is silently lost when a framework replaces the node. The user sees
their rotation disappear on re-render. We accept this: a lost transform is recoverable in one click,
a leaked tab is not.

**Revisit if.** We implement persistent per site transforms (a v2 candidate), which needs a
durable store keyed by selector rather than by node identity.

---

## D3: The content script is built as an IIFE, in a separate Vite pass

**Decision.** Two build passes. `vite.config.ts` emits `background.ts` as ESM.
`vite.content.config.ts` emits `src/content/content.tsx` as a single IIFE with
`inlineDynamicImports: true`.

**Reason.** MV3 service workers support `type: "module"` and benefit from ESM. Content scripts do
not: they cannot use ESM imports and must be a single self contained file. One config cannot satisfy
both. The second pass sets `emptyOutDir: false` so it does not delete the first pass output.

**Trade off.** Build order matters and is not enforced by tooling. Running the content build alone
silently produces a `dist/` with no service worker. `scripts/verify-build.js` exists partly to catch
this class of mistake.

**Revisit if.** Chrome ever supports ESM content scripts.

---

## D4: `ActionType` and `TargetScope` are inlined into `background.ts` and `content.tsx`

**Decision.** Both files declare their own copy of the enums rather than importing from `types.ts`.

**Reason.** Recorded honestly: this was a workaround for import resolution problems during the
initial build setup, not a considered design. The comment in both files reads "Inlined from types.ts
to avoid import issues".

**Consequence.** `types.ts` is now orphaned and has already drifted. It lacks the `zoom` field that
`content.tsx` added to `TransformState`. Adding a message type requires editing three files, and
editing only one produces a silent no-op.

**Status.** This is debt, not a decision to preserve. EXT-08 exists to undo it. Both build passes
bundle their entry point, so a shared import will inline correctly at build time and the original
concern no longer applies.

---

## D5: Context menu invocations use `ELEMENT` scope, keyboard shortcuts use `PAGE` scope

**Decision.** `background.ts` sends `TargetScope.ELEMENT` for context menu clicks and
`TargetScope.PAGE` for keyboard commands.

**Reason.** A context menu click carries an unambiguous pointer position, and the `contextmenu` DOM
listener has already cached `lastClickedElement` via `getSmartTarget`. A keyboard shortcut carries
no position, so there is no defensible way to guess which element the user meant. Defaulting to the
whole page is the predictable behaviour.

**Trade off.** The same `ActionType` produces different results depending on how it was invoked,
which surprises people reading `background.ts` in isolation.

**Revisit if.** We add a persistent "current selection" concept, in which case keyboard shortcuts
should act on the selection when one exists and fall back to page scope when none does.

---

## D6: An invalid whitelist regex fails open

**Decision.** `isWhitelisted()` catches a `RegExp` constructor throw, logs, and returns `true`.

**Reason.** A typo in a user supplied regex should not silently disable the product on every site
with no explanation. Failing open means the worst case of a bad regex is that filtering stops
working, which is visible and diagnosable. Failing closed would look identical to the extension
being broken.

**Trade off.** A user who intended to restrict the extension gets it running everywhere instead.

**Superseded by D10.** The whitelist is recommended for removal, which makes this record
historical. Keep it so the fail open reasoning is preserved if the feature is ever revived.

---

## D7: `activeTab` plus `scripting`, rather than `host_permissions: ["<all_urls>"]`

**Decision.** For EXT-01, inject on demand using `activeTab` and `scripting`, triggered by the
user's own gesture. Do not request standing host permissions. **Shipped in 1.3.0.**

**Reason.** Verified against Chrome documentation on 2026-09-09: `activeTab` is granted by executing
an action, executing a context menu item, executing a keyboard shortcut from the commands API, or
accepting an omnibox suggestion, and it authorises `scripting.executeScript` on that tab when the
`scripting` permission is also declared. All three of our entry points are qualifying gestures, so
gesture scoped access is sufficient for every case we care about.

**Rejected alternative.** `host_permissions: ["<all_urls>"]` plus a blanket re-injection loop over
`chrome.tabs.query()` in `runtime.onInstalled`. This also works and heals tabs before the user acts.
Rejected because it requests standing access to every site the user visits in order to solve a
problem that only exists at the moment the user asks us to do something, and because broader
permissions invite a harder store review.

**Revisit if.** We ever need to act on a tab without a user gesture, for example restoring a saved
transform automatically on page load.

---

## D8: The extension makes no network calls, ever

**Decision.** No `fetch`, no `XMLHttpRequest`, no analytics, no telemetry in the extension. The only
outbound reference is `chrome.runtime.setUninstallURL`.

**Reason.** Both the Chrome Web Store listing and the privacy policy state that the extension runs
entirely locally and sends no user data anywhere. That is currently true and independently
verifiable from the source. It is a compliance commitment, not a preference.

**Note.** The marketing **website** does run Google Analytics 4 and Microsoft Clarity. That is a
separate product with a separate privacy posture. WEB-04 exists to make the policy state this
distinction clearly.

**Revisit if.** Never, without an explicit product decision and a corresponding store listing and
privacy policy update made first, in that order.

---

## D9: React 19 in the extension, React 18.3.1 on the website

**Decision.** Deliberately different major versions in the two `package.json` files.

**Reason.** They are independent products with independent build pipelines and no shared code. The
extension bundles React into `content.js` where size matters and modern APIs are useful. The website
was scaffolded earlier on 18.3.1 and has no reason to move.

**Trade off.** Looks like an oversight. It is not.

**Revisit if.** The two ever share components, which is not currently planned.

---

## D10: The whitelist is removed rather than given a user interface

**Decision.** Remove `whitelistRegex` entirely rather than build the options page that would make it
usable. **Confirmed by the product owner and shipped in 1.3.0.** Tracked as EXT-04. The matching
store listing copy change is STORE-03 and is still outstanding.

**Reason.** Chrome already provides per site extension control natively, at
`chrome://extensions` under Site access and from the icon's right click menu. That control is more
discoverable, is enforced by the browser rather than by our code, and actually prevents injection.
Our version does not: the gate sits inside the listener callbacks, so `content.js` is still injected
on every page, the stylesheet is still appended and all six capture phase listeners are still
attached. It saves nothing.

The implementation is also the wrong shape for the real need. It is an allow list. The realistic
user need, "stop this extension interfering with one specific site", requires a block list. Meeting
that need with an allow list would force the user to enumerate every site they do want and maintain
that list forever.

**Cost of removal.** Zero users are affected, because no interface has ever existed to set the value.
There is no migration.

**Cost of keeping.** An options page, plus a store claim we would then have to keep true, in exchange
for a worse version of a native browser feature.

**Revisit if.** We ever need site scoped behaviour that Chrome's own control cannot express, for
example per site saved transforms, which is a v2 candidate and would need a different data model
anyway.
