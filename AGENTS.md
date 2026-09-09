# Agent Instructions

> [!IMPORTANT]
> **ALWAYS VERIFY THE BUILD BEFORE NOTIFYING THE USER.**

This project is a Chrome Extension. Common errors include missing files in the `dist` directory or
invalid `manifest.json`. A broken `dist/` fails silently in Chrome, so the build must be proven, not
assumed.

## Before your first edit

1. Read [ROADMAP.md](ROADMAP.md). It is the only backlog. Work that is not listed there is not
   approved work.
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) if you are touching `src/content/` or `background.ts`.
3. Read [LIMITATIONS.md](LIMITATIONS.md) before reporting a bug. It is probably already known and
   already has an ID.
4. Read [DECISIONS.md](DECISIONS.md) before "fixing" something that looks wrong. Several odd
   looking things are deliberate and load bearing.

## Verification Protocol

Before marking a task as complete or asking the user to test:

1. **Run the Build**: Execute `npm run build`.
2. **Run Verification Script**: Execute `node scripts/verify-build.js`.
3. **Check Output**: Ensure both commands exit with code 0.

**DO NOT BYPASS THESE CHECKS.**

For any change that touches the content script, also run the manual QA checklist in
[PLAYBOOK.md](PLAYBOOK.md). The content script runs on `<all_urls>`, so a regression there breaks
every site at once.

## Common Pitfalls

- **Missing Content Script**: The `content.js` file must be generated in `dist`. If it's missing,
  check `vite.content.config.ts` and the `build` script in `package.json`.
- **Manifest Errors**: Ensure `manifest.json` references existing files.
- **Icon Errors**: Ensure all icons referenced in `manifest.json` exist in `dist/icons`.
- **Build order**: pass 2 sets `emptyOutDir: false`. Running the content build alone leaves a
  `dist/` with no service worker. Always run the full `npm run build`.
- **Three copies of `ActionType`**: the enum is duplicated in `types.ts`, `background.ts` and
  `src/content/content.tsx`. If you add a message type you must add it in all three, until EXT-08
  consolidates them. Changing only one produces a silent no-op.

## Restricted areas

Do not change these without an explicit instruction and a DECISIONS.md entry:

| Area | Why it is protected |
|---|---|
| Shadow host attached to `document.documentElement` | Attaching to `body` makes the panel rotate with the page it controls |
| `WeakMap` for `elementStates` | A `Map` leaks every element the user ever touched on SPA heavy sites |
| `z-index` values 2147483647 and 2147483646 | Chosen to sit above any site chrome. The one below is for overlays |
| Transform composition order `rotate scaleX scaleY scale` | Scaling first reverses the visual direction of the rotation dial |
| `manifest.json` `permissions` array | Every addition changes the install prompt. See SECURITY.md |
| Anything under `website/` while an extension task is open | They are separate products. Do not mix them in one change |

## Coding conventions

- TypeScript throughout. `strict` is not currently enabled; do not rely on that, write as if it were.
- The panel components use inline styles and a scoped `<style>` block inside the shadow root.
  Do not introduce a CSS framework into the extension. The website uses Tailwind, the extension
  does not.
- Content script code must assume `chrome` may be undefined and guard accordingly. The existing
  `typeof chrome !== 'undefined'` guards are deliberate and allow the bundle to be loaded in a
  non extension context without throwing.
- Prefer small, single purpose functions in `content.tsx`. It is already 709 lines and doing four
  jobs. Do not make it longer without splitting.
- Match the surrounding style. Do not reformat files you are not otherwise changing.

## Review rules

A change is not ready until all of these are true:

1. `npm run build` and `node scripts/verify-build.js` both exit 0.
2. The relevant ROADMAP item's acceptance criteria are each demonstrably met, listed one by one.
3. Manual QA checklist run, if the content script changed.
4. CHANGELOG.md updated.
5. No new permission added without a SECURITY.md entry justifying it.

## Safety constraints

- **Never** add a network call to the extension. The store listing and the privacy policy both
  state the extension sends no data anywhere. That claim is currently true and verifiable, and it
  is a compliance commitment. The only permitted outbound reference is
  `chrome.runtime.setUninstallURL`.
- **Never** widen `permissions` or add `host_permissions` casually. Each one changes the install
  warning users see and can trigger a stricter store review.
- **Never** commit built artifacts. `dist/` is gitignored. `extension.zip` is currently committed
  and REL-01 exists to remove it. Do not add more.
- **Never** commit secrets. `website/.env.local` currently holds only a placeholder. Keep it that way.
- Do not publish to the Chrome Web Store without an explicit instruction. Store submissions are
  hard to reverse and trigger a review that can take days.
