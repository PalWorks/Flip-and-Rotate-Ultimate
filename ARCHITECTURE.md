# Architecture

## System overview

Two independent deliverables in one repository.

```
                        CHROME EXTENSION
  ┌──────────────────────────────────────────────────────────────┐
  │  background.ts  (MV3 service worker, ESM)                    │
  │    contextMenus.onClicked ─┐                                 │
  │    commands.onCommand ─────┼──> chrome.tabs.sendMessage ──┐  │
  │    action.onClicked ───────┘                              │  │
  │    runtime.onInstalled: builds menus, sets uninstall URL  │  │
  └───────────────────────────────────────────────────────────┼──┘
                                                              │
                            ExtensionMessage {type,scope,payload}
                                                              │
  ┌───────────────────────────────────────────────────────────▼──┐
  │  content.js  (IIFE, injected into <all_urls> at document_end)│
  │                                                              │
  │   runtime.onMessage ──> isWhitelisted() gate                 │
  │                     ──> applyTransform(el, scope, action)    │
  │                     ──> openPanel()                          │
  │                                                              │
  │   DOM listeners: contextmenu, mouseover, mouseout, click,    │
  │                  scroll, resize   (all capture phase)        │
  │                                                              │
  │   Shadow DOM host on document.documentElement                │
  │     └─ React root ─ PanelContainer                           │
  │          ├─ Panel           (element scope)                  │
  │          ├─ FullPagePanel   (page scope)                     │
  │          └─ ShortcutsModal                                   │
  └──────────────────────────────────────────────────────────────┘

                        MARKETING WEBSITE
  ┌──────────────────────────────────────────────────────────────┐
  │  website/  React 18 + hash router, Tailwind via CDN          │
  │  #/ Home  #/privacy  #/terms  #/contact  #/uninstall         │
  │  Built by Vite, deployed to GitHub Pages by Actions          │
  └──────────────────────────────────────────────────────────────┘
```

## Component responsibilities

### `background.ts` (service worker)

Stateless router. It owns no transform state. On install it creates a seven item context menu
tree under a `flip-root` parent and registers the uninstall feedback URL. It translates three
input sources into a single `ExtensionMessage` shape and forwards to the active tab:

| Source | Scope sent | Why |
|---|---|---|
| Context menu item | `ELEMENT` | The user right clicked a specific thing |
| Keyboard command | `PAGE` | No pointer position is available at keypress time |
| Toolbar icon click | `PAGE`, type `OPEN_PANEL` | Opens the UI rather than acting directly |

The scope difference between context menu and keyboard is deliberate and is the reason the same
`ActionType` produces different results depending on how it was invoked.

### `src/content/content.tsx` (content script)

The whole engine. Roughly four concerns in one file.

**1. Selection model.** `getSmartTarget(x, y)` calls `document.elementsFromPoint`, filters out the
panel host and the extension's own overlays, then returns the first `VIDEO`, `IMG`, `SVG` or
`CANVAS` in the stack, falling back to the topmost element. `handleSelection` supports additive
selection when Shift, Ctrl or Cmd is held.

**2. Transform state.** Three separate stores, and this is the part most likely to surprise you:

| Store | Holds | Lifetime |
|---|---|---|
| `elementStates: WeakMap<HTMLElement, TransformState>` | Per element flip, rotation, zoom | Garbage collected when the element leaves the DOM |
| `pageState: TransformState` | Page scope transform | Module lifetime |
| `chrome.storage.sync` under key `settings` | `whitelistRegex`, `animationsEnabled` | Persisted, synced across devices |

The `WeakMap` is deliberate. Single page applications tear down and rebuild nodes constantly, and a
`Map` would pin every element the user ever touched.

**3. Transform application.** `applyTransform` mutates state, `applyTransformToElement` composes the
CSS string. Order is fixed as `rotate() scaleX() scaleY() scale()`. Rotation is applied before
scale so that flipping does not reverse the visual direction of the dial.

Two fix ups live here. Inline elements are forced to `inline-block` because CSS transforms have no
effect on inline boxes. Page scope transforms additionally set `min-height`, `overflow` and
`transform-origin` on `body`, and invert scroll position so the viewport stays over the same
content after a flip.

**4. Panel lifecycle.** `mountPanel` attaches a Shadow DOM host to `document.documentElement`, not
to `body`. This is load bearing: page scope transforms target `body`, so a panel inside `body`
would rotate along with the page it is controlling.

### `src/content/Panel.tsx` and `FullPagePanel.tsx`

Presentational. All styling is inline or in a `<style>` tag inside the shadow root, so no page
stylesheet can reach it and it cannot leak out. Both use `z-index: 2147483647`; overlays sit one
below at `2147483646`.

## Data flow: a context menu rotate

```
user right clicks a video
  └─ content.tsx contextmenu listener (capture) stores lastClickedElement = getSmartTarget(x,y)
       └─ user picks "Rotate 90°"
            └─ background.ts contextMenus.onClicked
                 └─ tabs.sendMessage({ROTATE, ELEMENT, {degrees:90, relative:true}})
                      └─ content.tsx onMessage
                           ├─ isWhitelisted() gate
                           ├─ target = lastClickedElement
                           ├─ applyTransform: state.rotation = (state.rotation + 90) % 360
                           └─ applyTransformToElement: element.style.transform = "rotate(90deg) ..."
```

Note the ordering dependency: the `contextmenu` DOM listener must have already run and cached
`lastClickedElement` before the menu click arrives. This works because the browser fires
`contextmenu` before it renders the menu.

## Service boundaries

| Boundary | Mechanism | Notes |
|---|---|---|
| Worker to content script | `chrome.tabs.sendMessage` | Fails silently if no content script is present. See ROADMAP EXT-01 |
| Content script to worker | `chrome.runtime.sendMessage` | Only for `OPEN_SETTINGS` and `OPEN_EXT_MANAGEMENT` |
| Panel UI to page | Shadow DOM | Deliberate isolation in both directions |
| Extension to website | `chrome.runtime.setUninstallURL` | The only outbound network reference in the extension |

## Build pipeline

Two Vite passes, because the two artifacts need different module formats.

| Pass | Config | Entry | Output format | Why |
|---|---|---|---|---|
| 1 | `vite.config.ts` | `background.ts` | ESM | MV3 service workers support `type: "module"` |
| 2 | `vite.content.config.ts` | `src/content/content.tsx` | IIFE, `inlineDynamicImports` | Content scripts cannot use ESM imports, everything must be one file |

Pass 2 sets `emptyOutDir: false` so it does not erase pass 1's output. Order matters.

`scripts/verify-build.js` then parses `dist/manifest.json` and asserts that the service worker,
every content script and every icon it references actually exists on disk.

## Domain vocabulary

| Term | Meaning |
|---|---|
| Scope | Either `PAGE` (targets `document.body`) or `ELEMENT` (targets the selection) |
| Smart target | The element `getSmartTarget` picks, preferring media over containers |
| Selection mode | While active, hover highlights and click selects instead of navigating |
| Whitelist | A regex tested against `window.location.href`. Empty means enabled everywhere |
| Overlay | A positioned div mirroring an element's bounding box, used for hover and selection tint |
| Panel host | The Shadow DOM root element, id `flip-rotate-interactive-root` |

## External dependencies

| Dependency | Used by | Notes |
|---|---|---|
| React 19, react-dom 19 | Extension panel | Bundled into `content.js` |
| lucide-react | Extension panel icons | Bundled |
| React 18.3.1 | Website | Note the deliberate version split from the extension |
| Tailwind CSS | Website | Loaded from CDN at runtime, not built |
| Google Analytics 4, Microsoft Clarity | Website only | Never in the extension. See SECURITY.md |
| Tally.so | Website contact and uninstall forms | Third party iframe |

## Scaling considerations

There is no server, no database and no per user state beyond `chrome.storage.sync`. The scaling
axis for this project is not load, it is the number of distinct sites the content script must
behave correctly on. It runs on `<all_urls>` at `document_end` and attaches capture phase
listeners on every page, so a regression in `getSmartTarget` or the DOM listeners degrades every
site at once. Treat changes in that area as high blast radius.
