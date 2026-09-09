# Roadmap

**This file is the single source of truth for all work on Flip and Rotate Ultimate.**
Every backlog item lives here. Do not open work that is not listed here. If you find something new,
add it here first with an ID, then do the work.

Last reviewed: 2026-09-09

---

---

## Master summary

**Read this table first.** Everything below is detail on these rows.

Last execution: 2026-09-09. Shipped as manifest version **1.3.0**, which delivers the v1.1.0,
v1.2.0 and v1.3.0 milestones together. 1.1.0 and 1.2.0 were never released separately.

| Phase | Milestone | Bucket focus | Items | Done | Open | Status | Exit criteria | Next action |
|---|---|---|---|---|---|---|---|---|
| **0** | Audit and documentation | DOC | 1 | 1 | 0 | **Complete** | Full doc set committed, every backlog item has an ID and acceptance criteria | Done |
| **1** | v1.1.0 Rating recovery | EXT, WEB, STORE | 8 | 6 | 2 | **Submitted 2026-09-09**, awaiting Google review | The advertised product is reachable | Wait for the review outcome |
| **2** | v1.2.0 Correctness | EXT, WEB, QA | 7 | 7 | 0 | **Complete** | No known user visible bug on the happy path | Done |
| **3** | v1.3.0 Hygiene | EXT, REL, WEB, STORE, QA, DOC | 13 | 10 | 3 | **Submitted 2026-09-09.** 1 decision outstanding | Debt paid down so v2 is cheap | Owner: decide REL-03. Wait for review |
| **4** | v2.0.0 Options page | EXT | 4 | 0 | 4 | **Scoped 2026-09-09** | Earns the "2.0" the website claimed | Resolve the EXT-14 network question first |

### Status by bucket

| Bucket | Meaning | Total | Done | Open | Open items |
|---|---|---|---|---|---|
| `EXT` | Extension code | 16 | 12 | 4 | EXT-13 to EXT-16, all v2.0.0 |
| `WEB` | Marketing website | 5 | 5 | 0 | none |
| `STORE` | Chrome Web Store dashboard, **owner action only** | 5 | 0 | 5 | STORE-01 to 04 **submitted 2026-09-09**. STORE-05 artwork deferred |
| `REL` | Release and CI process | 3 | 2 | 1 | REL-03 needs a decision |
| `QA` | Testing | 2 | 2 | 0 | none |
| `DOC` | Documentation | 2 | 2 | 0 | none |
| | **Total** | **33** | **23** | **10** | 4 submitted, 4 scoped for v2, 1 artwork task, 1 decision |

### Shipped in 1.3.0

| ID | What changed | Verified by |
|---|---|---|
| EXT-01 | Works on tabs opened before install. PING probe, then `scripting.executeScript` under `activeTab` | `dist/background.js` contains the probe and inject path | Open |
| EXT-02 | Tab scoped badge and tooltip, two distinct messages | Unit tested: we never tell a user to refresh a `chrome://` page | Open |
| EXT-03 | Per page instance marker tears down an orphaned script on update | `__flipRotateUltimateInstance` present in build | Open |
| EXT-04 | Whitelist removed entirely | Zero occurrences of `whitelist` in `dist/` | Open |
| EXT-05 | `window.open` fallback removed, `OPEN_SETTINGS` deleted | No options page needed | **Done** |
| EXT-06 | Scroll correction runs only on the flip transition | Manual QA regression step added | Open |
| EXT-07 | Hotkeys guarded on inputs, contenteditable, IME, modifiers | `isContentEditable` present in build | Open |
| EXT-08 | One copy of `ActionType` and `TargetScope` in `types.ts` | `tsc --noEmit` clean under `strict` | **Done** |
| EXT-09 | `ZOOM` is its own action type | No `{zoom}` payload on `ROTATE` | **Done** |
| EXT-10 | `GET_STATE` no longer re-applies the transform | Read path returns before dispatch | **Done** |
| EXT-11 | 952 KB of store artwork moved out of `public/` | `dist` is 264 KB, was ~1.2 MB | Open |
| EXT-12 | Animations toggle in the panel settings menu | Persists via `storage.sync` | Open |
| WEB-01 | Five CTAs behind one `STORE_URL` constant | Listing URL present in deployed bundle, zero old URLs | Open |
| WEB-02 | `/index.css` 404 and esm.sh importmap removed | Zero occurrences in built `index.html` | Open |
| WEB-03 | Version copy reads from `EXTENSION_VERSION` | Zero "2.0" claims remain | Open |
| WEB-04 | Privacy policy splits extension from website, names GA4, Clarity, Tally | Sections 2 and 3 | Open |
| WEB-05 | `website/.vite` untracked and ignored | | **Done** |
| REL-01 | `extension.zip` untracked. CI already builds it per tag | | **Done** |
| REL-02 | Stale `v1.0.1` tag deleted locally | Remote deletion needs a push | **Done** |
| QA-01 | Manual QA checklist extended with EXT-01, 02, 06, 07 regression steps | PLAYBOOK.md | Open |
| QA-02 | Vitest harness (36 tests) plus a Playwright end-to-end suite, 21 checks against real Chrome and live YouTube | `npm test`, `npm run test:e2e` | **Done** |
| DOC-01 | Full doc set updated to match shipped state | | **Done** |
| DOC-02 | MIT `LICENSE` added | Backs the open source claim the site already made | **Done** |

### Open, and why

**All four STORE items were submitted on 2026-09-09 and are awaiting Google review.** They stay
open until the listing goes live, because a rejection sends them back. The copy that was submitted
is in **STORE_LISTING_COPY.md**. REL-03 is the only item still needing a decision from the owner.

| ID | Blocked on | Action |
|---|---|---|
| STORE-01 | Google review | Privacy policy URL set to `.../#/privacy` | **Submitted 2026-09-09** |
| STORE-02 | Google review | Zoom slider added to the listing copy | **Submitted 2026-09-09** |
| STORE-03 | Google review | Whitelist claim removed from the description and the storage justification | **Submitted 2026-09-09** |
| STORE-04 | Google review | Renamed and the optimised summary and description pasted. Artwork refresh still deferred | **Submitted 2026-09-09** |
| STORE-05 | New artwork | Regenerate the 7 store images. They render "FLIP & ROTATE ULTIMATE" and the screenshots show the old panel header. Deferred by the owner 2026-09-09 | Open |
| REL-03 | A decision from the owner | Delete the abandoned `gh-pages` branch, or document why it stays | Needs a decision |

### Decisions taken

| # | Decision | Outcome |
|---|---|---|
| 1 | Remove the whitelist | **Confirmed and done.** See DECISIONS.md D10 |
| 2 | Licence | **MIT.** `LICENSE` added, DOC-02 |
| 3 | `graphify-out/` | **Gitignored** |
| 4 | Sequencing | EXT-08 pulled forward from v1.3.0 to first, so EXT-01 could add `PING` in one place instead of three |

---

## North star

> Flip and Rotate Ultimate should work, instantly and correctly, on whatever page the user is
> already looking at. Every feature we advertise should be reachable by a user who has never read
> the documentation.

Two thirds of the current backlog exists because we violate one half of that sentence or the other.
The extension does not work on tabs that were already open. The whitelist we advertise on the store
cannot be reached by anyone. Fixing those two things is the entire near term plan.

## Where we are

| Metric | Value | Source |
|---|---|---|
| Published version | 1.0.0. **1.3.0 submitted 2026-09-09, in review** | Chrome Web Store |
| Users | 3,000 | Chrome Web Store, checked 2026-09-09 |
| Rating | **3.9 from 7 ratings**, was 3.7 from 6 at the audit | Chrome Web Store, checked 2026-09-09 |
| Store category | Developer Tools | Chrome Web Store |
| Last store update | 2026-01-01. Update recency is a ranking signal, so this alone helps | Chrome Web Store |
| Last code commit | 2025-12-28 | git |
| Automated tests | None | repository |

## The rating hypothesis

The working theory for a 3.7 rating on an otherwise functional product:

1. User installs from the store.
2. User switches to a tab that was **already open** and clicks the toolbar icon.
3. Nothing happens. There is no content script in that tab and no error is shown.
4. User concludes the extension is broken and leaves a low rating.

A second, independent path to the same outcome:

1. Store listing advertises "Whitelist Support".
2. User looks for it. There is no options page and no settings UI at all.
3. User concludes the listing is misleading.

A third:

1. User finds us via the marketing site and clicks "Add to Chrome".
2. The button goes to the Chrome Web Store homepage, not our listing.
3. User never installs at all, and we never hear about it.

**EXT-01, EXT-02, EXT-04 and WEB-01 exist to close these three paths. They are the priority.**

**Confirmed 2026-09-09:** the six store ratings are bare star ratings with no written text, so there
is no qualitative feedback to test this against. The hypothesis therefore stands unfalsified rather
than proven. That is an argument for fixing all three paths rather than betting on one, which is how
Phase 1 is scoped. It is also an argument for adding a feedback path of our own so the next 3,000
users can tell us something more useful than a number.

---

## Milestones

| Milestone | Theme | Contains |
|---|---|---|
| **v1.1.0** Rating recovery | Make the advertised product actually reachable | EXT-01, EXT-02, EXT-04, EXT-11, WEB-01, WEB-04, STORE-01, STORE-03 |
| **v1.2.0** Correctness | Fix the real bugs behind the happy path | EXT-03, EXT-06, EXT-07, EXT-12, WEB-02, WEB-03, QA-01 |
| **v1.3.0** Hygiene | Pay down debt so v2 is cheap to build | EXT-05, EXT-08, EXT-09, EXT-10, REL-01, REL-02, REL-03, WEB-05, STORE-02, STORE-04, QA-02, DOC-01, DOC-02 |
| **v2.0.0** Options page | Give the extension a home for support, feedback, donations and diagnostics | EXT-13, EXT-14, EXT-15, EXT-16 |

---

## P0 backlog: ship in v1.1.0

### EXT-01 Work on tabs that were already open

> **DONE in 1.3.0.**

**Priority:** P0. This is the flagship item.

**Problem.** A content script declared in `manifest.json` is injected only into pages that load
**after** the extension is installed or updated. Every tab the user already had open has no content
script. `chrome.tabs.sendMessage` to those tabs rejects with
`Could not establish connection. Receiving end does not exist.` and we swallow it. The user sees
absolutely nothing happen. This affects all three entry points: toolbar icon, context menu and
keyboard shortcut.

**Is it bypassable?** Yes, completely, for every normal http and https page. It is not bypassable
for a small set of browser restricted URLs, which is what EXT-02 handles.

**Chosen approach: `activeTab` plus `scripting`, inject on demand.**

Verified against Chrome documentation on 2026-09-09:
- `activeTab` is granted by **all four** of: executing an action, executing a context menu item,
  executing a keyboard shortcut from the commands API, accepting an omnibox suggestion.
- Once granted, the extension may call `scripting.executeScript()` on that tab provided the
  `scripting` permission is also declared.

Every one of our entry points is a qualifying gesture, so we can inject exactly when the user asks
us to, and never before.

**Manifest change:**
```json
"permissions": ["contextMenus", "storage", "scripting", "activeTab"]
```

**Rejected alternative:** `host_permissions: ["<all_urls>"]` plus a blanket re-injection loop over
`chrome.tabs.query()` inside `runtime.onInstalled`. This works too and has the advantage of healing
tabs before the user acts. It was rejected because it requests standing access to every site when
gesture scoped access is sufficient, which is worse for users and invites a harder store review.
Revisit only if we ever need to act on a tab without a user gesture.

**Implementation sketch.** Add one shared helper in `background.ts` used by all three entry points:

```ts
async function ensureInjected(tabId: number): Promise<InjectResult> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: ActionType.PING });
    return { ok: true };                       // already present, do nothing
  } catch {
    try {
      await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
      return { ok: true, injected: true };
    } catch (err) {
      return { ok: false, reason: classifyInjectionFailure(err) };
    }
  }
}
```

Then every `chrome.tabs.sendMessage` call site becomes `await ensureInjected(tabId)` followed by the
existing send.

**Required companion changes:**
- Add `ActionType.PING` to the enum in all three places it is duplicated, or do EXT-08 first.
- Content script must answer `PING` synchronously so the probe resolves fast.
- Probe before inject, never inject blindly. Double injection would duplicate every DOM listener,
  re-append the stylesheet and orphan the previous overlays.

**Acceptance criteria:**
1. Open three tabs. Install the unpacked extension. Without refreshing any of them, the toolbar
   icon, a context menu item, and `Alt+Shift+X` each work on all three.
2. On a page loaded after install, exactly one `content.js` is present. Verify no duplicate
   listeners by checking a single click does not produce two selections.
3. On `chrome://extensions`, the failure is handled by EXT-02 and does not throw an unhandled
   rejection.
4. The install permission prompt is reviewed and the wording change, if any, is recorded in
   DECISIONS.md before release.

**Effort:** Medium. One helper, three call sites, one manifest change, one message type.

---

### EXT-02 Tell the user when we genuinely cannot run

> **DONE in 1.3.0.**

**Priority:** P0. Ships with EXT-01, useless without it.

**Problem.** Some URLs can never host a content script no matter what we do: `chrome://`,
`chrome-extension://`, `edge://`, `about:`, `view-source:`, the Chrome Web Store itself, and
`file://` unless the user has ticked "Allow access to file URLs". After EXT-01, these are the only
remaining failure cases, and today they still fail silently.

**Requirement from the product owner:** show a message rather than doing nothing.

**Important nuance.** The message must not be a single generic "please refresh". Refreshing a
`chrome://` page will never help, and telling a user to do something futile is worse than saying
nothing. Two distinct messages are needed:

| Condition | Message |
|---|---|
| Injection failed but URL is ordinary http or https | "Please refresh this page for Flip and Rotate to work here." |
| URL is a browser restricted page or the Web Store | "Flip and Rotate can't run on this page. Chrome blocks extensions on browser and Web Store pages." |

**Delivery mechanism.** We cannot render the React panel, because the absence of the content script
is precisely the problem. Options considered:

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Badge text plus `action.setTitle` | No new permission, always works | Easy to miss, tooltip needs a hover | Ship this first |
| `chrome.notifications` | Impossible to miss | Needs `notifications` permission, some users disable OS notifications | Add if badge proves too quiet |
| Convert action to a `default_popup` that always opens and reports status | Most robust, popup never depends on the page | Larger change, alters the click to open panel interaction | Consider for v2 |

Recommendation: badge plus title in v1.1.0, measure, escalate only if needed.

**Acceptance criteria:**
1. Clicking the icon on `chrome://extensions` sets a visible badge and a tooltip carrying the
   restricted page message.
2. Clicking the icon on a normal page that fails injection for any other reason produces the
   refresh message.
3. Badge clears on the next successful invocation and does not persist across tabs.
4. No unhandled promise rejections appear in the service worker console in either case.

**Effort:** Small, once EXT-01 lands.

---

### EXT-04 Remove the whitelist

> **DONE in 1.3.0.**

**Priority:** P0. **Status: recommended, pending product owner confirmation.**

**The question asked.** Is a whitelist required at all, and what is its use case?

**Analysis.** The feature gates the extension on a case insensitive regex tested against
`window.location.href`. Empty means enabled everywhere. Four arguments were considered and three of
them fail on inspection.

| Claimed use case | Does it hold? |
|---|---|
| Reduce the extension's footprint on sites you do not use it on | **No.** The gate is inside the listener callbacks. `content.js` is still injected on `<all_urls>`, the stylesheet is still appended, the hover overlay div is still created and all six capture phase listeners are still attached. The whitelist saves nothing |
| Stop the extension interfering with a specific site that it breaks | **No.** That needs a block list. This is an allow list. To silence one bad site you would have to write a regex enumerating every site you do want, and update it forever |
| Keep the context menu clean on irrelevant sites | **No.** The context menu is created once by the service worker and is global. The whitelist does not remove menu items |
| Prevent the extension activating on sensitive sites, such as banking | **Yes, but Chrome already does this better** |

**The decisive argument.** Chrome ships this natively and more discoverably. Right click the
extension icon, then "This can read and change site data", and choose "On click", "On specific
sites" or "On all sites". The same control is at `chrome://extensions` under Site access. It is a
browser level guarantee rather than an in page code path, users already know it, and it genuinely
prevents injection rather than merely gating message handling.

We are shipping a worse, invisible reimplementation of a native browser feature.

**Recommendation: remove it.** Supporting facts:

- No user can currently reach it, so removal breaks nobody. There is no migration to write.
- It is a store claim we cannot honour, which is a listing liability.
- It deletes a branch from `isWhitelisted()`, called on every message and on every hover and click
  while selection mode is active.
- After EXT-01 lands with `activeTab`, site access becomes gesture scoped anyway, which narrows the
  remaining need further.

**Scope if confirmed:**
1. Delete `isWhitelisted()` and its three call sites in `src/content/content.tsx`.
2. Remove `whitelistRegex` from `AppSettings` and `DEFAULT_SETTINGS` in all three declaration sites.
3. Change the `manifest.json` description. It currently reads "Includes context menu integration and
   whitelist support."
4. Remove the "Site Management: Whitelist Support" section from the store listing. Tracked as STORE-03.
5. Add a `DECISIONS.md` record so this is not reintroduced later by someone reading the old store copy.

**Acceptance criteria:**
1. No reference to `whitelistRegex` remains in the codebase.
2. `manifest.json` description makes no claim we cannot deliver.
3. Store listing copy updated in the same release, not after.
4. `README.md` configuration table no longer lists the setting.
5. `AppSettings` still carries `animationsEnabled`, which is a real setting and is handled by EXT-12.

**If the decision is instead to keep it,** the alternative scope is an options page exposing the
regex with inline validation, `options_page` declared in the manifest, and the settings menu item in
`Panel.tsx` wired to `OPEN_SETTINGS`. That is medium effort and, on the analysis above, buys a worse
version of something Chrome gives away.

**Effort:** Small if removing. Medium if keeping.

---

### EXT-11 Stop shipping dead code to users

> **DONE in 1.3.0.**

**Priority:** P0. Trivial fix, embarrassing if found by a reviewer.

**Problem.** Every published artifact, including the `v1.0.0` GitHub release asset that was verified
byte for byte, contains `main.js` (206,645 bytes) and `index.html` (670 bytes). These are the popup
UI that was deleted from source in commit `3e2084a`. They are roughly 45 percent of the uncompressed
payload and nothing references them. `manifest.json` does not mention either file.

**Cause.** The old popup entry was removed from source but the build config still emits it.

**Acceptance criteria:**
1. `npm run build` produces a `dist/` containing only files referenced by `manifest.json`.
2. `unzip -l extension.zip` lists no `main.js` and no `index.html`.
3. Packaged size drops materially. Record the before and after in CHANGELOG.md.

**Effort:** Small.

---

### WEB-01 Point the website at our actual store listing

> **DONE in 1.3.0.**

**Priority:** P0. Highest value to effort ratio in the entire backlog.

**Problem.** All five "Add to Chrome" calls to action on the live site link to
`https://chrome.google.com/webstore`, which 301 redirects to the Chrome Web Store homepage. None of
them link to our listing. The extension ID `nlbnapelehjkadekmfghljagafhbobhp` does not appear
anywhere in this repository. Every visitor who tries to install from the marketing site is dropped
on a generic store front page.

**Locations:** `website/components/Navbar.tsx` (2), `website/pages/Home.tsx` (2),
`website/components/Pricing.tsx` (1).

**Acceptance criteria:**
1. A single exported constant, for example `STORE_URL` in `website/constants.ts`, holds the listing
   URL. No component contains a hardcoded store URL.
2. All five calls to action resolve to the listing.
3. Verified against the deployed bundle after the Pages workflow completes, not just locally.

**Effort:** Small.

---

### WEB-04 Disclose website analytics in the privacy policy

> **DONE in 1.3.0.**

**Priority:** P0. Compliance exposure.

**Problem.** `website/pages/PrivacyPolicy.tsx` states "We do **not** collect usage analytics."
The page serving that statement loads Microsoft Clarity (`usr39i7vdz`) and Google Analytics 4
(`G-KWG7FB66QN`). Both are live and confirmed in the deployed HTML.

The claim is accurate about the **extension**, which makes no network calls at all. It is
inaccurate about the **website**. The policy does not currently distinguish the two.

**Acceptance criteria:**
1. Policy has two clearly separated sections: "The extension" and "This website".
2. The extension section keeps the existing no data claim, which is true and verifiable.
3. The website section names Clarity and GA4, states what they collect and links their policies.
4. Reviewed alongside STORE-01, because the store points at this page.

**Effort:** Small.

---

### STORE-01 Fix the store privacy policy link

**Priority:** P0. Dashboard edit, no code.

**Problem.** The store's Privacy Policy field is
`https://palworks.github.io/Flip-and-Rotate-Ultimate/`. Because the site uses a hash router, that
URL lands on the marketing homepage, not the policy. A user or reviewer looking for the policy sees
a sales page that is running two analytics trackers.

**Acceptance criteria:** field updated to `https://palworks.github.io/Flip-and-Rotate-Ultimate/#/privacy`
and confirmed to deep link correctly. Do this **after** WEB-04 is deployed.

**Effort:** Trivial.

---

### STORE-03 Align the store listing with what actually ships

**Priority:** P0. Dashboard edit, no code. Must ship in the same release as EXT-04.

**Problem.** The listing sells "Whitelist Support: Automatically enable or disable the extension on
specific websites." No user can reach it. If EXT-04 removes the feature, the copy must go with it in
the same release, not afterwards. Shipping code that contradicts a live listing is how extensions
attract review problems.

**Acceptance criteria:**
1. Whitelist claim removed from the listing and from the `manifest.json` description.
2. Every remaining claim re-read against the shipped build and confirmed true.
3. Permission rationale fields updated for `scripting` and `activeTab`, copied from SECURITY.md.

**Effort:** Trivial, but must be sequenced with EXT-04.

---

## P1 backlog: v1.2.0

### EXT-03 Survive extension updates on open tabs

> **DONE in 1.3.0.**

Same class of failure as EXT-01, different trigger. When the extension updates, content scripts
already running in open tabs are orphaned. Their `chrome.runtime` handle is invalidated and every
call throws `Extension context invalidated`. EXT-01's probe will fail for those tabs, so injection
will be attempted, which is correct, but the orphaned script is still in the page holding stale DOM
listeners and a stale panel.

**Acceptance criteria:** orphaned instance detects invalidation, removes its listeners, unmounts its
panel and clears its overlays before the new instance mounts. No duplicate panels after an update.

**Effort:** Medium. Do not start before EXT-01 is merged.

### EXT-06 Scroll correction fires on every apply

> **DONE in 1.3.0.**

`applyTransformToElement` inverts scroll position whenever `state.flipX` or `state.flipY` is true,
not only when the flip changes. Rotating or zooming a page that is already flipped re-inverts the
scroll each time, so the view jumps. Move the correction into the `FLIP_X` and `FLIP_Y` cases in
`applyTransform`, where the transition actually happens.

**Acceptance criteria:** flip the page, then rotate three times. Scroll position stays stable after
the initial flip.

### EXT-07 Panel hotkeys steal page typing

> **DONE in 1.3.0.**

`PanelContainer` registers a `keydown` listener on `document` in the capture phase and acts on bare
`r` and `h`. While the panel is open, typing the letter r into any page input resets the user's
transforms. Guard on `e.target` being an `input`, `textarea` or `contenteditable`, and on
`e.isComposing` for IME users.

**Acceptance criteria:** with the panel open, typing "rhubarb" into a page search box changes
nothing. The shortcuts still work when focus is on the page body.

### WEB-02 Remove the live 404 and the dead importmap

> **DONE in 1.3.0.**

The deployed page requests `/index.css`, which returns 404 on every page load. The file does not
exist and the absolute path would be wrong under the `/Flip-and-Rotate-Ultimate/` base in any case.
The page also ships an esm.sh importmap for React 18.3.1 that is redundant, because Vite bundles
React into `assets/index-*.js`.

**Acceptance criteria:** zero 404s in the network tab on a cold load of the deployed site.

### WEB-03 Stop claiming version 2.0

> **DONE in 1.3.0.**

`website/pages/Home.tsx` says "v2.0: The Ultimate Engineering Update" and
`website/components/Pricing.tsx` says "Version 2.0 • Compatible with Chrome v88+". The store ships
1.0.0. Correct the copy to match reality, or defer until a genuine 2.0 exists.

**Recommendation:** correct it now. Overstating the version on a page that links to a 1.0.0 listing
undermines trust at exactly the moment the visitor is deciding.

### EXT-12 Expose the animations toggle

> **DONE in 1.3.0.**

`animationsEnabled` is a real, working setting with no user interface. Once the whitelist is removed
under EXT-04 it is the only setting left, which makes a whole options page disproportionate.

Put a simple toggle in the panel's existing settings menu, next to "Shortcuts" and "Show Full Page
Options". More discoverable than an options page and a much smaller change.

**Acceptance criteria:** toggling it off removes the `flip-ext-transition` class path so transforms
apply instantly. The choice persists across page loads via `chrome.storage.sync`.

**Depends on:** EXT-04, for the decision on whether an options page is needed at all.

### QA-01 Manual QA checklist

> **DONE in 1.3.0.**

There are zero tests. Before adding a framework, write down what a human must verify before every
release. See PLAYBOOK.md for the checklist skeleton. This is a prerequisite for releasing EXT-01
safely, because EXT-01 changes behaviour on every page.

---

## P2 backlog: v1.3.0 hygiene

| ID | Item | Notes | Status |
|---|---|---|---|
| EXT-05 | Remove `window.open` fallback in the `OPEN_SETTINGS` handler | `window` is undefined in an MV3 service worker. The line would throw if reached | **Done** |
| EXT-08 | Collapse the three copies of `ActionType` and `TargetScope` into `types.ts` | `background.ts` and `content.tsx` each inline their own. `types.ts` is orphaned and already drifted: it lacks the `zoom` field that `content.tsx` added | **Done** |
| EXT-09 | Stop routing zoom through `ActionType.ROTATE` | `onZoom` sends `ROTATE` with a `{zoom}` payload and relies on a special case checked before the action switch. Give zoom its own action type | **Done** |
| EXT-10 | `GET_STATE` should not fall through to `applyTransform` | It currently re-applies the existing transform before responding. Harmless today, fragile later | **Done** |
| REL-01 | Stop committing `extension.zip` | The release workflow already builds and attaches it on every `v*` tag. The committed copy is duplicate state that has already drifted once | **Done** |
| REL-02 | Delete the `v1.0.1` tag | It points at the same commit as `v1.0.0`, has no content difference, and has no GitHub release. A version number that promises a change and delivers none will mislead | **Done** |
| REL-03 | Decide the fate of the `gh-pages` branch | Abandoned since commit `1878d10` migrated deployment to `actions/deploy-pages`. Delete it or document why it is kept | Needs a decision |
| WEB-05 | Untrack `website/.vite/deps` | Vite's dependency cache is committed to git | **Done** |
| STORE-02 | Add the zoom slider to the store listing | 0.5x to 3x zoom is implemented and shipped but is not mentioned anywhere in the listing copy | Owner, dashboard |
| STORE-04 | Rename the listing to "Flip and Rotate Ultimate" | The ampersand is removed from the manifest, the panel, both failure messages, the website and the docs. The extension ID and listing URL are unaffected. Scope is text only: the 7 store images still render "FLIP & ROTATE ULTIMATE" as artwork and the screenshots still show the old panel header. Owner accepted that mismatch on 2026-09-09; regenerating the artwork is deferred, not cancelled | Owner, dashboard |
| QA-02 | Automated test harness | Vitest for pure logic (36 tests) plus a Playwright end-to-end suite in `e2e/` driving real Chrome against live YouTube (21 checks), which is the only way to test EXT-01 properly | **Done** |
| DOC-01 | Keep this doc set current | Update CHANGELOG.md on every release and DECISIONS.md whenever a rejected alternative is worth recording | **Done** |
| DOC-02 | Add a `LICENSE` file | There is none. The website says "Open Source Software" and the store listing carries an "Open Source" badge. Without a licence file the default is all rights reserved, so both claims are currently unbacked. MIT recommended | **Done** |
| EXT-13 | Options page | The extension has no options page at all. `options_ui` in the manifest, reachable from the panel settings menu and from `chrome://extensions`. Host for EXT-14, 15 and 16 | v2.0.0 |
| EXT-14 | Support and feedback entry points | Buttons opening the website contact page in a new tab. **Do not embed a form without resolving the D8 conflict first** | v2.0.0, decision needed |
| EXT-15 | Donate section | Outbound button to a donation page. Permitted by store policy; disclose it on the listing | v2.0.0 |
| EXT-16 | Debug log toggle and diagnostics copy | Verbose logging behind a setting, plus a clipboard diagnostics dump for support. Console only, never page content | v2.0.0 |

---

## v2.0.0 scope, committed 2026-09-09

Requested by the owner. The theme is that the extension currently has **no home**: no options page,
nowhere to ask for help, no way to say thank you, and no way for a user to hand us a useful bug
report. Everything below is one page and the plumbing behind it.

| ID | Item | Notes |
|---|---|---|
| EXT-13 | An options page | `options_ui` in the manifest, opened from the panel settings menu and from `chrome://extensions`. This partially reverses D10, which rejected an options page built solely to host the whitelist. The justification is different now |
| EXT-14 | Support and feedback entry points | **Blocked on a decision. See the constraint below** |
| EXT-15 | Donate section | Buttons to an external donation page |
| EXT-16 | Debug log toggle and diagnostics copy | Applicable, and cheap |

### The EXT-14 constraint, decide before building

**An embedded feedback form would break DECISIONS.md D8 and contradict a claim we submitted to the
Chrome Web Store on the same day.** Embedding a Tally iframe in the options page is a network
request made by the extension. The listing, the privacy policy and the storage permission
justification all state that the extension makes no network requests at all. D8 says this may be
revisited only with a product decision and a listing and privacy policy update made first, in that
order.

| Option | What it means | Trade-off |
|---|---|---|
| **A. Buttons that open the website (recommended)** | "Report a problem" and "Send feedback" open `#/contact` in a new tab via `chrome.tabs.create` | **Zero network calls in the extension.** D8 holds, the privacy claim holds, nothing needs resubmitting. The form is one click away rather than in-page |
| B. Embed the form in the options page | A real inline form | Breaks D8. Requires a privacy policy rewrite, a new store data disclosure, a changed permission justification and a fresh review. Also needs CSP and host permission work |

**Recommendation: A.** The owner asked for "inline support and feedback buttons / forms"; buttons
that open the existing pages satisfy the request without spending the privacy position, which is
currently the extension's strongest differentiator against every competitor in the niche.

### EXT-15 notes

Chrome Web Store program policy permits donation links. The affiliate policy that governs this area
targets **injected** affiliate links with no user benefit, not a donate button in the extension's
own interface. Two conditions apply: the user must take a deliberate action, which a button
satisfies, and the arrangement should be described on the store listing page. Same architecture as
EXT-14, an outbound `chrome.tabs.create`, so it inherits the D8 answer.

### EXT-16 notes

**Applicable, and worth doing.** The extension already has failure paths that are currently invisible
to a user: injection refused, no element selected, a transform applied to a node a single page app
then replaced. Today those are a silent `console.warn`. A toggle in the options page that enables
verbose logging, plus a "copy diagnostics" button that puts the manifest version, the current
settings and the last N log lines on the clipboard, turns a useless "it doesn't work" report into a
report we can act on. The clipboard is local, so this stays inside D8.

Scope guard: log to the console only, never to storage by default, and never anything from the page
itself. Logging page content would turn a diagnostics feature into a data collection feature and
falsify the privacy claim by a different route.

---

## Candidate v2 themes, not yet committed

Not scoped or approved, and not part of the v2.0.0 scope above.

- Persist transforms per site so a corrected video stays corrected on the next visit.
- Free angle rotation without the 45 degree snap, with the snap held behind a modifier key.
- A popup based action so the UI never depends on a content script at all, superseding EXT-02.
- Firefox and Edge builds. The codebase is close to portable already.
- Undo and redo across a selection.
- Export the transformed element as an image.

---

## How to work this roadmap

1. Pick the lowest numbered open item in the current milestone. Do not skip ahead to P2 work.
2. Read LIMITATIONS.md and DECISIONS.md for that area before writing code.
3. Follow PLAYBOOK.md for build, verify and release.
4. When done, tick the item here, add a CHANGELOG.md entry, and record any rejected alternative in
   DECISIONS.md.
5. If the work reveals something new, add it here with an ID before acting on it.
