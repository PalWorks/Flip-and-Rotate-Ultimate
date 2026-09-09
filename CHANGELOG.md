# Changelog

All notable changes to this project. Format follows Keep a Changelog loosely.
The version numbers here are extension versions, as declared in `public/manifest.json`.

The website is deployed continuously from `main` and is not versioned separately. Website changes
are noted under the release they shipped alongside.

---

## [Unreleased] v2.0.0, scoped 2026-09-09

Scoped, not started. An options page giving the extension a home for support, feedback,
donations and diagnostics: EXT-13 to EXT-16 in ROADMAP.md.

EXT-14 carries an open decision. An embedded feedback form would be a network request from the
extension and would contradict the no-network claim submitted to the store on 2026-09-09. The
scoped design opens the website in a new tab instead. See ROADMAP.md, the EXT-14 constraint.

---

## [1.3.0] 2026-09-09

Delivers the v1.1.0, v1.2.0 and v1.3.0 roadmap milestones together. 1.1.0 and 1.2.0 were never
released separately, so this is the first release since 1.0.0.

**Submitted to the Chrome Web Store on 2026-09-09, awaiting review.** Uploaded by the owner with
the listing changes tracked as STORE-01 through STORE-04. Expect an in-depth review: the
`<all_urls>` content script match triggers one regardless of the justification text.

The dashboard state was not independently verified from the development session, so the record
here is of what was prepared and handed over, not of what Google received.

### Added

- **Works on tabs that were already open** (EXT-01). The service worker probes each tab with a
  `PING` and injects the content script through `chrome.scripting.executeScript` only when nothing
  answers. Host access comes from `activeTab`, which Chrome grants for all three entry points, so
  no standing host permission is requested. This was the single largest user facing failure.
- **Clear failure messaging** (EXT-02). A tab scoped badge and tooltip explain why the extension
  cannot run. Two distinct messages: refreshing is only suggested for ordinary pages where it can
  actually help, never for `chrome://` pages or the Web Store.
- **Animations toggle** in the panel settings menu (EXT-12).
- **Automated tests** (QA-02). Vitest, 36 tests over the extracted pure logic in `src/lib`. CI now
  runs typecheck, tests and build verification before every release. Plus an end-to-end suite in
  `e2e/` that drives real Chrome with the extension loaded unpacked against live YouTube, 21 checks,
  including proof that EXT-01 works on a tab opened before the extension was installed.
- **MIT LICENSE** (DOC-02), backing the open source claim the website and store listing already made.

### Fixed

- Orphaned content scripts after an extension update no longer leave duplicate listeners and a stale
  panel in open tabs (EXT-03).
- Scroll position no longer jumps when rotating or zooming an already flipped page. The correction
  ran on every apply instead of only on the flip transition (EXT-06).
- Panel hotkeys `r` and `h` no longer fire while typing into a page input, textarea or
  contenteditable, or during IME composition (EXT-07).
- `GET_STATE` no longer re-applies the current transform as a side effect of a read (EXT-10).
- All five "Add to Chrome" buttons on the website now reach the actual listing instead of the Chrome
  Web Store homepage (WEB-01).
- The website no longer requests a non existent `/index.css` and 404s on every page load (WEB-02).
- Website version copy no longer claims 2.0 while shipping something else (WEB-03).
- The privacy policy no longer claims "no usage analytics" on a page running Google Analytics 4 and
  Microsoft Clarity. Extension and website postures are now separate sections (WEB-04).

### Removed

- **Whitelist support** (EXT-04). Chrome's native Site access control does the same job better and
  more discoverably, our gate saved no footprint because injection happened regardless, and no user
  could reach it. See DECISIONS.md D10. The store listing copy must be updated to match.
- The options page message path and its `window.open` fallback, which would have thrown in an MV3
  service worker (EXT-05).
- 952 KB of Chrome Web Store artwork from the packaged extension. `public/` is copied verbatim into
  `dist/`, so every user was downloading the listing screenshots. Moved to `store-assets/`. The
  package is now 264 KB, down from about 1.2 MB (EXT-11).
- The redundant esm.sh React importmap from the website (WEB-02).
- `extension.zip` from version control. CI builds and attaches it on every `v*` tag (REL-01).
- The `v1.0.1` tag, which pointed at the same commit as `v1.0.0` with no content difference and no
  GitHub release. Deleted locally; the remote deletion needs a push (REL-02).
- `website/.vite` dependency cache from version control (WEB-05).
- The abandoned `gh-pages` branch (REL-03). Deployment moved to `actions/deploy-pages` in commit
  `1878d10`; the branch head was from 2025-12-28 and held the old site. Verified before deleting
  that the Pages API reports `build_type: workflow`, and verified after that the site still serves.
  Recoverable from `549e9c3`.

### Changed

- **Renamed from "Flip & Rotate Ultimate" to "Flip, Rotate and Mirror Ultimate."** The ampersand is gone
  from the manifest name, the in-page panel header, both failure messages, the website and the docs.
  The store listing name changes with this upload; the extension ID and the listing URL do not.
  Scope is text only. The seven store images still render the old name as artwork; refreshing them
  is deferred (STORE-04). Rationale in DECISIONS.md D11.
- **Listing optimised for Chrome Web Store search.** The manifest `name` is now
  "Flip, Rotate and Mirror Ultimate: Video, Image, Page" (52 of 75 characters), carrying six
  non-repeating keywords where the old name carried two. A `short_name` of "Flip and Rotate" was
  added, because Chrome truncates a long `name` in the toolbar and on `chrome://extensions`. The
  manifest `description`, which becomes the listing Summary, was rewritten to lead with the action
  and the object rather than with "any element". Full research and the measured keyword density are
  in STORE_LISTING_COPY.md section 7.
- `ActionType` and `TargetScope` are now declared once in `types.ts` instead of three times, where
  they had already drifted. Editing one copy used to produce a silent no-op (EXT-08).
- Zoom has its own `ActionType.ZOOM` instead of riding on `ROTATE` with a `{zoom}` payload (EXT-09).
- Manifest permissions gain `scripting` and `activeTab`. The description drops the whitelist claim.
- TypeScript now typechecks under `strict` with Chrome types, and passes clean.

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
