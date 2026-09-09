# Changelog

All notable changes to this project. Format follows Keep a Changelog loosely.
The version numbers here are extension versions, as declared in `public/manifest.json`.

The website is deployed continuously from `main` and is not versioned separately. Website changes
are noted under the release they shipped alongside.

---

## Unreleased

Documentation set added for agent driven development: `README.md` rewritten from the AI Studio
scaffold, plus `ARCHITECTURE.md`, `ROADMAP.md`, `DECISIONS.md`, `LIMITATIONS.md`, `PLAYBOOK.md`,
`SECURITY.md` and this file. `agents.md` renamed to `AGENTS.md` and expanded.

No functional change. See [ROADMAP.md](ROADMAP.md) for what is planned next.

---

## [1.0.0] 2026-01-01

First public release on the Chrome Web Store. Listed under Developer Tools.

Tagged `v1.0.0` at commit `3e2084a` on 2025-12-28. GitHub release created the same day with
`extension.zip` attached by CI. Store review completed and the listing went live on 2026-01-01.

### Features

- Flip horizontally and vertically, on a selected element or the whole page.
- Rotate 90, 180 and 270 degrees from the context menu, plus a drag dial snapping to 45 degrees.
- Zoom a selected element between 0.5x and 3x.
- Smart element selection preferring `VIDEO`, `IMG`, `SVG` and `CANVAS` over wrapper containers.
- Multi selection with Shift, Ctrl or Cmd, transforming several elements at once.
- Draggable floating control panel isolated in a Shadow DOM, plus a separate full page panel.
- Context menu integration with a seven item menu.
- Keyboard shortcuts: `Alt+Shift+X` flip horizontal, `Alt+Shift+Y` flip vertical,
  `Alt+Shift+R` rotate.
- Whitelist regex gating, stored in `chrome.storage.sync`. **Note: no UI exists to set this.
  See EXT-04.**
- Uninstall feedback form, opened via `chrome.runtime.setUninstallURL`.

### Known issues shipped in this version

Documented retroactively on 2026-09-09. See [LIMITATIONS.md](LIMITATIONS.md) for the full list.

- Does not work on tabs that were open before installation, with no error shown. EXT-01, EXT-02.
- Whitelist is advertised but unreachable, no options page exists. EXT-04.
- Package contains roughly 207 KB of dead popup code, `main.js` and `index.html`. EXT-11.
- Scroll position jumps when transforming an already flipped page. EXT-06.
- Panel hotkeys `r` and `h` intercept typing in page inputs. EXT-07.

---

## Repository history before 1.0.0

Condensed from git history. All dates 2025-12-28 unless noted.

| Commit | Change |
|---|---|
| `ddef884` | Promotional images and logo assets added |
| `65b77eb` | Microsoft Clarity and GA4 added to the website |
| `fd7927a` | Google site verification meta tag |
| `3e2084a` | Cleanup of unused files and permissions for store release. **Tagged v1.0.0 and v1.0.1** |
| `6c59978` | Release automation workflow added |
| `b9bc90b` | Navbar mobile menu, contact border fix, pricing anchor id |
| `1878d10` | Deployment migrated to GitHub Actions, `gh-pages` branch abandoned from here |
| `adc8bcd` | Relative logo paths for the GitHub Pages base URL |
| `7c253bb` | Favicon switched to logo.jpg |
| `04c917e` | Logo replaced with a jpg version |
| `89e6feb` | Uninstall feedback page added and wired to the extension |
| `1e98210` | GitHub Pages deployment workflow added |
| `468bbce` | Footer source code link corrected |
| `fc0cbd2` | Contact form, logo and styling refinements |
| `64ff0a3` | Marketing website added |
| `e2ad913` | Multi selection support and UX refinements |

### Note on the `v1.0.1` tag

`v1.0.1` points at the same commit as `v1.0.0`, `3e2084a`. There is no content difference between
them. The release workflow ran successfully for the tag on 2025-12-28 at 17:31 UTC, but no
`v1.0.1` GitHub release exists, so it appears to have been created and then removed. No 1.0.1 was
ever published to the Chrome Web Store. REL-02 tracks deleting the tag.
