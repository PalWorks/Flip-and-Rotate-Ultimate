/**
 * End-to-end suite: real Chrome, unpacked extension, live YouTube.
 *
 * Covers the behaviour unit tests cannot reach, above all EXT-01: a content
 * script declared in the manifest is only injected into pages loaded after
 * install, so tabs the user already had open are inert. That is the single
 * largest user-facing failure 1.0.0 shipped with, and the only way to prove it
 * is fixed is to open a tab, install the extension afterwards, and click.
 *
 * Run with: npm run test:e2e
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  sleep, launchChrome, stopChrome, connect,
  tabTargetId, getServiceWorker, ping, domProbe, reporter,
} from './harness.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
const SHOTS = path.join(__dirname, 'screenshots');
const YT_WATCH = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';

const shot = async (p, f) => { try { await p.screenshot({ path: path.join(SHOTS, f), timeout: 8000 }); } catch {} };

/**
 * YouTube has several <video> elements, including hidden inline-preview players.
 * querySelector('video') can return a zero-size one, so pick the largest visible
 * player and wait for it to have a real box.
 */
async function videoBox(page, timeout = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const box = await page.evaluate(() => {
      const best = [...document.querySelectorAll('video')]
        .map((v) => ({ v, r: v.getBoundingClientRect() }))
        .filter((o) => o.r.width > 120 && o.r.height > 80)
        .sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height)[0];
      if (!best) return null;
      // Do NOT scrollIntoView here: on a YouTube watch page any scroll collapses
      // the player into a miniplayer and leaves a placeholder div behind, so the
      // coordinates would then point at nothing. Scroll to the top instead, which
      // is where the full-size player lives.
      window.scrollTo(0, 0);
      const r = best.v.getBoundingClientRect();
      const vh = window.innerHeight, vw = window.innerWidth;
      if (r.width < 120 || r.height < 80) return null;
      const x = Math.round(Math.min(Math.max(r.left + r.width / 2, 1), vw - 2));
      const y = Math.round(Math.min(Math.max(r.top + r.height / 2, 1), vh - 2));
      const bottomY = Math.round(Math.min(Math.max(r.bottom - 20, 1), vh - 2));
      if (y < 0 || y > vh || bottomY < 0 || bottomY > vh) return null;
      best.v.setAttribute('data-e2e-target', '1');
      return { x, y, bottomY, w: Math.round(r.width), h: Math.round(r.height),
               top: Math.round(r.top), vh, vw };
    });
    if (box) return box;
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(700);
  }
  // Diagnostics, so a null result is explainable rather than mysterious.
  const seen = await page.evaluate(() => [...document.querySelectorAll('video')].map((v) => {
    const r = v.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) };
  }));
  console.log(`            (no usable player; <video> boxes seen: ${JSON.stringify(seen)})`);
  return null;
}

const targetVideoTransform = (page) =>
  page.evaluate(() => {
    const v = document.querySelector('video[data-e2e-target="1"]') || document.querySelector('video');
    return v ? getComputedStyle(v).transform : 'no-video';
  });

async function main() {
  if (!fs.existsSync(path.join(DIST, 'manifest.json'))) {
    console.error('dist/manifest.json missing. Run `npm run build` first.');
    process.exit(1);
  }
  fs.mkdirSync(SHOTS, { recursive: true });

  const chrome = await launchChrome();
  const { browser, ctx, bs } = await connect();
  const t = reporter();

  try {
    // ---------------------------------------------------------------
    // EXT-01: the tab must exist BEFORE the extension does.
    // ---------------------------------------------------------------
    console.log('\nEXT-01  pre-existing tab');
    const page = await ctx.newPage();
    await page.goto(YT_WATCH, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(5000);
    await shot(page, '01-tab-before-install.png');

    const before = await domProbe(page);
    t.check('EXT-01a', 'Tab opened before install has no content script',
      before.panels === 0 && before.styleTags === 0, JSON.stringify(before));

    const { id: extId } = await bs.send('Extensions.loadUnpacked', { path: DIST });
    await sleep(2500);
    const sw = await getServiceWorker(ctx);
    const tabId = await sw.evaluate(async () => (await chrome.tabs.query({ active: true, currentWindow: true }))[0].id);

    const mf = await sw.evaluate(() => chrome.runtime.getManifest());
    t.check('T1', 'Manifest declares scripting and activeTab',
      mf.permissions.includes('scripting') && mf.permissions.includes('activeTab'),
      `v${mf.version} ${JSON.stringify(mf.permissions)}`);
    t.check('EXT-11', 'Package ships no store artwork',
      !fs.readdirSync(DIST).some((f) => /\.(png|jpg)$/i.test(f)), fs.readdirSync(DIST).join(', '));

    const inert = await domProbe(page);
    const pingBefore = await ping(sw, tabId);
    t.check('EXT-01b', 'Install alone does not reach the old tab',
      inert.styleTags === 0 && !pingBefore.ok, `ping=${JSON.stringify(pingBefore)}`);

    // the real user action
    const tTab = await tabTargetId(bs, 'youtube.com');
    await bs.send('Extensions.triggerAction', { id: extId, targetId: tTab });
    await sleep(2000);
    const healed = await domProbe(page);
    await shot(page, '02-injected-and-open.png');
    t.check('EXT-01c', 'Toolbar click injects into the pre-existing tab and opens the panel',
      healed.panels === 1 && healed.styleTags === 1 && (await ping(sw, tabId)).ok, JSON.stringify(healed));

    await bs.send('Extensions.triggerAction', { id: extId, targetId: tTab });
    await sleep(1500);
    const twice = await domProbe(page);
    t.check('EXT-01d', 'A second click does not double-inject',
      twice.panels === 1 && twice.styleTags === 1 && twice.hoverOverlays === 1, JSON.stringify(twice));

    // ---------------------------------------------------------------
    console.log('\npanel and transforms');
    const ui = await page.evaluate(() => {
      const h = document.getElementById('flip-rotate-interactive-root');
      if (!h?.shadowRoot) return { error: 'no shadow root' };
      const txt = h.shadowRoot.textContent || '';
      return { buttons: h.shadowRoot.querySelectorAll('button.panel-btn').length,
               slider: Boolean(h.shadowRoot.querySelector('input[type=range]')),
               title: txt.includes('Flip and Rotate'), parent: h.parentElement.tagName };
    });
    t.check('T2', 'Panel renders in a Shadow DOM hosted on <html>',
      ui.buttons >= 3 && ui.slider && ui.title && ui.parent === 'HTML', JSON.stringify(ui));

    await sw.evaluate(async (id) => chrome.tabs.sendMessage(id, { type: 'FLIP_X', scope: 'PAGE' }), tabId);
    await sleep(900);
    const bodyT = await page.evaluate(() => getComputedStyle(document.body).transform);
    const hostT = await page.evaluate(() => getComputedStyle(document.getElementById('flip-rotate-interactive-root')).transform);
    await shot(page, '03-page-flipped.png');
    t.check('T4', 'FLIP_X mirrors the page but not the panel',
      bodyT.includes('-1') && !hostT.includes('-1'), `body=${bodyT} panel=${hostT}`);

    // EXT-06 regression: correction must fire on the flip, not on every apply
    await page.evaluate(() => window.scrollTo(0, 800));
    await sleep(500);
    await sw.evaluate(async (id) => chrome.tabs.sendMessage(id, { type: 'FLIP_Y', scope: 'PAGE' }), tabId);
    await sleep(800);
    const anchor = await page.evaluate(() => window.scrollY);
    const positions = [];
    for (let i = 0; i < 3; i++) {
      await sw.evaluate(async (id) => chrome.tabs.sendMessage(id, { type: 'ROTATE', scope: 'PAGE', payload: { degrees: 90, relative: true } }), tabId);
      await sleep(600);
      positions.push(await page.evaluate(() => window.scrollY));
    }
    t.check('EXT-06', 'Scroll holds steady when rotating an already flipped page',
      positions.every((p) => Math.abs(p - anchor) <= 2), `anchor=${anchor} rotations=${JSON.stringify(positions)}`);

    await sw.evaluate(async (id) => chrome.tabs.sendMessage(id, { type: 'RESET', scope: 'PAGE' }), tabId);
    await sleep(700);
    const reset = await page.evaluate(() => ({ t: getComputedStyle(document.body).transform,
      mh: document.body.style.minHeight, ov: document.body.style.overflow }));
    t.check('T5', 'RESET clears the transform and the body style overrides',
      !reset.t.includes('-1') && reset.mh === '' && reset.ov === '', JSON.stringify(reset));

    // ---------------------------------------------------------------
    console.log('\nselection');
    // Fresh page: the checks above flip, rotate and reset this document, and a
    // selection test should not inherit that state.
    await page.close();
    const sel = await ctx.newPage();
    await sel.goto(YT_WATCH, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(6000);
    await bs.send('Extensions.triggerAction', { id: extId, targetId: await tabTargetId(bs, 'youtube.com') });
    await sleep(1800);
    const box = await videoBox(sel);
    if (box) {
      const smart = await sel.evaluate((b) => {
        const at = (x, y) => {
          const st = document.elementsFromPoint(x, y);
          const media = st.find((e) => ['VIDEO', 'IMG', 'SVG', 'CANVAS'].includes(e.tagName.toUpperCase()));
          return { top: st[0]?.tagName, picked: media?.tagName };
        };
        return { centre: at(b.x, b.y), controls: at(b.x, b.bottomY) };
      }, box);
      t.check('T3', 'Smart targeting resolves the player, preferring it over any overlay',
        smart.centre.picked === 'VIDEO' && smart.controls.picked === 'VIDEO',
        `${JSON.stringify(smart)} box=${box.w}x${box.h}`);
    } else {
      t.check('T3', 'Smart targeting resolves the player, preferring it over any overlay',
        false, 'no usable YouTube player rendered');
    }

    if (!box) {
      t.check('T6', 'Clicking the video selects it', false, 'no usable YouTube player rendered');
      t.check('T7', 'Panel flip mirrors the element only, leaving the page alone', false, 'skipped, no player');
    } else {
    await sel.mouse.move(box.x, box.y); await sleep(500);
    await sel.mouse.click(box.x, box.y); await sleep(1200);
    const status = await sel.evaluate(() => {
      const h = document.getElementById('flip-rotate-interactive-root');
      return h?.shadowRoot?.textContent.match(/\d+ Selected|Select Element/)?.[0] || null;
    });
    t.check('T6', 'Clicking the video selects it', /Selected/.test(status || ''), `status="${status}"`);

    await sel.locator('#flip-rotate-interactive-root button.panel-btn').nth(0).click();
    await sleep(1000);
    const vT = await targetVideoTransform(sel);
    const pageT = await sel.evaluate(() => getComputedStyle(document.body).transform);
    await shot(sel, '04-element-flipped.png');
    t.check('T7', 'Panel flip mirrors the element only, leaving the page alone',
      vT.includes('-1') && !pageT.includes('-1'), `video=${vT} body=${pageT}`);
    }

    // EXT-07: hotkeys must not fire while the user is typing
    const focused = await sel.evaluate(() => {
      const el = [...document.querySelectorAll('input,textarea,[contenteditable="true"]')].find((e) => e.offsetParent !== null);
      if (!el) return false;
      el.focus();
      return document.activeElement === el || el.contains(document.activeElement);
    });
    const t0 = await targetVideoTransform(sel);
    if (focused) { await sel.keyboard.type('rhubarb'); await sleep(1200); }
    const t1 = await targetVideoTransform(sel);
    t.check('EXT-07', 'Typing "rhubarb" into a page input does not reset the transform',
      focused && t0 === t1, `focused=${focused} before=${t0} after=${t1}`);

    await sel.evaluate(() => document.activeElement?.blur());
    await sel.keyboard.press('r');
    await sleep(1000);
    const afterR = await targetVideoTransform(sel);
    t.check('T8', 'The "r" hotkey still resets when focus is not in an input',
      !afterR.includes('-1'), `video=${afterR}`);

    // ---------------------------------------------------------------
    console.log('\nsettings');
    await sel.locator('#flip-rotate-interactive-root button[title="Settings"]').click();
    await sleep(600);
    const menu = await sel.evaluate(() => {
      const h = document.getElementById('flip-rotate-interactive-root');
      return [...h.shadowRoot.querySelectorAll('.settings-menu-item')].map((b) => b.textContent.trim());
    });
    t.check('EXT-12a', 'Settings menu exposes the animations toggle',
      menu.some((m) => /Animations/.test(m)), JSON.stringify(menu));

    await sel.locator('#flip-rotate-interactive-root .settings-menu-item').filter({ hasText: /Animations/ }).click();
    await sleep(900);
    const stored = await sw.evaluate(() => new Promise((r) => chrome.storage.sync.get('settings', (d) => r(d.settings))));
    t.check('EXT-12b', 'Toggle persists to storage.sync',
      stored?.animationsEnabled === false, JSON.stringify(stored));
    t.check('EXT-04', 'No whitelist key survives in stored settings',
      stored && !('whitelistRegex' in stored), `keys=${JSON.stringify(Object.keys(stored || {}))}`);

    // ---------------------------------------------------------------
    // EXT-03: an extension update orphans the running content script.
    // Uninstall then reinstall reproduces it without the CDP crash that
    // chrome.runtime.reload() triggers while a worker session is attached.
    // ---------------------------------------------------------------
    console.log('\nEXT-03  orphan teardown');
    await bs.send('Extensions.uninstall', { id: extId });
    await sleep(2500);
    const orphan = await domProbe(sel);
    const { id: extId2 } = await bs.send('Extensions.loadUnpacked', { path: DIST });
    await sleep(2500);
    const sw2 = await getServiceWorker(ctx);
    await bs.send('Extensions.triggerAction', { id: extId2, targetId: await tabTargetId(bs, 'youtube.com') });
    await sleep(3000);
    const after = await domProbe(sel);
    await shot(sel, '05-after-update.png');
    t.check('EXT-03', 'Re-injection tears the orphan down: one panel, one stylesheet, one overlay',
      after.panels === 1 && after.styleTags === 1 && after.hoverOverlays === 1,
      `orphan=${JSON.stringify(orphan)} after=${JSON.stringify(after)}`);

    // ---------------------------------------------------------------
    console.log('\nEXT-02  restricted pages');
    const rp = await ctx.newPage();
    await rp.goto('chrome://version', { timeout: 15000 }).catch(() => {});
    await sleep(2000);
    const rTab = await tabTargetId(bs, 'chrome://version');
    await bs.send('Extensions.triggerAction', { id: extId2, targetId: rTab }).catch(() => {});
    await sleep(2000);
    const badge = await sw2.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return { url: tab.url, text: await chrome.action.getBadgeText({ tabId: tab.id }),
               title: await chrome.action.getTitle({ tabId: tab.id }) };
    });
    await shot(rp, '06-restricted-page.png');
    t.check('EXT-02', 'Restricted page badges, and never tells the user to refresh',
      badge.text === '!' && /can.t run on this page/i.test(badge.title) && !/refresh/i.test(badge.title),
      JSON.stringify(badge));

    await rp.goto('https://example.com', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await sleep(2500);
    const cleared = await sw2.evaluate(async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return { text: await chrome.action.getBadgeText({ tabId: tab.id }), title: await chrome.action.getTitle({ tabId: tab.id }) };
    });
    t.check('EXT-02b', 'Badge clears when the tab navigates away',
      cleared.text === '' && cleared.title === 'Flip Control', JSON.stringify(cleared));
  } finally {
    const ok = t.summary();
    fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(t.results, null, 2));
    await browser.close().catch(() => {});
    stopChrome(chrome);
    process.exit(ok ? 0 : 1);
  }
}

main().catch((e) => { console.error('HARNESS FAIL:', e.stack); process.exit(1); });
