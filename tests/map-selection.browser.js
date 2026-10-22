/* Exact-ID map selection and accessible shared-coordinate chooser regressions.
 * BROWSER=chromium|webkit node tests/map-selection.browser.js
 * Real pinned Leaflet 1.9.4; every external request is fulfilled locally or aborted.
 * Synthetic tile images are NOT provider availability/cartography evidence.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const zlib = require('node:zlib');
const vm = require('node:vm');
const {chromium, webkit} = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'test-results');
const engineName = process.env.BROWSER || 'chromium';
assert.ok(['chromium', 'webkit'].includes(engineName));
assert.equal(require('leaflet/package.json').version, '1.9.4');
const leafletDirectory = path.join(path.dirname(require.resolve('leaflet/package.json')), 'dist');
const leafletJS = fs.readFileSync(path.join(leafletDirectory, 'leaflet.js'));
const leafletCSS = fs.readFileSync(path.join(leafletDirectory, 'leaflet.css'));
function registeredCities() {
  // A filename glob also finds best-parks-data.js, which is editorial metadata,
  // not a city. Derive the sweep from actual production registrations instead.
  const window = {dispatchEvent() {}};
  const context = vm.createContext({window, CustomEvent: class {constructor(type, options) {this.type = type; this.detail = options.detail;}}});
  const sources = ['site-config.js', 'park-data-registry.js', ...fs.readdirSync(root).filter(name => name.endsWith('-parks-data.js')).sort()];
  for (const file of sources) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file});
  return Object.keys(window.PARK_DATASETS).sort();
}
const cities = registeredCities();
assert.equal(cities.length, 18, 'Sweep every registered city, not editorial aggregate filenames');
const viewports = [{width: 320, height: 740}, {width: 390, height: 844}, {width: 1440, height: 1000}];
const results = [], failures = [], metrics = [], network = [];
let browser, origin, currentCase = 'setup';
const safeName = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4), crc = Buffer.alloc(4);
  length.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}
function makeFixtureTile() {
  const size = 256, raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const color = Math.abs(x - y) < 4 || Math.abs(255 - x - y) < 4 ? [79, 140, 190]
      : (x % 64 < 3 || y % 64 < 3) ? [255, 255, 255]
      : ((Math.floor(x / 64) + Math.floor(y / 64)) % 2) ? [221, 211, 154] : [164, 204, 168];
    const offset = y * (size * 3 + 1) + 1 + x * 3;
    color.forEach((value, index) => { raw[offset + index] = value; });
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), pngChunk('IHDR', header), pngChunk('IDAT', zlib.deflateSync(raw)), pngChunk('IEND', Buffer.alloc(0))]);
}
const tilePNG = makeFixtureTile();
const mime = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp'};
const server = http.createServer((req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) {res.writeHead(405).end(); return;}
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.resolve(root, '.' + pathname);
    if (!target.startsWith(root + path.sep) || pathname.split('/').some(part => part.startsWith('.'))) {res.writeHead(404).end(); return;}
    const body = fs.readFileSync(target);
    res.setHeader('Content-Type', mime[path.extname(target)] || 'application/octet-stream');
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (_) {res.writeHead(404).end();}
});
async function check(name, callback) {
  currentCase = name; console.log('START', name);
  try {await callback(); results.push({name, passed: true}); console.log('PASS', name);}
  catch (error) {failures.push({name, message: error.stack}); console.error('FAIL', name, error.stack);}
}
async function capture(page, name) {
  await page.evaluate(() => {
    if (document.getElementById('selection-fixture-label')) return;
    const label = document.createElement('div'); label.id = 'selection-fixture-label';
    label.textContent = 'FIXTURE TILES · Real Leaflet 1.9.4 · No provider traffic';
    label.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:100000;padding:8px;background:#171d17;color:white;font:bold 11px sans-serif;text-align:center;pointer-events:none';
    document.body.appendChild(label);
  });
  await page.screenshot({path: path.join(output, 'map-selection-' + engineName + '-' + safeName(name) + '.png'), animations: 'disabled'});
}
async function testPage(viewport, callback, fixture) {
  const context = await browser.newContext({viewport, timezoneId: 'America/Denver', serviceWorkers: 'block'});
  const page = await context.newPage(), errors = [], routeErrors = [], requests = [];
  page.setDefaultTimeout(15000); page.setDefaultNavigationTimeout(20000);
  page.on('pageerror', error => errors.push(error.message));
  await context.addInitScript(() => {
    window.__selectionGeoRequests = 0;
    Object.defineProperty(navigator, 'geolocation', {configurable: true, value: {
      getCurrentPosition() {window.__selectionGeoRequests++;}
    }});
  });
  await context.route('**/*', async route => {
    try {
      const request = route.request(), url = new URL(request.url());
      const item = {url: request.url(), action: null}; requests.push(item);
      if (url.origin === origin) {
        if (fixture && url.pathname === '/aurora-parks-data.js') {
          item.action = 'local-fixture';
          await route.fulfill({status: 200, contentType: 'text/javascript', body:
            'window.PARK_COORDS = window.PARK_COORDS || {}; window.PARK_COORDS.aurora = {}; window.registerParkDataset("aurora", ' + JSON.stringify(fixture) + ');'});
          return;
        }
        item.action = 'loopback'; await route.continue(); return;
      }
      if (request.url() === 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js') {
        item.action = 'local-leaflet'; await route.fulfill({status: 200, contentType: 'text/javascript', body: leafletJS}); return;
      }
      if (request.url() === 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css') {
        item.action = 'local-leaflet'; await route.fulfill({status: 200, contentType: 'text/css', body: leafletCSS}); return;
      }
      if (/^https:\/\/(?:[abc]\.)?tile\.openstreetmap\.org\//.test(request.url()) || /^https:\/\/server\.arcgisonline\.com\//.test(request.url())) {
        item.action = 'local-tile'; await route.fulfill({status: 200, contentType: 'image/png', body: tilePNG}); return;
      }
      item.action = 'abort'; await route.abort();
    } catch (error) {if (!page.isClosed()) routeErrors.push(error.message);}
  });
  try {
    await callback(page);
    assert.equal(await page.evaluate(() => window.__selectionGeoRequests), 0, 'Selection never requests visitor location');
    assert.deepEqual(errors, [], 'No uncaught page errors');
    assert.deepEqual(routeErrors, [], 'Every intercepted request was handled');
    assert.ok(requests.some(request => request.action === 'local-leaflet'));
    for (const request of requests) {
      assert.ok(request.action, 'No request escaped interception');
      if (new URL(request.url).origin !== origin) assert.ok(['local-leaflet', 'local-tile', 'abort'].includes(request.action), 'No public request is continued onto the network');
    }
  } catch (error) {
    try {await capture(page, 'failure-' + currentCase);} catch (_) {}
    throw error;
  } finally {
    network.push({case: currentCase, loopback: requests.filter(item => item.action === 'loopback').length,
      locallyFulfilledPublic: requests.filter(item => ['local-leaflet', 'local-tile'].includes(item.action)).length,
      abortedPublic: requests.filter(item => item.action === 'abort').length, routeErrors, pageErrors: errors});
    await context.close();
  }
}
async function gotoCity(page, city) {
  await page.goto(origin + '/parks.html?dataset=' + city);
  await page.waitForFunction(city => {
    const parks = window.getParkDataset && window.getParkDataset(city);
    const card = document.querySelector('#grid .card[data-park-id]');
    const chip = document.querySelector('.dataset-link[data-dataset="' + city + '"]');
    // Greenwood Village is registered and directly routable, but has no city
    // chip. Actual selected dataset/card/marker state remains required for it.
    return window.ACTIVE_DATASET_KEY === city && typeof DATASET_KEY !== 'undefined' && DATASET_KEY === city &&
      Array.isArray(parks) && parks.length > 0 && card && parks.some(park => park.id === card.dataset.parkId && park.datasetKey === city) &&
      typeof markersLayer !== 'undefined' && markersLayer && markersLayer.getLayers().length > 0 &&
      (!chip || chip.getAttribute('aria-current') === 'true');
  }, city);
  await mapReady(page);
}
async function mapReady(page) {
  await page.locator('#map').scrollIntoViewIfNeeded();
  await page.evaluate(() => {window.__selectionMapStable = null;});
  await page.waitForFunction(() => {
    if (!window.L || L.version !== '1.9.4' || typeof map === 'undefined' || !map || map._animatingZoom || map._panAnim?._inProgress) return false;
    const box = document.getElementById('map').getBoundingClientRect(), size = map.getSize();
    const current = Object.values(map._layers).filter(layer => layer instanceof L.TileLayer).flatMap(layer => Object.values(layer._tiles)).filter(tile => tile.current);
    if (!(box.width > 100 && box.height > 100 && Math.abs(box.width - size.x) < 2 && Math.abs(box.height - size.y) < 2 &&
      current.length > 0 && current.every(tile => tile.active && tile.el.isConnected && tile.el.complete && tile.el.naturalWidth === 256 && Number(getComputedStyle(tile.el).opacity) >= .99))) return false;
    const key = JSON.stringify({size, center: map.getCenter(), zoom: map.getZoom(), tiles: current.map(tile => tile.el.src).sort()});
    if (!window.__selectionMapStable || window.__selectionMapStable.key !== key) window.__selectionMapStable = {key, since: performance.now()};
    return performance.now() - window.__selectionMapStable.since >= 350;
  });
}
const popup = page => page.locator('#map .leaflet-popup-content');
const card = (page, id) => page.locator('#grid .card[data-park-id="' + id + '"]');
async function loadEveryCard(page) {
  // Dispatch actual Load More button clicks. No runtime state or map geometry is patched.
  return page.evaluate(() => {
    let clicks = 0;
    while (document.querySelector('#load-more-wrap button')) {
      if (++clicks > 100) throw new Error('Load More did not terminate');
      document.querySelector('#load-more-wrap button').click();
    }
    return clicks;
  });
}
async function assertSelected(page, id, name, city = 'aurora') {
  await page.waitForFunction(id => document.querySelector('#map .leaflet-popup-content > [data-park-id]')?.dataset.parkId === id, id);
  assert.equal(await popup(page).locator('b').first().textContent(), name);
  const guide = popup(page).getByRole('link', {name: 'Open mini guide', exact: true});
  const href = new URL(await guide.getAttribute('href'), origin);
  assert.equal(href.pathname, '/park.html'); assert.equal(href.searchParams.get('dataset'), city); assert.equal(href.searchParams.get('id'), id);
  assert.equal(await guide.evaluate(node => document.activeElement === node), true, 'Selection moves keyboard focus to the exact mini-guide link');
}
async function assertReadablePopup(page, label) {
  await mapReady(page);
  const detail = await popup(page).evaluate(node => {
    function color(value) {const parts = value.match(/[\d.]+/g).map(Number); return [parts[0], parts[1], parts[2], parts.length > 3 ? parts[3] : 1];}
    function composite(front, back) {return front.slice(0, 3).map((value, index) => value * front[3] + back[index] * (1 - front[3]));}
    function background(element) {
      const chain = []; for (let item = element; item; item = item.parentElement) chain.push(item);
      return chain.reverse().reduce((result, item) => composite(color(getComputedStyle(item).backgroundColor), result), [255, 255, 255]);
    }
    function luminance(rgb) {return rgb.map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);}
    function measure(element) {
      const style = getComputedStyle(element), box = element.getBoundingClientRect(), bg = background(element);
      const foreground = composite(color(style.color), bg), l1 = luminance(foreground), l2 = luminance(bg);
      return {text: element.textContent.trim(), color: style.color, background: bg, contrast: (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05),
        fontSize: parseFloat(style.fontSize), lineHeight: parseFloat(style.lineHeight), width: box.width, height: box.height,
        left: box.left, right: box.right, top: box.top, bottom: box.bottom, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth};
    }
    const wrapper = node.closest('.leaflet-popup'), box = wrapper.getBoundingClientRect();
    return {viewportWidth: innerWidth, viewportHeight: innerHeight, documentWidth: document.documentElement.scrollWidth,
      popup: {left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height},
      secondary: Array.from(node.querySelectorAll('.popup-acres, .popup-place')).filter(item => item.textContent.trim()).map(measure),
      links: Array.from(node.querySelectorAll('a, button')).map(measure),
      textBounds: Array.from(node.querySelectorAll('b, .popup-acres, .popup-place, a, button')).filter(item => item.textContent.trim()).map(measure)};
  });
  assert.ok(detail.popup.left >= -1 && detail.popup.right <= detail.viewportWidth + 1, 'Popup fits the viewport horizontally');
  assert.ok(detail.popup.top >= -1 && detail.popup.bottom <= detail.viewportHeight + 1, 'Popup is visible vertically');
  assert.ok(detail.documentWidth <= detail.viewportWidth + 1, 'Popup does not create page overflow');
  for (const text of [...detail.secondary, ...detail.links]) assert.ok(text.contrast >= 4.5, text.text + ' contrast must be >= 4.5:1; measured ' + text.contrast);
  for (const text of detail.secondary) {assert.ok(text.fontSize >= 12); assert.ok(text.lineHeight >= text.fontSize * 1.4);}
  for (const text of detail.textBounds) {
    assert.ok(text.width > 0 && text.height > 0, 'Popup text has rendered dimensions');
    assert.ok(text.left >= detail.popup.left - 1 && text.right <= detail.popup.right + 1, 'Text remains within popup');
    // Inline links have clientWidth=0, so only block/button boxes can be compared.
    if (text.clientWidth > 0) assert.ok(text.scrollWidth <= text.clientWidth + 1, 'Popup text does not clip horizontally');
  }
  const accessibility = await new AxeBuilder({page}).include('#map .leaflet-popup').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.deepEqual(accessibility.violations.map(item => ({id: item.id, nodes: item.nodes.map(node => node.target)})), [], 'Scoped popup axe checks');
  metrics.push({case: currentCase, label, ...detail, axeViolations: accessibility.violations.length});
  await capture(page, label);
}
const cottonwood = [
  {id: 'co-aurora-cottonwood-grove', name: 'Cottonwood Grove'},
  {id: 'co-aurora-cottonwood-park', name: 'Cottonwood Park'}
];
const sharedMarker = page => page.locator('#map [role="button"][aria-label*="Cottonwood Grove"][aria-label*="Cottonwood Park"]');
const fixtures = [
  {id: 'fixture-shared-a', n: 'Identical display name', a: '100 Fixture Lane', ac: 5, lat: 39.7, lng: -104.8, f: {playground: true}},
  {id: 'fixture-shared-b', n: 'Other shared-coordinate park', a: '200 Fixture Lane', ac: 9, lat: 39.7, lng: -104.8, f: {trails: true}},
  {id: 'fixture-nearby', n: 'Identical display name', a: '300 Fixture Lane', ac: 12, lat: 39.7001, lng: -104.8001, f: {trails: true}},
  {id: 'fixture-no-coordinates', n: 'No coordinates fixture', a: 'Fixture City', ac: 0, lat: null, lng: null, f: {trails: true}}
];
(async () => {
  fs.mkdirSync(output, {recursive: true});
  try {
    await new Promise((resolve, reject) => {server.once('error', reject); server.listen(0, '127.0.0.1', resolve);});
    origin = 'http://127.0.0.1:' + server.address().port;
    const launch = {headless: true};
    if (engineName === 'chromium' && process.env.CHROMIUM_EXECUTABLE_PATH) launch.executablePath = process.env.CHROMIUM_EXECUTABLE_PATH;
    browser = await ({chromium, webkit})[engineName].launch(launch);
    for (const city of cities) await check(city + ': every ID, card and Map action selects the exact park', () => testPage(viewports[2], async page => {
      await gotoCity(page, city); await loadEveryCard(page);
      const detail = await page.evaluate(city => {
        const parks = window.getParkDataset(city), before = JSON.stringify(parks), failures = [], actions = [];
        const coordinate = park => Number.isFinite(park.lat) && Number.isFinite(park.lng) ? [park.lat, park.lng] : null;
        const groups = new Set(parks.filter(coordinate).map(park => JSON.stringify(coordinate(park))));
        if (markersLayer.getLayers().length !== groups.size) failures.push('Marker count must equal exact-coordinate groups');
        const cards = Array.from(document.querySelectorAll('#grid .card[data-park-id]'));
        if (cards.length !== parks.length || new Set(cards.map(card => card.dataset.parkId)).size !== parks.length) failures.push('Every dataset ID needs exactly one card');
        for (const park of parks) {
          const card = cards.find(item => item.dataset.parkId === park.id), coords = coordinate(park);
          if (!card) {failures.push('Missing card ' + park.id); continue;}
          const mapButton = card.querySelector('.map-pin-btn'), marker = parkMarkers[park.id];
          const cardGuide = new URL(card.querySelector('.city-btn').href);
          if (cardGuide.searchParams.get('dataset') !== city || cardGuide.searchParams.get('id') !== park.id) failures.push('Wrong card guide ' + park.id);
          if (!coords) {if (mapButton || marker) failures.push('Unmapped park has map selection ' + park.id); continue;}
          if (!mapButton || !marker) {failures.push('Missing Map action/marker ' + park.id); continue;}
          const point = marker.getLatLng();
          if (point.lat !== coords[0] || point.lng !== coords[1]) failures.push('Wrong marker coordinates ' + park.id);
          for (const [kind, target] of [['Map', mapButton], ['card', card]]) {
            target.click(); // Real DOM event handler, not focusMapOnPark API invocation.
            const popup = document.querySelector('#map .leaflet-popup-content > [data-park-id]');
            const guide = popup && popup.querySelector('a'), href = guide && new URL(guide.href);
            if (popup?.dataset.parkId !== park.id || popup.querySelector('b').textContent !== park.name || href?.searchParams.get('dataset') !== city || href?.searchParams.get('id') !== park.id) failures.push('Wrong ' + kind + ' popup ' + park.id);
            if (document.activeElement !== guide) failures.push('Wrong ' + kind + ' focus ' + park.id);
            actions.push({kind, id: park.id});
          }
        }
        if (JSON.stringify(parks) !== before) failures.push('Selection mutated dataset');
        return {city, records: parks.length, mapped: parks.filter(coordinate).length, markerGroups: groups.size, actions, failures};
      }, city);
      assert.deepEqual(detail.failures, []);
      assert.equal(detail.actions.length, detail.mapped * 2, 'Both real card and Map handlers tested for every mapped park');
      metrics.push({case: currentCase, ...detail});
    }));

    for (const viewport of viewports) await check(viewport.width + 'px: actual duplicate chooser, keyboard and readable popup', () => testPage(viewport, async page => {
      await gotoCity(page, 'aurora'); await loadEveryCard(page);
      const ids = cottonwood.map(park => park.id);
      assert.equal(await page.evaluate(ids => parkMarkers[ids[0]] === parkMarkers[ids[1]], ids), true, 'Actual duplicate pair shares exactly one marker');
      for (const park of cottonwood) {
        const button = card(page, park.id).getByRole('button', {name: 'Show ' + park.name + ' on map', exact: true});
        await button.focus(); await page.keyboard.press('Enter');
        await assertSelected(page, park.id, park.name);
        await assertReadablePopup(page, viewport.width + '-card-' + park.id);
        await page.keyboard.press('Escape');
        assert.equal(await button.evaluate(node => node === document.activeElement), true, 'Escape restores the exact card Map opener');
        assert.equal(await popup(page).count(), 0);
      }
      const marker = sharedMarker(page);
      assert.equal(await marker.count(), 1);
      assert.equal(await marker.getAttribute('tabindex'), '0');
      assert.match(await marker.getAttribute('aria-label'), /Choose from 2 parks/);
      for (const [openingKey, choiceKey, index] of [['Enter', 'Space', 1], ['Space', 'Enter', 0]]) {
        await marker.focus(); await page.keyboard.press(openingKey);
        const choices = popup(page).locator('.park-chooser button[data-park-id]');
        assert.deepEqual(await choices.evaluateAll(nodes => nodes.map(node => ({id: node.dataset.parkId, name: node.textContent}))), cottonwood);
        assert.equal(await choices.first().evaluate(node => node === document.activeElement), true, 'Keyboard marker opening focuses first named choice');
        await assertReadablePopup(page, viewport.width + '-chooser-' + openingKey.toLowerCase());
        if (index === 1) {await page.keyboard.press('Tab'); assert.equal(await choices.nth(1).evaluate(node => node === document.activeElement), true, 'Tab reaches the second native choice');}
        await page.keyboard.press(choiceKey);
        await assertSelected(page, cottonwood[index].id, cottonwood[index].name);
        await page.keyboard.press('Tab');
        const back = popup(page).getByRole('button', {name: 'Other parks at this location', exact: true});
        assert.equal(await back.evaluate(node => node === document.activeElement), true, 'Tab reaches the chooser return action');
        await page.keyboard.press('Enter');
        assert.deepEqual(await popup(page).locator('.park-chooser button[data-park-id]').evaluateAll(nodes => nodes.map(node => node.dataset.parkId)), ids);
        assert.equal(await popup(page).locator('.park-chooser button').first().evaluate(node => node === document.activeElement), true, 'Returning to the chooser resets focus to its first choice');
        await page.keyboard.press('Enter');
        await assertSelected(page, cottonwood[0].id, cottonwood[0].name);
        await page.keyboard.press('Escape');
        assert.equal(await marker.evaluate(node => node === document.activeElement), true, 'Escape after choice restores original marker');
        assert.equal(await popup(page).count(), 0);
      }
      // Real pointer clicks must survive replacing the clicked popup DOM: the
      // original click must not reach Leaflet's map-level popup-close handler.
      await marker.click();
      assert.deepEqual(await popup(page).locator('.park-chooser button[data-park-id]').evaluateAll(nodes => nodes.map(node => node.dataset.parkId)), ids);
      for (const park of cottonwood) {
        await popup(page).getByRole('button', {name: park.name, exact: true}).click();
        await assertSelected(page, park.id, park.name);
        assert.equal(await popup(page).count(), 1, 'Pointer choice leaves the selected popup open');
        await popup(page).getByRole('button', {name: 'Other parks at this location', exact: true}).click();
        const restored = popup(page).locator('.park-chooser button[data-park-id]');
        assert.deepEqual(await restored.evaluateAll(nodes => nodes.map(node => node.dataset.parkId)), ids, 'Pointer return leaves the chooser open with both exact IDs');
        assert.equal(await restored.first().evaluate(node => node === document.activeElement), true, 'Pointer return restores first-choice keyboard focus');
      }
      await page.keyboard.press('Escape');
      assert.equal(await marker.evaluate(node => node === document.activeElement), true);
      assert.equal(await popup(page).count(), 0);
      metrics.push({case: currentCase, label: 'pointer-selection-and-chooser-return', selectedIds: ids, returnedToChooser: true, escapeRestoredMarker: true});
    }));

    await check('filter/search changes rebuild shared groups without excluded chooser members', () => testPage(viewports[1], async page => {
      await gotoCity(page, 'aurora');
      await page.locator('#search').fill('Cottonwood');
      await page.waitForFunction(() => document.querySelectorAll('#grid .card[data-park-id]').length === 2);
      assert.equal(await page.evaluate(() => markersLayer.getLayers().length), 1);
      const filterToggle = page.locator('#filter-toggle');
      if (await filterToggle.isVisible() && await filterToggle.getAttribute('aria-expanded') !== 'true') await filterToggle.click();
      await page.locator('.pill[data-k="playground"]').click();
      await page.waitForFunction(() => Object.keys(parkMarkers).length === 1);
      assert.deepEqual(await page.evaluate(() => Object.keys(parkMarkers)), ['co-aurora-cottonwood-park']);
      await card(page, 'co-aurora-cottonwood-park').locator('.map-pin-btn').click();
      await assertSelected(page, 'co-aurora-cottonwood-park', 'Cottonwood Park');
      assert.equal(await popup(page).locator('.park-chooser').count(), 0, 'Filtered-out shared park is absent');
      await page.keyboard.press('Escape');
      if (await filterToggle.isVisible() && await filterToggle.getAttribute('aria-expanded') !== 'true') await filterToggle.click();
      await page.locator('.pill[data-k="playground"]').click();
      await page.waitForFunction(() => Object.keys(parkMarkers).length === 2);
      await card(page, cottonwood[0].id).locator('.map-pin-btn').click(); await page.keyboard.press('Escape');
      await sharedMarker(page).focus(); await page.keyboard.press('Enter');
      assert.equal(await popup(page).locator('.park-chooser button[data-park-id]').count(), 2, 'Clearing feature restores both choices');
      await page.keyboard.press('Escape');
      await page.locator('#search').fill('Cottonwood Grove');
      await page.waitForFunction(() => Object.keys(parkMarkers).length === 1);
      assert.deepEqual(await page.evaluate(() => Object.keys(parkMarkers)), ['co-aurora-cottonwood-grove']);
    }));

    await check('synthetic equal-name, exact-coordinate and nearby-coordinate IDs stay distinct', () => testPage(viewports[1], async page => {
      await gotoCity(page, 'aurora');
      assert.deepEqual(await page.evaluate(() => ({groups: markersLayer.getLayers().length,
        shared: parkMarkers['fixture-shared-a'] === parkMarkers['fixture-shared-b'],
        nearbyDistinct: parkMarkers['fixture-shared-a'] !== parkMarkers['fixture-nearby']})), {groups: 2, shared: true, nearbyDistinct: true});
      for (const park of fixtures.filter(park => park.lat !== null)) {
        await card(page, park.id).locator('.map-pin-btn').click();
        await assertSelected(page, park.id, park.n);
        await page.keyboard.press('Escape');
      }
      // Set up the existing visited-only mode directly, then use the real card
      // button for selection. shared-b has a unique name: visited state is
      // intentionally still name-based, outside this exact-ID selection fix.
      const visitedBefore = await page.evaluate(() => {
        visited.clear(); visited.add('Other shared-coordinate park');
        mapMode = 'visited'; activeFilters.mapMode = 'visited';
        renderMarkers(currentFiltered);
        return {mode: mapMode, filters: JSON.parse(JSON.stringify(activeFilters)),
          active: [...window._activeSet], visited: [...visited],
          markerIds: Object.keys(parkMarkers), groups: markersLayer.getLayers().length};
      });
      assert.deepEqual(visitedBefore.markerIds, ['fixture-shared-b']);
      assert.equal(visitedBefore.groups, 1, 'Visited setup contains only the uniquely named shared-b park');
      await card(page, 'fixture-shared-a').locator('.map-pin-btn').click();
      await assertSelected(page, 'fixture-shared-a', 'Identical display name');
      const transient = await page.evaluate(() => ({mode: mapMode, filters: JSON.parse(JSON.stringify(activeFilters)),
        active: [...window._activeSet], visited: [...visited], groups: markersLayer.getLayers().length,
        markerIds: Object.keys(parkMarkers).sort(),
        sameMarker: parkMarkers['fixture-shared-a'] === parkMarkers['fixture-shared-b'],
        group: parkMarkers['fixture-shared-a'].parkGroup.map(park => park.id).sort()}));
      assert.equal(transient.groups, 1, 'Selecting an excluded shared park does not stack a second marker');
      assert.equal(transient.sameMarker, true);
      assert.deepEqual(transient.markerIds, ['fixture-shared-a', 'fixture-shared-b']);
      assert.deepEqual(transient.group, ['fixture-shared-a', 'fixture-shared-b']);
      for (const key of ['mode', 'filters', 'active', 'visited']) assert.deepEqual(transient[key], visitedBefore[key], 'Transient selection preserves ' + key);
      const reset = await page.evaluate(() => {
        renderMarkers(currentFiltered);
        return {mode: mapMode, filters: JSON.parse(JSON.stringify(activeFilters)),
          active: [...window._activeSet], visited: [...visited],
          markerIds: Object.keys(parkMarkers), groups: markersLayer.getLayers().length};
      });
      assert.deepEqual(reset, visitedBefore, 'Next render clears the temporary member and restores the original visited-only marker');
      metrics.push({case: currentCase, label: 'visited-only-transient-shared-selection', before: visitedBefore, transient, reset});
      const noCoordinates = card(page, 'fixture-no-coordinates');
      assert.equal(await noCoordinates.locator('.map-pin-btn').count(), 0);
      assert.equal(await page.evaluate(() => Object.hasOwn(parkMarkers, 'fixture-no-coordinates')), false);
      await noCoordinates.locator('.park-name').click();
      await page.waitForURL(url => url.pathname === '/park.html' && url.searchParams.get('id') === 'fixture-no-coordinates');
      assert.equal(new URL(page.url()).searchParams.get('dataset'), 'aurora', 'Unmapped card retains its exact-ID mini-guide fallback');
    }, fixtures));

    await check('existing unmapped Aurora card retains mini-guide navigation', () => testPage(viewports[1], async page => {
      await gotoCity(page, 'aurora'); await loadEveryCard(page);
      const park = await page.evaluate(() => window.getParkDataset('aurora').find(park => !Number.isFinite(park.lat) || !Number.isFinite(park.lng)));
      assert.ok(park, 'Existing unmapped record is covered, not only a synthetic fixture');
      assert.equal(await card(page, park.id).locator('.map-pin-btn').count(), 0);
      await card(page, park.id).locator('.park-name').click();
      await page.waitForURL(url => url.pathname === '/park.html' && url.searchParams.get('id') === park.id);
    }));
  } catch (error) {failures.push({name: currentCase, message: error.stack}); console.error(error.stack);}
  finally {
    if (browser) await browser.close();
    if (server.listening) await new Promise(resolve => server.close(resolve));
    fs.writeFileSync(path.join(output, 'map-selection-' + engineName + '-results.json'), JSON.stringify({engine: engineName, leaflet: '1.9.4',
      passed: results.length, failed: failures.length, results, failures, metrics, network,
      method: 'Real Leaflet; every external request locally fulfilled or aborted. All-city card/Map handler sweep uses DOM click events; focused chooser tests use Playwright pointer and keyboard input.',
      limitations: ['Synthetic tiles do not test live providers or cartography.', 'Scoped popup axe/contrast and Chromium/WebKit viewport evidence do not certify screen readers or physical iOS/Android devices.', 'No production data or runtime patches are used; the explicit synthetic identity fixture substitutes one dataset response in that scenario only.']}, null, 2) + '\n');
    console.log('Map selection tests:', results.length, 'passed;', failures.length, 'failed');
    process.exitCode = failures.length ? 1 : 0;
  }
})();
