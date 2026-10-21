/* Test-only local server. No organizer navigation, live submissions or inventory claims. */
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
  let requested;
  try { requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const target = path.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' })[path.extname(target)] || 'application/octet-stream');
  res.end(fs.readFileSync(target));
});
const results = [];
const failures = [];
const engineName = process.env.BROWSER || 'chromium';
const fixedTime = '2026-10-21T16:00:00Z';
let currentPage;
const natureId = 'aurora-trick-or-treat-nature-trail-2026';
const nicksId = 'aurora-nicks-fall-fest-2026';
const soldId = 'test-only-sold-out-discovery';
const soldOutFixture = {
  id: soldId, city: 'aurora', title: 'Test-only sold-out session', section: 'holiday', recurring: false, featured: true,
  status: 'approved', verifiedAt: '2026-10-21', timezone: 'America/Denver',
  dateStart: '2026-10-23T07:00:00-06:00', dateEnd: '2026-10-23T08:00:00-06:00',
  dateLabel: 'October 23, 2026', timeLabel: '7–8 a.m. MDT', locationLabel: 'Test fixture location',
  description: 'Synthetic sold-out fixture used only in automated tests.',
  costLabel: 'SOLD OUT — test fixture', costType: 'free', audienceLabel: 'Test fixture',
  availabilityStatus: 'sold_out', availabilityLabel: 'SOLD OUT: test fixture only; no tickets offered.',
  calendarDisabled: true, sourceType: 'test_fixture', href: 'https://example.invalid/test-only-event',
  sourceUrls: ['https://example.invalid/test-only-event'], nearbyParks: []
};
const visibleCards = page => page.locator('#events-root [data-current="true"]:visible');
const card = (page, id) => page.locator('#event-' + id);
async function check(name, callback) {
  try {
    await currentPage.clock.setFixedTime(new Date(fixedTime));
    try { await callback(); }
    finally { await currentPage.clock.setFixedTime(new Date(fixedTime)); }
    results.push({ name, passed: true }); console.log('PASS', name);
  }
  catch (error) { failures.push({ name, message: error.stack }); console.error('FAIL', name, error.stack); }
}
async function noOverflow(page) {
  const bounds = await page.evaluate(() => ({
    viewport: innerWidth, content: document.documentElement.scrollWidth,
    overflowing: document.documentElement.scrollWidth <= innerWidth ? [] : Array.from(document.body.querySelectorAll('*')).flatMap(element => {
      const box = element.getBoundingClientRect();
      if (!box.width || !box.height || (box.left >= -0.5 && box.right <= innerWidth + 0.5)) return [];
      const style = getComputedStyle(element);
      return [{ element: element.tagName.toLowerCase() + (element.id ? '#' + element.id : '') + (typeof element.className === 'string' && element.className ? '.' + element.className.trim().replace(/\s+/g, '.') : ''),
        left: Math.round(box.left * 100) / 100, right: Math.round(box.right * 100) / 100, width: Math.round(box.width * 100) / 100,
        minWidth: style.minWidth, whiteSpace: style.whiteSpace, text: (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90) }];
    }).slice(0, 25)
  }));
  assert.ok(bounds.content <= bounds.viewport, JSON.stringify(bounds, null, 2));
}
async function followInternalLink(page, link) {
  const destination = new URL(await link.getAttribute('href'), page.url());
  assert.equal(destination.origin, new URL(page.url()).origin, 'test only follows internal links');
  await Promise.all([page.waitForURL(destination.href, { waitUntil: 'load' }), link.click()]);
}
async function expectedCards(page, city, view) {
  return page.evaluate(({ city, view }) => window.EVENTS_DATA.events.filter(event =>
    (!city || window.FEP_EVENTS.normCity(event.city) === city) && window.FEP_EVENTS.matchingOccurrences(event, view, new Date()).length
  ).map(event => event.id).sort(), { city, view });
}
async function assertFilter(page, city, view) {
  assert.equal(await page.locator('#event-date-filter').inputValue(), view);
  assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').getAttribute('data-city'), city);
  assert.deepEqual((await visibleCards(page).evaluateAll(items => items.map(item => item.dataset.eventId))).sort(), await expectedCards(page, city, view));
}
async function settleColors(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.querySelectorAll('.event-filter-pill')).flatMap(item => item.getAnimations().map(animation => animation.finished.catch(() => {}))));
  });
}
(async () => {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await ({ chromium, webkit })[engineName].launch({ headless: true });
  // 320 CSS px is a narrow-layout/reflow proxy, not actual 400% browser zoom or a real device.
  const viewports = [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }], ['small-mobile', { width: 320, height: 740 }], ['width-400', { width: 400, height: 844 }]];
  for (const [label, viewport] of viewports) {
    const context = await browser.newContext({ viewport, timezoneId: label === 'desktop' ? 'Asia/Tokyo' : 'America/Los_Angeles' });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      // Park profiles require their existing pinned Leaflet assets; map tiles and all actions stay blocked.
      const leafletAsset = url.hostname === 'unpkg.com' && url.pathname.startsWith('/leaflet@1.9.4/dist/');
      return url.origin === origin || ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname) || leafletAsset ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.clock.install({ time: new Date(fixedTime) });
    currentPage = page;

    await check(`${label}: date selector and city/date combined filtering use actual occurrences`, async () => {
      await page.goto(origin + '/events.html?city=aurora&date=weekend');
      assert.deepEqual(await page.locator('#event-date-filter option').evaluateAll(items => items.map(item => item.value)), ['all', 'weekend', '2026-10', '2026-11', '2026-12']);
      assert.equal(await page.locator('label[for="event-date-filter"]').textContent(), 'Event dates');
      await assertFilter(page, 'aurora', 'weekend');
      assert.equal(await visibleCards(page).count(), 4);
      assert.match(await page.locator('#filter-status').textContent(), /Oct.*23.*Oct.*25.*2026/);
      assert.equal(await card(page, 'aurora-mall-o-ween-2026').isVisible(), false);
      for (const city of ['centennial', 'parker', 'denver', 'aurora']) {
        await page.locator(`.event-filter-pill[data-city="${city}"]`).click();
        await assertFilter(page, city, 'weekend');
      }
      await page.locator('#event-date-filter').selectOption('2026-10');
      await assertFilter(page, 'aurora', '2026-10');
      assert.equal(await visibleCards(page).count(), 5);
      await noOverflow(page);
    });

    await check(`${label}: empty November and December are honest and recover without resetting the city`, async () => {
      await page.goto(origin + '/events.html?city=aurora&date=all');
      for (const month of ['2026-11', '2026-12']) {
        await page.locator('#event-date-filter').selectOption(month);
        await assertFilter(page, 'aurora', month);
        assert.equal(await visibleCards(page).count(), 0);
        assert.ok(await page.locator('#empty-city').isVisible());
        assert.match(await page.locator('#empty-city-copy').textContent(), /No verified listings yet/);
        assert.match(await page.locator('#empty-city-copy').textContent(), /Aurora/);
        assert.equal(new URL(page.url()).searchParams.get('city'), 'aurora');
      }
      await page.locator('#event-date-filter').selectOption('weekend');
      await assertFilter(page, 'aurora', 'weekend');
      assert.equal(await page.locator('#empty-city').isVisible(), false);
      await page.locator('#event-date-filter').selectOption('all');
      await assertFilter(page, 'aurora', 'all');
    });

    await check(`${label}: city/date history preserves unrelated query values and hash`, async () => {
      const hash = '#event-' + natureId;
      await page.goto(origin + '/events.html?city=aurora&campaign=fall%20family&source=review' + hash);
      await page.locator('#event-date-filter').selectOption('weekend');
      await page.locator('.event-filter-pill[data-city="centennial"]').click();
      await page.locator('#event-date-filter').selectOption('2026-11');
      for (const [move, city, view] of [['back', 'centennial', 'weekend'], ['back', 'aurora', 'weekend'], ['back', 'aurora', 'all'], ['forward', 'aurora', 'weekend'], ['forward', 'centennial', 'weekend'], ['forward', 'centennial', '2026-11']]) {
        if (move === 'back') await page.goBack(); else await page.goForward();
        await assertFilter(page, city, view);
        const url = new URL(page.url());
        assert.equal(url.searchParams.get('campaign'), 'fall family');
        assert.equal(url.searchParams.get('source'), 'review');
        assert.equal(url.hash, hash);
      }
      await page.locator('#event-date-filter').selectOption('all');
      await page.locator('.event-filter-pill[data-city=""]').click();
      const url = new URL(page.url());
      assert.equal(url.searchParams.has('city'), false);
      assert.equal(url.searchParams.has('date'), false);
      assert.equal(url.searchParams.get('campaign'), 'fall family');
      assert.equal(url.hash, hash);
    });

    await check(`${label}: deep link expands the matching schedule and hash navigation focuses its card`, async () => {
      await page.goto(origin + '/events.html?city=aurora&date=weekend#event-' + natureId);
      const target = card(page, natureId);
      assert.ok(await target.isVisible());
      assert.equal(await target.getAttribute('data-event-id'), natureId);
      assert.equal(await target.locator('details').getAttribute('open'), '');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'event-' + natureId);
      await page.evaluate(id => { location.hash = 'event-' + id; }, nicksId);
      await page.waitForFunction(id => document.activeElement.id === 'event-' + id, nicksId);
      assert.equal(await card(page, nicksId).locator('details').getAttribute('open'), '');
      await page.clock.fastForward('01:00');
      assert.equal(await card(page, nicksId).locator('details').getAttribute('open'), '');
      await noOverflow(page);
      await page.screenshot({ path: path.join(output, `${engineName}-discovery-anchored-${label}.png`), fullPage: false });
    });

    await check(`${label}: native date control and city pills are keyboard usable with 44px targets`, async () => {
      await page.goto(origin + '/events.html?city=aurora');
      const date = page.locator('#event-date-filter');
      await date.focus();
      assert.equal(await page.evaluate(() => document.activeElement.id), 'event-date-filter');
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      assert.equal(await date.inputValue(), 'weekend');
      const denver = page.locator('.event-filter-pill[data-city="denver"]');
      await denver.focus(); await page.keyboard.press('Enter');
      await assertFilter(page, 'denver', 'weekend');
      for (const box of await page.locator('#event-date-filter, .event-filter-pill').evaluateAll(items => items.map(item => ({ width: item.getBoundingClientRect().width, height: item.getBoundingClientRect().height })))) {
        assert.ok(box.width >= 44 && box.height >= 44, JSON.stringify(box));
      }
      await settleColors(page);
      const audit = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      fs.writeFileSync(path.join(output, `${engineName}-discovery-axe-${label}.json`), JSON.stringify(audit.violations, null, 2));
      assert.deepEqual(audit.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })), []);
    });

    await check(`${label}: homepage remains park-first and every preview is a real weekend session`, async () => {
      await page.clock.setFixedTime(new Date(fixedTime));
      await page.goto(origin + '/index.html?city=aurora');
      const previews = page.locator('.home-event-card');
      assert.equal(await previews.count(), 3);
      assert.ok(await page.locator('#geoBtn').isVisible());
      assert.match(await page.locator('#home-events-heading').textContent(), /This Weekend/);
      const parkBeforeEvents = await page.evaluate(() => !!(document.getElementById('geoBtn').compareDocumentPosition(document.querySelector('.home-events')) & Node.DOCUMENT_POSITION_FOLLOWING));
      assert.equal(parkBeforeEvents, true);
      const expected = await page.evaluate(() => Array.from(document.querySelectorAll('.home-event-card')).map(node => {
        const event = window.EVENTS_DATA.events.find(event => event.id === node.dataset.eventId);
        return { id: event.id, label: window.FEP_EVENTS.occurrenceLabel(event, 'weekend', new Date()), cost: event.costLabel, availability: event.availabilityLabel,
          sessions: window.FEP_EVENTS.matchingOccurrences(event, 'weekend', new Date()).map(item => item.date), sold: window.FEP_EVENTS.isSoldOut(event) };
      }));
      for (const item of expected) {
        const preview = page.locator(`.home-event-card[data-event-id="${item.id}"]`);
        assert.equal(item.sold, false);
        assert.ok(item.sessions.length > 0);
        assert.ok(item.sessions.every(date => date >= '2026-10-23' && date <= '2026-10-25'));
        assert.equal(await preview.locator('.home-event-date').textContent(), item.label);
        assert.equal(await preview.locator('.home-event-cost').textContent(), item.cost);
        assert.equal(await preview.locator('.home-event-availability').textContent(), item.availability);
        const url = new URL(await preview.locator('.home-event-cta').getAttribute('href'), page.url());
        assert.equal(url.origin, origin); assert.equal(url.pathname, '/events.html');
        assert.equal(url.searchParams.get('date'), 'weekend');
        assert.equal(url.hash, '#event-' + item.id);
      }
      await page.locator('.home-events').scrollIntoViewIfNeeded();
      await noOverflow(page);
      await page.screenshot({ path: path.join(output, `${engineName}-discovery-home-weekend-${label}.png`), fullPage: false });
      await page.locator('.intent-grid').scrollIntoViewIfNeeded();
      await noOverflow(page);
      await page.screenshot({ path: path.join(output, `${engineName}-discovery-home-tiles-${label}.png`), fullPage: false });
      const firstId = expected[0].id;
      await followInternalLink(page, page.locator('.home-event-cta').first());
      await card(page, firstId).waitFor({ state: 'visible' });
      assert.ok(await card(page, firstId).isVisible());
      assert.equal(await page.locator('#event-date-filter').inputValue(), 'weekend');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'event-' + firstId);
      const organizer = card(page, firstId).locator('a.event-link');
      assert.equal(await organizer.count(), 1);
      assert.notEqual(new URL(await organizer.getAttribute('href'), page.url()).origin, origin);
    });

    await check(`${label}: Sunday homepage has one qualifying session, then none, with no next-week padding`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-26T00:00:00Z'));
      await page.goto(origin + '/index.html?city=parker');
      assert.equal(await page.locator('.home-event-card:visible').count(), 1);
      assert.equal(await page.locator('.home-event-card').getAttribute('data-event-id'), 'denver-boo-at-zoo-2026');
      assert.match(await page.locator('.home-event-date').textContent(), /\bSun,?\s+Oct\s+25\b/);
      assert.doesNotMatch(await page.locator('.home-event-date').textContent(), /\bOct\s+30\b/);
      await page.clock.setFixedTime(new Date('2026-10-26T03:00:00Z'));
      await page.goto(origin + '/index.html?city=parker');
      assert.equal(await page.locator('.home-event-card:visible').count(), 0);
      await page.clock.setFixedTime(new Date('2026-10-26T06:00:00Z'));
      await page.goto(origin + '/index.html?city=parker');
      assert.ok(await page.locator('.home-event-card:visible').count() > 0);
      assert.match(await page.locator('.home-events-sub').textContent(), /Oct.*30.*Nov.*1/);
      await page.clock.setFixedTime(new Date(fixedTime));
    });

    await check(`${label}: city preview links keep city/date; held events stay absent and synthetic sold-out picks are excluded`, async () => {
      await page.goto(origin + '/best-parks-parker.html');
      assert.equal(await page.locator(`.city-event-card[data-event-id="${soldId}"]`).count(), 0);
      assert.equal(await page.locator('.city-event-card').count(), 0, 'both Parker events are held outside the public manifest');
      await page.goto(origin + '/best-parks-centennial.html?date=weekend');
      const preview = page.locator('.city-event-card[data-event-id="centennial-goodson-trick-or-treat-2026"]');
      assert.match(await preview.textContent(), /Fee and booking rules unverified/);
      assert.match(await preview.textContent(), /Fee, registration rules and capacity remain unresolved/);
      assert.ok((await preview.locator('.city-event-cost').textContent()).length > 0);
      assert.ok((await preview.locator('.city-event-availability').textContent()).length > 0);
      const id = await preview.getAttribute('data-event-id');
      const url = new URL(await preview.locator('.city-event-cta').getAttribute('href'), page.url());
      assert.equal(url.origin, origin); assert.equal(url.pathname, '/events.html');
      assert.equal(url.searchParams.get('city'), 'centennial');
      assert.equal(url.searchParams.get('date'), 'weekend');
      assert.equal(url.hash, '#event-' + id);
      await followInternalLink(page, preview.locator('.city-event-cta'));
      await card(page, id).waitFor({ state: 'visible' });
      assert.ok(await card(page, id).isVisible());
      assert.equal(await card(page, soldId).count(), 0);
      await assertFilter(page, 'centennial', 'weekend');
      assert.equal(await visibleCards(page).count(), 3);
      const manifestPattern = '**/data/events/events-manifest.js';
      let injectedFixture = soldOutFixture;
      const injectSoldOut = async route => {
        const response = await route.fetch();
        await route.fulfill({ response, body: (await response.text()) + '\nwindow.EVENTS_DATA.events.push(' + JSON.stringify(injectedFixture) + ');' });
      };
      await page.route(manifestPattern, injectSoldOut);
      try {
        await page.goto(origin + '/events.html?city=aurora&date=weekend');
        await card(page, soldId).waitFor({ state: 'visible' });
        assert.match(await card(page, soldId).textContent(), /SOLD OUT/);
        assert.equal(await card(page, soldId).locator('a[href*="calendar.google"], a:has-text("Registration")').count(), 0);
        await page.goto(origin + '/index.html?city=aurora');
        assert.equal(await page.locator('.home-event-card[data-event-id="' + soldId + '"]').count(), 0);
        await page.goto(origin + '/best-parks-aurora.html?date=weekend');
        assert.equal(await page.locator('.city-event-card[data-event-id="' + soldId + '"]').count(), 0);
        assert.ok(await page.locator('.city-event-card').count() > 0, 'available verified sessions still appear');
        injectedFixture = { ...soldOutFixture, availabilityStatus: 'unknown', costLabel: 'Test-only positive control', availabilityLabel: 'Confirm with test organizer.' };
        for (const [url, prefix] of [['/index.html?city=aurora', 'home'], ['/best-parks-aurora.html?date=weekend', 'city']]) {
          await page.goto(origin + url);
          assert.equal(await page.locator('.' + prefix + '-event-card[data-event-id="' + soldId + '"]').count(), 1, 'the same non-sold-out fixture must qualify within the preview cap');
        }
      } finally { await page.unroute(manifestPattern, injectSoldOut); }
      await page.goto(origin + '/best-parks-aurora.html?date=weekend');
      for (const href of await page.locator('.city-event-cta').evaluateAll(items => items.map(item => item.href))) {
        const link = new URL(href); assert.equal(link.searchParams.get('city'), 'aurora'); assert.equal(link.searchParams.get('date'), 'weekend');
      }
      assert.equal(await page.locator(`.city-event-card[data-event-id="aurora-mall-o-ween-2026"]`).count(), 0);
      await noOverflow(page);
      await page.locator('.city-event-grid').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `${engineName}-discovery-city-preview-${label}.png`), fullPage: false });
    });

    await check(`${label}: verified host links differ from nearby suggestions and park return keeps date context`, async () => {
      for (const [city, id, parkId, relationship] of [
        ['aurora', natureId, 'co-aurora-star-k-ranch', 'At this park:'],
        ['centennial', 'centennial-hoofin-hollows-5k-2026', 'co-centennial-dekoevend-park', 'At this park:'],
        ['centennial', 'centennial-goodson-trick-or-treat-2026', 'co-centennial-dekoevend-park', 'Explore nearby:']
      ]) {
        await page.clock.setFixedTime(new Date(fixedTime));
        await page.goto(origin + '/events.html?city=' + city + '&date=weekend#event-' + id);
        const target = card(page, id);
        const parkLink = target.locator(`.event-park-link[href*="${parkId}"]`);
        assert.match(await parkLink.textContent(), new RegExp('^' + relationship));
        const href = new URL(await parkLink.getAttribute('href'), page.url());
        assert.equal(href.searchParams.get('dataset'), city);
        assert.equal(href.searchParams.get('id'), parkId);
        assert.equal(href.searchParams.get('date'), 'weekend');
        await followInternalLink(page, parkLink);
        await page.locator('#guide-links a[href*="events.html"]').waitFor();
        assert.notEqual(await page.locator('#park-name').textContent(), 'Park Not Found');
        const returnLink = page.locator('#guide-links a[href*="events.html"]');
        assert.equal(await returnLink.count(), 1);
        const returnUrl = new URL(await returnLink.getAttribute('href'), page.url());
        assert.equal(returnUrl.searchParams.get('city'), city);
        assert.equal(returnUrl.searchParams.get('date'), 'weekend');
        await noOverflow(page);
        if (id === natureId) await page.screenshot({ path: path.join(output, `${engineName}-discovery-park-context-${label}.png`), fullPage: false });
        await followInternalLink(page, returnLink);
        await page.locator('#event-date-filter').waitFor();
        await assertFilter(page, city, 'weekend');
        await page.goBack(); assert.equal(new URL(page.url()).searchParams.get('id'), parkId);
        await page.goBack(); assert.equal(new URL(page.url()).hash, '#event-' + id);
        await assertFilter(page, city, 'weekend');
        await page.goForward(); assert.equal(new URL(page.url()).searchParams.get('id'), parkId);
      }
    });

    await check(`${label}: non-source cities use supported datasets and unsupported cities never fabricate one`, async () => {
      for (const [city, dataset] of [['highlands-ranch', 'highlands-ranch'], ['greenwood-village', 'greenwood-village'], ['lone-tree', 'lone-tree'], ['castle-pines', null], ['wheat-ridge', null]]) {
        await page.goto(origin + '/events.html?city=' + city + '&date=2026-12');
        assert.equal(await page.locator('#event-date-filter').inputValue(), '2026-12');
        assert.equal(await visibleCards(page).count(), 0);
        assert.ok(await page.locator('#empty-city').isVisible());
        const parks = new URL(await page.locator('#nav-parks-link').getAttribute('href'), page.url());
        assert.equal(parks.pathname, '/parks.html');
        assert.equal(parks.searchParams.get('dataset'), dataset);
      }
      await noOverflow(page);
    });

    await check(`${label}: per-session expiry updates an open weekend tab and preserves expanded schedules`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-24T20:59:30Z'));
      await page.goto(origin + '/events.html?city=aurora&date=weekend#event-' + natureId);
      assert.match(await card(page, natureId).locator('.event-window-sessions').textContent(), /Oct.*24.*Oct.*25/);
      assert.equal(await card(page, natureId).locator('details').getAttribute('open'), '');
      await page.clock.setFixedTime(new Date('2026-10-24T21:00:00Z'));
      await page.clock.fastForward('01:00');
      assert.ok(await card(page, natureId).isVisible());
      const sessions = await card(page, natureId).locator('.event-window-sessions').textContent();
      assert.match(sessions, /Oct.*25/); assert.doesNotMatch(sessions, /Oct.*24/);
      assert.equal(await card(page, natureId).locator('details').getAttribute('open'), '');
      await page.clock.setFixedTime(new Date('2026-10-25T21:00:00Z'));
      await page.clock.fastForward('01:00');
      assert.equal(await page.locator(`[data-current="true"][data-event-id="${natureId}"]`).count(), 0);
      await page.clock.setFixedTime(new Date(fixedTime));
    });

    await check(`${label}: DST weekend is Oct 30–Nov 1 and expired anchors remain readable only in all-dates archive`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-30T16:00:00Z'));
      await page.goto(origin + '/events.html?city=denver&date=weekend');
      assert.match(await page.locator('#filter-status').textContent(), /Oct.*30.*Nov.*1.*2026/);
      await assertFilter(page, 'denver', 'weekend');
      assert.equal(await visibleCards(page).count(), 2);
      for (const stamp of ['2026-11-01T07:30:00Z', '2026-11-01T08:30:00Z']) {
        await page.clock.setFixedTime(new Date(stamp));
        await page.goto(origin + '/events.html?city=denver&date=weekend');
        assert.match(await page.locator('#filter-status').textContent(), /Oct.*30.*Nov.*1.*2026/);
        assert.equal(await visibleCards(page).count(), 0);
      }
      await page.clock.setFixedTime(new Date('2026-11-02T20:00:00Z'));
      await page.goto(origin + '/events.html?city=aurora#event-' + natureId);
      const archived = card(page, natureId);
      assert.equal(await archived.getAttribute('data-current'), 'false');
      assert.ok(await archived.isVisible());
      assert.equal(await page.evaluate(() => document.activeElement.id), 'event-' + natureId);
      assert.equal(await page.locator('[id="event-' + natureId + '"]').count(), 1);
      await page.locator('#event-date-filter').selectOption('2026-11');
      assert.equal(await archived.isVisible(), false);
      assert.equal(await visibleCards(page).count(), 0);
      await page.clock.setFixedTime(new Date(fixedTime));
    });

    await check(`${label}: no horizontal overflow with longest warnings and no uncaught JavaScript errors`, async () => {
      for (const city of ['parker', 'centennial', 'denver', 'aurora']) {
        await page.goto(origin + '/events.html?city=' + city + '&date=weekend');
        await page.locator('.event-dates').evaluateAll(items => items.forEach(item => { item.open = true; }));
        await noOverflow(page);
      }
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `${engineName}-discovery-filters-${label}.png`), fullPage: false });
      assert.deepEqual(pageErrors, []);
    });
    await context.close();
  }
  await browser.close();
  server.close();
  fs.writeFileSync(path.join(output, `${engineName}-discovery-results.json`), JSON.stringify({ results, failures }, null, 2));
  console.log(`${results.length} discovery checks passed, ${failures.length} failed`);
  if (failures.length) process.exitCode = 1;
})().catch(error => {
  console.error(error);
  server.close();
  fs.writeFileSync(path.join(output, `${engineName}-discovery-results.json`), JSON.stringify({ results, failures, startupError: error.stack }, null, 2));
  process.exitCode = 1;
});
