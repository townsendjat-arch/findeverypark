/* Focused All events regression. Local, read-only browser traffic only.
 * BROWSER=chromium|webkit node tests/all-events.browser.js
 * node tests/all-events.browser.js --preflight checks immutable data without a browser.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const now = '2026-10-22T16:00:00Z';
const output = path.join(root, 'test-results');
const baselines = [
  { name: 'pre-pr5', ref: '3a12e7b6bffad111c3a44a5ac25f7bf0c4aa73be', prefix: '/__all_events_pre_pr5__', total: 47, current: 16 },
  { name: 'production', ref: '9d965f2d7cff56e38ff2705181d2b8922473f94e', prefix: '/__all_events_baseline__', total: 58, current: 27 }
];
const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
const snapshots = new Map();
function readSnapshot(ref, file) {
  const key = ref + ':' + file;
  if (!snapshots.has(key)) snapshots.set(key, git(['show', key]));
  return snapshots.get(key);
}
function loadData(read) {
  const context = { window: {}, document: { readyState: 'loading', addEventListener() {} } };
  vm.createContext(context);
  for (const file of ['city-events.js', 'data/events/events-manifest.js']) vm.runInContext(read(file).toString(), context);
  const { EVENTS_DATA: data, FEP_EVENTS: rules } = context.window;
  return { data: JSON.parse(JSON.stringify(data)), current: JSON.parse(JSON.stringify(data.events.filter(event => rules.isCurrent(event, new Date(now))))),
    counts: { total: data.events.length, current: data.events.filter(event => rules.isCurrent(event, new Date(now))).length,
      archived: data.events.filter(event => rules.isPublishable(event) && !rules.isCurrent(event, new Date(now))).length,
      excluded: data.events.filter(event => !rules.isPublishable(event)).length,
      pumpkins: data.events.filter(rules.isPumpkin).length } };
}
// Fetch immutable public commit objects only when CI's shallow checkout needs them.
// This does not change a remote, branch, workflow, deployment or working-tree file.
for (const baseline of baselines) {
  try { git(['cat-file', '-e', baseline.ref + '^{commit}']); }
  catch (_) { git(['fetch', '--no-tags', '--depth=1', 'origin', baseline.ref]); }
  baseline.fixture = loadData(file => readSnapshot(baseline.ref, file));
  assert.deepEqual(baseline.fixture.counts, { total: baseline.total, current: baseline.current, archived: 30, excluded: 1, pumpkins: 6 });
}
const final = { name: 'fixed', prefix: '', fixture: loadData(file => fs.readFileSync(path.join(root, file))) };
const novemberAudit = JSON.parse(fs.readFileSync(path.join(root, 'docs/november-source-review-2026-10-22.json'), 'utf8'));
const novemberIds = new Set(novemberAudit.events.map(event => event.id));
assert.equal(novemberAudit.events.length, 8);
assert.equal(novemberIds.size, 8, 'November additions have eight distinct canonical IDs.');
assert.deepEqual(final.fixture.counts, { total: 66, current: 35, archived: 30, excluded: 1, pumpkins: 6 });
const originalRecords = final.fixture.data.events.filter(event => !novemberIds.has(event.id));
assert.deepEqual(originalRecords, baselines[1].fixture.data.events, 'All 58 historical records retain their exact objects and order.');
assert.deepEqual(final.fixture.data.events.filter(event => novemberIds.has(event.id)), novemberAudit.events, 'Only the eight audited November records are added.');
const unchangedMetadata = data => Object.fromEntries(Object.entries(data).filter(([key]) => !['events', 'updatedLabel'].includes(key)));
assert.deepEqual(unchangedMetadata(final.fixture.data), unchangedMetadata(baselines[1].fixture.data), 'City metadata and every other global field remain unchanged.');
assert.equal(typeof final.fixture.data.updatedLabel, 'string');
assert.ok(final.fixture.data.updatedLabel.trim(), 'The global update label remains visible.');
assert.deepEqual(final.fixture.data.events.filter(event => event.pumpkin), baselines[0].fixture.data.events.filter(event => event.pumpkin), 'All six pumpkin records are unchanged from before PR #5.');
console.log('PASS additive November data: 66/35/30/1; original 58 records and all city metadata preserved; historical 47/16/30/1 and 58/27/30/1 baselines; six unchanged pumpkins');
if (process.argv.includes('--preflight')) process.exit(0);

const { chromium, webkit } = require('playwright');
const engineName = process.env.BROWSER || 'chromium';
assert.ok(['chromium', 'webkit'].includes(engineName), 'BROWSER must be chromium or webkit');
const results = [], failures = [];
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    let requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const baseline = baselines.find(item => requested.startsWith(item.prefix + '/'));
    if (baseline) requested = requested.slice(baseline.prefix.length);
    if (requested === '/') requested = '/index.html';
    const target = path.resolve(root, '.' + requested);
    if (!target.startsWith(root + path.sep) || requested.split('/').some(segment => segment.startsWith('.'))) { res.writeHead(404).end(); return; }
    // Every prefixed asset comes from the same exact revision, never a mixed page.
    const body = baseline ? readSnapshot(baseline.ref, requested.slice(1)) : fs.readFileSync(target);
    res.setHeader('Content-Type', mime[path.extname(target)] || 'application/octet-stream');
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (_) { res.writeHead(404).end(); }
});
async function check(name, callback) {
  try { await callback(); results.push({ name, passed: true }); console.log('PASS', name); }
  catch (error) { failures.push({ name, message: error.stack }); console.error('FAIL', name, error.stack); }
}
const allEvents = page => page.locator('.event-category-pill[data-category=""]');
const pumpkins = page => page.locator('.event-category-pill[data-category="pumpkin-patches"]');
const cityPill = (page, city) => page.locator(`.event-filter-pill[data-city="${city}"]`);
async function state(page) {
  return {
    url: page.url(),
    ids: await page.locator('[data-current="true"]:visible').evaluateAll(cards => cards.map(card => card.dataset.eventId).sort()),
    city: await page.locator('.event-filter-pill[aria-pressed="true"]').getAttribute('data-city'),
    category: await page.locator('.event-category-pill[aria-pressed="true"]').getAttribute('data-category'),
    title: await page.locator('#page-title').textContent(),
    status: await page.locator('#filter-status').textContent(),
    empty: await page.locator('#empty-city').isVisible(),
    emptyCopy: await page.locator('#empty-city-copy').textContent()
  };
}
async function assertState(page, fixture, city = '', category = '') {
  const expected = fixture.current.filter(event => (!city || event.city === city) && (!category || event.category === category)).map(event => event.id).sort();
  await page.waitForFunction(({ city, category, count }) => {
    const selectedCity = document.querySelector('.event-filter-pill[aria-pressed="true"]');
    const selectedCategory = document.querySelector('.event-category-pill[aria-pressed="true"]');
    return selectedCity && selectedCity.dataset.city === city && selectedCategory && selectedCategory.dataset.category === category &&
      document.querySelector('#filter-status').textContent.startsWith(count + ' current or upcoming ');
  }, { city, category, count: expected.length });
  const actual = await state(page), url = new URL(actual.url);
  assert.equal(url.searchParams.get('city') || '', city.replace(/_/g, '-'));
  assert.equal(url.searchParams.get('category') || '', category);
  assert.deepEqual(actual.ids, expected, 'Exact current event IDs, not merely the card count');
  const label = city ? fixture.data.cities[city].label : 'All Cities';
  assert.equal(actual.title, city ? label + ' Events' : 'Front Range Events');
  assert.equal(actual.status, expected.length + ' current or upcoming ' + (category ? 'pumpkin listing' : 'event') + (expected.length === 1 ? '' : 's') + ' · ' + label + ' · All times Mountain Time');
  assert.equal(actual.empty, expected.length === 0);
  assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').count(), 1);
  assert.equal(await page.locator('.event-category-pill[aria-pressed="true"]').count(), 1);
  assert.equal(await cityPill(page, city).evaluate(button => button.classList.contains('active')), true);
  assert.equal(await page.locator('#filter-status').getAttribute('role'), 'status');
  assert.equal(await page.locator('#filter-status').getAttribute('aria-live'), 'polite');
  assert.equal(await page.locator('[data-current="false"]').count(), 30, 'Archive retained');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Events page fits viewport');
  return actual;
}
async function screenshot(page, name) {
  await page.locator('.event-category-pills').evaluate(element => element.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: path.join(output, `${engineName}-all-events-${name}.png`), fullPage: false });
}

(async () => {
  fs.mkdirSync(output, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await ({ chromium, webkit })[engineName].launch({ headless: true });
    for (const [label, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }], ['small-mobile', { width: 320, height: 740 }]]) {
      const context = await browser.newContext({ viewport, timezoneId: 'America/Denver' });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      const pageErrors = [], consoleErrors = [], failedLocalRequests = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') consoleErrors.push({ text: message.text(), location: message.location() }); });
      page.on('response', response => { if (response.url().startsWith(origin + '/') && response.status() >= 400) failedLocalRequests.push({ url: response.url(), status: response.status() }); });
      page.on('requestfailed', request => { if (request.url().startsWith(origin + '/')) failedLocalRequests.push({ url: request.url(), error: request.failure() }); });
      await page.clock.install({ time: new Date(now) });
      await context.route('**/*', route => {
        const request = route.request();
        if (new URL(request.url()).origin === origin && ['GET', 'HEAD'].includes(request.method())) return route.continue();
        // Stub analytics/fonts/remote assets rather than creating expected blocked-network errors.
        // No external request, submission, account action or third-party navigation is made.
        const type = request.resourceType();
        return route.fulfill({ status: 200, contentType: type === 'stylesheet' ? 'text/css' : type === 'image' ? 'image/svg+xml' : 'text/javascript',
          body: type === 'image' ? '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>' : '' });
      });
      for (const version of [...baselines, final]) {
        await check(`${label}: ${version.name} homepage See All Events navigates globally`, async () => {
          await page.goto(origin + version.prefix + '/index.html?city=aurora&category=pumpkin-patches');
          const link = page.getByRole('link', { name: 'See All Events', exact: true });
          assert.equal(await link.getAttribute('href'), './events.html');
          await link.click();
          await page.waitForURL(origin + version.prefix + '/events.html');
          await assertState(page, version.fixture);
        });
      }
      for (const baseline of baselines) {
        await check(`${label}: ${baseline.name} reproduces city-stuck and empty All events bug`, async () => {
          for (const city of ['aurora', 'centennial', 'arvada']) {
            await page.goto(origin + baseline.prefix + '/events.html');
            await cityPill(page, city).click();
            await pumpkins(page).click();
            await assertState(page, baseline.fixture, city, 'pumpkin-patches');
            await allEvents(page).click();
            const actual = await assertState(page, baseline.fixture, city);
            assert.ok(actual.ids.length < baseline.fixture.counts.current, 'Known-broken control must not silently become a passing reset');
            if (city === 'arvada') assert.match(actual.emptyCopy, /Try All events/);
            if (city !== 'centennial') await screenshot(page, `before-${baseline.name}-${city}-${label}`);
          }
        });
      }
      await check(`${label}: All events clears each selected city, even with no category change`, async () => {
        await page.goto(origin + '/events.html');
        for (const city of ['aurora', 'centennial', 'parker', 'denver', 'arvada']) {
          await cityPill(page, city).click();
          await assertState(page, final.fixture, city);
          await allEvents(page).click();
          await assertState(page, final.fixture);
        }
      });
      await check(`${label}: Pumpkin Patches intersects cities; All Cities retains category; All events resets both`, async () => {
        await page.goto(origin + '/events.html');
        await pumpkins(page).click();
        await assertState(page, final.fixture, '', 'pumpkin-patches');
        for (const city of ['aurora', 'centennial', 'arvada']) {
          await cityPill(page, city).click();
          await assertState(page, final.fixture, city, 'pumpkin-patches');
          await allEvents(page).click();
          await assertState(page, final.fixture);
          if (city !== 'centennial') await screenshot(page, `after-fixed-${city}-${label}`);
          await pumpkins(page).click();
        }
        await cityPill(page, 'aurora').click();
        await cityPill(page, '').click();
        await assertState(page, final.fixture, '', 'pumpkin-patches');
        await allEvents(page).click();
        await assertState(page, final.fixture);
      });
      await check(`${label}: reset preserves unrelated URL parameters/hash and Back/Forward restores exact states`, async () => {
        await page.goto(origin + '/events.html?utm_source=reset-test&tag=one&tag=two#test-anchor');
        const historyStates = [await assertState(page, final.fixture)];
        await cityPill(page, 'aurora').click();
        historyStates.push(await assertState(page, final.fixture, 'aurora'));
        await pumpkins(page).click();
        historyStates.push(await assertState(page, final.fixture, 'aurora', 'pumpkin-patches'));
        await allEvents(page).click();
        historyStates.push(await assertState(page, final.fixture));
        const url = new URL(page.url());
        assert.deepEqual([...url.searchParams.entries()], [['utm_source', 'reset-test'], ['tag', 'one'], ['tag', 'two']]);
        assert.equal(url.hash, '#test-anchor');
        for (const index of [2, 1, 0]) {
          await page.goBack();
          await assertState(page, final.fixture, historyStates[index].city, historyStates[index].category);
          assert.deepEqual(await state(page), historyStates[index]);
        }
        for (const index of [1, 2, 3]) {
          await page.goForward();
          await assertState(page, final.fixture, historyStates[index].city, historyStates[index].category);
          assert.deepEqual(await state(page), historyStates[index]);
        }
        await page.reload();
        assert.deepEqual(await assertState(page, final.fixture), historyStates[3], 'Global reset persists on reload');
      });
      await check(`${label}: empty deep link recovers; repeated resets stay global without losing prior history`, async () => {
        await page.goto(origin + '/events.html?city=arvada&category=pumpkin-patches');
        const previous = await assertState(page, final.fixture, 'arvada', 'pumpkin-patches');
        for (let index = 0; index < 3; index++) { await allEvents(page).click(); await assertState(page, final.fixture); }
        // Existing pushState-per-click behavior is intentionally preserved, not redesigned.
        for (let index = 0; index < 2; index++) { await page.goBack(); await assertState(page, final.fixture); }
        await page.goBack();
        await assertState(page, final.fixture, 'arvada', 'pumpkin-patches');
        assert.deepEqual(await state(page), previous);
        await page.goForward();
        await assertState(page, final.fixture);
      });
      await check(`${label}: Enter/Space activate native reset and filter buttons with accessible selected state`, async () => {
        for (const key of ['Enter', 'Space']) {
          await page.goto(origin + '/events.html?city=centennial&category=pumpkin-patches');
          await allEvents(page).focus();
          await page.keyboard.press(key);
          await assertState(page, final.fixture);
          assert.equal(await allEvents(page).evaluate(button => button === document.activeElement && button.tagName === 'BUTTON' && button.type === 'button'), true);
          await page.keyboard.press('Tab');
          assert.equal(await pumpkins(page).evaluate(button => button === document.activeElement), true);
          await page.keyboard.press(key);
          await assertState(page, final.fixture, '', 'pumpkin-patches');
          await cityPill(page, 'aurora').focus();
          await page.keyboard.press(key);
          await assertState(page, final.fixture, 'aurora', 'pumpkin-patches');
        }
        for (const box of await page.locator('.event-filter-pill, .event-category-pill').evaluateAll(buttons => buttons.map(button => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })))) {
          assert.ok(box.width >= 44 && box.height >= 44, 'Minimum 44px filter target');
        }
      });
      await check(`${label}: no page exceptions, console errors or failed local resources`, async () => {
        assert.deepEqual(pageErrors, []);
        assert.deepEqual(consoleErrors, []);
        assert.deepEqual(failedLocalRequests, []);
      });
      await context.close();
    }
  } finally {
    if (browser) await browser.close();
    server.close();
    fs.writeFileSync(path.join(output, `${engineName}-all-events-results.json`), JSON.stringify({ engine: engineName, at: now,
      baselines: baselines.map(({ name, ref, fixture }) => ({ name, ref, counts: fixture.counts })), results, failures }, null, 2));
  }
  console.log(`${results.length} passed, ${failures.length} failed`);
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
