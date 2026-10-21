/* Test-only local HTTP server; no live third-party submissions or navigation. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const { chromium, webkit } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const root = path.join(__dirname, '..');
const output = path.join(root, 'test-results');
fs.mkdirSync(output, { recursive: true });
// Compare inherited homepage overflow with the exact released main baseline.
// Fetch only the public commit object if CI's shallow checkout does not contain it.
// This changes no remote state, branch, workflow or deployment configuration.
const baselineRef = 'd178a64ebb896ec1b1e9f66429c46796004a3fe9';
try { execFileSync('git', ['cat-file', '-e', baselineRef + '^{commit}'], { cwd:root, stdio:'pipe' }); }
catch (_) { execFileSync('git', ['fetch', '--no-tags', '--depth=1', 'origin', baselineRef], { cwd:root, stdio:'pipe' }); }
const baselineFiles = new Map(['index.html','data/events/events-manifest.js','city-events.js'].map(file =>
  [file, execFileSync('git', ['show', baselineRef + ':' + file], { cwd:root })]));
const server = http.createServer((req, res) => {
  let requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
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
    await page.clock.install({ time: new Date('2026-10-21T16:00:00Z') });
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
    await page.locator('[data-event-id="aurora-nicks-fall-fest-2026"] details > summary').click();
    await page.locator('[data-current="true"]:visible').first().evaluate(card => card.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: path.join(output, `${engineName}-event-cards-${label}.png`), fullPage: false });
    await check(`${label}: all requested city filters and back/forward`, async () => {
      for (const city of ['centennial','parker','denver','aurora']) {
        await page.locator(`.event-filter-pill[data-city="${city}"]`).click();
        assert.equal(new URL(page.url()).searchParams.get('city'), city);
        const visible = page.locator('[data-current="true"]:visible');
        assert.equal(await visible.count(), ({centennial:3,parker:0,denver:3,aurora:5})[city], city);
        assert.ok((await visible.evaluateAll(items => items.map(e => e.dataset.city))).every(value => value === city));
      }
      await page.goBack(); assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').textContent(), 'Denver');
      await page.goForward(); assert.equal(await page.locator('.event-filter-pill[aria-pressed="true"]').textContent(), 'Aurora');
      await page.locator('.event-filter-pill[data-city=""]').click();
      assert.equal(new URL(page.url()).searchParams.has('city'), false);
      assert.equal(await page.locator('[data-current="true"]:visible').count(), 16);
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
      assert.equal(await page.locator('[data-event-id="aurora-halloween-on-havana-2026"]').count(), 0);
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
    await check(`${label}: Parker is empty after sold-out removal and unresolved RSVP hold`, async () => {
      for (const url of ['/events.html?city=parker','/index.html?city=parker','/best-parks-parker.html']) {
        await page.goto(origin + url);
        for (const title of ['Trunk or Treat on Mainstreet','All Treats, No Tricks: Sensory-Friendly Trick or Treat']) {
          assert.equal(await page.getByText(title, {exact:true}).count(), 0);
        }
        if (url.startsWith('/events.html')) {
          assert.equal(await page.locator('[data-current="true"]:visible').count(), 0);
          assert.ok(await page.locator('#empty-city').isVisible());
          await page.screenshot({path:path.join(output,`${engineName}-parker-empty-${label}.png`),fullPage:false});
        }
        if (url.startsWith('/best-parks-')) assert.equal(await page.locator('.city-event-card:visible').count(), 0);
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
      assert.equal(await page.locator('[data-current="true"]:visible').count(), 3);
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
    await check(`${label}: pumpkin picking, costs, next dates and warnings stay outside closed details`, async () => {
      const cards = page.locator('.pumpkin-card[data-current="true"]:visible');
      assert.equal(await cards.count(), 6);
      for (let index = 0; index < await cards.count(); index++) {
        const card = cards.nth(index);
        const id = await card.getAttribute('data-event-id');
        assert.ok(await card.locator('details > summary').count(), `${id}: schedule disclosure`);
        await card.locator('details').evaluateAll(items => items.forEach(details => { details.open = false; }));
        for (const selector of ['.pumpkin-picking','.pumpkin-costs','.pumpkin-next','.pumpkin-warning']) {
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
        const published = await page.evaluate(eventId => window.EVENTS_DATA.events.find(event => event.id === eventId).pumpkin, id);
        const visibleWarnings = (await card.locator('.pumpkin-warning').allTextContents()).join(' ');
        for (const warning of published.warnings) {
          assert.ok(visibleWarnings.includes(warning), `${id}: every source-backed warning remains visible`);
        }
        const visibleCosts = (await card.locator('.pumpkin-costs').allTextContents()).join(' ');
        for (const field of ['entryCost','pumpkinCost','activityCost']) {
          assert.ok(visibleCosts.includes(published[field]), `${id}: complete ${field} stays visible`);
        }
        assert.ok((await card.locator('.pumpkin-picking').textContent()).includes(published.pickingType));
        assert.match(await card.textContent(), /Details checked October 21, 2026/);
        // No CTA implies that a published schedule guarantees a ticket or crop.
        assert.doesNotMatch(await card.locator('a, button').allTextContents().then(texts => texts.join(' ')),
          /guaranteed (?:entry|tickets|availability)|tickets available now|book confirmed/i);
      }
      const anderson = cards.filter({ hasText: /Anderson/ });
      assert.equal(await anderson.count(), 1);
      assert.match(await anderson.locator('.pumpkin-warning').allTextContents().then(texts => texts.join(' ')),
        /conflict|inconsistent|confirm/i);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
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
      await remember('aurora', '', 5);
      await assertState(states[2]);
      await page.locator('.event-filter-pill[data-city=""]').click();
      assert.equal(new URL(page.url()).searchParams.has('city'), false);
      await remember('', '', 16);
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
        assert.ok(await card.locator('.pumpkin-warning').first().isVisible());
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
    await check(`${label}: Nick's next visit advances in an open tab and preserves disclosure state`, async () => {
      // October 21 at 5:59 p.m. MDT, even though the Tokyo test visitor is on October 22.
      await page.clock.setFixedTime(new Date('2026-10-21T23:59:00Z'));
      await page.goto(origin + '/events.html?category=pumpkin-patches&city=aurora#pumpkin-patches');
      const card = page.locator('.pumpkin-card[data-event-id="aurora-nicks-fall-fest-2026"]');
      assert.equal(await card.count(), 1);
      assert.match(await card.locator('.pumpkin-next').textContent(), /October 21, 2026/);
      await card.locator('details > summary').click();
      assert.equal(await card.locator('details').getAttribute('open'), '');
      // The 6 p.m. close removes today's occurrence, not the still-running series.
      await page.clock.setFixedTime(new Date('2026-10-22T00:01:00Z'));
      await page.clock.fastForward('01:00');
      assert.equal(await card.count(), 1);
      assert.match(await card.locator('.pumpkin-next').textContent(), /October 22, 2026/);
      assert.doesNotMatch(await card.locator('.pumpkin-next').textContent(), /October 21, 2026/);
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
      assert.match(next, /October 29, 2026/);
      assert.doesNotMatch(next, /October (?:26|27|28), 2026/);
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
    await check(`${label}: no uncaught JavaScript exceptions`, async () => assert.deepEqual(pageErrors, []));
    await context.close();
  }
  await browser.close(); server.close();
  fs.writeFileSync(path.join(output, `${engineName}-results.json`), JSON.stringify({ results, failures }, null, 2));
  console.log(`${results.length} passed, ${failures.length} failed`);
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
