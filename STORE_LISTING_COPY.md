# Store Listing Copy

Every field on the Chrome Web Store Developer Dashboard, what goes in it, and whether it is already
correct. Written for the **1.3.0** submission.

Source draft: `store-assets/Flip and Rotate Store Listing Description 20260908`.
Permission text also lives standalone in `store-assets/permission-justifications.md`.

- Item ID: `nlbnapelehjkadekmfghljagafhbobhp`
- Publisher: `palworks.ai`
- Dashboard: https://chrome.google.com/u/1/webstore/devconsole/.../nlbnapelehjkadekmfghljagafhbobhp/edit
- Package to upload: `extension.zip`, 94 KB, built from `dist/` (`npm run build`)

Everything marked **CHANGE** must be edited in this submission. Everything marked **ADD** is
currently empty and is required before the Submit button will enable.

---

## 0. Corrections needed to the draft

Nine issues found in the 2026-09-08 draft. Two of them are claims that are not true of the shipped
code, which is the category that produces one star "it doesn't work" reviews.

| # | Field | Issue | Severity |
|---|---|---|---|
| 1 | Description, Perfect For 4 | **"Rotate PDF viewers ... directly in the browser" is false.** Chrome's built-in PDF viewer cannot be reached by a content script. See LIMITATIONS.md | **High** |
| 2 | Storage justification | **Describes a "Whitelist" that was removed in 1.3.0**, and panel position persistence that does not exist. `storage.sync` holds one key: `{ animationsEnabled }` | **High** |
| 3 | Host permission justification | Says the extension "needs access to all hosts". 1.3.0 declares **no `host_permissions` at all**; `<all_urls>` is only a `content_scripts` match | Medium |
| 4 | scripting justification | Missing. Required, box is empty | Blocking |
| 5 | activeTab justification | Missing. Required, box is empty | Blocking |
| 6 | Description, Key Features 3 | "dial in the exact rotation angle" overstates it. The dial **snaps to 45 degrees** (`Panel.tsx:114`) | Medium |
| 7 | Description, Privacy Focused | Reads "Flip & Rotate Ultimate". Ampersand, against the rename | Low |
| 8 | Description, heading | "Smart Selection & Multi-Select". Ampersand | Low |
| 9 | Description, Perfect For | Numbered 1, 3, 3, 4, 5. Two threes, no two | Low |

Issue 1 in full: a user who installs this to rotate a PDF will open a PDF in Chrome, find nothing
happens, and rate accordingly. That is precisely the failure pattern behind the current 3.7 rating.
The corrected copy below keeps the reading use case but scopes it to what actually works.

---

## 1. Package

| Field | Value |
|---|---|
| Upload | `extension.zip` (repo root, 94 KB, 7 files, `manifest.json` at archive root) |
| Version | `1.3.0`, read from the manifest. Not editable in the dashboard |
| Manifest name | `Flip and Rotate Ultimate`. Already applied |

---

## 2. Store listing tab

### Product name

```
Flip and Rotate Ultimate
```

24 of 75 characters. **Already applied** in the dashboard.

### Summary (short description)

```
Flip, rotate and zoom any element or the whole page. Smart media targeting, multi-select and context menu integration.
```

118 of 132 characters. This is the manifest `description`, which pre-fills the Summary field.
Confirm the dashboard picked it up after the upload rather than keeping the old text.

### Detailed description

Limit 16,000 characters. The block below is the 2026-09-08 draft with issues 1 and 6 through 9
corrected and the zoom slider retained. Everything else is the owner's wording, unchanged.

```
Take full control of your browsing experience with the most powerful flip and rotate extension for Chrome. Whether you need to fix a sideways video, mirror your camera for a meeting, or debug web designs, Flip and Rotate Ultimate handles it all with a single click.

🚀 Why Choose Flip and Rotate Ultimate?
- Unlike basic tools that only rotate the entire page, our extension offers precise control. Select specific elements - videos, images, iframes, or text blocks - and transform them individually or all at once.

✨ Key Features:

🔄 Universal Flip and Rotate
1. Flip Horizontally/Vertically: Instantly mirror any element or the entire webpage. Perfect for fixing mirrored webcam feeds on Google Meet, Zoom, or Twitch.
2. Rotate 90° / 180° / 270°: Correct the orientation of smartphone videos (vertical video syndrome) on YouTube, Vimeo, and other platforms.
3. Precision Control: Use our exclusive Interactive Floating Panel to dial the rotation in 45° steps. Use our 0.5x to 3x zoom slider, to zoom in on any element on the page.

🎯 Smart Selection and Multi-Select
1. Smart Detect: Automatically identifies the most likely element you want to transform (like a video player) when you hover.
2. Multi-Selection Mode: Hold Shift to select multiple elements and transform them simultaneously. A game-changer for developers and designers!

🛠️ Power User Tools
1. Context Menu Integration: Right-click anywhere to access quick flip and rotate actions.
2. Keyboard Shortcuts: Work faster with customizable hotkeys (Alt+Shift+X to flip, Alt+Shift+R to rotate).

💡 Perfect For:
1. Video Streaming: Fix upside-down or sideways videos on any site.
2. Online Meetings: Mirror your video feed during presentations.
3. Web Development: Test responsive designs and element positioning.
4. Reading: Rotate scanned documents and images embedded in a web page.
5. Privacy Focused: We believe in privacy. Flip and Rotate Ultimate runs entirely locally on your browser. No user data is collected or sent to external servers.

Get the ultimate control over your web content today!
```

### Category

| | |
|---|---|
| Current | Developer Tools |
| Recommendation | **Leave it as Developer Tools for this submission** |

The copy sells video, meetings and reading, which points at Tools rather than Developer Tools. But
this submission already changes the name, the description and five permission justifications.
Changing the category at the same time makes it impossible to attribute any change in installs.
Move it in a later, separate submission if you want to test it.

### Language

English. Unchanged.

### Graphic assets

All seven files are already at the exact required dimensions. Verified.

| Asset | Required | File | Status |
|---|---|---|---|
| Store icon | 128x128 | `public/icons/icon-128.png` | Ships in the package |
| Screenshots | 1280x800, 1 to 5 | `store-assets/Image 1-5.png`, all 1280x800 | **Stale, reuse anyway** |
| Small promo tile | 440x280 | `store-assets/Small Promo Tile.jpg` | **Stale, reuse anyway** |
| Marquee promo tile | 1400x560 | `store-assets/Marquee Promo Tile.jpg` | **Stale, reuse anyway** |
| YouTube video | optional | none | Skip |

"Stale" means the artwork renders "FLIP & ROTATE ULTIMATE" and the screenshots show the old panel
header. You deferred regenerating these on 2026-09-09 (STORE-04). Re-upload the existing files
unchanged; the listing will carry the new name over old artwork until you replace them.

### URLs

| Field | Value |
|---|---|
| Official / homepage URL | `https://palworks.github.io/Flip-and-Rotate-Ultimate/` |
| Support URL | `https://palworks.github.io/Flip-and-Rotate-Ultimate/#/contact` |

### Mature content

No.

---

## 3. Privacy tab

### Single purpose description

Unchanged from the draft, it is accurate.

```
The single purpose of this extension is to allow users to flip (horizontally/vertically) and rotate (90/180/270 degrees) web pages or specific elements (like videos and images) directly within the browser for better viewing and accessibility.
```

### Permission justifications

Five boxes. Full text in `store-assets/permission-justifications.md`; all are within the 1,000
character limit.

| Box | Action | Why |
|---|---|---|
| `contextMenus` | **Keep as is** | Still accurate |
| `storage` | **CHANGE** | Current text describes the removed whitelist and a panel position that is not stored |
| `scripting` | **ADD** | New in 1.3.0, box is empty |
| `activeTab` | **ADD** | New in 1.3.0, box is empty |
| Host permission | **CHANGE** | Current text claims host access the manifest no longer requests |

**contextMenus** (keep, 187 chars)

```
This permission is required to add "Flip" and "Rotate" options to the right-click context menu, allowing users to quickly transform the specific element or page they are interacting with.
```

**storage** (replace, 659 chars)

```
The extension stores exactly one user preference: whether transform animations are enabled. It is written to chrome.storage.sync so the setting follows the user across their signed-in Chrome profile, and read back when the control panel loads. The stored value is a single boolean.

No browsing history, page content, URLs, form data or personal information is stored. Nothing is transmitted anywhere: the extension makes no network requests of any kind.

The previously submitted justification for this permission described storing a "Whitelist" of sites. That feature has been removed in this version and the extension no longer stores anything of the kind.
```

**scripting** (add, 838 chars)

```
The extension calls chrome.scripting.executeScript for one purpose: to inject its own content script into a tab that does not already have it.

A content script declared in the manifest is only injected into pages loaded after the extension is installed or updated. Tabs the user already had open are inert, so clicking the toolbar icon in them did nothing and users reported the extension as broken. The service worker now sends a PING message to the tab first and calls executeScript only when nothing answers.

It injects our own bundled content.js file, listed in the "files" parameter. It never executes a code string, never uses remotely hosted or generated code, and only ever runs after the user invokes the extension by clicking the toolbar icon, choosing one of our context menu items, or pressing one of our keyboard shortcuts.
```

**activeTab** (add, 689 chars)

```
activeTab gives the extension temporary access to the single tab the user has just acted on, and only for the duration of that action.

It is what allows chrome.scripting.executeScript to inject our content script into a tab that was open before the extension was installed. Chrome grants activeTab on exactly the three gestures this extension supports: clicking the toolbar icon, choosing one of our context menu items, and pressing one of our keyboard shortcuts.

activeTab was chosen deliberately in place of a broad host_permissions entry. The extension holds no standing access to any site. Until the user actively invokes it on a specific tab, it can read nothing and change nothing.
```

**Host permission** (replace, 763 chars)

```
The <all_urls> match pattern appears only in the content_scripts field. This extension declares no host_permissions entry at all.

It is a general purpose page transform tool: the user points at any element on any page and flips, rotates or zooms it using a CSS transform. There is no finite list of sites that could be named instead, because the site the user wants to fix is whichever one they are looking at.

The content script attaches event listeners and applies CSS transforms to the page. It does not read page text, form data, cookies or credentials, and it transmits nothing. The extension makes no network requests.

Host access for injecting into tabs that were already open comes from activeTab on a user gesture, not from a standing host permission.
```

### Remote code

**No, I am not using remote code.**

Everything the extension runs is bundled in the uploaded package. No remote script tag, no eval of
fetched text, no network request of any kind. DECISIONS.md D8 makes this a standing project rule.

### Data usage

Leave **every** data type checkbox unchecked. The extension collects nothing.

Then tick all three certifications:

- [ ] I do not sell or transfer user data to third parties, outside of the approved use cases
- [ ] I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- [ ] I do not use or transfer user data to determine creditworthiness or for lending purposes

**Note on the website.** The marketing site runs GA4, Microsoft Clarity and Tally forms. This
disclosure covers the **extension package only**, which is why "no data collected" is correct here
and not a contradiction. The privacy policy separates the two in sections 2 and 3 (WEB-04).

### Privacy policy URL

**CHANGE.** This is STORE-01. It currently points at the marketing homepage.

```
https://palworks.github.io/Flip-and-Rotate-Ultimate/#/privacy
```

**Known risk.** The site is a hash router on GitHub Pages, so the policy only exists behind `#/`.
If a reviewer's tooling strips the fragment they land on the homepage, not the policy. Two options:

| Option | Trade-off |
|---|---|
| **A. Submit the hash URL (recommended)** | Works in any real browser. Small chance an automated check sees the homepage |
| B. Add a real `/privacy/` path first | Removes the risk. Needs a second deployed page or a router change, and delays this submission |

Take A now. If review comes back querying the policy, do B.

---

## 4. Distribution tab

| Field | Value |
|---|---|
| Visibility | **Public** |
| Distribution | All regions |
| Pricing | Free |

Do not change visibility during this submission. Beyond the risk of an accidental unlisting, the
Chrome Web Store API refuses to publish an item whose visibility was changed by hand until it has
been published manually at the new setting at least once.

---

## 5. Account level, not per item

Both live under Account settings and block publishing if unset.

| Item | Value |
|---|---|
| Contact email | Must be set **and verified**, or the item cannot be published |
| Trader status (EU DSA) | Mandatory. Declare trader or non-trader. Non-trader hides the listing in the EU unless declared |

---

## 6. Submission checklist

- [ ] Upload `extension.zip`
- [ ] Confirm Summary picked up the new manifest description
- [ ] Paste the corrected detailed description
- [ ] Re-upload the seven existing graphic assets if the form requires them
- [ ] Set official URL and support URL
- [ ] Replace the **storage** justification
- [ ] Add the **scripting** justification
- [ ] Add the **activeTab** justification
- [ ] Replace the **Host permission** justification
- [ ] Remote code: No
- [ ] Data types: all unchecked; all three certifications ticked
- [ ] Privacy policy URL set to the `#/privacy` page
- [ ] Contact email verified, trader status declared
- [ ] Save draft, then Submit for review

Expect an in-depth review. The `<all_urls>` content script match triggers it, and no wording
changes that. It cannot be avoided without breaking context menu element targeting and the keyboard
shortcuts, because `lastClickedElement` is recorded by a listener registered at content script load
(`src/content/content.tsx:225`).

---

## Roadmap mapping

| ID | Covered by |
|---|---|
| STORE-01 | Privacy policy URL, section 3 |
| STORE-02 | Zoom slider, retained in Key Features 3 |
| STORE-03 | Whitelist gone from the description and from the storage justification |
| STORE-04 | Product name, section 2. Artwork deferred |
