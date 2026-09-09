# Playbook

Step by step operational procedures. Follow these exactly.

---

## Build the extension

```bash
npm install
npm run verify    # build + verify-build + typecheck + unit tests
npm run test:e2e  # real Chrome against live YouTube, needs google-chrome and xvfb-run
```

Or the individual steps:

```bash
npm run build
node scripts/verify-build.js
npm run typecheck
npm test
```

Both commands must exit 0. `npm run build` runs two Vite passes in sequence and the order matters:
pass 1 emits the ESM service worker, pass 2 emits the IIFE content script with `emptyOutDir: false`.
Running pass 2 alone leaves a `dist/` with no service worker, which Chrome will load without
complaint and which will do nothing.

## Load it locally

1. Open `chrome://extensions`.
2. Enable Developer mode, top right.
3. "Load unpacked", choose the `dist/` directory.
4. After every rebuild, click the reload icon on the extension card.

To test EXT-01 style behaviour you must **not** reload existing tabs after loading the extension.
That is the whole point of the test.

## Build and preview the website

```bash
cd website
npm install
npm run dev      # http://localhost:3000
npm run build    # outputs website/dist
```

The site uses a hash router, so deep links are `#/privacy`, `#/terms`, `#/contact`, `#/uninstall`.

---

## Manual QA checklist

Run the whole list for any change to `src/content/` or `background.ts`. Run the marked subset for
anything else.

**Run `npm run test:e2e` first.** It automates 21 of these checks against real Chrome and live
YouTube, including every EXT-01, EXT-02, EXT-03, EXT-06, EXT-07 and EXT-12 regression step. What
remains manual is the context menu, the keyboard shortcuts, and the site compatibility spot check,
because those are native UI or subjective.

### Core transforms

- [ ] Right click an image, Flip Horizontally. Image mirrors, page does not.
- [ ] Right click a video, Rotate 90°. Video rotates, surrounding layout does not.
- [ ] Repeat Rotate 90° four times. Element returns to its original orientation.
- [ ] Right click, Reset Element. Element returns to normal and the selection clears.
- [ ] `Alt+Shift+X`, `Alt+Shift+Y`, `Alt+Shift+R` each transform the whole page.

### Panel

- [ ] Toolbar icon opens the panel. Selection mode is active automatically.
- [ ] Drag the panel header. It moves and does not select page text.
- [ ] Drag the rotation dial. Rotation snaps to 45 degree steps.
- [ ] Zoom slider moves between 0.5x and 3x and the readout matches.
- [ ] Hold Shift and click three elements. Badge reads "3 Selected", all three transform together.
- [ ] Settings menu opens, closes on outside click, and each item does what it says.
- [ ] `Esc` closes the shortcuts modal if open, otherwise closes the panel.
- [ ] **EXT-07 regression check:** with the panel open, type "rhubarb" into a page search box.
      Nothing resets and the full page panel does not toggle.
- [ ] Panel stays upright while the page underneath is flipped and rotated.

### Page scope

- [ ] Flip the page vertically. Scroll position stays over the same content.
- [ ] With the page flipped, rotate it three times. **EXT-06 regression check:** the view must not
      jump after the initial flip.
- [ ] Reset. `body` inline styles for `min-height`, `overflow` and `transform-origin` are cleared.

### Injection, EXT-01 and EXT-02

- [ ] Open three ordinary tabs. Install or reload the unpacked extension. Do not refresh the tabs.
- [ ] Toolbar icon works on all three.
- [ ] Context menu works on all three.
- [ ] Keyboard shortcut works on all three.
- [ ] On a page loaded after install, one click produces exactly one selection, not two. This proves
      no double injection.
- [ ] On `chrome://extensions`, a red `!` badge appears and the tooltip reads "Flip and Rotate can't
      run on this page...". It must **not** say "refresh".
- [ ] Navigate that tab to an ordinary page. The badge clears on its own.
- [ ] The badge is scoped to its tab: switching to another tab shows no badge.
- [ ] No unhandled rejection is logged in the service worker console in either case.

### Update survival, EXT-03

- [ ] Open a page, open the panel, select an element.
- [ ] Reload the unpacked extension from `chrome://extensions`. Do not refresh the page.
- [ ] Click the toolbar icon. Exactly one panel appears, not two.
- [ ] The old panel and its overlays are gone from the page.

### Settings, EXT-12

- [ ] Settings menu shows "Disable Animations". Click it, transforms apply instantly.
- [ ] Reload the page. The choice persisted, and the menu now reads "Enable Animations".

### Site compatibility spot check

Run on at least: YouTube, a Google Docs document, a site using a Shadow DOM heavy component library,
and one page with a fixed header.

- [ ] Selection picks the media element, not its wrapper.
- [ ] The panel renders above all site chrome.
- [ ] The extension's stylesheet does not visibly alter the host page when idle.

### Website, for `website/` changes

- [ ] All routes render: `#/`, `#/privacy`, `#/terms`, `#/contact`, `#/uninstall`.
- [ ] Mobile menu opens and closes.
- [ ] Every "Add to Chrome" button resolves to the real store listing. **WEB-01 regression check.**
- [ ] Zero 404s in the network tab on a cold load. **WEB-02 regression check.**

---

## Release the extension

The workflow at `.github/workflows/release.yml` triggers on any `v*` tag.

```bash
# 1. Make sure main is clean and green
git status
npm run build && node scripts/verify-build.js

# 2. Bump the version in public/manifest.json. This is the version users see.
#    Add a CHANGELOG.md entry for it.

# 3. Commit, tag, push
git add public/manifest.json CHANGELOG.md
git commit -m "chore: release vX.Y.Z"
git tag vX.Y.Z
git push && git push --tags
```

CI then installs, builds, zips `dist/` and attaches `extension.zip` to a GitHub release.

**Verify the release before submitting to the store:**

```bash
gh release view vX.Y.Z --repo PalWorks/Flip-and-Rotate-Ultimate --json assets
curl -sL -o /tmp/rel.zip https://github.com/PalWorks/Flip-and-Rotate-Ultimate/releases/download/vX.Y.Z/extension.zip
unzip -l /tmp/rel.zip
unzip -p /tmp/rel.zip manifest.json | head -5
```

The listing must contain only files the manifest references. If `main.js` or a stray `index.html`
appears, EXT-11 has regressed. Stop and fix it before submitting.

**Do not tag a version that is identical to the previous one.** `v1.0.1` currently does exactly this
and REL-02 exists to delete it.

## Submit to the Chrome Web Store

Do this only when explicitly instructed. Submissions trigger a review that can take days and are
awkward to reverse.

1. Download the release asset built by CI. Do not upload a locally built zip, so that what ships is
   what the repository proves.
2. Chrome Web Store Developer Dashboard, upload the new package.
3. If `permissions` changed, write the justification into the dashboard's permission rationale
   fields. Copy the reasoning from SECURITY.md rather than inventing new wording.
4. Confirm the privacy policy URL is `https://palworks.github.io/Flip-and-Rotate-Ultimate/#/privacy`.
   See STORE-01.
5. Re-read the listing copy against the shipped feature set. See STORE-03.
6. Submit. Record the submission date in CHANGELOG.md.

## Roll back the extension

There is no instant rollback on the Chrome Web Store. The only route is forward.

1. Identify the last known good tag.
2. `git revert` the offending commits on `main`. Do not force push a published tag.
3. Bump `manifest.json` to a **new higher** version. The store rejects a resubmission of a version
   number it has already seen.
4. Tag, release and resubmit following the procedure above.
5. Record the incident and the cause in CHANGELOG.md.

Expect the rollback to take as long as a normal review. Plan releases accordingly.

---

## Deploy the website

Fully automatic. Any push to `main` that touches anything triggers
`.github/workflows/deploy.yml`, which builds `website/` and publishes to GitHub Pages via
`actions/deploy-pages`.

**Verify a deployment:**

```bash
BASE=https://palworks.github.io/Flip-and-Rotate-Ultimate
curl -s -o /dev/null -w '%{http_code}\n' $BASE/
curl -sL $BASE/ | grep -oE '/assets/[^"]*\.js'
# compare the deployed bundle against your local build
sha256sum website/dist/assets/index-*.js
curl -sL $BASE/assets/index-<hash>.js | sha256sum
```

The two hashes must match. If they do not, the workflow did not pick up your commit.

**Note on `gh-pages`.** A `gh-pages` branch exists but has been abandoned since commit `1878d10`
migrated deployment to `actions/deploy-pages`. It is not what serves the live site. Do not push to
it. REL-03 will decide whether to delete it.

## Roll back the website

Fast, unlike the extension.

```bash
git revert <bad-commit>
git push
```

The deploy workflow runs on the push and the site is back within about 30 seconds.

---

## Debug: the extension does nothing on a page

Work through this in order.

1. Open the page's devtools console. Is `content.js` present? Check the Sources panel under Content
   scripts.
2. If absent, is the tab older than the install? That is EXT-01.
3. Is the URL restricted? `chrome://`, `chrome-extension://`, the Web Store, `view-source:`,
   `about:`, or `file://` without file access enabled. Nothing will fix that. That is EXT-02.
4. Open the service worker console from `chrome://extensions` and click the extension's
   "service worker" link. Look for `Could not establish connection`.
5. Check Chrome's own Site access setting for the extension. Right click the icon, then "This can
   read and change site data". If it is set to "On click" or a specific site list, that is Chrome
   blocking us, not a bug. The whitelist we used to ship was removed in 1.3.0; this is its
   replacement.
6. Reload the extension from `chrome://extensions`, then reload the page, and retry.

## Debug: the panel renders but transforms do nothing

1. Is the target an inline element? Transforms do not apply. Check whether the `inline-block`
   fix up ran.
2. Is the element inside a Shadow DOM on the host page? `getSmartTarget` may have selected the
   shadow host rather than the intended child.
3. Is a page stylesheet overriding `transform` with `!important`? Inspect computed styles.
4. Is the element inside `overflow: hidden`? It is transforming, it is being clipped.

## Debug: a build that "succeeds" but produces a broken extension

Run `node scripts/verify-build.js`. It parses `dist/manifest.json` and asserts the service worker,
every content script and every icon exists. This catches the two most common failures: a missing
`content.js` from a skipped second build pass, and a manifest referencing an icon that was renamed.
