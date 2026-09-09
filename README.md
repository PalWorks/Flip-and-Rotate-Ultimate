<div align="center">

# Flip & Rotate Ultimate

**Rotate, flip and zoom any element on any web page. Or the whole page.**

Fix a sideways phone video without leaving the tab. Mirror a webcam preview. Check a layout's
symmetry in one click.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/nlbnapelehjkadekmfghljagafhbobhp?label=chrome%20web%20store)](https://chromewebstore.google.com/detail/flip-rotate-ultimate/nlbnapelehjkadekmfghljagafhbobhp)
[![Users](https://img.shields.io/chrome-web-store/users/nlbnapelehjkadekmfghljagafhbobhp)](https://chromewebstore.google.com/detail/flip-rotate-ultimate/nlbnapelehjkadekmfghljagafhbobhp)
[![Rating](https://img.shields.io/chrome-web-store/rating/nlbnapelehjkadekmfghljagafhbobhp)](https://chromewebstore.google.com/detail/flip-rotate-ultimate/nlbnapelehjkadekmfghljagafhbobhp)
[![Release](https://img.shields.io/github/v/release/PalWorks/Flip-and-Rotate-Ultimate)](https://github.com/PalWorks/Flip-and-Rotate-Ultimate/releases)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-blue)](public/manifest.json)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/flip-rotate-ultimate/nlbnapelehjkadekmfghljagafhbobhp) ·
[Website](https://palworks.github.io/Flip-and-Rotate-Ultimate/) ·
[Roadmap](ROADMAP.md) ·
[Report an issue](https://github.com/PalWorks/Flip-and-Rotate-Ultimate/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Message API Reference](#message-api-reference)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Security and Privacy](#security-and-privacy)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

### The problem

The web renders content in the orientation it was given. When that orientation is wrong there is
usually nothing you can do about it in the page itself.

- A phone video uploaded sideways stays sideways. Every viewer tilts their head.
- A webcam preview is mirrored when it should not be, or is not when it should be.
- A scanned PDF or an embedded image is 90 degrees out and the host site offers no rotate control.
- A designer wants to check whether a layout still reads correctly when mirrored, a classic trick
  for spotting visual imbalance.

The usual workarounds are to download the file and open a desktop editor, or to write a one off
`transform` rule in devtools that vanishes on the next reload.

### The solution

Flip & Rotate Ultimate applies CSS transforms directly to whatever you point at. It runs entirely
in the browser, touches nothing on the network, and works on any element on any page: a video, an
image, a canvas, a div, or the entire document.

The part that makes it usable rather than merely possible is **smart targeting**. Naively, clicking
on a video selects whichever wrapper `div` happens to be topmost, and you end up rotating the
player chrome instead of the picture. This extension inspects the full element stack under the
cursor and prefers `VIDEO`, `IMG`, `SVG` and `CANVAS` over their containers, so it picks what you
meant.

### Who it is for

| Audience | What they use it for |
|---|---|
| Anyone watching video | Correcting sideways phone footage on YouTube, Drive, social feeds |
| Front end developers and designers | Mirroring a layout to check visual balance, testing RTL-like reading order |
| People on video calls | Correcting a mirrored webcam preview |
| Anyone reading scanned documents | Rotating an embedded scan the host site will not rotate |

### Status

Published on the Chrome Web Store as version 1.0.0 with roughly 3,000 users, rated 3.7 from 6
ratings, listed under Developer Tools. Known gaps that plausibly explain that rating are documented
honestly in [LIMITATIONS.md](LIMITATIONS.md) and scheduled in [ROADMAP.md](ROADMAP.md). The most
significant is that the extension does not currently work on tabs that were already open when it
was installed.

---

## Features

| Feature | Detail |
|---|---|
| **Flip horizontally / vertically** | `scaleX(-1)` / `scaleY(-1)` on a selected element or on `document.body` |
| **Rotate** | 90, 180 and 270 degrees from the context menu. A drag dial in the panel snaps to 45 degree increments |
| **Zoom** | 0.5x to 3x on a selected element, via a slider |
| **Smart targeting** | Prefers `VIDEO`, `IMG`, `SVG`, `CANVAS` over wrapper containers when resolving what you clicked |
| **Multi selection** | Hold Shift, Ctrl or Cmd to select several elements and transform them together |
| **Dual scope** | An element panel and a separate full page panel, so page level and element level state never collide |
| **Draggable panel** | Isolated in a Shadow DOM so no site stylesheet can break it and it cannot leak styles into the page |
| **Context menu** | Seven item menu under a single parent, available on right click anywhere |
| **Keyboard shortcuts** | `Alt+Shift+X`, `Alt+Shift+Y`, `Alt+Shift+R`, remappable at `chrome://extensions/shortcuts` |
| **Animated transitions** | A cubic bezier ease with overshoot, toggleable |
| **Memory safe** | Element state lives in a `WeakMap`, so nodes destroyed by a single page application are garbage collected rather than pinned |
| **Works on open tabs** | Injects on demand into tabs that predate installation, using `activeTab` so no standing site access is requested |
| **No network access** | Zero `fetch` calls. Nothing leaves the browser. See [Security and Privacy](#security-and-privacy) |

### Not currently available

Stated plainly rather than omitted:

- **Persistence.** Transforms reset on reload. There is no per site memory.
- **Free angle rotation.** The dial snaps to 45 degrees with no modifier to bypass it.
- **Cross browser.** Chrome only for now. Firefox and Edge builds are v2 candidates.
- **Cross origin iframes.** `all_frames` is not enabled, so content inside a third party iframe is
  out of reach.

---

## Architecture

```
                         CHROME EXTENSION (MV3)
  ┌───────────────────────────────────────────────────────────────┐
  │  background.js   service worker, ESM                          │
  │                                                               │
  │    contextMenus.onClicked ──┐                                 │
  │    commands.onCommand ──────┼──> chrome.tabs.sendMessage ──┐  │
  │    action.onClicked ────────┘                              │  │
  │    runtime.onInstalled ──> build menus, set uninstall URL  │  │
  └────────────────────────────────────────────────────────────┼──┘
                                                               │
                        ExtensionMessage { type, scope, payload }
                                                               │
  ┌────────────────────────────────────────────────────────────▼──┐
  │  content.js   IIFE, injected into <all_urls> at document_end   │
  │                                                                │
  │   runtime.onMessage ──> applyTransform(el, scope, action)      │
  │                     └─> openPanel()                            │
  │                                                                │
  │   DOM listeners (capture): contextmenu, mouseover, mouseout,   │
  │                            click, scroll, resize               │
  │                                                                │
  │   State:  elementStates: WeakMap<HTMLElement, TransformState>  │
  │           pageState:     TransformState (module scoped)        │
  │           settings:      chrome.storage.sync                   │
  │                                                                │
  │   Shadow DOM host on document.documentElement                  │
  │     └─ React root ─ PanelContainer                             │
  │          ├─ Panel          element scope controls              │
  │          ├─ FullPagePanel  page scope controls                 │
  │          └─ ShortcutsModal                                     │
  └────────────────────────────────────────────────────────────────┘
```

Three design choices carry most of the weight. Each is recorded with its reasoning in
[DECISIONS.md](DECISIONS.md).

**The panel mounts on `document.documentElement`, not `body`.** Page scope transforms target
`body`. A panel inside `body` would rotate along with the page it is controlling, becoming unusable
at exactly the moment you need it.

**Element state lives in a `WeakMap`.** Single page applications create and destroy nodes
continuously. A `Map` would hold a strong reference to every element you ever touched, preventing
garbage collection for the lifetime of the tab. The trade off is that a transform is lost when a
framework replaces the node. A lost transform costs one click. A leaked tab costs memory forever.

**Transform order is fixed as `rotate() scaleX() scaleY() scale()`.** Applying scale before rotate
reverses the apparent direction of the rotation dial, which makes the control feel broken.

For component level detail, data flow traces and the domain vocabulary, see
[ARCHITECTURE.md](ARCHITECTURE.md).

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Extension platform | Chrome Manifest V3 | Required for new Chrome Web Store submissions |
| Language | TypeScript 5.8 | Type safety across the worker and content script boundary |
| UI | React 19 + `react-dom` 19 | Bundled into the content script, rendered inside a Shadow DOM |
| Icons | `lucide-react` | Tree shaken, no icon font, no external requests |
| Bundler | Vite 6, two passes | The worker needs ESM, the content script needs a single IIFE |
| Website | React 18.3.1, Vite 6, Tailwind via CDN | Independent product, deliberately a separate version. See DECISIONS.md D9 |
| CI/CD | GitHub Actions | Pages deploy on push, release build on `v*` tag |
| Analytics | GA4 and Microsoft Clarity, **website only** | Never in the extension |

---

## Installation

### For users

Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/flip-rotate-ultimate/nlbnapelehjkadekmfghljagafhbobhp).

Since 1.3.0 it works immediately on tabs you already had open, with no refresh needed.

### For developers

**Prerequisites:** Node.js 20 or later. Chrome 88 or later.

```bash
git clone https://github.com/PalWorks/Flip-and-Rotate-Ultimate.git
cd Flip-and-Rotate-Ultimate
npm install
npm run build
node scripts/verify-build.js
```

Expected output from the verification step:

```
🔍 Verifying build...
✅ manifest.json is valid JSON.
✅ Background script found: background.js
✅ Content script found: content.js
✅ Icon found: icons/icon-16.png
✅ Icon found: icons/icon-48.png
✅ Icon found: icons/icon-128.png

✨ Build verification PASSED!
```

Then load it into Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode**, top right.
3. Click **Load unpacked** and select the `dist/` directory.
4. After each rebuild, click the reload icon on the extension card.

> **Why the extra verification step.** `npm run build` runs two Vite passes in sequence. The second
> sets `emptyOutDir: false` so it does not erase the first. If the second pass is skipped or fails,
> Chrome will happily load a `dist/` with no content script and the extension will silently do
> nothing. `verify-build.js` parses the built manifest and asserts every file it references exists.
> Treat it as part of the build, not as an optional check.

### Website

The marketing site is a separate npm project with its own lockfile.

```bash
cd website
npm install
npm run dev      # http://localhost:3000
```

---

## Configuration

### Extension settings

Stored in `chrome.storage.sync` under the key `settings`.

| Key | Type | Default | Effect |
|---|---|---|---|
| `animationsEnabled` | `boolean` | `true` | Adds the `flip-ext-transition` class, a 0.4s cubic bezier with overshoot |

Toggle animations from the panel's settings menu.

**Per site control** is handled by Chrome itself, not by us. Right click the extension icon, choose
"This can read and change site data", then "On click", "On specific sites" or "On all sites". The
same control is at `chrome://extensions` under Site access. A whitelist feature existed before 1.3.0
but was removed: it was a worse reimplementation of this, and no user could reach it. See
[DECISIONS.md](DECISIONS.md) D10.

### Build time configuration

No environment variables are required to build or run either project.

`website/.env.local` contains `GEMINI_API_KEY=PLACEHOLDER_API_KEY` and both Vite configs define
`process.env.API_KEY` from it. **These are inert leftovers from the project scaffold.** There is no
Gemini code anywhere in the repository. Removing them is scheduled cleanup.

### Keyboard shortcuts

Declared in `public/manifest.json` under `commands`. Users remap them at
`chrome://extensions/shortcuts`.

| Command | Default | Action |
|---|---|---|
| `flip-x` | `Alt+Shift+X` | Flip the page horizontally |
| `flip-y` | `Alt+Shift+Y` | Flip the page vertically |
| `rotate` | `Alt+Shift+R` | Rotate the page 90 degrees |

Keyboard shortcuts act on **page scope** by design. A keypress carries no cursor position, so there
is no defensible way to infer which element you meant. Context menu actions, which do carry a
position, act on **element scope**.

---

## Usage

### Quick start

1. Click the toolbar icon. The floating panel appears and selection mode activates automatically.
2. Move the cursor. Elements highlight with a dashed outline as you hover.
3. Click the element you want. The badge changes to `1 Selected`.
4. Use the panel: flip horizontal, flip vertical, drag the dial to rotate, or move the zoom slider.
5. Press `Esc` to close.

### Fix a sideways video

```
Right click the video
  └─ Flip and Rotate Ultimate
       └─ Rotate 90°
```

Smart targeting selects the `<video>` element itself, not the player wrapper, so the controls and
the surrounding page layout are unaffected.

### Transform several elements at once

1. Open the panel.
2. Hold **Shift** (or Ctrl, or Cmd) and click each element.
3. The badge counts your selection: `3 Selected`.
4. Any panel action now applies to all of them simultaneously.

### Flip the entire page

Either press `Alt+Shift+X`, or open the panel, then the settings menu, then **Show Full Page
Options**. A second panel appears with page scope controls.

When flipping a page vertically, scroll position is inverted so the viewport stays over the content
you were reading rather than jumping to the opposite end of the document.

### In-panel keyboard shortcuts

Active only while the panel is open.

| Key | Action |
|---|---|
| `Esc` | Close the shortcuts modal if open, otherwise close the panel |
| `R` | Reset the current transform |
| `H` | Toggle the full page panel |

They are suppressed while you are typing into an input, textarea or contenteditable, and while an
IME composition is active.

---

## Message API Reference

The service worker and the content script communicate over `chrome.tabs.sendMessage` using a single
message shape. This is the internal contract you need if you are extending either side.

### `ExtensionMessage`

```ts
interface ExtensionMessage {
  type: ActionType;
  scope: TargetScope;
  payload?: { degrees?: number; relative?: boolean; zoom?: number };
}
```

### `ActionType`

| Value | Meaning | Payload | Handled by |
|---|---|---|---|
| `FLIP_X` | Toggle horizontal flip | none | content script |
| `FLIP_Y` | Toggle vertical flip | none | content script |
| `ROTATE` | Set or add rotation | `{ degrees, relative }` | content script |
| `RESET` | Clear all transforms | none | content script |
| `GET_STATE` | Return current `pageState` | none | content script |
| `OPEN_PANEL` | Mount the panel UI | none | content script |
| `TOGGLE_INTERACTIVE` | Legacy alias for `OPEN_PANEL` | none | content script |
| `UPDATE_SETTINGS` | Reserved, not currently dispatched | none | content script |
| `OPEN_SETTINGS` | Open the options page | none | service worker |
| `OPEN_EXT_MANAGEMENT` | Open `chrome://extensions/?id=...` | none | service worker |

### `TargetScope`

| Value | Target | Set by |
|---|---|---|
| `PAGE` | `document.body` | Keyboard shortcuts, toolbar click |
| `ELEMENT` | Current selection, or `lastClickedElement` | Context menu, panel actions |

### Example: rotate the current selection by 90 degrees

```ts
chrome.tabs.sendMessage(tabId, {
  type: ActionType.ROTATE,
  scope: TargetScope.ELEMENT,
  payload: { degrees: 90, relative: true },
});
```

`relative: true` adds to the current rotation and wraps at 360. `relative: false` sets an absolute
angle, which is what the drag dial uses.

> **Warning for contributors.** `ActionType` and `TargetScope` are currently declared **three
> times**: in `types.ts`, in `background.ts` and in `src/content/content.tsx`. Adding a message type
> to only one of them produces a silent no-op. Consolidation is tracked as EXT-08. Until it lands,
> edit all three.

---

## Project Structure

```
.
├── background.ts               Service worker: menus, commands, message routing
├── types.ts                    Shared types. Currently orphaned, see EXT-08
├── vite.config.ts              Build pass 1: service worker, ESM
├── vite.content.config.ts      Build pass 2: content script, IIFE
├── src/
│   └── content/
│       ├── content.tsx         Engine: selection, transforms, panel lifecycle
│       ├── Panel.tsx           Element scope panel + ShortcutsModal
│       └── FullPagePanel.tsx   Page scope panel
├── public/
│   ├── manifest.json           MV3 manifest, the source of truth for what ships
│   ├── icons/                  16, 48, 128 px
│   └── *.png, *.jpg            Chrome Web Store listing assets
├── scripts/
│   └── verify-build.js         Post build assertion, mandatory
├── website/                    Marketing and legal site, independent npm project
│   ├── App.tsx                 Hash router
│   ├── components/             Navbar, Footer, Pricing, Demo, Testimonials, Contact
│   └── pages/                  Home, PrivacyPolicy, TermsOfService, Contact, UninstallFeedback
├── .github/workflows/
│   ├── deploy.yml              Pages deploy on push to main
│   └── release.yml             Build and attach extension.zip on v* tag
└── docs (this set)
    ├── ARCHITECTURE.md         System design and data flow
    ├── ROADMAP.md              Single source of truth for all work
    ├── AGENTS.md               Contract for agent driven development
    ├── DECISIONS.md            Why things are the way they are
    ├── LIMITATIONS.md          Known bugs, debt and platform constraints
    ├── PLAYBOOK.md             Build, QA, release, deploy, rollback, debug
    ├── SECURITY.md             Permission justification and privacy commitments
    └── CHANGELOG.md            Version history
```

---

## Testing

```bash
npm test          # vitest, 36 unit tests
npm run test:e2e  # real Chrome + unpacked extension + live YouTube, 21 checks
npm run typecheck # tsc --noEmit, strict
npm run verify    # build + verify-build + typecheck + unit tests
```

What exists today:

| Layer | Mechanism |
|---|---|
| Build integrity | `node scripts/verify-build.js`, mandatory, exits non zero on a broken `dist/` |
| Functional | A manual QA checklist in [PLAYBOOK.md](PLAYBOOK.md), covering core transforms, panel behaviour, page scope, and a site compatibility spot check |
| Type checking | `tsc --noEmit` under `strict` with Chrome types. Passes clean |
| Unit tests | Vitest, 36 tests over `src/lib`, run by CI before every release |

Unit coverage is deliberately scoped to logic that is pure and worth protecting:

- `src/lib/transform.ts` rotation wrapping, zoom clamping, and the CSS transform string. Includes a
  regression test for the negative modulo bug that made the dial jump anticlockwise past zero, and
  one asserting the `rotate scaleX scaleY scale` order that keeps the dial feeling correct.
- `src/lib/urls.ts` restricted URL classification, including a test that we never tell a user to
  refresh a `chrome://` page, because refreshing one can never help.

End to end coverage lives in [`e2e/`](e2e/README.md): Playwright drives real Chrome with the
extension loaded unpacked, against live YouTube. It proves EXT-01 the only way it can be proved, by
opening a tab, installing the extension **afterwards**, and clicking the toolbar icon.

Note that Chrome 152 silently ignores `--load-extension`, so the harness installs through the CDP
`Extensions` domain instead. `Extensions.triggerAction` is what makes a genuine toolbar click
automatable. The `e2e/README.md` documents that and two other traps.

**Still missing:** context menu items and `chrome.commands` shortcuts are native browser UI that no
harness can drive. Both share the verified `dispatch()` path, so the untested surface is the small
`switch` statements that map menu ids to actions.

---

## Deployment

### Extension release

Tagging triggers `.github/workflows/release.yml`, which installs, builds, zips `dist/` and attaches
`extension.zip` to a GitHub release.

```bash
# bump the version in public/manifest.json first, and add a CHANGELOG entry
git commit -am "chore: release v1.1.0"
git tag v1.1.0
git push && git push --tags
```

Verify the published asset before submitting to the store:

```bash
curl -sL -o /tmp/rel.zip \
  https://github.com/PalWorks/Flip-and-Rotate-Ultimate/releases/download/v1.1.0/extension.zip
unzip -l /tmp/rel.zip
```

The archive must contain only files the manifest references. Chrome Web Store submission itself is
manual through the developer dashboard. Full procedure, including rollback, is in
[PLAYBOOK.md](PLAYBOOK.md).

> **Rollback reality check.** There is no instant rollback on the Chrome Web Store. The only route
> is forward: revert, bump to a **higher** version number, resubmit, and wait for review. Plan
> releases accordingly.

### Website deployment

Fully automatic. Any push to `main` triggers `.github/workflows/deploy.yml`, which builds `website/`
and publishes via `actions/deploy-pages`. Typical run time is about 30 seconds.

A `gh-pages` branch exists but has been abandoned since deployment migrated to Actions. It is not
what serves the live site. Do not push to it.

---

## Roadmap

Full detail, with acceptance criteria and status for every item, lives in [ROADMAP.md](ROADMAP.md).

**1.3.0 delivered 23 of 27 tracked items**, closing the v1.1.0, v1.2.0 and v1.3.0 milestones. The
headline change is that the extension now works on tabs opened before installation, which was the
largest user facing failure in 1.0.0.

The four remaining items are not code: three are Chrome Web Store dashboard edits that must
accompany the 1.3.0 upload, and one is a decision about an abandoned `gh-pages` branch.

**v2.0.0 is not yet scoped.** Candidates: per site transform persistence, free angle rotation, a
popup based UI that never depends on a content script, Firefox and Edge builds, undo and redo.

## Contributing

Contributions are welcome. This repository is set up for both human and agent driven development.

### Before you start

1. Read [ROADMAP.md](ROADMAP.md). It is the only backlog. If your idea is not there, add it with an
   ID first.
2. Read [AGENTS.md](AGENTS.md) for conventions, restricted areas and safety constraints. It applies
   to humans too.
3. Check [LIMITATIONS.md](LIMITATIONS.md) before filing a bug. It may already have an ID.
4. Check [DECISIONS.md](DECISIONS.md) before "fixing" something that looks wrong. Several odd
   looking things are deliberate and load bearing.

### Workflow

```bash
git checkout -b ext-01-inject-existing-tabs   # branch named for the roadmap ID
# make the change
npm run build && node scripts/verify-build.js  # both must exit 0
# run the manual QA checklist if you touched src/content/
```

### A change is ready when

- [ ] `npm run build` and `node scripts/verify-build.js` both exit 0.
- [ ] Each acceptance criterion for the roadmap item is listed and demonstrably met.
- [ ] The manual QA checklist has been run, if the content script changed.
- [ ] `CHANGELOG.md` is updated.
- [ ] Any new permission has a justification in `SECURITY.md`.
- [ ] Any rejected alternative worth remembering is recorded in `DECISIONS.md`.

### Hard rules

- **Never add a network call to the extension.** The store listing and the privacy policy both state
  it sends nothing anywhere. That is currently true and verifiable, and it is a compliance
  commitment, not a preference.
- **Never widen `permissions` casually.** Each addition changes the install warning users see.
- **Never commit built artifacts.** `dist/` is gitignored.

---

## Security and Privacy

**The extension makes no network requests.** No `fetch`, no `XMLHttpRequest`, no WebSocket, no
analytics, no telemetry. Verified against the source on 2026-09-09. The only outbound reference is
`chrome.runtime.setUninstallURL`, which Chrome opens after uninstall.

Declared permissions and why each is needed:

| Permission | Purpose |
|---|---|
| `contextMenus` | The right click menu, the primary entry point |
| `storage` | Persists two local settings via `chrome.storage.sync` |
| `<all_urls>` content script match | The product transforms whatever page you choose |

`scripting` and `activeTab` are approved but not yet added, pending EXT-01. `activeTab` was chosen
over `host_permissions: ["<all_urls>"]` specifically to avoid requesting standing access to every
site a user visits.

**The website is a different matter and has a different posture.** It runs Google Analytics 4 and
Microsoft Clarity, and embeds Tally.so forms. Do not conflate the two. Full detail, including the
current gap in the published privacy policy, is in [SECURITY.md](SECURITY.md).

To report a vulnerability, email support@palworks.ai rather than opening a public issue.

---

## License

[MIT](LICENSE). Copyright 2025-2026 Palaniappan Meyyappan.

You may use, copy, modify and distribute this software freely, including commercially, provided the
copyright notice and permission notice are preserved.

## Acknowledgements

- [React](https://react.dev/) and [Vite](https://vite.dev/), which make bundling a React UI into a
  content script tolerable.
- [Lucide](https://lucide.dev/) for the panel icons.
- [Tailwind CSS](https://tailwindcss.com/) for the marketing site.
- [Tally](https://tally.so/) for the contact and uninstall feedback forms.
- Everyone who installed this and rated it honestly. The gaps documented above exist because of that
  feedback, and fixing them is the plan.

---

<div align="center">

Built by [PalWorks](https://github.com/PalWorks) ·
[Install](https://chromewebstore.google.com/detail/flip-rotate-ultimate/nlbnapelehjkadekmfghljagafhbobhp) ·
[Website](https://palworks.github.io/Flip-and-Rotate-Ultimate/)

</div>
