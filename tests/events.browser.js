/* Test-only local HTTP server; no live third-party submissions or navigation. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const root = path.join(__dirname, '..');
const output = path.join(root, 'test-results');
fs.mkdirSync(output, { recursive: true });
const server = http.createServer((req, res) => {
  const requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const target = path.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404).end(); return; }
  const ext = path.extname(target);
  res.setHeader('Content-Type', ({ '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg' })[ext] || 'application/octet-stream');
  res.end(fs.readFileSync(target));
});
const results = [];
const failures = [];
async function check(name, callback) {
  try { await callback(); results.push({ name, passed: true }); console.log('PASS', name); }
  catch (error) { failures.push({ name, message: error.stack }); console.error('FAIL', name, error.stack); }
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const engineName = process.env.BROWSER || 'chromium';
  const browser = await ({ chromium, webkit })[engineName].launch({ headless: true });
  for (const [label, viewport] of [['desktop',{width:1440,height:1000}], ['mobile',{width:390,height:844}], ['small-mobile',{width:320,height:740}]]) {
    const context = await browser.newContext({ viewport, timezoneId: label === 'desktop' ? 'Asia/Tokyo' : 'America/Los_Angeles' });
    const page = await context.newPage();
    const pageErrors = []; page.on('pageerror', error => pageErrors.push(error.message));
    // Freeze time to the research date, independent of CI's current date.
    await page.clock.install({ time: new Date('2026-10-21T16:00:00Z') });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      // Fonts are presentation only. All analytics, external images, actions are blocked.
      return url.origin === origin || ['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname) ? route.continue() : route.abort();
    });
    await check(`${label}: initial Aurora query and visible city`, async () => {
      await page.goto(origin + '/events.html?city=aurora');
      await page.locator('.event-filter-pill[aria-pressed="true"]').waitFor();
      assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').textContent(), 'Aurora');
      assert.equal(await page.locator('#page-title').textContent(), 'Aurora Events');
      const visible = page.locator('[data-current="true"]:visible');
      assert.equal(await visible.count(), 5);
      assert.ok((await visible.evaluateAll(items => items.map(e => e.dataset.city))).every(city => city === 'aurora'));
      assert.ok(await page.locator('#aurora-events-link-paths').isVisible());
    });
    await check(`${label}: no horizontal overflow`, async () => {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    });
    await check(`${label}: full event details, registration and park links`, async () => {
      const nature = page.locator('[data-event-id="aurora-trick-or-treat-nature-trail-2026"]');
      assert.match(await nature.textContent(), /10 a\.m\./);
      assert.match(await nature.textContent(), /Details checked October 21, 2026/);
      assert.ok(await nature.locator('a:has-text("Registration")').count());
      const parkHref = await nature.locator('a:has-text("Park stop")').getAttribute('href');
      assert.match(parkHref, /co-aurora-star-k-ranch/);
      assert.match(await nature.textContent(), /not verified/);
    });
    await check(`${label}: calendar uses Mountain time and correct exclusive all-day end`, async () => {
      const calendar = await page.evaluate(() => ({
        invalid: buildCalendarUrl({ title: 'Test', dateStart: '2026-10-21', dateEnd: '2026-13-01' }),
        timed: buildCalendarUrl({ title: 'Test', dateStart: '2026-10-24T11:00:00-06:00', dateEnd: '2026-10-24T13:00:00-06:00' }),
        allDay: buildCalendarUrl({ title: 'Test', dateStart: '2026-10-24', dateEnd: '2026-10-25' }),
        unknownEnd: buildCalendarUrl({ title: 'Test', dateStart: '2026-10-24T17:00:00-06:00', dateEnd: '2026-10-24', calendarDisabled: true }),
        series: buildCalendarUrl({ recurring: true, dateStart: '2026-10-24T11:00:00-06:00', dateEnd: '2026-10-25T13:00:00-06:00' })
      }));
      assert.equal(new URL(calendar.timed).searchParams.get('ctz'), 'America/Denver');
      assert.equal(new URL(calendar.timed).searchParams.get('dates'), '20261024T170000Z/20261024T190000Z');
      assert.equal(new URL(calendar.allDay).searchParams.get('dates'), '20261024/20261026');
      assert.equal(calendar.unknownEnd, ''); assert.equal(calendar.series, ''); assert.equal(calendar.invalid, '');
    });
    await check(`${label}: schedule expansion preserved on idle refresh`, async () => {
      const details = page.locator('[data-event-id="aurora-nicks-fall-fest-2026"] details');
      await details.locator('summary').click();
      await page.clock.fastForward('01:00');
      assert.equal(await details.getAttribute('open'), '');
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(output, `${engineName}-events-aurora-${label}.png`), fullPage: false });
    await page.locator('[data-current="true"]:visible').first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `${engineName}-event-cards-${label}.png`), fullPage: false });
    await check(`${label}: all requested city filters and back/forward`, async () => {
      for (const city of ['centennial','parker','denver','aurora']) {
        await page.locator(`.event-filter-pill[data-city="${city}"]`).click();
        assert.equal(new URL(page.url()).searchParams.get('city'), city);
        const visible = page.locator('[data-current="true"]:visible');
        assert.ok(await visible.count() > 0, city);
        assert.ok((await visible.evaluateAll(items => items.map(e => e.dataset.city))).every(value => value === city));
      }
      await page.goBack(); assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').textContent(), 'Denver');
      await page.goForward(); assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').textContent(), 'Aurora');
      await page.locator('.event-filter-pill[data-city=""]').click();
      assert.equal(new URL(page.url()).searchParams.has('city'), false);
      assert.ok(await page.locator('[data-current="true"]:visible').count() >= 10);
    });
    await check(`${label}: empty city and hyphen alias`, async () => {
      await page.goto(origin + '/events.html?city=highlands-ranch');
      assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').textContent(), 'Highlands Ranch');
      assert.equal(await page.locator('[data-current="true"]:visible').count(), 0);
      assert.ok(await page.locator('#empty-city').isVisible());
    });
    await check(`${label}: accessible filter state and keyboard target`, async () => {
      const button = page.locator('.event-filter-pill[data-city="aurora"]');
      await button.focus(); await page.keyboard.press('Enter');
      assert.equal(await button.getAttribute('aria-pressed'), 'true');
      for (const box of await page.locator('.event-filter-pill').evaluateAll(items => items.map(item => ({ width:item.getBoundingClientRect().width,height:item.getBoundingClientRect().height })))) assert.ok(box.height >= 44 && box.width >= 44);
      const audit = await new AxeBuilder({ page }).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      fs.writeFileSync(path.join(output, `${engineName}-axe-${label}.json`), JSON.stringify(audit.violations, null, 2));
      assert.deepEqual(audit.violations.map(v => ({ id:v.id, impact:v.impact, nodes:v.nodes.length })), []);
    });
    await check(`${label}: exact expiry in open tab and no stale homepage/city cards`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-24T18:59:30Z'));
      await page.goto(origin + '/events.html?city=aurora');
      assert.equal(await page.locator('[data-event-id="aurora-halloween-on-havana-2026"]').count(), 1);
      await page.clock.setFixedTime(new Date('2026-10-24T19:00:01Z'));
      await page.clock.fastForward('01:00');
      assert.equal(await page.locator('[data-event-id="aurora-halloween-on-havana-2026"]').count(), 0);
      await page.clock.setFixedTime(new Date('2026-11-02T20:00:00Z'));
      await page.goto(origin + '/events.html?city=aurora');
      assert.equal(await page.locator('[data-current="true"]:visible').count(), 0);
      await page.goto(origin + '/index.html?city=aurora');
      assert.equal(await page.locator('.home-event-card:visible').count(), 0);
      await page.goto(origin + '/best-parks-aurora.html');
      assert.equal(await page.locator('.city-event-card:visible').count(), 0);
    });
    await check(`${label}: homepage stays park-first and caps events at three`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-21T16:00:00Z'));
      await page.goto(origin + '/index.html?city=aurora');
      assert.equal(await page.locator('.home-event-card').count(), 3);
      assert.ok(await page.locator('#geoBtn').count());
      await page.screenshot({ path: path.join(output, `${engineName}-homepage-${label}.png`), fullPage: false });
      await page.locator('.home-events').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `${engineName}-homepage-events-${label}.png`), fullPage: false });
    });
    await check(`${label}: no uncaught JavaScript exceptions`, async () => assert.deepEqual(pageErrors, []));
    await context.close();
  }
  await browser.close(); server.close();
  fs.writeFileSync(path.join(output, `${engineName}-results.json`), JSON.stringify({ results, failures }, null, 2));
  console.log(`${results.length} passed, ${failures.length} failed`);
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
