/**
 * Shared plumbing for the end-to-end suite.
 *
 * Why this is not a plain `playwright.launchPersistentContext` with
 * `--load-extension`: Chrome 152 silently ignores that switch. The extension
 * simply never loads and nothing tells you. Verified against
 * chrome://extensions-internals, which listed only the built-in PDF viewer.
 * `--disable-features=DisableLoadExtensionCommandLineSwitch` does not help.
 *
 * The supported route is the CDP `Extensions` domain, which also gives us
 * `Extensions.triggerAction`. That is what makes a real toolbar-icon click
 * automatable, and the toolbar click is the entry point EXT-01 turns on.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CDP_PORT = process.env.CDP_PORT || 9222;
const CHROME = process.env.CHROME_BIN || 'google-chrome';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launchChrome() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fr-e2e-'));
  const args = [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    // required for the CDP Extensions domain
    '--enable-unsafe-extension-debugging',
    '--remote-allow-origins=*',
    'about:blank',
  ];
  // Headless Chrome cannot run MV3 extensions reliably, so run headed under a
  // virtual display when there is no real one.
  const useXvfb = !process.env.DISPLAY || process.env.FORCE_XVFB === '1';
  const cmd = useXvfb ? 'xvfb-run' : CHROME;
  const cmdArgs = useXvfb
    ? ['-a', '--server-args=-screen 0 1920x1080x24', CHROME, ...args]
    : args;

  const proc = spawn(cmd, cmdArgs, { stdio: 'ignore', detached: true });

  for (let i = 0; i < 40; i++) {
    await sleep(500);
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (res.ok) return { proc, profile };
    } catch {
      /* not up yet */
    }
  }
  throw new Error('Chrome did not expose a CDP endpoint in time');
}

function stopChrome({ proc, profile }) {
  try { process.kill(-proc.pid, 'SIGKILL'); } catch { try { proc.kill('SIGKILL'); } catch {} }
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}

async function connect() {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
  return { browser, ctx: browser.contexts()[0], bs: await browser.newBrowserCDPSession() };
}

/** Resolve the *tab* target id. Extensions.triggerAction rejects page targets. */
async function tabTargetId(bs, urlPart) {
  const { targetInfos } = await bs.send('Target.getTargets', { filter: [{ type: 'tab' }] });
  const t = targetInfos.find((x) => x.url.includes(urlPart));
  return t ? t.targetId : null;
}

async function getServiceWorker(ctx, timeout = 25000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const sw = ctx.serviceWorkers().find((w) => w.url().includes('background.js'));
    if (sw) {
      try { await sw.evaluate(() => 1); return sw; } catch { /* still starting */ }
    }
    await sleep(300);
  }
  throw new Error('service worker never became available');
}

const ping = (sw, tabId) =>
  sw.evaluate(async (id) => {
    try { return { ok: true, r: await chrome.tabs.sendMessage(id, { type: 'PING', scope: 'PAGE' }) }; }
    catch (e) { return { ok: false, err: String(e.message || e).slice(0, 100) }; }
  }, tabId);

/**
 * DOM-level probe. Safe from the page world because the extension's artefacts
 * live in the shared DOM.
 *
 * Do NOT probe `window.__flipRotateUltimateInstance` from page.evaluate: content
 * scripts run in an isolated world and the page's `window` never sees it.
 */
const domProbe = (page) =>
  page.evaluate(() => ({
    panels: document.querySelectorAll('#flip-rotate-interactive-root').length,
    styleTags: document.querySelectorAll('style[data-flip-ext]').length,
    hoverOverlays: document.querySelectorAll('#flip-ext-hover-overlay').length,
    selectionOverlays: document.querySelectorAll('[id^="flip-ext-selection-"]').length,
    selected: document.querySelectorAll('.flip-ext-selected').length,
  }));

function reporter() {
  const results = [];
  return {
    results,
    check(id, name, pass, detail) {
      results.push({ id, name, pass, detail });
      console.log(`${pass ? '  PASS' : '  FAIL'}  ${String(id).padEnd(9)} ${name}`);
      if (detail) console.log(`            ${detail}`);
      return pass;
    },
    summary() {
      const passed = results.filter((r) => r.pass).length;
      console.log(`\n${passed}/${results.length} checks passed`);
      const failed = results.filter((r) => !r.pass);
      if (failed.length) console.log('failed: ' + failed.map((f) => f.id).join(', '));
      return failed.length === 0;
    },
  };
}

export { sleep, launchChrome, stopChrome, connect, tabTargetId, getServiceWorker, ping, domProbe, reporter };
