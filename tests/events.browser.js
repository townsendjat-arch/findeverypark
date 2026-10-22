/* Test-only local HTTP server; no live third-party submissions or navigation. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const { chromium, webkit } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const root = path.join(__dirname, '..');
const priorityAudit = JSON.parse(fs.readFileSync(path.join(root, 'docs/priority-one-source-review-2026-10-21.json'), 'utf8'));
const priorityEvents = priorityAudit.events;
const hasNapa = priorityEvents.some(event => event.id === 'centennial-napa-trunk-treat-2026');
const currentCount = hasNapa ? 27 : 26;
const centennialCount = hasNapa ? 6 : 5;
const output = path.join(root, 'test-results');
fs.mkdirSync(output, { recursive: true });
// Compare inherited homepage overflow with the exact released main baseline.
// Fetch only the public commit object if CI's shallow checkout does not contain it.
// This changes no remote state, branch, workflow or deployment configuration.
const baselineRef = '3a12e7b6bffad111c3a44a5ac25f7bf0c4aa73be';
try { execFileSync('git', ['cat-file', '-e', baselineRef + '^{commit}'], { cwd:root, stdio:'pipe' }); }
catch (_) { execFileSync('git', ['fetch', '--no-tags', '--depth=1', 'origin', baselineRef], { cwd:root, stdio:'pipe' }); }
const baselineFiles = new Map(['index.html','data/events/events-manifest.js','city-events.js'].map(file =>
  [file, execFileSync('git', ['show', baselineRef + ':' + file], { cwd:root })]));
// This is a separate before/after reference for the focused card-readability pass.
// Do not replace the released homepage baseline above with this feature branch.
const readabilityBaselineRef = '57b28792ba1fea69bc8b6426a8f0ed8768b2c62b';
try { execFileSync('git', ['cat-file', '-e', readabilityBaselineRef + '^{commit}'], { cwd:root, stdio:'pipe' }); }
catch (_) { execFileSync('git', ['fetch', '--no-tags', '--depth=1', 'origin', readabilityBaselineRef], { cwd:root, stdio:'pipe' }); }
const readabilityBaselineFiles = new Map(['events.html','data/events/events-manifest.js','city-events.js'].map(file =>
  [file, execFileSync('git', ['show', readabilityBaselineRef + ':' + file], { cwd:root })]));
const server = http.createServer((req, res) => {
  let requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (requested.startsWith('/__readability_baseline__/')) {
    requested = requested.slice('/__readability_baseline__'.length);
    const snapshot = readabilityBaselineFiles.get(requested.slice(1));
    if (snapshot) { res.setHeader('Content-Type', requested.endsWith('.html') ? 'text/html' : 'text/javascript'); res.end(snapshot); return; }
  }
  if (requested.startsWith('/__baseline__/')) {
    requested = requested.slice('/__baseline__'.length);
    const snapshot = baselineFiles.get(requested.slice(1));
    if (snapshot) { res.setHeader('Content-Type', requested.endsWith('.html') ? 'text/html' : 'text/javascript'); res.end(snapshot); return; }
  }
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
    await page.clock.install({ time: new Date('2026-10-22T16:00:00Z') });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      // Read-only local pages and presentation fonts only. Never submit a form,
      // follow an external action, fetch analytics or load third-party images.
      const readOnly = ['GET','HEAD'].includes(route.request().method());
      return readOnly && (url.origin === origin || ['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname))
        ? route.continue() : route.abort();
    });
    await check(`${label}: initial Aurora query and visible city`, async () => {
      await page.goto(origin + '/events.html?city=aurora');
      await page.locator('.event-filter-pill[aria-pressed="true"]').waitFor();
      assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').textContent(), 'Aurora');
      assert.equal(await page.locator('#page-title').textContent(), 'Aurora Events');
      const visible = page.locator('[data-current="true"]:visible');
      assert.equal(await visible.count(), 8);
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
    await page.locator('[data-event-id="aurora-nicks-fall-fest-2026"] details > summary').click();
    await page.locator('[data-current="true"]:visible').first().evaluate(card => card.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: path.join(output, `${engineName}-event-cards-${label}.png`), fullPage: false });
    await check(`${label}: all requested city filters and back/forward`, async () => {
      for (const city of ['centennial','parker','denver','aurora']) {
        await page.locator(`.event-filter-pill[data-city="${city}"]`).click();
        assert.equal(new URL(page.url()).searchParams.get('city'), city);
        const visible = page.locator('[data-current="true"]:visible');
        assert.equal(await visible.count(), ({centennial:centennialCount,parker:1,denver:3,aurora:8})[city], city);
        assert.ok((await visible.evaluateAll(items => items.map(e => e.dataset.city))).every(value => value === city));
      }
      await page.goBack(); assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').textContent(), 'Denver');
      await page.goForward(); assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').textContent(), 'Aurora');
      await page.locator('.event-filter-pill[data-city=""]').click();
      assert.equal(new URL(page.url()).searchParams.has('city'), false);
      assert.equal(await page.locator('[data-current="true"]:visible').count(), currentCount);
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
      // Audit the settled selected state, not an intermediate color cross-fade.
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.querySelectorAll('.event-filter-pill')).flatMap(item => item.getAnimations().map(animation => animation.finished.catch(() => {}))));
      });
      const audit = await new AxeBuilder({ page }).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      fs.writeFileSync(path.join(output, `${engineName}-axe-${label}.json`), JSON.stringify(audit.violations, null, 2));
      assert.deepEqual(audit.violations.map(v => ({ id:v.id, impact:v.impact, nodes:v.nodes.length })), []);
    });
    await check(`${label}: exact expiry in open tab and no stale homepage/city cards`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-24T18:59:30Z'));
      await page.goto(origin + '/events.html?city=aurora');
      assert.equal(await page.locator('[data-event-id="aurora-halloween-on-havana-2026"]').count(), 1);
      await page.locator('[data-event-id="aurora-nicks-fall-fest-2026"] details > summary').click();
      await page.clock.setFixedTime(new Date('2026-10-24T19:00:01Z'));
      await page.clock.fastForward('01:00');
      assert.equal(await page.locator('[data-current="true"][data-event-id="aurora-halloween-on-havana-2026"]').count(), 0);
      assert.equal(await page.locator('[data-current="false"][data-event-id="aurora-halloween-on-havana-2026"]').count(), 1);
      assert.equal(await page.locator('[data-event-id="aurora-nicks-fall-fest-2026"] details').getAttribute('open'), '');
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
    await check(`${label}: Parker has only Primrose; held Kiddie Academy, Mainstreet and Violet Bridge stay absent`, async () => {
      for (const url of ['/events.html?city=parker','/index.html?city=parker','/best-parks-parker.html']) {
        await page.goto(origin + url);
        for (const title of ['Trunk or Treat on Mainstreet','All Treats, No Tricks: Sensory-Friendly Trick or Treat','Halloween at Kiddie Academy: Free Family Trunk or Treat']) {
          assert.equal(await page.getByText(title, {exact:true}).count(), 0);
        }
        if (url.startsWith('/events.html')) {
          assert.equal(await page.locator('[data-current="true"]:visible').count(), 1);
          assert.equal(await page.locator('#empty-city').isVisible(), false);
          const ids = await page.locator('[data-current="true"]:visible').evaluateAll(cards => cards.map(card => card.dataset.eventId).sort());
          assert.deepEqual(ids, ['parker-primrose-trunk-treat-2026']);
          await page.screenshot({path:path.join(output,`${engineName}-parker-priority-one-${label}.png`),fullPage:false});
        }
        if (url.startsWith('/best-parks-')) assert.equal(await page.locator('.city-event-card:visible').count(), 1);
      }
      await page.goto(origin + '/events.html?city=parker');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    });
    await check(`${label}: synthetic sold-out fixture has no registration or calendar CTA`, async () => {
      const rendered = await page.evaluate(() => {
        // Test-only, detached DOM fixture. Never inserted into the manifest or live page.
        const card = renderEventDetails({ event: {
          id:'synthetic-sold-out', city:'parker', title:'Synthetic sold-out event',
          description:'SOLD OUT: informational test fixture.', costLabel:'SOLD OUT', costType:'free',
          dateStart:'2026-10-24T13:00:00-06:00', dateEnd:'2026-10-24T17:00:00-06:00',
          calendarDisabled:true, href:'https://example.com/information'
        } });
        return { text:card.textContent, links:Array.from(card.querySelectorAll('a')).map(a => ({text:a.textContent, href:a.href})) };
      });
      assert.match(rendered.text, /SOLD OUT/);
      assert.equal(rendered.links.some(a => /Registration|Add to Calendar/.test(a.text)), false);
      assert.equal(rendered.links.some(a => /calendar\.google|tickettailor/.test(a.href)), false);
      assert.equal(await page.locator('[data-event-id="synthetic-sold-out"]').count(), 0);
    });
    await check(`${label}: synthetic RSVP warning remains prominent without publishing held events`, async () => {
      const rendered = await page.evaluate(() => {
        const card = renderEventDetails({event:{
          id:'synthetic-rsvp-warning', city:'parker', title:'Synthetic RSVP warning',
          description:'Family RSVP required; signup link unavailable. Do not assume walk-in entry.',
          costLabel:'Free; required family RSVP has no usable signup link', costType:'free',
          registrationLabel:'Family RSVP required; no usable attendee signup link verified.',
          dateStart:'2026-10-30T18:00:00-06:00', dateEnd:'2026-10-30T21:30:00-06:00'
        }});
        return {text:card.textContent, badge:card.querySelector('.free-badge').textContent,
          links:Array.from(card.querySelectorAll('a')).map(a=>a.textContent)};
      });
      assert.match(rendered.badge,/required family RSVP has no usable signup link/);
      assert.match(rendered.text,/Do not assume walk-in entry/);
      assert.equal(rendered.links.includes('Registration'),false);
      assert.equal(await page.locator('[data-event-id="synthetic-rsvp-warning"]').count(),0);
    });
    await check(`${label}: Centennial unknowns, Hoofin price/cutoff and organizer correction`, async () => {
      await page.goto(origin + '/events.html?city=centennial');
      assert.equal(await page.locator('[data-current="true"]:visible').count(), centennialCount);
      const goodson = page.locator('[data-event-id="centennial-goodson-trick-or-treat-2026"]');
      assert.match(await goodson.locator('.cost-badge').textContent(), /Fee and registration requirements unverified/);
      assert.match(await goodson.locator('.event-description').first().textContent(), /^Fee and booking rules unverified/);
      assert.match(await goodson.textContent(), /Adult 18\+ must accompany children/);
      const hoofin = page.locator('[data-event-id="centennial-hoofin-hollows-5k-2026"]');
      assert.match(await hoofin.textContent(), /Adult total \$22\.45; ages 4–14 total \$17\.15/);
      assert.match(await hoofin.textContent(), /conflict on the cutoff/);
      assert.match(await hoofin.textContent(), /end time not published/);
      assert.equal(await hoofin.locator('a[href*="calendar.google"]').count(), 0);
      assert.equal(await page.locator('[data-event-id="centennial-spooky-streets-2026"] a.event-link').getAttribute('href'), 'https://www.shopsouthglenn.com/event/spooky-streets-2/');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await goodson.screenshot({ path:path.join(output, `${engineName}-fee-warning-${label}.png`) });
      await hoofin.screenshot({ path:path.join(output, `${engineName}-hoofin-correction-${label}.png`) });
    });
    await check(`${label}: corrected warning cards retain scoped accessibility`, async () => {
      for (const city of ['parker','centennial']) {
        await page.goto(origin + '/events.html?city=' + city);
        await page.evaluate(async () => { await document.fonts.ready; await Promise.all(Array.from(document.querySelectorAll('.event-filter-pill')).flatMap(item => item.getAnimations().map(animation => animation.finished.catch(() => {})))); });
        const audit = await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
        fs.writeFileSync(path.join(output, `${engineName}-axe-${city}-${label}.json`), JSON.stringify(audit.violations,null,2));
        assert.deepEqual(audit.violations.map(v => ({id:v.id,impact:v.impact,nodes:v.nodes.length})), []);
      }
    });
    await check(`${label}: zoo age bands, infant tickets and sampled availability`, async () => {
      await page.goto(origin + '/events.html?city=denver');
      assert.equal(await page.locator('[data-current="true"]:visible').count(), 3);
      for (const id of ['denver-boo-at-zoo-2026','denver-boo-at-zoo-sensory-2026']) {
        const card = page.locator(`[data-event-id="${id}"]`);
        const text = await card.textContent();
        assert.match(text,/youth ages 3–15/); assert.match(text,/free ticket for each child age 2 or under/);
        assert.match(text,/4:30–9 p\.m\./); assert.match(text,/heading conflicts at 10 p\.m\./);
        assert.match(text,/other slots were not tested/); assert.match(text,/current availability is not guaranteed/);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    });
    await check(`${label}: short homepage and city previews retain material warnings`, async () => {
      for (const [city,title,warning] of [
        ['centennial','Trick-or-Treat Street at Goodson',/Fee and booking rules unverified/]
      ]) {
        for (const [url,prefix] of [['/index.html?city='+city,'home'],['/best-parks-'+city+'.html','city']]) {
          await page.goto(origin + url);
          assert.equal(await page.locator('.'+prefix+'-event-card').filter({hasText:'Trunk or Treat on Mainstreet'}).count(), 0);
          const card = page.locator('.'+prefix+'-event-card').filter({has:page.locator('h3',{hasText:title})});
          assert.equal(await card.count(),1);
          assert.match(await card.locator('.'+prefix+'-event-desc').textContent(),warning);
          if (city === 'centennial') assert.match(await card.locator('.'+prefix+'-event-desc').textContent(),/Adult 18\+ must accompany children/);
          await card.screenshot({path:path.join(output,`${engineName}-${prefix}-warning-${city}-${title.startsWith('All')?'rsvp':city==='parker'?'sold':'fee'}-${label}.png`)});
        }
      }
    });
    await check(`${label}: pumpkin category has six unique October 21 listings and reuses Nick's`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-21T16:00:00Z'));
      await page.goto(origin + '/events.html?category=pumpkin-patches#pumpkin-patches');
      const cards = page.locator('.pumpkin-card[data-current="true"]:visible');
      assert.equal(await cards.count(), 6);
      const ids = await cards.evaluateAll(items => items.map(card => card.dataset.eventId));
      assert.equal(new Set(ids).size, 6, 'each pumpkin listing has a distinct event ID');
      assert.deepEqual((await cards.evaluateAll(items => items.map(card => card.dataset.city))).sort(),
        ['aurora','erie','kiowa','louisville','platteville','thornton']);
      assert.equal(await page.locator('[data-event-id="aurora-nicks-fall-fest-2026"]').count(), 1);
      assert.equal(await page.locator('[data-current="true"]:visible').count(), 6);
      assert.equal(await page.locator('.event-category-pill[data-category="pumpkin-patches"]').getAttribute('aria-pressed'), 'true');
      assert.equal(new URL(page.url()).hash, '#pumpkin-patches');
      assert.equal(await page.locator('#pumpkin-patches').count(), 1);
      // The separate discovery PR is not part of this feature.
      assert.equal(await page.locator('.event-date-select').count(), 0);
    });
    await check(`${label}: concise pumpkin cards retain critical warnings and price-first costs outside details`, async () => {
      const cards = page.locator('.pumpkin-card[data-current="true"]:visible');
      assert.equal(await cards.count(), 6);
      for (let index = 0; index < await cards.count(); index++) {
        const card = cards.nth(index);
        const id = await card.getAttribute('data-event-id');
        const event = await page.evaluate(eventId => window.EVENTS_DATA.events.find(item => item.id === eventId), id);
        const published = event.pumpkin;
        assert.ok(await card.locator('details > summary').count(), `${id}: schedule disclosure`);
        await card.locator('details').evaluateAll(items => items.forEach(details => { details.open = false; }));
        for (const selector of ['.pumpkin-picking','.pumpkin-costs','.pumpkin-next', ...(published.criticalWarnings.length ? ['.pumpkin-warning'] : [])]) {
          const items = card.locator(selector);
          assert.ok(await items.count() > 0, `${id}: ${selector} is present`);
          for (let itemIndex = 0; itemIndex < await items.count(); itemIndex++) {
            const item = items.nth(itemIndex);
            assert.ok(await item.isVisible(), `${id}: ${selector} is visible without expansion`);
            assert.ok((await item.textContent()).trim(), `${id}: ${selector} has substantive text`);
            assert.equal(await item.evaluate(element => Boolean(element.closest('details'))), false,
              `${id}: ${selector} must not be hidden in a disclosure`);
          }
        }
        const visibleWarnings = (await card.locator('.pumpkin-warning').allTextContents()).join(' ');
        for (const warning of published.criticalWarnings) {
          assert.ok(visibleWarnings.includes(warning), `${id}: every critical warning remains visible`);
        }
        const rows = card.locator('.pumpkin-costs > div');
        assert.equal(await rows.count(), 3, `${id}: three comparison rows`);
        assert.deepEqual(await rows.locator('dt').allTextContents(), ['Entry','Pumpkins','Activities']);
        for (const [rowIndex, field] of ['entry','pumpkins','activities'].entries()) {
          const row = rows.nth(rowIndex);
          const value = row.locator('dd');
          assert.equal((await value.textContent()).trim(), published.costSummary[field], `${id}: ${field} summary`);
          assert.ok(await value.locator('strong').count() > 0, `${id}: ${field} emphasizes its price semantically`);
          const emphasis = (await value.locator('strong').allTextContents()).join(' ');
          assert.match(emphasis, /\$[\d,.]+|\bFree\b|\bIncluded\b|\bExtra\b|\bNot listed\b/i, `${id}: ${field} emphasizes a monetary amount or explicit cost status`);
        }
        const collapsedText = await card.innerText();
        assert.ok(collapsedText.includes(published.fitLabel), `${id}: concise family fit remains visible`);
        assert.ok((await card.locator('.pumpkin-picking').textContent()).includes(published.pickingType));
        assert.doesNotMatch(collapsedText, /\beditorial\b|\b(?:un)?verified\b/i, `${id}: collapsed copy uses everyday language`);
        const upcoming = await page.evaluate(eventId => window.FEP_EVENTS.nextPumpkinVisits(
          window.EVENTS_DATA.events.find(item => item.id === eventId), new Date()), id);
        const nextText = await card.locator('.pumpkin-next').textContent();
        assert.ok(upcoming.length > 0);
        const compactDate = date => new Date(date + 'T12:00:00Z').toLocaleDateString('en-US',
          {timeZone:'America/Denver',weekday:'short',month:'short',day:'numeric'});
        assert.ok(nextText.includes(compactDate(upcoming[0].date)), `${id}: one next visit is visible`);
        assert.ok(nextText.includes(upcoming[0].time), `${id}: source hours preserved`);
        if (upcoming[0].lastEntry) assert.ok(nextText.includes(published.cutoffSummary || upcoming[0].lastEntry), `${id}: arrival cutoff preserved`);
        for (const later of upcoming.slice(1)) assert.ok(!nextText.includes(compactDate(later.date)), `${id}: later dates belong in details`);
        // No CTA implies that a published schedule guarantees a ticket or crop.
        assert.doesNotMatch(await card.locator('a, button').allTextContents().then(texts => texts.join(' ')),
          /guaranteed (?:entry|tickets|availability)|tickets available now|book confirmed/i);
      }
      const anderson = page.locator('.pumpkin-card[data-city="erie"] .pumpkin-warning');
      assert.match(await anderson.textContent(), /conflict|disagree|contradict|(?:dates|festival).*but.*(?:closed|not open)|closed.*(?:dates|festival)/i);
      assert.match(await anderson.textContent(), /open|closed|closure|operating/i);
      assert.match(await anderson.textContent(), /check|confirm|call/i);
      const maize = await page.locator('.pumpkin-card[data-city="thornton"] .pumpkin-warning').textContent();
      assert.match(maize, /ticket|book/i); assert.match(maize, /check|confirm|conflict/i);
      const miller = await page.locator('.pumpkin-card[data-city="platteville"] .pumpkin-warning').textContent();
      assert.match(miller, /waiver/i); assert.match(miller, /required|every|each/i);
      const patch = await page.locator('.pumpkin-card[data-city="kiowa"] .pumpkin-warning').textContent();
      assert.match(patch, /ticket/i); assert.match(patch, /waiver/i); assert.match(patch, /required|need|must/i);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    });
    await check(`${label}: expandable pumpkin details preserve all original facts, qualifications, full dates and links`, async () => {
      const cards = page.locator('.pumpkin-card[data-current="true"]:visible');
      assert.equal(await cards.count(), 6);
      for (let index = 0; index < await cards.count(); index++) {
        const card = cards.nth(index);
        const id = await card.getAttribute('data-event-id');
        const event = await page.evaluate(eventId => window.EVENTS_DATA.events.find(item => item.id === eventId), id);
        const p = event.pumpkin;
        const details = card.locator('details').first();
        await details.locator(':scope > summary').focus();
        await page.keyboard.press('Enter');
        assert.equal(await details.getAttribute('open'), '');
        const text = await details.innerText();
        for (const fact of [event.audienceLabel, event.dateLabel, event.timeLabel, event.locationLabel,
          event.registrationLabel, event.availabilityLabel, p.goodFit, p.entryCost, p.pumpkinCost, p.activityCost,
          ...p.warnings, ...p.essentials].filter(Boolean)) {
          assert.ok(text.includes(fact), `${id}: original detail is preserved: ${fact}`);
        }
        for (const occurrence of event.schedule) {
          const date = new Date(occurrence.date + 'T12:00:00Z').toLocaleDateString('en-US',
            {timeZone:'America/Denver',month:'long',day:'numeric',year:'numeric'});
          for (const fact of [date, occurrence.time, occurrence.lastEntry, occurrence.note].filter(Boolean)) {
            assert.ok(text.includes(fact), `${id}: full schedule fact is preserved: ${fact}`);
          }
        }
        assert.match(text, /Details checked October 21, 2026/);
        const hrefs = await card.locator('a').evaluateAll(links => links.map(link => link.href));
        for (const source of [event.href, event.registrationUrl, ...event.sourceUrls].filter(Boolean)) {
          // A conflicting operating status keeps official sources but suppresses a purchase CTA.
          if (source === event.registrationUrl && p.operatingStatus === 'conflicting') continue;
          assert.ok(hrefs.includes(source), `${id}: source or booking link is retained`);
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await card.screenshot({path:path.join(output,`${engineName}-pumpkin-expanded-${id}-${label}.png`)});
        await details.locator(':scope > summary').focus();
        await page.keyboard.press('Space');
        assert.equal(await details.getAttribute('open'), null);
      }
      await page.locator('.pumpkin-card details').evaluateAll(items => items.forEach(details => { details.open = true; }));
      const audit = await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      fs.writeFileSync(path.join(output, `${engineName}-axe-pumpkins-expanded-${label}.json`), JSON.stringify(audit.violations,null,2));
      await page.locator('.pumpkin-card details').evaluateAll(items => items.forEach(details => { details.open = false; }));
      assert.deepEqual(audit.violations.map(v => ({id:v.id,impact:v.impact,nodes:v.nodes.length})), []);
    });
    await check(`${label}: exact pumpkin city filters do not generate unsupported park links`, async () => {
      for (const city of ['erie','thornton','platteville','kiowa','louisville','aurora']) {
        await page.locator(`.event-filter-pill[data-city="${city}"]`).click();
        assert.equal(new URL(page.url()).searchParams.get('city'), city);
        assert.equal(new URL(page.url()).searchParams.get('category'), 'pumpkin-patches');
        assert.equal(new URL(page.url()).hash, '#pumpkin-patches');
        const cards = page.locator('[data-current="true"]:visible');
        assert.equal(await cards.count(), 1, city);
        assert.equal(await cards.first().getAttribute('data-city'), city);
        assert.ok(await cards.first().evaluate(card => card.classList.contains('pumpkin-card')));
        if (['erie','platteville','kiowa','louisville'].includes(city)) {
          assert.equal(await cards.locator('a[href*="park.html"], a[href*="parks.html"], a[href*="best-parks-"], a[href*="city.html"]').count(), 0,
            `${city}: do not invent a park dataset or nearby-park link`);
          const nav = new URL(await page.locator('#nav-parks-link').getAttribute('href'), page.url());
          assert.equal(nav.searchParams.has('dataset'), false, `${city}: unsupported city has no parks dataset`);
          assert.equal(await page.locator(`a[href*="dataset=${city}"]`).count(), 0);
        }
      }
    });
    await check(`${label}: pumpkin category and city state survive deep links and Back/Forward with anchor`, async () => {
      await page.goto(origin + '/events.html?category=pumpkin-patches&city=louisville#pumpkin-patches');
      const states = [];
      const remember = async (city, category, count) => {
        states.push({ url:page.url(), city, category, count });
      };
      const assertState = async state => {
        assert.equal(page.url(), state.url);
        assert.equal(new URL(page.url()).hash, '#pumpkin-patches');
        assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').getAttribute('data-city'), state.city);
        assert.equal(await page.locator('.event-category-pill[aria-pressed="true"]').getAttribute('data-category'), state.category);
        assert.equal(await page.locator('[data-current="true"]:visible').count(), state.count);
        assert.equal(await page.locator('#empty-city').isVisible(), state.count === 0);
      };
      await remember('louisville', 'pumpkin-patches', 1);
      await assertState(states[0]);
      await page.locator('.event-filter-pill[data-city="aurora"]').click();
      await remember('aurora', 'pumpkin-patches', 1);
      await assertState(states[1]);
      await page.locator('.event-category-pill[data-category=""]').click();
      assert.equal(new URL(page.url()).searchParams.has('category'), false);
      assert.equal(new URL(page.url()).searchParams.has('city'), false);
      await remember('', '', currentCount);
      await assertState(states[2]);
      await page.locator('.event-filter-pill[data-city=""]').click();
      assert.equal(new URL(page.url()).searchParams.has('city'), false);
      await remember('', '', currentCount);
      await assertState(states[3]);
      for (let index = states.length - 2; index >= 0; index--) {
        await page.goBack();
        await assertState(states[index]);
      }
      for (let index = 1; index < states.length; index++) {
        await page.goForward();
        await assertState(states[index]);
      }
      assert.equal(await page.locator('[data-event-id="aurora-nicks-fall-fest-2026"]').count(), 1);
    });
    await check(`${label}: empty pumpkin results retain clear category and city state`, async () => {
      await page.goto(origin + '/events.html?category=pumpkin-patches&city=parker#pumpkin-patches');
      assert.equal(await page.locator('[data-current="true"]:visible').count(), 0);
      assert.equal(await page.locator('.pumpkin-card:visible').count(), 0);
      assert.ok(await page.locator('#empty-city').isVisible());
      assert.match(await page.locator('#empty-city-copy').textContent(), /Parker/);
      assert.equal(await page.locator('.event-category-pill[data-category="pumpkin-patches"]').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('.event-filter-pill[data-city="parker"]').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path:path.join(output, `${engineName}-pumpkin-empty-${label}.png`), fullPage:false });
      await page.locator('.event-filter-pill[data-city=""]').click();
      assert.equal(await page.locator('.pumpkin-card:visible').count(), 6);
      assert.equal(await page.locator('#empty-city').isVisible(), false);
    });
    await check(`${label}: pumpkin disclosures and category controls work from the keyboard`, async () => {
      const all = page.locator('.event-category-pill[data-category=""]');
      await all.focus(); await page.keyboard.press('Enter');
      assert.equal(await all.getAttribute('aria-pressed'), 'true');
      const pumpkin = page.locator('.event-category-pill[data-category="pumpkin-patches"]');
      await pumpkin.focus(); await page.keyboard.press('Space');
      assert.equal(await pumpkin.getAttribute('aria-pressed'), 'true');
      const cards = page.locator('.pumpkin-card:visible');
      assert.equal(await cards.count(), 6);
      for (let index = 0; index < await cards.count(); index++) {
        const card = cards.nth(index);
        const details = card.locator('details').first();
        const summary = details.locator(':scope > summary');
        assert.equal(await details.getAttribute('open'), null);
        await summary.focus(); await page.keyboard.press('Enter');
        assert.equal(await details.getAttribute('open'), '');
        assert.ok(await summary.evaluate(element => element === document.activeElement));
        await page.keyboard.press('Space');
        assert.equal(await details.getAttribute('open'), null);
        for (const warning of await card.locator('.pumpkin-warning').all()) assert.ok(await warning.isVisible());
      }
      for (const box of await page.locator('.event-category-pill').evaluateAll(items => items.map(item => ({ width:item.getBoundingClientRect().width,height:item.getBoundingClientRect().height })))) {
        assert.ok(box.height >= 44 && box.width >= 44, 'category controls have at least 44px targets');
      }
    });
    await check(`${label}: pumpkin layouts, individual cards and scoped accessibility`, async () => {
      await page.goto(origin + '/events.html?category=pumpkin-patches#pumpkin-patches');
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.querySelectorAll('.event-filter-pill, .event-category-pill'))
          .flatMap(item => item.getAnimations().map(animation => animation.finished.catch(() => {}))));
      });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path:path.join(output, `${engineName}-pumpkin-header-${label}.png`), fullPage:false });
      await page.locator('#pumpkin-patches').scrollIntoViewIfNeeded();
      await page.screenshot({ path:path.join(output, `${engineName}-pumpkin-list-${label}.png`), fullPage:true });
      const cards = page.locator('.pumpkin-card:visible');
      assert.equal(await cards.count(), 6);
      for (let index = 0; index < await cards.count(); index++) {
        const card = cards.nth(index);
        const id = await card.getAttribute('data-event-id');
        await card.screenshot({ path:path.join(output, `${engineName}-pumpkin-card-${id}-${label}.png`) });
      }
      const audit = await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      fs.writeFileSync(path.join(output, `${engineName}-axe-pumpkins-${label}.json`), JSON.stringify(audit.violations,null,2));
      assert.deepEqual(audit.violations.map(v => ({id:v.id,impact:v.impact,nodes:v.nodes.length})), []);
    });
    await check(`${label}: every collapsed pumpkin card is shorter than the exact pre-readability baseline`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-21T16:00:00Z'));
      const measure = () => Array.from(document.querySelectorAll('.pumpkin-card')).map(card => ({
        id:card.dataset.eventId, height:card.getBoundingClientRect().height,
        width:card.getBoundingClientRect().width,
        visibleWords:card.innerText.trim().split(/\s+/).length,
        noticeHeight:card.querySelector('.before-you-go')?.getBoundingClientRect().height || 0,
        detailsOpen:card.querySelector('details').open
      }));
      const capture = async url => {
        await page.goto(url);
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await page.locator('.pumpkin-card:visible').count(), 6);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        return page.evaluate(measure);
      };
      const before = await capture(origin + '/__readability_baseline__/events.html?category=pumpkin-patches#pumpkin-patches');
      const after = await capture(origin + '/events.html?category=pumpkin-patches#pumpkin-patches');
      const cards = after.map(card => {
        const previous = before.find(item => item.id === card.id);
        assert.ok(previous, card.id + ': same canonical record exists in baseline');
        return {id:card.id, before:previous, after:card,
          savedPixels:Math.round((previous.height - card.height) * 100) / 100,
          reductionPercent:Math.round((1 - card.height / previous.height) * 1000) / 10};
      });
      const evidence = {baselineRef:readabilityBaselineRef, engine:engineName, viewport, cards};
      fs.writeFileSync(path.join(output, `${engineName}-pumpkin-readability-${label}.json`), JSON.stringify(evidence,null,2));
      console.log('PUMPKIN READABILITY', label, JSON.stringify(evidence));
      for (const card of cards) {
        assert.equal(card.before.detailsOpen, false);
        assert.equal(card.after.detailsOpen, false);
        assert.ok(card.after.height < card.before.height, card.id + ': the closed card must be shorter');
        assert.ok(card.after.visibleWords < card.before.visibleWords, card.id + ': main-card copy must be more concise');
      }
    });
    await check(`${label}: Nick's next visit advances in an open tab and preserves disclosure state`, async () => {
      // October 21 at 5:59 p.m. MDT, even though the Tokyo test visitor is on October 22.
      await page.clock.setFixedTime(new Date('2026-10-21T23:59:00Z'));
      await page.goto(origin + '/events.html?category=pumpkin-patches&city=aurora#pumpkin-patches');
      const card = page.locator('.pumpkin-card[data-event-id="aurora-nicks-fall-fest-2026"]');
      assert.equal(await card.count(), 1);
      assert.match(await card.locator('.pumpkin-next').textContent(), /Wed, Oct 21/);
      await card.locator('details > summary').click();
      assert.equal(await card.locator('details').getAttribute('open'), '');
      // The 6 p.m. close removes today's occurrence, not the still-running series.
      await page.clock.setFixedTime(new Date('2026-10-22T00:01:00Z'));
      await page.clock.fastForward('01:00');
      assert.equal(await card.count(), 1);
      assert.match(await card.locator('.pumpkin-next').textContent(), /Thu, Oct 22/);
      assert.doesNotMatch(await card.locator('.pumpkin-next').textContent(), /Oct 21/);
      assert.equal(await card.locator('details').getAttribute('open'), '');
      assert.equal(await page.locator('[data-current="true"]:visible').count(), 1);
      assert.equal(new URL(page.url()).searchParams.get('category'), 'pumpkin-patches');
      assert.equal(new URL(page.url()).searchParams.get('city'), 'aurora');
      assert.equal(new URL(page.url()).hash, '#pumpkin-patches');
    });
    await check(`${label}: 7th Generation skips the closed weekday gap and expires at its final MST close`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-26T16:00:00Z'));
      await page.goto(origin + '/events.html?category=pumpkin-patches&city=louisville#pumpkin-patches');
      const card = page.locator('.pumpkin-card[data-city="louisville"]');
      assert.equal(await card.count(), 1);
      assert.match(await card.textContent(), /7th Generation/);
      const next = await card.locator('.pumpkin-next').textContent();
      assert.match(next, /Thu, Oct 29/);
      assert.doesNotMatch(next, /Oct (?:26|27|28)\b/);
      // November 1 is back on MST: 6 p.m. local is November 2 at 01:00 UTC.
      await page.clock.setFixedTime(new Date('2026-11-02T00:59:00Z'));
      await page.goto(origin + '/events.html?category=pumpkin-patches&city=louisville#pumpkin-patches');
      assert.equal(await page.locator('.pumpkin-card[data-city="louisville"]').count(), 1);
      await page.clock.setFixedTime(new Date('2026-11-02T01:00:01Z'));
      await page.clock.fastForward('01:00');
      assert.equal(await page.locator('.pumpkin-card[data-city="louisville"]').count(), 0);
      assert.equal(await page.locator('[data-current="true"]:visible').count(), 0);
      assert.ok(await page.locator('#empty-city').isVisible());
      assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').getAttribute('data-city'), 'louisville');
      assert.equal(await page.locator('.event-category-pill[aria-pressed="true"]').getAttribute('data-category'), 'pumpkin-patches');
      assert.equal(new URL(page.url()).hash, '#pumpkin-patches');
    });
    await check(`${label}: conflicting Anderson listing is not recommended in homepage previews`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-21T16:00:00Z'));
      await page.goto(origin + '/index.html?city=erie');
      assert.equal(await page.locator('.home-event-card').filter({ hasText:/Anderson/ }).count(), 0);
      assert.ok(await page.locator('#geoBtn').count(), 'homepage remains park-first');
      await page.evaluate(() => document.fonts.ready);
      const measure = () => ({
        viewport:innerWidth, scrollWidth:document.documentElement.scrollWidth,
        offenders:Array.from(document.querySelectorAll('body *')).filter(el => {
          const rect=el.getBoundingClientRect(); return rect.width && (rect.right > innerWidth + 1 || rect.left < -1);
        }).map(el => ({tag:el.tagName,classes:el.className,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right})),
        preview:Array.from(document.querySelectorAll('.home-events, .home-event-card')).map(el => ({
          classes:el.className,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,
          scrollWidth:el.scrollWidth,clientWidth:el.clientWidth
        }))
      });
      const candidate = await page.evaluate(measure);
      for (const box of candidate.preview) {
        assert.ok(box.left >= -1 && box.right <= viewport.width + 1, JSON.stringify(box));
        assert.ok(box.scrollWidth <= box.clientWidth + 1, JSON.stringify(box));
      }
      assert.ok(candidate.preview.length >= 2, 'test includes existing preview and its cards');
      await page.screenshot({path:path.join(output, `${engineName}-pumpkin-home-erie-${label}.png`),fullPage:true});
      await page.goto(origin + '/__baseline__/index.html?city=erie');
      await page.evaluate(() => document.fonts.ready);
      const baseline = await page.evaluate(measure);
      const evidence = {baselineRef, candidate, baseline};
      fs.writeFileSync(path.join(output, `${engineName}-home-overflow-baseline-${label}.json`),JSON.stringify(evidence,null,2));
      console.log('HOMEPAGE BASELINE', label, JSON.stringify(evidence));
      assert.ok(candidate.scrollWidth <= baseline.scrollWidth, 'pumpkin content must not worsen inherited whole-homepage overflow');
      // PR #3, not this feature, owns the pre-existing city/intent-tile wrap correction.
      if (baseline.scrollWidth > viewport.width) assert.ok(baseline.offenders.some(el => /city-card|city-grid|intent-card|intent-grid|intent-label|intent-sub/.test(el.classes)), 'identify inherited city/intent-tile overflow');
    });
    await check(`${label}: Miller verification horizon never becomes a false Past Event claim`, async () => {
      await page.clock.setFixedTime(new Date('2026-11-01T17:00:00Z'));
      await page.goto(origin + '/events.html?city=platteville');
      assert.equal(await page.locator('[data-current="true"]:visible').count(), 0);
      assert.equal(await page.locator('.event-row').filter({hasText:/Miller/}).count(), 0);
      assert.match(await page.locator('#empty-city-copy').textContent(), /November dates.*not been verified/);
      assert.match(await page.locator('#empty-city-copy').textContent(), /not a confirmed season closing date/);
    });
    await check(`${label}: Priority 1 has every approved card exactly once with visible facts and official action links`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-22T16:00:00Z'));
      await page.goto(origin + '/events.html');
      assert.equal(await page.locator('[data-current="true"]:visible').count(),currentCount);
      assert.equal(await page.locator('.event-date-select').count(),0,'PR #3 date control is still separate');
      for (const event of priorityEvents) {
        const card = page.locator(`[data-current="true"][data-event-id="${event.id}"]`);
        assert.equal(await card.count(),1,event.id);
        for (const text of [event.title,event.timeLabel,event.locationLabel,event.costLabel,event.description,event.registrationLabel,event.availabilityLabel]) {
          assert.ok((await card.textContent()).includes(text),event.id + ': visible source qualification');
        }
        assert.equal(await card.locator('a.event-link').getAttribute('href'),event.href);
        assert.equal(await card.locator('a:has-text("Registration")').count(),event.registrationUrl ? 1 : 0);
        if (event.registrationUrl) assert.equal(await card.locator('a:has-text("Registration")').getAttribute('href'),event.registrationUrl);
        const calendar = card.locator('a[href*="calendar.google"]');
        assert.equal(await calendar.count(),event.calendarDisabled ? 0 : 1);
        if (!event.calendarDisabled) {
          const url = new URL(await calendar.getAttribute('href'));
          assert.equal(url.searchParams.get('ctz'),'America/Denver');
          const compact = value => new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
          assert.equal(url.searchParams.get('dates'),compact(event.dateStart)+'/'+compact(event.dateEnd));
        }
        for (const action of await card.locator('a').all()) {
          await action.focus();
          assert.equal(await action.evaluate(el=>document.activeElement===el),true,event.id + ': keyboard focus');
        }
        const box = await card.evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,scroll:el.scrollWidth,client:el.clientWidth}));
        assert.ok(box.left>=-1 && box.right<=viewport.width+1,JSON.stringify(box));
        assert.ok(box.scroll<=box.client+1,event.id + ': card content must not overflow');
        await card.screenshot({path:path.join(output,`${engineName}-priority-one-${event.id}-${label}.png`)});
      }
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await page.evaluate(()=>document.fonts.ready);
      const axe = await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      fs.writeFileSync(path.join(output,`${engineName}-axe-priority-one-all-${label}.json`),JSON.stringify(axe.violations,null,2));
      assert.deepEqual(axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),[]);
    });
    await check(`${label}: three new city deep links, aliases, keyboard filtering and history are usable`, async () => {
      for (const [query,key,title,id] of [
        ['castle-rock','castle_rock','Castle Rock','castle-rock-sos-trunk-or-treat-2026'],
        ['greenwood-village','greenwood_village','Greenwood Village','greenwood-music-darkened-theater-2026'],
        ['littleton','littleton','Littleton','littleton-goblin']
      ]) {
        await page.goto(origin+'/events.html?city='+query);
        assert.equal(await page.locator('#page-title').textContent(),title+' Events');
        assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').getAttribute('data-city'),key);
        assert.equal(await page.locator('[data-current="true"]:visible').count(),1);
        assert.equal(await page.locator('[data-current="true"]:visible').getAttribute('data-event-id'),id);
        assert.equal(await page.locator('#empty-city').isVisible(),false);
        const all = page.locator('.event-filter-pill[data-city=""]');
        await all.focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('[data-current="true"]:visible').count(),currentCount);
        const button = page.locator(`.event-filter-pill[data-city="${key}"]`);
        await button.focus(); await page.keyboard.press('Space');
        assert.equal(await page.locator('[data-current="true"]:visible').count(),1);
        assert.equal(new URL(page.url()).searchParams.get('city'),query);
        await page.goBack(); assert.equal(await page.locator('[data-current="true"]:visible').count(),currentCount);
        await page.goForward(); assert.equal(await page.locator('[data-current="true"]:visible').count(),1);
        await page.screenshot({path:path.join(output,`${engineName}-priority-one-city-${key}-${label}.png`),fullPage:false});
      }
    });
    await check(`${label}: approved Before You Go copy and official sources are visible on every current and archived listing`, async () => {
      await page.clock.setFixedTime(new Date('2026-10-22T16:00:00Z'));
      await page.goto(origin + '/events.html');
      const approved = '⚠️ Before You Go: Event dates, times, prices, registration requirements, and weather or cancellation policies may change. Please check the official event website before attending.';
      assert.equal(await page.locator('[data-current="true"]:visible .before-you-go').count(),currentCount);
      assert.equal(await page.locator('.pumpkin-card details[open]').count(),0);
      // Preserve the archive as a whole disclosure. Its revealed rows need no further expansion.
      await page.locator('summary.section-summary').click();
      assert.equal(await page.locator('[data-current="false"]:visible').count(),30);
      const listings = page.locator('[data-current]:visible');
      assert.equal(await listings.count(),currentCount+30);
      const events = await page.evaluate(() => window.EVENTS_DATA.events);
      const metrics = [];
      for (const listing of await listings.all()) {
        const id = await listing.getAttribute('data-event-id');
        const event = events.find(item => item.id === id);
        assert.ok(event,id+': canonical record');
        const notice = listing.locator('.before-you-go');
        assert.equal(await notice.count(),1);
        assert.ok(await notice.isVisible(),id+': always visible with the listing');
        assert.equal(await notice.locator('.before-you-go-copy').textContent(),approved);
        assert.equal(await notice.evaluate(el => !!el.closest('details:not([open])')),false);
        const link = notice.getByRole('link',{name:'Official event source for '+event.title,exact:true});
        assert.equal(await link.getAttribute('href'),event.href || event.link || event.sourceUrls[0]);
        assert.equal(await link.getAttribute('target'),'_blank');
        assert.match(await link.getAttribute('rel'),/noopener/);
        await link.focus(); assert.equal(await link.evaluate(el => el === document.activeElement),true);
        const box = await notice.evaluate(el => {
          const rect=el.getBoundingClientRect(), style=getComputedStyle(el), a=el.querySelector('a').getBoundingClientRect();
          return {left:rect.left,right:rect.right,height:rect.height,fontSize:parseFloat(style.fontSize),lineHeight:parseFloat(style.lineHeight),linkHeight:a.height};
        });
        assert.ok(box.left >= 0 && box.right <= viewport.width+1,id+': notice fits viewport');
        assert.ok(box.fontSize >= 13 && box.lineHeight >= 20 && box.linkHeight >= 44,id+': readable type and touch target');
        metrics.push({id,...box});
      }
      for (const [name,selector] of [
        ['existing','.event-card[data-event-id="aurora-trick-or-treat-nature-trail-2026"]'],
        ['pumpkin','.pumpkin-card[data-city="erie"]'],
        ['archive','[data-current="false"]']
      ]) {
        const listing=page.locator(selector).first();
        // A renamed existing ID should fail rather than silently skip screenshot coverage.
        assert.equal(await listing.count(),1);
        await listing.screenshot({path:path.join(output,`${engineName}-before-you-go-${name}-${label}.png`)});
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false);
      const audit = await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      fs.writeFileSync(path.join(output,`${engineName}-axe-before-you-go-all-${label}.json`),JSON.stringify(audit.violations,null,2));
      fs.writeFileSync(path.join(output,`${engineName}-before-you-go-metrics-${label}.json`),JSON.stringify(metrics,null,2));
      assert.deepEqual(audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),[]);
    });
    await check(`${label}: missing or unsafe official source is explicit without an empty or fabricated notice link`, async () => {
      const manifest=await page.evaluate(() => window.EVENTS_DATA);
      const template=manifest.events.find(event => event.id === 'aurora-midterm-monster-mash-2026');
      manifest.events=[
        {...template,id:'notice-missing-source-fixture',title:'Missing source fixture',href:'',link:'',sourceUrls:[]},
        {...template,id:'notice-unsafe-source-fixture',title:'Unsafe source fixture',href:'javascript:alert(1)',link:'data:text/html,unsafe',sourceUrls:['/relative']}
      ];
      await page.route('**/data/events/events-manifest.js',route=>route.fulfill({contentType:'application/javascript',body:'window.EVENTS_DATA = '+JSON.stringify(manifest)+';'}));
      try {
        await page.goto(origin+'/events.html');
        assert.equal(await page.locator('.before-you-go').count(),2);
        for (const notice of await page.locator('.before-you-go').all()) {
          assert.ok(await notice.isVisible());
          assert.equal(await notice.locator('a').count(),0);
          assert.equal(await notice.locator('.source-unavailable').textContent(),'Official source not provided.');
        }
      } finally { await page.unroute('**/data/events/events-manifest.js'); }
    });
    await check(`${label}: actual short-preview renderer preserves each new record's front-loaded warning`, async () => {
      // Isolate one real approved record per page solely to exercise the existing
      // capped preview renderer; this is not a claim about default homepage ranking.
      const warnings = {
        'centennial-napa-trunk-treat-2026': [/tickets not required/i,/optional RSVP/i],
        'castle-pines-fall-festival': [/chili.*cancel/i,/festival/i],
        'aurora-midterm-monster-mash-2026': [/registration required/i,/weapon/i],
        'parker-kiddie-academy-trunk-treat-2026': [/reserve|RSVP/i,/food.*extra/i],
        'centennial-sos-spooktacular-2026': [/RSVP/i,/no diagnosis/i],
        'centennial-gracepoint-carnival-costumes-2026': [/RSVP/i,/non-scary/i],
        'aurora-stanley-monster-mash-2026': [/free/i,/purchases|food|shops/i,/new winter-clothing/i],
        'littleton-goblin': [/free/i],
        'greenwood-music-darkened-theater-2026': [/end time.*not published/i],
        'parker-primrose-trunk-treat-2026': [/public|community/i,/free/i,/food.*extra/i],
        'castle-rock-sos-trunk-or-treat-2026': [/RSVP/i,/sensory/i,/costumes optional/i],
        'aurora-hallelujah-night-2026': [/church/i,/scary|gory/i,/demon/i,/witch/i,/RSVP availability unconfirmed/i]
      };
      const pattern = '**/data/events/events-manifest.js';
      try {
        for (const event of priorityEvents) {
          await page.route(pattern,route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(root,'data/events/events-manifest.js'),'utf8')+'\nwindow.EVENTS_DATA.events=window.EVENTS_DATA.events.filter(e=>e.id==='+JSON.stringify(event.id)+');'}));
          await page.goto(origin+'/index.html?city='+event.city);
          const preview=page.locator('.home-event-card');
          assert.equal(await preview.count(),1,event.id);
          const copy=await preview.locator('.home-event-desc').textContent();
          for (const warning of warnings[event.id]) assert.match(copy,warning,event.id);
          const box=await preview.evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,scroll:el.scrollWidth,client:el.clientWidth}));
          assert.ok(box.left>=-1 && box.right<=viewport.width+1 && box.scroll<=box.client+1,event.id+': preview bounds');
          await preview.screenshot({path:path.join(output,`${engineName}-priority-one-preview-${event.id}-${label}.png`)});
          await page.unroute(pattern);
        }
      } finally { await page.unroute(pattern); }
    });
    await check(`${label}: unknown-end concert has no calendar CTA and expires at Colorado midnight`, async () => {
      const id='greenwood-music-darkened-theater-2026';
      await page.clock.setFixedTime(new Date('2026-10-26T05:59:00Z'));
      await page.goto(origin+'/events.html?city=greenwood-village');
      const card=page.locator(`[data-current="true"][data-event-id="${id}"]`);
      assert.equal(await card.count(),1);
      assert.match(await card.textContent(),/end time not published/);
      assert.equal(await card.locator('a[href*="calendar.google"]').count(),0);
      await page.clock.setFixedTime(new Date('2026-10-26T06:00:01Z'));
      await page.clock.fastForward('01:00');
      assert.equal(await card.count(),0);
      assert.equal(await page.locator('[data-current="true"]:visible').count(),0);
      assert.ok(await page.locator('#empty-city').isVisible());
      await page.clock.setFixedTime(new Date('2026-11-01T16:00:00Z'));
      await page.goto(origin+'/events.html');
      for(const event of priorityEvents) assert.equal(await page.locator(`[data-current="true"][data-event-id="${event.id}"]`).count(),0,event.id);
    });
    await check(`${label}: no uncaught JavaScript exceptions`, async () => assert.deepEqual(pageErrors, []));
    await context.close();
  }
  await browser.close(); server.close();
  fs.writeFileSync(path.join(output, `${engineName}-results.json`), JSON.stringify({ results, failures }, null, 2));
  console.log(`${results.length} passed, ${failures.length} failed`);
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
