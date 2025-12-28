# Agent Instructions

> [!IMPORTANT]
> **ALWAYS VERIFY THE BUILD BEFORE NOTIFYING THE USER.**

This project is a Chrome Extension. Common errors include missing files in the `dist` directory or invalid `manifest.json`.

## Verification Protocol

Before marking a task as complete or asking the user to test:

1. **Run the Build**: Execute `npm run build`.
2. **Run Verification Script**: Execute `node scripts/verify-build.js`.
3. **Check Output**: Ensure both commands exit with code 0.

## Common Pitfalls

- **Missing Content Script**: The `content.js` file must be generated in `dist`. If it's missing, check `vite.content.config.ts` and the `build` script in `package.json`.
- **Manifest Errors**: Ensure `manifest.json` references existing files.
- **Icon Errors**: Ensure all icons referenced in `manifest.json` exist in `dist/icons`.

## Verification Script Logic

The `scripts/verify-build.js` script performs the following checks:

- `dist/manifest.json` exists and is valid JSON.
- Background script (if defined) exists.
- Content scripts (if defined) exist.
- Icons (if defined) exist.

**DO NOT BYPASS THESE CHECKS.**
