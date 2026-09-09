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

**Applied.** Chosen 2026-09-09, live in `public/manifest.json`.

```
Flip, Rotate and Mirror Ultimate: Video, Image, Page
```

52 of 75 characters. Six keywords, none repeated: flip, rotate, mirror, video, image, page. The
brand block "Flip, Rotate and Mirror Ultimate" is 32 characters, so it survives intact in a
truncated search result. Reasoning and the options considered are in section 7.

**A `short_name` was added alongside it.** Chrome truncates a long `name` in the toolbar and on
`chrome://extensions`, so the manifest now carries `"short_name": "Flip and Rotate"` for those
space-constrained surfaces. Google recommends a maximum of 12 characters there and states no hard
limit; 15 is a deliberate overshoot, because the alternative readings ("Flip Rotate", "FlipRotate")
lose the brand for three characters.

### Summary (short description)

Optimised. This is what appears under your name in search results, so it is doing double duty as
ranking text and as ad copy.

```
Rotate or flip any video, image or whole page in one click. Mirror your webcam, fix sideways videos, zoom into any element.
```

123 of 132 characters.

The previous version, "Flip, rotate and zoom any element or the whole page. Smart media targeting,
multi-select and context menu integration", was written for a developer. It led with an abstraction,
"any element", and spent its last 60 characters on three internal feature names. It contained none
of video, image, mirror or webcam. The new one leads with the action and the object, then names the
two use cases people actually arrive with.

**Applied.** This field is the manifest `description`, so it ships in the package and the Summary
field on the listing picks it up from the upload.

### Detailed description

Optimised. 2615 characters, 439 words, well inside the 16,000 limit.

```
Rotate a video, flip an image, or mirror an entire web page in one click. Flip and Rotate Ultimate fixes sideways videos, mirrors your webcam for meetings, rotates scanned documents, and helps you debug web layouts, on any site you visit.

Most tools only rotate the whole page. This one lets you pick the exact element you want. Hover over a video, image, iframe or block of text, click it, and transform just that one thing, or select several and transform them together.

✨ KEY FEATURES

🔄 Rotate and flip anything
1. Rotate video 90°, 180° or 270°: fix vertical video syndrome and upside down clips on YouTube, Vimeo, Twitch and anywhere else video plays.
2. Flip horizontally or vertically: mirror any image, photo, video or the full webpage instantly.
3. Mirror your camera: correct a reversed webcam feed on Google Meet, Zoom or Twitch before you present.
4. Precision dial: set the rotation angle in 45° steps from our floating control panel.
5. Zoom slider: scale any element from 0.5x up to 3x to inspect it closely.

🎯 Smart selection
1. Smart detect: hover and the extension picks the element you most likely mean, preferring the video player over the wrapper around it.
2. Multi-select: hold Shift to select several elements and rotate or flip them all at once.
3. Page or element scope: rotate a single image, or turn the entire browser window.

🛠️ Power user tools
1. Right-click menu: flip and rotate straight from the context menu on any element.
2. Keyboard shortcuts: Alt+Shift+X to flip horizontally, Alt+Shift+Y to flip vertically, Alt+Shift+R to rotate. All remappable at chrome://extensions/shortcuts.
3. Works on pages that were already open: no need to reload every tab after installing.

💡 WHO IT IS FOR

1. Watching video: fix a sideways or upside down clip without downloading anything.
2. Online meetings and streaming: mirror your camera feed so text reads the right way round.
3. Web developers and designers: rotate and flip elements to test responsive layouts and spot alignment problems.
4. Reading and photos: rotate an image or a scanned document that was photographed at the wrong angle.
5. Accessibility: turn the page to a comfortable orientation on a rotated or wall mounted screen.

🔒 PRIVACY

Flip and Rotate Ultimate runs entirely inside your browser. It makes no network requests at all. No browsing history, no page content, no analytics, nothing is collected and nothing is sent anywhere. The only thing it saves is whether you want animations on or off.

Open source under the MIT licence. The full code is on GitHub.

Free, no ads, no watermarks, no account required.
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
- [ ] Paste the optimised detailed description
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

---

## 7. Search optimisation

Researched 2026-09-09 against published Chrome Web Store ranking analyses and Google's own listing
guidance. Sources at the end of this section.

### How Chrome Web Store ranking actually works

It is not Google web search. Backlinks, domain authority and crawl budget are irrelevant. The signals
that matter, in order:

| Signal | Weight | In our control |
|---|---|---|
| **Relevance**: title, summary and description matching the query | Highest | **Yes, fully** |
| Weekly active users | High | Indirectly |
| Ratings count and average | High | Indirectly. We are at 3.7 from 6 |
| Install velocity | High | Indirectly |
| Update recency | Medium | Yes. 1.3.0 helps, the last update was January |
| Featured / Verified badges | Low | Reported as weaker than developers assume |

**Relevance is the only lever fully under our control**, and it is the one currently being wasted.
Title keywords outweigh description keywords: an exact keyword match in the title beats the same word
buried in the description.

### The keyword gap

The competing extensions in this niche encode the real search demand in their own names:

| Competitor | Rating | Nouns in the title |
|---|---|---|
| Rotate that Video Player | 4.9 | video |
| QuickFlip | 4.8 | none |
| Flip-Rotate Image (Sempurna) | 4.4 | image |
| Webpage Rotator | 4.1 | webpage |
| RotateX: Image Rotator and Page Rotation | | image, page |
| YT Mirror | | mirror |
| **Flip and Rotate Ultimate** | **3.7** | **none** |

Our title carries the two verbs and zero of the nouns. "Ultimate" is a brand word with no search
volume, and it occupies 9 of the roughly 35 characters that show before truncation.

### Title options

All are within the 75 character hard limit. The 45 character guidance is a display heuristic, not a
Google rule.

| | Title | Chars | Trade-off |
|---|---|---|---|
| **CHOSEN** | `Flip, Rotate and Mirror Ultimate: Video, Image, Page` | 52 | **Applied 2026-09-09.** Six keywords, the most of any option. Adds "mirror", a search intent every other option misses. The 32 character brand block still fits the visible window |
| A | `Flip and Rotate Ultimate: Video, Image, Page` | 44 | Keeps the original brand block, but has no "mirror" |
| B | `Flip and Rotate Ultimate: Mirror Video and Image` | 48 | Trades "page" for "mirror". Better if webcam mirroring is the use case you want to own |
| C | `Flip, Rotate and Mirror: Video, Image, Page` | 43 | Most keyword dense. **Drops "Ultimate"**, so it abandons brand recognition with 3,000 existing users |
| D | `Flip and Rotate Ultimate` | 24 | No change. Zero risk, zero gain |

**Decision: the owner's own formulation, above.** It was better than my option A on the measure that
matters: it carries six keywords instead of five, and the one it adds, "mirror", is a distinct search
intent that A missed entirely. The cost I expected, pushing the nouns past the truncation point, does
not materialise: "Flip, Rotate and Mirror Ultimate" is 32 characters, so a truncated result still
reads as three stated capabilities rather than a cut-off keyword list.

It is also truthful. Mirroring is what a horizontal flip does, so all six words name real functions.
Overselling is what produced the 3.7 rating; this does not repeat that mistake.

**Keyword stuffing is a suspension risk, not just a ranking one.** Google's listing guidance states
plainly that "repetitive or irrelevant use of keywords can create an unpleasant user experience and
result in an item being suspended." None of options A to C repeat a word, which is what keeps them
on the right side of that line.

### What changed in the description, and why

| Change | Reason |
|---|---|
| Opening line is now "Rotate a video, flip an image, or mirror an entire web page in one click" | The first paragraph carries the most weight after the title, and previously opened with "Take full control of your browsing experience", which contains no keyword at all |
| Named the objects everywhere: video, image, photo, page, webpage, document | The old copy leaned on "element", which nobody searches for |
| Added natural phrase variants: "rotate video", "flip an image", "mirror your camera", "vertical video", "upside down", "sideways" | Semantic variation catches long tail queries without repeating one term |
| Named the platforms: YouTube, Vimeo, Twitch, Google Meet, Zoom | People search "rotate video YouTube" and "mirror camera Google Meet" |
| Added "Works on pages that were already open" | The 1.3.0 headline fix, and a differentiator no competitor advertises |
| Privacy section states the no network claim concretely | Trust signal that lifts install-to-click conversion |
| Added "Free, no ads, no watermarks, no account required" | Common qualifying searches |

Measured keyword density in the new description, against the 2 to 3 percent guidance for primary
terms:

| Term | Uses | Density |
|---|---|---|
| rotate | 14 | 3.31% |
| flip | 10 | 2.36% |
| video | 9 | 2.13% |
| page | 6 | 1.42% |
| image | 5 | 1.18% |
| mirror | 5 | 1.18% |

Nothing is repeated to the point of reading badly. Verify by reading it aloud, which is the test
Google's guidance is really describing.

### What copy cannot fix

**Ratings are the second largest signal and ours are the weakest thing about the listing.** 3.7 from
6 ratings, where extensions above 4.5 get a meaningful ranking advantage. No wording change moves
that number. What moves it is 1.3.0 shipping, because the top rated competitors are at 4.8 and 4.9
and the gap is a working-on-existing-tabs bug, not a copy problem.

Screenshots do not affect ranking directly but strongly affect click-through from search results to
the listing. Ours are stale and show the old name, which is worth revisiting once STORE-04 artwork
is regenerated.

### Sources

- [How the Chrome Web Store Ranking Algorithm Works in 2026, ExtensionFast](https://www.extensionfast.com/blog/chrome-web-store-ranking-algorithm-how-extensions-get-ranked-in-2025)
- [Chrome Web Store SEO: Ranking Guide, ExtensionFast](https://www.extensionfast.com/blog/chrome-web-store-seo-complete-ranking-guide-for-2025)
- [Chrome Web Store Rankings, Patterns Across 120K Data Points, ExtensionRanker](https://extensionranker.com/blog/chrome-web-store-ranking-patterns)
- [Making your listing shine, Chrome for Developers](https://developer.chrome.com/docs/webstore/best-listing)
- [Updates to extension name length requirements, chromium-extensions](https://groups.google.com/a/chromium.org/g/chromium-extensions/c/mpDvFpT0KJM/m/WWFFQZFyAAAJ)

**Caveat.** Google publishes no ranking algorithm. Everything above except the official listing
guidance and the 75 character name limit is third party analysis of observed rankings, not
documented behaviour. The relevance-beats-everything-you-control conclusion is consistent across all
three independent sources, which is why I am acting on it, but it is inference from correlation.

---

## Roadmap mapping

| ID | Covered by |
|---|---|
| STORE-01 | Privacy policy URL, section 3 |
| STORE-02 | Zoom slider, retained in Key Features 3 |
| STORE-03 | Whitelist gone from the description and from the storage justification |
| STORE-04 | Product name, section 2. Artwork deferred |
| SEO | Section 7. Title options, optimised summary and description, ranking research |
