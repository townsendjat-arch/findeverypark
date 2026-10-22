/* Real Leaflet 1.9.4 rendering regression, with clearly synthetic image tiles.
 * BROWSER=chromium|webkit node tests/map-rendering.browser.js
 * Optional local Chromium: CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
 * Every public request is intercepted. This suite NEVER contacts OSM, Esri,
 * unpkg, fonts, or analytics, and is not a live-provider/physical-device pass.
 * Actual loopback wire headers independently verify browser referrer behavior;
 * canonical OSM URL headers are observed at the browser interception boundary.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const zlib = require('node:zlib');
const {chromium, webkit} = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'test-results');
const engineName = process.env.BROWSER || 'chromium';
assert.ok(['chromium', 'webkit'].includes(engineName), 'BROWSER must be chromium or webkit');
const leafletDirectory = path.join(path.dirname(require.resolve('leaflet/package.json')), 'dist');
assert.equal(require('leaflet/package.json').version, '1.9.4', 'The real Leaflet version is pinned');
const leafletJS = fs.readFileSync(path.join(leafletDirectory, 'leaflet.js'));
const leafletCSS = fs.readFileSync(path.join(leafletDirectory, 'leaflet.css'));
const sentinel = [12.3456789, -98.7654321]; // Invented test values; retained only in test memory.
const viewports = [['320px', {width: 320, height: 740}], ['390px', {width: 390, height: 844}], ['1440px', {width: 1440, height: 1000}]];
const results = [], failures = [], metrics = [], wireRequests = [];
let browser, origin, wireOrigin, currentCase = 'setup';

// An opaque RGB PNG, generated locally without a downloaded map or image.
// Alternating green/gold cells and blue diagonals make missing/transparent tiles
// visibly different. Every screenshot also carries a FIXTURE TILES label.
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
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/__map-referrer-probe.html') {
      res.setHeader('Content-Type', 'text/html');
      res.end('<!doctype html><meta name="referrer" content="no-referrer"><title>Local-only native Referer probe</title>');
      return;
    }
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root + path.sep) || pathname.split('/').some(part => part.startsWith('.'))) { res.writeHead(404).end(); return; }
    const body = fs.readFileSync(target);
    res.setHeader('Content-Type', mime[path.extname(target)] || 'application/octet-stream');
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (_) { res.writeHead(404).end(); }
});
const wireServer = http.createServer((req, res) => {
  wireRequests.push({url: wireOrigin + req.url, headers: req.headers});
  res.setHeader('Content-Type', 'image/png'); res.setHeader('Cache-Control', 'no-store'); res.end(tilePNG);
});
function decoded(value) {
  let text = typeof value === 'string' ? value : JSON.stringify(value);
  for (let count = 0; count < 3; count++) {
    try { const next = decodeURIComponent(text.replace(/\+/g, ' ')); if (next === text) break; text = next; } catch (_) { break; }
  }
  return text;
}
function privateVariants() {
  return sentinel.flatMap(value => Array.from({length: 7}, (_, index) => value.toFixed(index + 3).replace(/0+$/, '').replace(/\.$/, '')));
}
function assertNoSentinel(value, label) {
  const text = decoded(value);
  for (const variant of privateVariants()) assert.equal(text.includes(variant), false, label + ' must not contain a synthetic visitor coordinate');
}
function redact(value) {
  let text = JSON.stringify(value, null, 2);
  for (const variant of privateVariants()) text = text.split(variant).join('[synthetic-coordinate-redacted]');
  return text;
}
const canonicalTile = url => /^https:\/\/tile\.openstreetmap\.org\/\d+\/\d+\/\d+\.png$/.test(url);
const anyOsmTile = url => /^https:\/\/(?:[abc]\.)?tile\.openstreetmap\.org\//.test(url);
const esriTile = url => /^https:\/\/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery\/MapServer\/tile\//.test(url);
const safeName = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 150);
function gate() {
  let release, markSeen;
  const wait = new Promise(resolve => { release = resolve; });
  const seen = new Promise(resolve => { markSeen = resolve; });
  return {release, wait, seen, markSeen};
}
async function deadline(promise, milliseconds, label) {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(label + ' exceeded ' + milliseconds + ' ms')), milliseconds); })]); }
  finally { clearTimeout(timer); }
}
async function check(name, callback) {
  currentCase = name; console.log('START', name);
  try { await callback(); results.push({name, passed: true}); console.log('PASS', name); }
  catch (error) { failures.push({name, message: error.stack}); console.error('FAIL', name, redact(error.stack)); }
}
async function annotateFixtures(page) {
  await page.evaluate(() => {
    if (document.getElementById('fixture-tile-label')) return;
    const label = document.createElement('div'); label.id = 'fixture-tile-label';
    label.textContent = 'FIXTURE TILES · Real Leaflet 1.9.4 · No provider traffic';
    label.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:100000;padding:8px 10px;background:#171d17;color:white;font:bold 11px sans-serif;text-align:center;pointer-events:none';
    document.body.appendChild(label);
  });
}
async function capture(page, name) {
  await annotateFixtures(page);
  await page.locator('.map-section').scrollIntoViewIfNeeded();
  await page.screenshot({path: path.join(output, 'map-rendering-' + engineName + '-' + safeName(name) + '.png'), animations: 'disabled'});
}
async function privacySnapshot(page) {
  return page.evaluate(() => ({
    url: location.href, history: history.state, historyWrites: window.__historyWrites,
    local: Object.fromEntries(Object.entries(localStorage)), session: Object.fromEntries(Object.entries(sessionStorage)),
    cookies: document.cookie, dataLayer: Array.from(window.dataLayer || [], value => Array.from(value)),
    links: Array.from(document.querySelectorAll('a[href]'), node => node.getAttribute('href').startsWith('#') ? node.getAttribute('href') : node.href),
    resources: performance.getEntriesByType('resource').map(entry => entry.name)
  }));
}
async function testPage(viewport, options, callback) {
  const context = await browser.newContext({viewport, timezoneId: 'America/Denver', serviceWorkers: 'block'});
  const page = await context.newPage(), requests = [], errors = [], consoleMessages = [], routeErrors = [];
  page.setDefaultTimeout(15000); page.setDefaultNavigationTimeout(20000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => consoleMessages.push(message.text()));
  await context.addInitScript(() => {
    window.__geoRequests = []; window.__historyWrites = [];
    Object.defineProperty(navigator, 'geolocation', {configurable: true, value: {
      getCurrentPosition(success, error, options) { window.__geoRequests.push({success, error, options}); }
    }});
    for (const key of ['pushState', 'replaceState']) {
      const original = history[key].bind(history);
      history[key] = function(state, title, url) { window.__historyWrites.push({state, url}); return original(state, title, url); };
    }
  });
  await context.route('**/*', async route => {
    try {
      const request = route.request(), url = new URL(request.url());
      requests.push({url: request.url(), headers: await request.allHeaders(), body: request.postData() || '', type: request.resourceType()});
      if (url.origin === origin) {
        // Only the retained synthetic-GPS privacy case enables the saved implementation.
        // Every ordinary map/rendering case exercises the actual paused release.
        if (options.retainedGPS && url.pathname === '/gps-availability.js') {
          const source = fs.readFileSync(path.join(root, 'gps-availability.js'), 'utf8');
          assert.ok(source.includes('window.FEP_GPS_AVAILABLE = false;'));
          await route.fulfill({status: 200, contentType: 'text/javascript',
            body: source.replace('window.FEP_GPS_AVAILABLE = false;', 'window.FEP_GPS_AVAILABLE = true;')}); return;
        }
        if (options.datasetGate && url.pathname === (options.datasetHoldPath || '/aurora-parks-data.js')) {
          options.datasetGate.markSeen(); await options.datasetGate.wait;
          if (options.datasetFailure) { await route.abort(); return; }
        }
        await route.continue(); return;
      }
      if (url.origin === wireOrigin) { await route.continue(); return; } // The only extra origin allowed onto the wire is loopback.
      if (request.url() === 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js') {
        if (options.leafletGate) { options.leafletGate.markSeen(); await options.leafletGate.wait; }
        await route.fulfill({status: 200, contentType: 'text/javascript', body: leafletJS}); return;
      }
      if (request.url() === 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css') {
        await route.fulfill({status: 200, contentType: 'text/css', body: leafletCSS}); return;
      }
      if (anyOsmTile(request.url()) || esriTile(request.url())) {
        await route.fulfill({status: 200, contentType: 'image/png', body: tilePNG}); return;
      }
      // Do not execute analytics, fetch fonts, or permit any other public request.
      await route.abort();
    } catch (error) {
      if (!page.isClosed()) routeErrors.push(error.message);
    }
  });
  try {
    await deadline(callback({page, context, requests}), 90000, 'Browser scenario');
    assertNoSentinel(await privacySnapshot(page), 'URL, history, storage, analytics, links and resource names');
    assertNoSentinel(consoleMessages, 'Browser console');
    for (const [index, request] of requests.entries()) {
      const candidate = new URL(request.url);
      const initialLegacy = options.legacyEntry && index === 0 && request.type === 'document' && candidate.origin === origin &&
        candidate.pathname === '/parks.html' && candidate.searchParams.get('lat') === String(sentinel[0]) && candidate.searchParams.get('lng') === String(sentinel[1]);
      // A caller-supplied legacy URL already reached the initial host. Cleanup cannot erase that request.
      if (initialLegacy) assertNoSentinel({headers: request.headers, body: request.body}, 'Initial legacy request headers/body');
      else assertNoSentinel(request, 'Outgoing request URL, headers and body');
      const url = new URL(request.url);
      if (url.origin === origin || url.origin === wireOrigin) continue;
      if (anyOsmTile(request.url)) {
        assert.ok(canonicalTile(request.url), 'OSM requests use only the canonical tile.openstreetmap.org host');
        assert.equal(request.headers.referer, origin + '/', 'Browser-generated canonical OSM Referer is page origin only');
      } else assert.equal(request.headers.referer || '', '', 'Other public requests retain no-referrer');
    }
    assert.deepEqual(errors, [], 'No uncaught page errors');
    assert.deepEqual(routeErrors, [], 'No failed interception operations');
  } catch (error) {
    try {
      const detail = {case: currentCase, error: error.stack, errors, routeErrors, consoleMessages, requests, state: await privacySnapshot(page)};
      detail.mapSnapshot = await page.evaluate(() => {
        const main = typeof map === 'undefined' ? null : map;
        const rect = node => { const box = node.getBoundingClientRect(); return {left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height}; };
        const node = document.getElementById('map');
        return {viewport: {width: innerWidth, height: innerHeight, scrollY}, mapRect: node ? rect(node) : null,
          initialized: !!main, size: main?.getSize(), center: main?.getCenter(), zoom: main?.getZoom(),
          zoomAnimating: main?._animatingZoom, panAnimating: main?._panAnim?._inProgress, stability: window.__mapTestStable,
          layers: main ? Object.values(main._layers).filter(layer => layer instanceof L.TileLayer).map(layer => ({
            tileZoom: layer._tileZoom, loading: layer._loading, noPrune: layer._noPrune,
            tiles: Object.values(layer._tiles).map(tile => ({current: tile.current, active: tile.active, loaded: tile.loaded, retain: tile.retain,
              coordinates: tile.coords, src: tile.el.src, complete: tile.el.complete, naturalWidth: tile.el.naturalWidth, naturalHeight: tile.el.naturalHeight,
              opacity: getComputedStyle(tile.el).opacity, connected: tile.el.isConnected, classes: tile.el.className, rect: rect(tile.el)}))
          })) : [],
          domTiles: node ? Array.from(node.querySelectorAll('.leaflet-tile')).map(tile => ({src: tile.src, complete: tile.complete,
            naturalWidth: tile.naturalWidth, naturalHeight: tile.naturalHeight, opacity: getComputedStyle(tile).opacity, rect: rect(tile)})) : []};
      });
      fs.writeFileSync(path.join(output, 'map-rendering-' + engineName + '-failure-' + safeName(currentCase) + '.json'), redact(detail));
      await annotateFixtures(page);
      await page.screenshot({path: path.join(output, 'map-rendering-' + engineName + '-failure-' + safeName(currentCase) + '.png'), animations: 'disabled', timeout: 5000});
    } catch (_) {}
    throw error;
  } finally {
    if (options.datasetGate) options.datasetGate.release();
    if (options.leafletGate) options.leafletGate.release();
    await context.close();
  }
}
const cityLink = (page, city) => page.locator('.dataset-link[data-dataset="' + city + '"]');
async function readyCity(page, city) {
  await page.waitForFunction(city => window.ACTIVE_DATASET_KEY === city && window.getParkDataset && Array.isArray(window.getParkDataset(city)) &&
    document.querySelector('#grid .card[data-park-id]') && document.querySelector('.dataset-link[data-dataset="' + city + '"]').getAttribute('aria-current') === 'true', city);
}
async function chooseCity(page, city) { await cityLink(page, city).click(); await readyCity(page, city); }
async function gotoCity(page, city) { await page.goto(origin + '/parks.html?dataset=' + city); await readyCity(page, city); }
async function awaitingCity(page) {
  await page.waitForFunction(() => document.querySelector('#page-intro-title').textContent === 'Choose a city to see parks');
  assert.equal(await page.locator('#map').isVisible(), false, 'Unconfirmed city map is hidden');
  assert.equal(await page.locator('#grid .card[data-park-id]').count(), 0, 'No unconfirmed park cards');
  assert.equal(new URL(page.url()).searchParams.get('dataset'), null, 'No implied dataset confirmation');
}
async function mapReady(page) {
  // Every call starts a fresh observation. Leaflet schedules zoom in a later
  // animation frame, so cached stability from the previous action is not readiness.
  await page.evaluate(() => { window.__mapTestStable = null; });
  // View the real map as a user would; this does not invoke a Leaflet repair API.
  await page.locator('#map').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    if (!window.L || L.version !== '1.9.4' || typeof map === 'undefined' || !map || map._animatingZoom || map._panAnim?._inProgress) return false;
    const node = document.getElementById('map'), box = node.getBoundingClientRect(), size = map.getSize();
    const svg = node.querySelector('.leaflet-overlay-pane svg'), paths = Array.from(node.querySelectorAll('.leaflet-overlay-pane path'));
    const tiles = Array.from(node.querySelectorAll('.leaflet-tile-loaded'));
    return box.width > 100 && box.height > 100 && Math.abs(box.width - size.x) < 2 && Math.abs(box.height - size.y) < 2 &&
      svg && svg.getBoundingClientRect().width > 100 && svg.getBoundingClientRect().height > 100 &&
      paths.length > 0 && paths.some(path => path.getBBox().width > 1 && path.getBBox().height > 1 && !/^M0(?:\s|,)+0(?:\s|z)*$/i.test(path.getAttribute('d') || '')) &&
      tiles.some(tile => tile.complete && tile.naturalWidth === 256 && tile.naturalHeight === 256 && Number(getComputedStyle(tile).opacity) > 0.9);
  });
  // Observe genuine settled geometry/image pruning, never trigger test-side map repair.
  await page.waitForFunction(() => {
    if (map._animatingZoom || map._panAnim?._inProgress) return false;
    // Leaflet deliberately retains old-level/offscreen tiles, but _updateOpacity
    // skips !tile.current. Read its current tiles rather than requiring obsolete
    // retained images to finish a fade that Leaflet no longer advances.
    const records = Object.values(map._layers).filter(layer => layer instanceof L.TileLayer)
      .flatMap(layer => Object.values(layer._tiles)).filter(tile => tile.current);
    const tiles = records.map(tile => tile.el);
    if (!tiles.length || records.some(tile => !tile.active) || tiles.some(tile => !tile.isConnected || !tile.complete ||
      tile.naturalWidth !== 256 || tile.naturalHeight !== 256 || Number(getComputedStyle(tile).opacity) < .99)) return false;
    const key = JSON.stringify({size: map.getSize(), center: map.getCenter(), zoom: map.getZoom(), tiles: tiles.map(tile => tile.src).sort()});
    if (!window.__mapTestStable || window.__mapTestStable.key !== key) window.__mapTestStable = {key, since: performance.now()};
    return performance.now() - window.__mapTestStable.since >= 350;
  }, undefined, {polling: 100});
}
async function assertMap(page, label) {
  await mapReady(page);
  const detail = await page.evaluate(() => {
    const node = document.getElementById('map'), box = node.getBoundingClientRect();
    const svg = node.querySelector('.leaflet-overlay-pane svg'), svgBox = svg.getBoundingClientRect();
    const paths = Array.from(node.querySelectorAll('.leaflet-overlay-pane path'));
    const tileRecords = Object.values(map._layers).filter(layer => layer instanceof L.TileLayer).flatMap(layer => Object.values(layer._tiles));
    const currentTiles = tileRecords.filter(tile => tile.current);
    const tiles = currentTiles.map(tile => tile.el).filter(tile => tile.isConnected && tile.complete && tile.naturalWidth === 256 &&
      tile.naturalHeight === 256 && Number(getComputedStyle(tile).opacity) >= .99);
    const visiblePaths = paths.filter(path => { const b = path.getBoundingClientRect(); return b.width > 1 && b.height > 1 && b.right > box.left && b.left < box.right && b.bottom > box.top && b.top < box.bottom; });
    const tileBoxes = tiles.map(tile => tile.getBoundingClientRect()), tileSamples = [];
    for (const x of [.03, .25, .5, .75, .97]) for (const y of [.03, .25, .5, .75, .97]) {
      const px = box.left + box.width * x, py = box.top + box.height * y;
      tileSamples.push({x, y, covered: tileBoxes.some(tile => px >= tile.left && px <= tile.right && py >= tile.top && py <= tile.bottom)});
    }
    const attributionNode = node.querySelector('.leaflet-control-attribution'), attributionBox = attributionNode.getBoundingClientRect();
    return {leafletVersion: L.version, mapSize: map.getSize(), mapRect: {width: box.width, height: box.height, left: box.left, right: box.right},
      svgSize: {width: svgBox.width, height: svgBox.height}, markerCount: paths.length, visibleMarkerCount: visiblePaths.length,
      validPathCount: paths.filter(path => path.getBBox().width > 1 && path.getBBox().height > 1 && !/NaN|Infinity/.test(path.getAttribute('d') || '')).length,
      examplePath: paths[0]?.getAttribute('d'), currentTileCount: currentTiles.length, retainedNoncurrentTileCount: tileRecords.length - currentTiles.length,
      loadedOpaqueFixtureTiles: tiles.length, tileSamples,
      attributionVisibleInsideMap: attributionBox.width > 0 && attributionBox.height > 0 && getComputedStyle(attributionNode).visibility !== 'hidden' &&
        attributionBox.left >= box.left - 1 && attributionBox.right <= box.right + 1 && attributionBox.top >= box.top - 1 && attributionBox.bottom <= box.bottom + 1,
      viewportWidth: innerWidth, documentWidth: document.documentElement.scrollWidth,
      center: map.getCenter(), zoom: map.getZoom(), bounds: map.getBounds(), tileFadeAnimated: map._fadeAnimated,
      tilePolicies: Array.from(new Set(tiles.map(tile => tile.referrerPolicy))),
      tileURLs: tiles.map(tile => tile.src).sort(),
      attribution: node.querySelector('.leaflet-control-attribution')?.textContent};
  });
  assert.equal(detail.leafletVersion, '1.9.4');
  assert.equal(detail.tileFadeAnimated, false, 'Decoded current tiles never depend on an interruptible fade');
  assert.ok(detail.visibleMarkerCount > 0, 'At least one meaningful marker is actually inside the visible map');
  // Leaflet clips offscreen paths to M0 0; require meaningful geometry for every visible marker, not every offscreen one.
  assert.ok(detail.validPathCount >= detail.visibleMarkerCount, 'Visible marker paths have nonzero SVG geometry');
  assert.ok(detail.loadedOpaqueFixtureTiles > 0, 'Opaque locally generated RGB tiles decode and are rendered');
  assert.equal(detail.loadedOpaqueFixtureTiles, detail.currentTileCount, 'Every current Leaflet tile is decoded and fully opaque');
  assert.equal(detail.tileSamples.filter(point => point.covered).length, 25, 'Loaded opaque tiles cover all 25 samples across the map, not just one corner');
  assert.equal(detail.attributionVisibleInsideMap, true, 'OSM attribution has visible dimensions entirely inside the map');
  assert.ok(detail.mapRect.left >= -1 && detail.mapRect.right <= detail.viewportWidth + 1, 'Map remains inside viewport horizontally');
  assert.ok(detail.documentWidth <= detail.viewportWidth + 1, 'No page horizontal overflow from map or controls');
  assert.match(detail.attribution, /OpenStreetMap/);
  metrics.push({case: currentCase, label, ...detail});
  return detail;
}
async function expectedMarkers(page, city, filter = '', query = '') {
  return page.evaluate(({city, filter, query}) => {
    const legacy = (window.PARK_COORDS || {})[city] || {};
    return window.getParkDataset(city).filter(park => !filter || (park.features || park.f || {})[filter] || (filter === 'restroom' && park.bathrooms))
      .filter(park => !query || (park.name || park.n || '').toLowerCase().includes(query.toLowerCase()) || (park.address || park.a || '').toLowerCase().includes(query.toLowerCase()))
      .map(park => { const own = typeof park.lat === 'number' && typeof park.lng === 'number' && Number.isFinite(park.lat) && Number.isFinite(park.lng) && Math.abs(park.lat) <= 90 && Math.abs(park.lng) <= 180;
        return {name: park.name || park.n, coordinates: own ? [park.lat, park.lng] : legacy[park.name || park.n]}; })
      .filter(park => park.coordinates).sort((a, b) => a.name.localeCompare(b.name));
  }, {city, filter, query});
}
async function assertMarkerCorrespondence(page, city, filter = '', query = '') {
  const expected = await expectedMarkers(page, city, filter, query);
  await page.waitForFunction(count => typeof parkMarkers !== 'undefined' && Object.keys(parkMarkers).length === count, expected.length);
  const actual = await page.evaluate(() => markersLayer.getLayers().flatMap(marker => {
    const content = marker.getPopup().getContent(), point = marker.getLatLng();
    const element = typeof content === 'string' ? document.createElement('div') : content;
    if (typeof content === 'string') element.innerHTML = content;
    const names = marker.parkGroup.length > 1
      ? Array.from(element.querySelectorAll('.park-chooser button[data-park-id]'), button => button.textContent)
      : [element.querySelector('b').textContent];
    return names.map(name => ({name, coordinates: [point.lat, point.lng]}));
  }).sort((a, b) => a.name.localeCompare(b.name)));
  assert.deepEqual(actual, expected, 'Real Leaflet marker coordinates/popups exactly match the city and active filter/search');
  assert.ok(expected.length, 'Nonempty public park marker fixture');
  return expected;
}
async function focusAbbott(page) {
  const card = page.locator('#grid .card[data-park-id]').filter({has: page.locator('.park-name', {hasText: /^Abbott Park$/})});
  // Stable name text rather than a copied record ID also exercises the actual public dataset.
  const target = await card.count() ? card : page.locator('#grid .card[data-park-id]').filter({hasText: 'Abbott Park'}).first();
  await target.locator('.map-pin-btn').click();
  await page.waitForFunction(() => document.querySelector('#map .leaflet-popup-content b')?.textContent === 'Abbott Park');
  await page.waitForFunction(() => map.getZoom() === 15 && !map._animatingZoom && !map._panAnim?._inProgress);
  await mapReady(page);
  assert.equal(await page.locator('#map .leaflet-popup-content b').textContent(), 'Abbott Park');
  const href = await page.locator('#map .leaflet-popup-content a').getAttribute('href');
  const guide = new URL(href, page.url());
  assert.equal(guide.searchParams.get('dataset'), 'centennial');
  assert.ok(guide.searchParams.get('id'), 'Popup mini guide identifies the public park');
  assert.equal(await page.evaluate(() => map.getZoom()), 15, 'Abbott Map action zooms to the selected park');
  assert.equal(await page.locator('#map .leaflet-popup').isVisible(), true);
}
async function filterClick(page, key) {
  const button = page.locator('.pill[data-k="' + key + '"]');
  if (!await button.isVisible()) await page.locator('#filter-toggle').click();
  await button.click();
}
async function fixLocation(page) {
  await page.locator('#btn-locate').click();
  await page.waitForFunction(() => window.__geoRequests.length > 0);
  await page.evaluate(coords => { const request = window.__geoRequests[window.__geoRequests.length - 1]; request.success({coords: {latitude: coords[0], longitude: coords[1]}}); }, sentinel);
}

(async () => {
  fs.mkdirSync(output, {recursive: true});
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); origin = 'http://127.0.0.1:' + server.address().port;
  await new Promise(resolve => wireServer.listen(0, '127.0.0.1', resolve)); wireOrigin = 'http://127.0.0.1:' + wireServer.address().port;
  try {
    const launch = {headless: true};
    if (engineName === 'chromium' && process.env.CHROMIUM_EXECUTABLE_PATH) launch.executablePath = process.env.CHROMIUM_EXECUTABLE_PATH;
    browser = await ({chromium, webkit})[engineName].launch(launch);
    for (const [label, viewport] of viewports) {
      await check(label + ': Home city browse → Centennial → Abbott Map', () => testPage(viewport, {}, async ({page}) => {
        await page.goto(origin + '/index.html'); await page.locator('#browseParksBtn').click();
        await page.waitForURL('**/parks.html?near=1'); await awaitingCity(page);
        assert.equal(await page.evaluate(() => window.__geoRequests.length), 0, 'Near Me never requests GPS automatically');
        await chooseCity(page, 'centennial'); await assertMap(page, 'confirmed-city');
        await assertMarkerCorrespondence(page, 'centennial'); await focusAbbott(page);
        await assertMap(page, 'abbott-popup'); await capture(page, label + '-near-me-abbott-popup');
      }));
      await check(label + ': direct city and Aurora/Centennial switching', () => testPage(viewport, {}, async ({page}) => {
        await gotoCity(page, 'centennial'); await assertMap(page, 'direct-centennial'); await assertMarkerCorrespondence(page, 'centennial');
        await chooseCity(page, 'aurora'); await assertMap(page, 'switched-aurora'); await assertMarkerCorrespondence(page, 'aurora');
        await chooseCity(page, 'centennial'); await assertMap(page, 'switched-back-centennial'); await assertMarkerCorrespondence(page, 'centennial');
        await focusAbbott(page); await capture(page, label + '-city-switching');
      }));
      await check(label + ': amenity/search markers and empty recovery', () => testPage(viewport, {}, async ({page}) => {
        await gotoCity(page, 'centennial'); await assertMap(page, 'all-parks');
        await filterClick(page, 'playground'); await assertMarkerCorrespondence(page, 'centennial', 'playground'); await assertMap(page, 'playgrounds');
        await page.locator('#search').fill('Abbott'); await assertMarkerCorrespondence(page, 'centennial', 'playground', 'Abbott');
        await assertMap(page, 'search-abbott'); await focusAbbott(page); await capture(page, label + '-filtered-abbott');
        await page.locator('#search').fill('No matching synthetic park');
        await page.waitForFunction(() => markersLayer.getLayers().length === 0);
        assert.equal(await page.locator('#grid .card[data-park-id]').count(), 0); assert.equal(await page.locator('#empty').isVisible(), true);
        await page.locator('#search').fill(''); await filterClick(page, 'playground');
        await assertMarkerCorrespondence(page, 'centennial'); await assertMap(page, 'empty-recovery');
      }));
      await check(label + ': history hidden state and repeated forward reveal', () => testPage(viewport, {}, async ({page}) => {
        await page.goto(origin + '/parks.html?near=1'); await awaitingCity(page);
        await page.waitForFunction(() => history.state?.awaitingCity === true);
        await chooseCity(page, 'centennial'); await assertMap(page, 'first-reveal');
        for (let repeat = 0; repeat < 3; repeat++) {
          await page.goBack(); await awaitingCity(page);
          assert.equal(await page.evaluate(() => typeof markersLayer === 'undefined' || !markersLayer ? 0 : markersLayer.getLayers().length), 0, 'Hidden history state clears markers');
          await page.goForward(); await readyCity(page, 'centennial');
          await assertMap(page, 'forward-reveal-' + repeat); await assertMarkerCorrespondence(page, 'centennial');
        }
        await focusAbbott(page); await capture(page, label + '-repeated-history-reveal');
      }));
    }
    await check('1440px: repeated Playground returns keep every current zoom tile opaque', () => testPage(viewports[2][1], {}, async ({page}) => {
      await gotoCity(page, 'centennial');
      const initial = await assertMap(page, 'repeat-all-parks');
      assert.equal(initial.zoom, 10, 'Full Centennial dataset establishes the parent zoom');
      for (let repeat = 0; repeat < 6; repeat++) {
        await filterClick(page, 'playground');
        await assertMarkerCorrespondence(page, 'centennial', 'playground');
        const filtered = await assertMap(page, 'repeat-playgrounds-' + repeat);
        assert.equal(filtered.zoom, 11, 'Playground filter returns to the retained child zoom');
        await filterClick(page, 'playground');
        await assertMarkerCorrespondence(page, 'centennial');
        const cleared = await assertMap(page, 'repeat-cleared-' + repeat);
        assert.equal(cleared.zoom, 10, 'Clearing the filter returns to the parent zoom');
      }
      await filterClick(page, 'playground'); await assertMarkerCorrespondence(page, 'centennial', 'playground');
      await assertMap(page, 'repeat-final-playgrounds'); await capture(page, '1440px-repeated-playgrounds');
      await page.locator('#search').fill('Abbott');
      await assertMarkerCorrespondence(page, 'centennial', 'playground', 'Abbott');
      await focusAbbott(page); await assertMap(page, 'repeat-final-abbott-popup');
    }));
    await check('delayed initial dataset cannot override a confirmed city', () => {
      const datasetGate = gate();
      return testPage(viewports[1][1], {datasetGate}, async ({page}) => {
        await page.goto(origin + '/parks.html?near=1', {waitUntil: 'commit'});
        await deadline(datasetGate.seen, 15000, 'Initial dataset request'); await awaitingCity(page);
        await chooseCity(page, 'centennial'); await assertMap(page, 'confirmed-before-initial-data'); await focusAbbott(page);
        datasetGate.release(); await page.waitForFunction(() => Array.isArray(window.getParkDataset('aurora')));
        await readyCity(page, 'centennial'); await assertMap(page, 'initial-data-arrived'); await assertMarkerCorrespondence(page, 'centennial');
        await capture(page, 'delayed-dataset-centennial');
      });
    });
    await check('delayed real Leaflet initializes the already-revealed city', () => {
      const leafletGate = gate();
      return testPage(viewports[1][1], {leafletGate}, async ({page}) => {
        await page.goto(origin + '/parks.html?near=1', {waitUntil: 'commit'});
        await deadline(leafletGate.seen, 15000, 'Held Leaflet request'); await awaitingCity(page);
        await chooseCity(page, 'centennial'); assert.equal(await page.evaluate(() => typeof window.L), 'undefined');
        assert.ok(await page.locator('#grid .card[data-park-id]').count(), 'Park list works before Leaflet arrives');
        leafletGate.release(); await assertMap(page, 'leaflet-arrived-after-confirmation'); await assertMarkerCorrespondence(page, 'centennial');
        await focusAbbott(page); await capture(page, 'delayed-leaflet-abbott');
      });
    });
    await check('failed initial dataset recovers through manual city confirmation', () => {
      const datasetGate = gate();
      return testPage(viewports[1][1], {datasetGate, datasetFailure: true}, async ({page, requests}) => {
        await page.goto(origin + '/parks.html?near=1', {waitUntil: 'commit'});
        await deadline(datasetGate.seen, 15000, 'Failing initial dataset request'); await awaitingCity(page);
        datasetGate.release();
        await page.waitForFunction(() => /Park data could not be loaded/i.test(document.getElementById('location-status').textContent));
        await awaitingCity(page);
        assert.equal(requests.filter(request => anyOsmTile(request.url)).length, 0, 'No fallback map tiles before a public dataset is confirmed');
        await chooseCity(page, 'centennial'); await assertMap(page, 'manual-recovery-after-data-failure');
        await assertMarkerCorrespondence(page, 'centennial'); await focusAbbott(page); await capture(page, 'failed-data-manual-recovery');
      });
    });
    await check('delayed explicit-city dataset requests no fallback map coverage', () => {
      const datasetGate = gate();
      return testPage(viewports[1][1], {datasetGate, datasetHoldPath: '/centennial-parks-data.js'}, async ({page, requests}) => {
        await page.goto(origin + '/parks.html?dataset=centennial', {waitUntil: 'commit'});
        await deadline(datasetGate.seen, 15000, 'Explicit Centennial dataset request');
        await page.waitForFunction(() => window.L && L.version === '1.9.4' && document.getElementById('search'));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        assert.equal(requests.filter(request => anyOsmTile(request.url)).length, 0, 'No arbitrary fallback-area tiles while explicit-city data is held');
        datasetGate.release(); await readyCity(page, 'centennial'); await assertMap(page, 'explicit-city-data-arrived');
        await assertMarkerCorrespondence(page, 'centennial'); await focusAbbott(page); await capture(page, 'delayed-explicit-city');
      });
    });
    await check('focused park remains visible through 1440, 320, 390 and 1440 px resizes', () => testPage(viewports[2][1], {}, async ({page}) => {
      await gotoCity(page, 'centennial'); await assertMap(page, 'before-resize'); await focusAbbott(page);
      const initial = await page.evaluate(() => ({center: map.getCenter(), zoom: map.getZoom()}));
      for (const [label, viewport] of [viewports[0], viewports[1], viewports[2]]) {
        await page.setViewportSize(viewport); await assertMap(page, 'focused-resized-' + label); await assertMarkerCorrespondence(page, 'centennial');
        const focused = await page.evaluate(() => {
          const marker = parkMarkers[allParks.find(park => parkName(park) === 'Abbott Park').id], point = map.latLngToContainerPoint(marker.getLatLng()), size = map.getSize();
          return {center: map.getCenter(), zoom: map.getZoom(), point, size, popupOpen: marker.isPopupOpen()};
        });
        assert.equal(focused.zoom, initial.zoom, 'Resizing does not zoom away from focused park');
        assert.ok(Math.abs(focused.center.lat - initial.center.lat) < .0001 && Math.abs(focused.center.lng - initial.center.lng) < .0001, 'Resize preserves geographic centre within pixel rounding');
        assert.ok(focused.point.x >= 0 && focused.point.x <= focused.size.x && focused.point.y >= 0 && focused.point.y <= focused.size.y, 'Focused Abbott marker remains in the visible map after resizing');
        assert.equal(focused.popupOpen, true, 'Focused park popup remains open through resize');
        await capture(page, 'focused-resize-' + label);
      }
    }));
    await check('retained implementation: private GPS does not change public OSM tile coverage or leak', () => testPage(viewports[1][1], {retainedGPS: true}, async ({page, requests}) => {
      await gotoCity(page, 'centennial'); const before = await assertMap(page, 'before-gps');
      const baselineRequests = new Set(requests.filter(request => canonicalTile(request.url)).map(request => request.url));
      const requestStart = requests.length;
      await fixLocation(page); await page.waitForFunction(() => document.getElementById('sort').value === 'nearest');
      const after = await assertMap(page, 'after-gps'); await assertMarkerCorrespondence(page, 'centennial');
      assert.equal(after.zoom, before.zoom);
      // invalidateSize clears Leaflet's cached lat/lng centre even without a size
      // change; getCenter can then expose the same rounded pixel-origin centre.
      // Independently project both representations, while requiring exact bounds
      // and tile coverage below. This allows subpixel rounding, not a GPS recenter.
      const project = center => {
        const scale = 256 * 2 ** before.zoom, sin = Math.sin(center.lat * Math.PI / 180);
        return {x: scale * (center.lng + 180) / 360, y: scale * (.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI))};
      };
      const beforePoint = project(before.center), afterPoint = project(after.center);
      const centerDisplacement = {xPixels: afterPoint.x - beforePoint.x, yPixels: afterPoint.y - beforePoint.y};
      centerDisplacement.distancePixels = Math.hypot(centerDisplacement.xPixels, centerDisplacement.yPixels);
      metrics.push({case: currentCase, label: 'gps-public-map-center-rounding', zoom: before.zoom, centerDisplacement, maximumPermittedPixelsPerAxis: .500001});
      assert.ok(Math.abs(centerDisplacement.xPixels) <= .500001 && Math.abs(centerDisplacement.yPixels) <= .500001, 'Private location does not move either public map axis beyond half a CSS pixel of Leaflet rounding');
      assert.deepEqual(after.bounds, before.bounds);
      assert.deepEqual(after.tileURLs, before.tileURLs, 'Displayed canonical OSM tile coverage is independent of GPS');
      const laterTiles = requests.slice(requestStart).filter(request => canonicalTile(request.url));
      assert.ok(laterTiles.every(request => baselineRequests.has(request.url)), 'GPS causes no new canonical OSM geographic tile coverage');
      await page.locator('#clear-location').click(); await assertMap(page, 'after-clear-gps');
      await capture(page, 'private-gps-public-map');
    }));
    await check('legacy coordinate entry is cleaned before maps and other resources', () => testPage(viewports[1][1], {legacyEntry: true}, async ({page, requests}) => {
      await page.goto(origin + '/parks.html?near=1&lat=' + sentinel[0] + '&lng=' + sentinel[1]);
      await awaitingCity(page); assert.equal(new URL(page.url()).search, '?near=1');
      assert.equal(await page.evaluate(() => window.__geoRequests.length), 0, 'Legacy URL is not location consent');
      await chooseCity(page, 'centennial'); await assertMap(page, 'legacy-entry-cleaned'); await assertMarkerCorrespondence(page, 'centennial');
      const outgoingTiles = requests.filter(request => canonicalTile(request.url));
      assert.ok(outgoingTiles.length > 0);
      for (const request of outgoingTiles) { assert.equal(request.headers.referer, origin + '/'); assertNoSentinel(request, 'Legacy-entry tile request'); }
      await focusAbbott(page); await capture(page, 'legacy-entry-clean-map');
    }));
    await check('origin-only canonical OSM Referer and independent native wire proof', () => testPage(viewports[1][1], {}, async ({page, context, requests}) => {
      await gotoCity(page, 'centennial'); const detail = await assertMap(page, 'referrer-source-map');
      const osmRequests = requests.filter(request => canonicalTile(request.url));
      assert.ok(osmRequests.length > 0, 'Real Leaflet emitted canonical tile requests');
      for (const request of osmRequests) assert.equal(request.headers.referer, origin + '/');
      assert.deepEqual(detail.tilePolicies, ['origin'], 'Referrer exception is per OSM image, not a page-wide relaxation');
      assert.equal(await page.locator('meta[name="referrer"]').getAttribute('content'), 'no-referrer');
      const tilePolicy = await page.locator('#map .leaflet-tile-loaded').first().evaluate(image => image.referrerPolicy);
      const probe = await context.newPage();
      await probe.goto(origin + '/__map-referrer-probe.html?test-query=must-not-leak');
      const start = wireRequests.length;
      await probe.evaluate(async ({destination, tilePolicy}) => {
        const image = (path, policy) => new Promise((resolve, reject) => {
          const node = new Image(); if (policy) node.referrerPolicy = policy;
          node.onload = resolve; node.onerror = () => reject(new Error('Local native image request failed'));
          node.src = destination + path; document.body.appendChild(node);
        });
        await Promise.all([image('/tile-policy.png', tilePolicy), image('/default-policy.png', '')]);
      }, {destination: wireOrigin, tilePolicy});
      const actualWire = wireRequests.slice(start), tile = actualWire.find(request => request.url.endsWith('/tile-policy.png')),
        other = actualWire.find(request => request.url.endsWith('/default-policy.png'));
      assert.ok(tile && other, 'Both image requests reached the second loopback server');
      assert.equal(tile.headers.referer, origin + '/', 'Actual browser wire header excludes page path and query');
      assert.equal(other.headers.referer || '', '', 'Actual default image wire header retains no-referrer');
      assertNoSentinel(actualWire, 'Actual native wire requests');
      metrics.push({case: currentCase, canonicalInterceptedRequestCount: osmRequests.length,
        canonicalInterceptedReferer: osmRequests[0].headers.referer,
        nativeWireProof: {destination: 'second loopback origin, not OSM', tileReferer: tile.headers.referer, defaultReferer: other.headers.referer || '', manuallyOverriddenHeaders: false}});
      await probe.close();
    }));
  } catch (error) { failures.push({name: currentCase, message: error.stack}); console.error(redact(error.stack)); }
  finally {
    if (browser) await browser.close();
    await Promise.all([new Promise(resolve => server.close(resolve)), new Promise(resolve => wireServer.close(resolve))]);
    const report = {engine: engineName, leaflet: '1.9.4', viewports: viewports.map(([label, size]) => size.width + 'x' + size.height),
      passed: results.length, failed: failures.length, results, failures, metrics,
      fixture: 'Locally generated opaque 256x256 RGB PNGs. Real pinned Leaflet JavaScript/CSS, map geometry, image decoding, markers and popups. No provider traffic.',
      privacy: 'Synthetic GPS stays only in test/browser memory. Requests, history, storage, analytics, links and resource names checked. A separate legacy-entry test allows only its unavoidable caller-supplied initial document URL; every later request is checked. Public park coordinates are not visitor coordinates.',
      referrerEvidence: 'Canonical HTTPS OSM request headers are observed via browser interception; GPS-invariant coverage applies to the main OSM map, not lazy Esri card-image selection; actual native HTTP wire headers are independently captured by a second loopback server using the real tile element policy and a no-referrer control. No manual Referer overrides.',
      limitations: ['Not a live OSM/Esri availability, real cartography, cache-header or provider-acceptance test.', 'Loopback native-wire proof is not a live HTTPS OSM wire capture.', 'Playwright Chromium/WebKit viewport tests do not certify physical Android Chrome/iOS Safari permission UI.', 'Back/Forward checks same-document history; actual cross-document bfcache is outside this suite.']};
    fs.writeFileSync(path.join(output, 'map-rendering-' + engineName + '-results.json'), redact(report));
    console.log('Real Leaflet map tests:', results.length, 'passed;', failures.length, 'failed');
    process.exitCode = failures.length ? 1 : 0;
  }
})();
