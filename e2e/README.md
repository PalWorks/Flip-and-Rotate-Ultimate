# End-to-end tests

Real Chrome, unpacked extension, live YouTube. This is the half of QA-02 that unit tests cannot
reach: `npm test` covers the pure logic in `src/lib`, and everything here needs a browser.

```bash
npm run build      # e2e loads dist/, so build first
npm run test:e2e
```

Screenshots land in `e2e/screenshots/`, results in `e2e/results.json`. Exit code is non-zero if any
check fails.

## Why this does not use `--load-extension`

**Chrome 152 silently ignores `--load-extension`.** The browser starts, the extension never loads,
and nothing reports an error. Verified against `chrome://extensions-internals`, which listed only
the built-in PDF viewer. The commonly cited
`--disable-features=DisableLoadExtensionCommandLineSwitch` override did not help either.

The supported route is the CDP `Extensions` domain, gated behind
`--enable-unsafe-extension-debugging`:

| Command | Used for |
|---|---|
| `Extensions.loadUnpacked` | Install `dist/` and get the extension id |
| `Extensions.triggerAction` | Fire a genuine toolbar-icon click on a tab target |
| `Extensions.uninstall` | Orphan the running content script, to test EXT-03 |

`Extensions.triggerAction` is what makes EXT-01 testable at all. It needs a **tab** target id, not a
page target id, hence `tabTargetId()` in the harness.

## Two traps worth knowing

**Content scripts run in an isolated world.** `page.evaluate(() => window.__flipRotateUltimateInstance)`
always returns undefined, because the page's `window` is not the content script's `window`. Probe
shared DOM artefacts instead, or run through `chrome.scripting.executeScript` from the worker.

**`chrome.runtime.reload()` segfaults Chrome** when a CDP session is attached to the service worker.
The suite uses `Extensions.uninstall` followed by `loadUnpacked` to reproduce the same orphaned-script
condition safely.

## What this cannot cover

Context menu items and `chrome.commands` keyboard shortcuts are native browser UI and cannot be
driven by any automation harness. Both call the same `dispatch()` and `ensureInjected()` path as the
toolbar action, which is covered here, so the untested surface is the small `switch` statements in
`background.ts` that map menu ids and command names to actions.

## Environment

Needs `google-chrome` on PATH (override with `CHROME_BIN`) and, on a headless machine, `xvfb-run`.
Headless Chrome does not run MV3 extensions reliably, so the harness runs headed under a virtual
display. Set `FORCE_XVFB=1` to use Xvfb even when `DISPLAY` is set.
