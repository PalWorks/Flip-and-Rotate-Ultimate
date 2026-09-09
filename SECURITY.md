# Security and Privacy

This extension makes a public, verifiable claim: it collects nothing and sends nothing anywhere.
That claim appears on the Chrome Web Store listing and in the privacy policy. This document exists
so the claim stays true.

Last reviewed: 2026-09-09

## The commitment

> "We believe in privacy. Flip & Rotate Ultimate runs entirely locally on your browser. No user data
> is collected or sent to external servers."
> Chrome Web Store listing

The store's data disclosure states the developer will not collect or use user data, that data is not
sold to third parties, not used for purposes unrelated to core functionality, and not used for
creditworthiness or lending.

**This is currently true.** Verified 2026-09-09: there is no `fetch`, no `XMLHttpRequest`, no
WebSocket, no analytics SDK and no telemetry anywhere in `background.ts` or `src/content/`. The only
outbound reference in the entire extension is `chrome.runtime.setUninstallURL`, which Chrome itself
opens after uninstall.

## Permission justification

Every permission must be justified here before it is added to `manifest.json`. Chrome Web Store
review asks for exactly this reasoning, and the install prompt shows the consequence to users.

### Currently declared

| Permission | Why it is needed | What it does not allow |
|---|---|---|
| `contextMenus` | Builds the right click menu, our primary entry point | No page access on its own |
| `storage` | Persists `animationsEnabled` via `chrome.storage.sync`. Also `whitelistRegex`, which is scheduled for removal under EXT-04 | No network. Sync is Chrome's own profile sync, not our server |
| `content_scripts` matching `<all_urls>` | The product's purpose is to transform any page the user chooses | Declared match patterns, not arbitrary host access from the worker |

### Approved for EXT-01, not yet added

| Permission | Why | Chosen over |
|---|---|---|
| `scripting` | Required to call `chrome.scripting.executeScript` and inject into tabs that predate install | No alternative exists |
| `activeTab` | Grants temporary host access to the current tab, only when the user invokes us | `host_permissions: ["<all_urls>"]`, which would request standing access to every site the user ever visits |

The `activeTab` choice is deliberate and is recorded in DECISIONS.md as D7. It is the
minimum privilege route to solving EXT-01. Do not substitute broad host permissions for it without
an explicit product decision, because it changes the install prompt and invites a stricter review.

### Never add without an explicit product decision

`tabs` with full URL access, `webRequest`, `cookies`, `history`, `bookmarks`, `downloads`,
`nativeMessaging`, `<all_urls>` host permissions, or any permission whose purpose is data collection.

## Rules for contributors and agents

1. **No network calls in the extension.** Not for analytics, not for error reporting, not for
   feature flags, not for update checks. If you believe you need one, stop and raise it as a product
   decision, because it invalidates a published claim.
2. **No new permission without an entry in the table above** and a matching update to the store
   listing's permission rationale.
3. **Update the listing before the code ships**, not after. Shipping a permission the listing does
   not explain is how extensions get taken down.
4. **Do not log user content.** `console.warn` and `console.error` for diagnostics are fine.
   Never log page URLs, page text, selected element contents or anything derived from them.
5. **Treat the whitelist as user data** for as long as it exists. It can reveal which sites a user
   cares about. It stays in `chrome.storage.sync` and never leaves the browser. EXT-04 removes it,
   which removes this concern entirely. Per site control is better served by Chrome's own Site
   access setting, which we should point users to rather than reimplement.

## Website privacy posture, which is different

The marketing website at `palworks.github.io/Flip-and-Rotate-Ultimate/` is a separate product with a
separate posture. It **does** run:

| Tracker | ID | Purpose |
|---|---|---|
| Google Analytics 4 | `G-KWG7FB66QN` | Site traffic |
| Microsoft Clarity | `usr39i7vdz` | Session recording and heatmaps |

It also embeds third party Tally.so iframes for the contact and uninstall feedback forms.

**Open issue.** `website/pages/PrivacyPolicy.tsx` currently states "We do not collect usage
analytics" without distinguishing extension from website. The statement is true of the extension and
false of the page it is printed on. WEB-04 fixes this. STORE-01 fixes the related problem that the
store's privacy policy link lands on the tracked marketing homepage rather than the policy itself.

Do not resolve this by weakening the extension's claim. The extension claim is accurate and
valuable. Resolve it by separating the two clearly.

## Secrets handling

- No secrets are required to build or run either product.
- `website/.env.local` exists and contains only `GEMINI_API_KEY=PLACEHOLDER_API_KEY`. It is
  gitignored. There is no Gemini code anywhere in the repository; both this file and the
  `process.env.API_KEY` define in the Vite configs are leftovers from the AI Studio scaffold.
  Removing them is tracked as cleanup.
- CI uses only the `GITHUB_TOKEN` that Actions provides automatically. No repository secrets are
  configured or needed.
- Chrome Web Store publishing is currently manual through the developer dashboard. If it is ever
  automated, the store API credentials must be repository secrets and must never be echoed in a
  workflow log.

## Reporting a vulnerability

Email support@palworks.ai. Do not open a public GitHub issue for a security report.

Because the extension holds no credentials, makes no network calls and stores only two local
settings, the realistic threat surface is limited to:

- A content script bug that lets a hostile page read or manipulate extension state.
- A regression that causes the extension to leak page content anywhere.
- A supply chain compromise in a bundled dependency reaching `content.js`, which runs on every site.

The third is the most serious given `<all_urls>` reach. Review dependency updates to `react`,
`react-dom` and `lucide-react` with that in mind.
