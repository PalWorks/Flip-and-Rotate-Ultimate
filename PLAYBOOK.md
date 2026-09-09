# Playbook

Step by step operational procedures. Follow these exactly.

---

## Build the extension

```bash
npm install
npm run build
node scripts/verify-build.js
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
anything else. There are no automated tests, so this is the only safety net.

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
- [ ] Panel stays upright while the page underneath is flipped and rotated.

### Page scope

- [ ] Flip the page vertically. Scroll position stays over the same content.
- [ ] With the page flipped, rotate it. **EXT-06 regression check:** the view must not jump.
- [ ] Reset. `body` inline styles for `min-height`, `overflow` and `transform-origin` are cleared.

### Injection, once EXT-01 lands

- [ ] Open three ordinary tabs. Install or reload the unpacked extension. Do not refresh the tabs.
- [ ] Toolbar icon works on all three.
- [ ] Context menu works on all three.
- [ ] Keyboard shortcut works on all three.
- [ ] On a page loaded after install, one click produces exactly one selection, not two. This proves
      no double injection.
- [ ] On `chrome://extensions`, the restricted page message appears and no unhandled rejection is
      logged in the service worker console.

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
5. Check the whitelist. In the page console:
   `chrome.storage.sync.get('settings', console.log)`. A non empty `whitelistRegex` that does not
   match the current URL silently disables everything. Until EXT-04 ships there is no UI clue.
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
