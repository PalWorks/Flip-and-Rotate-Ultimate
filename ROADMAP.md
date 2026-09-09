# Roadmap

**This file is the single source of truth for all work on Flip & Rotate Ultimate.**
Every backlog item lives here. Do not open work that is not listed here. If you find something new,
add it here first with an ID, then do the work.

Last reviewed: 2026-09-09

---

---

## Master summary

**Read this table first.** Everything below is detail on these rows.

| Phase | Milestone | Bucket focus | Items | Done | Open | Status | Exit criteria | Next action |
|---|---|---|---|---|---|---|---|---|
| **0** | Audit and documentation | DOC | 1 | 1 | 0 | **Complete** 2026-09-09 | Full doc set committed, every backlog item has an ID and acceptance criteria | Done. No further action |
| **1** | v1.1.0 Rating recovery | EXT, WEB, STORE | 8 | 0 | 8 | **Not started** | The advertised product is reachable: works on pre-existing tabs, fails loudly when it cannot, every store claim is true, site links resolve to the listing | Start **EXT-01** |
| **2** | v1.2.0 Correctness | EXT, WEB, QA | 7 | 0 | 7 | Not started, blocked on Phase 1 | No known user visible bug on the happy path. A written QA checklist gates every release | Blocked |
| **3** | v1.3.0 Hygiene | EXT, REL, WEB, STORE, QA, DOC | 12 | 0 | 12 | Not started | Debt paid down so v2 is cheap: one enum, no duplicate artifacts, automated tests, a licence | Blocked |
| **4** | v2.0.0 | Not scoped | 0 | 0 | 0 | **Not scoped** | Earns the "2.0" the website already claims | Do not start while Phase 1 is open |

### Status by bucket

| Bucket | Meaning | Total | Open | P0 open |
|---|---|---|---|---|
| `EXT` | Extension code | 12 | 12 | 4 |
| `WEB` | Marketing website | 5 | 5 | 2 |
| `STORE` | Chrome Web Store listing, dashboard only | 3 | 3 | 2 |
| `REL` | Release and CI process | 3 | 3 | 0 |
| `QA` | Testing | 2 | 2 | 0 |
| `DOC` | Documentation | 2 | 1 | 0 |
| | **Total** | **27** | **26** | **8** |

### Done so far

| What | When | Notes |
|---|---|---|
| Full repository audit | 2026-09-09 | Local, GitHub and published store listing compared three ways |
| Artifact integrity verified | 2026-09-09 | Local `extension.zip`, the `v1.0.1` tag copy and the `v1.0.0` release asset are byte identical file for file |
| Documentation set | 2026-09-09 | README, ARCHITECTURE, ROADMAP, AGENTS, DECISIONS, LIMITATIONS, PLAYBOOK, SECURITY, CHANGELOG |
| Knowledge graph | 2026-09-09 | `graphify-out/`, 331 nodes, 405 edges, 23 labelled communities |
| v1.0.0 shipped | 2026-01-01 | ~3,000 users, 3.7 rating from 6 ratings |

### Not done, and honestly stated

- Zero automated tests exist.
- No `LICENSE` file exists, while the website and store listing both claim open source. DOC-02.
- No feature work has started. Every code item below is open.

### Decisions pending from the product owner

| # | Decision | Recommendation | Blocks |
|---|---|---|---|
| 1 | Remove the whitelist entirely | **Remove.** Chrome's native per site access control already does this, better and more discoverably. See EXT-04 | EXT-04, STORE-03 |
| 2 | Licence to declare | MIT, to match the open source claim already made publicly | DOC-02 |
| 3 | Commit `graphify-out/` or gitignore it | Mild preference to ignore and rebuild per session | Nothing |

---

## North star

> Flip & Rotate Ultimate should work, instantly and correctly, on whatever page the user is
> already looking at. Every feature we advertise should be reachable by a user who has never read
> the documentation.

Two thirds of the current backlog exists because we violate one half of that sentence or the other.
The extension does not work on tabs that were already open. The whitelist we advertise on the store
cannot be reached by anyone. Fixing those two things is the entire near term plan.

## Where we are

| Metric | Value | Source |
|---|---|---|
| Published version | 1.0.0 | Chrome Web Store |
| Users | ~3,000 | Chrome Web Store |
| Rating | 3.7 from 6 ratings | Chrome Web Store |
| Store category | Developer Tools | Chrome Web Store |
| Last store update | 2026-01-01 | Chrome Web Store |
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
| **v1.3.0** Hygiene | Pay down debt so v2 is cheap to build | EXT-05, EXT-08, EXT-09, EXT-10, REL-01, REL-02, REL-03, WEB-05, STORE-02, QA-02, DOC-01, DOC-02 |
| **v2.0.0** Earn the "2.0" the website already claims | Not yet scoped. See "Candidate v2 themes" |

---

## P0 backlog: ship in v1.1.0

### EXT-01 Work on tabs that were already open

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
| Injection failed but URL is ordinary http or https | "Please refresh this page for Flip & Rotate to work here." |
| URL is a browser restricted page or the Web Store | "Flip & Rotate can't run on this page. Chrome blocks extensions on browser and Web Store pages." |

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

Same class of failure as EXT-01, different trigger. When the extension updates, content scripts
already running in open tabs are orphaned. Their `chrome.runtime` handle is invalidated and every
call throws `Extension context invalidated`. EXT-01's probe will fail for those tabs, so injection
will be attempted, which is correct, but the orphaned script is still in the page holding stale DOM
listeners and a stale panel.

**Acceptance criteria:** orphaned instance detects invalidation, removes its listeners, unmounts its
panel and clears its overlays before the new instance mounts. No duplicate panels after an update.

**Effort:** Medium. Do not start before EXT-01 is merged.

### EXT-06 Scroll correction fires on every apply

`applyTransformToElement` inverts scroll position whenever `state.flipX` or `state.flipY` is true,
not only when the flip changes. Rotating or zooming a page that is already flipped re-inverts the
scroll each time, so the view jumps. Move the correction into the `FLIP_X` and `FLIP_Y` cases in
`applyTransform`, where the transition actually happens.

**Acceptance criteria:** flip the page, then rotate three times. Scroll position stays stable after
the initial flip.

### EXT-07 Panel hotkeys steal page typing

`PanelContainer` registers a `keydown` listener on `document` in the capture phase and acts on bare
`r` and `h`. While the panel is open, typing the letter r into any page input resets the user's
transforms. Guard on `e.target` being an `input`, `textarea` or `contenteditable`, and on
`e.isComposing` for IME users.

**Acceptance criteria:** with the panel open, typing "rhubarb" into a page search box changes
nothing. The shortcuts still work when focus is on the page body.

### WEB-02 Remove the live 404 and the dead importmap

The deployed page requests `/index.css`, which returns 404 on every page load. The file does not
exist and the absolute path would be wrong under the `/Flip-and-Rotate-Ultimate/` base in any case.
The page also ships an esm.sh importmap for React 18.3.1 that is redundant, because Vite bundles
React into `assets/index-*.js`.

**Acceptance criteria:** zero 404s in the network tab on a cold load of the deployed site.

### WEB-03 Stop claiming version 2.0

`website/pages/Home.tsx` says "v2.0: The Ultimate Engineering Update" and
`website/components/Pricing.tsx` says "Version 2.0 • Compatible with Chrome v88+". The store ships
1.0.0. Correct the copy to match reality, or defer until a genuine 2.0 exists.

**Recommendation:** correct it now. Overstating the version on a page that links to a 1.0.0 listing
undermines trust at exactly the moment the visitor is deciding.

### EXT-12 Expose the animations toggle

`animationsEnabled` is a real, working setting with no user interface. Once the whitelist is removed
under EXT-04 it is the only setting left, which makes a whole options page disproportionate.

Put a simple toggle in the panel's existing settings menu, next to "Shortcuts" and "Show Full Page
Options". More discoverable than an options page and a much smaller change.

**Acceptance criteria:** toggling it off removes the `flip-ext-transition` class path so transforms
apply instantly. The choice persists across page loads via `chrome.storage.sync`.

**Depends on:** EXT-04, for the decision on whether an options page is needed at all.

### QA-01 Manual QA checklist

There are zero tests. Before adding a framework, write down what a human must verify before every
release. See PLAYBOOK.md for the checklist skeleton. This is a prerequisite for releasing EXT-01
safely, because EXT-01 changes behaviour on every page.

---

## P2 backlog: v1.3.0 hygiene

| ID | Item | Notes |
|---|---|---|
| EXT-05 | Remove `window.open` fallback in the `OPEN_SETTINGS` handler | `window` is undefined in an MV3 service worker. The line would throw if reached |
| EXT-08 | Collapse the three copies of `ActionType` and `TargetScope` into `types.ts` | `background.ts` and `content.tsx` each inline their own. `types.ts` is orphaned and already drifted: it lacks the `zoom` field that `content.tsx` added |
| EXT-09 | Stop routing zoom through `ActionType.ROTATE` | `onZoom` sends `ROTATE` with a `{zoom}` payload and relies on a special case checked before the action switch. Give zoom its own action type |
| EXT-10 | `GET_STATE` should not fall through to `applyTransform` | It currently re-applies the existing transform before responding. Harmless today, fragile later |
| REL-01 | Stop committing `extension.zip` | The release workflow already builds and attaches it on every `v*` tag. The committed copy is duplicate state that has already drifted once |
| REL-02 | Delete the `v1.0.1` tag | It points at the same commit as `v1.0.0`, has no content difference, and has no GitHub release. A version number that promises a change and delivers none will mislead |
| REL-03 | Decide the fate of the `gh-pages` branch | Abandoned since commit `1878d10` migrated deployment to `actions/deploy-pages`. Delete it or document why it is kept |
| WEB-05 | Untrack `website/.vite/deps` | Vite's dependency cache is committed to git |
| STORE-02 | Add the zoom slider to the store listing | 0.5x to 3x zoom is implemented and shipped but is not mentioned anywhere in the listing copy |
| QA-02 | Automated test harness | Vitest for pure logic such as `getSmartTarget` and the transform string builder. Playwright for a real Chrome with the unpacked extension, which is the only way to test EXT-01 properly |
| DOC-01 | Keep this doc set current | Update CHANGELOG.md on every release and DECISIONS.md whenever a rejected alternative is worth recording |
| DOC-02 | Add a `LICENSE` file | There is none. The website says "Open Source Software" and the store listing carries an "Open Source" badge. Without a licence file the default is all rights reserved, so both claims are currently unbacked. MIT recommended |

---

## Candidate v2 themes, not yet committed

The website already advertises a 2.0. These are candidates for earning it. None are scoped or
approved. Do not start any of them while P0 items are open.

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
