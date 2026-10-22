'use strict';
// Deterministic source-level diagnosis only. No browser, network, or production requests.
// Loads the unmodified installed Leaflet distribution into a VM; the fake DOM provides
// nodes/event delivery and the fake clock controls scheduling, never tile lifecycle logic.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {test, after} = require('node:test');
const root = process.env.FEP_REPO_ROOT || path.resolve(__dirname, '..');
const output = process.env.LEAFLET_FADE_TRACE_DIR || path.join(root, 'test-results');
const leafletPath = require.resolve('leaflet/dist/leaflet-src.js', {paths: [root]});
const source = fs.readFileSync(leafletPath, 'utf8');

function environment() {
  let now = 1000, sequence = 0;
  const frames = new Map(), timers = new Map();
  class FakeDate extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
  class Element {
    constructor(tag) {
      this.tagName = tag.toUpperCase(); this.style = {opacity: '', transform: '', transition: '', position: 'relative'};
      this.children = []; this.parentNode = null; this.className = ''; this.listeners = {};
      this.complete = false; this.naturalWidth = this.naturalHeight = 0; this.attributes = {};
    }
    appendChild(child) {
      if (child.tagName === '#FRAGMENT') { for (const node of [...child.children]) this.appendChild(node); return child; }
      if (child.parentNode) child.parentNode.removeChild(child);
      this.children.push(child); child.parentNode = this; return child;
    }
    removeChild(child) { this.children.splice(this.children.indexOf(child), 1); child.parentNode = null; return child; }
    addEventListener(type, callback) { (this.listeners[type] ||= []).push(callback); }
    removeEventListener(type, callback) { this.listeners[type] = (this.listeners[type] || []).filter(fn => fn !== callback); }
    setAttribute(name, value) { this.attributes[name] = String(value); if (name === 'src') this.src = String(value); }
    getAttribute(name) { return name === 'src' ? this.src : this.attributes[name]; }
    dispatch(type) { for (const callback of this.listeners[type] || []) callback.call(this, {type, target: this}); }
  }
  const document = {
    documentElement: new Element('html'),
    createElement: tag => new Element(tag),
    createDocumentFragment: () => new Element('#fragment'),
    addEventListener() {}, removeEventListener() {}
  };
  const window = {
    document, navigator: {userAgent: 'Mozilla/5.0 AppleWebKit/605.1.15 Safari/605.1.15', platform: 'MacIntel'},
    screen: {deviceXDPI: 1, logicalXDPI: 1}, devicePixelRatio: 1,
    addEventListener() {}, removeEventListener() {},
    WebKitCSSMatrix: class { constructor() { this.m11 = 1; } },
    requestAnimationFrame(callback) { frames.set(++sequence, callback); return sequence; },
    cancelAnimationFrame(id) { frames.delete(id); },
    setTimeout(callback, delay = 0) { timers.set(++sequence, {callback, at: now + delay}); return sequence; },
    clearTimeout(id) { timers.delete(id); }
  };
  const context = {window, document, navigator: window.navigator, Date: FakeDate,
    setTimeout: window.setTimeout, clearTimeout: window.clearTimeout, console, exports: {}, module: {}};
  vm.runInNewContext(source, context, {filename: leafletPath});
  return {
    L: context.exports, Element, frames, timers,
    get now() { return now; }, set now(value) { now = value; },
    frame(at) {
      now = at;
      const pending = [...frames.entries()]; frames.clear();
      for (const [, callback] of pending) callback(now);
    },
    dueTimers(at) {
      now = at;
      for (const [id, timer] of [...timers]) if (timer.at <= now) { timers.delete(id); timer.callback(); }
    }
  };
}
function run(fadeAnimated) {
  const env = environment(), {L, Element} = env, trace = [];
  assert.equal(L.version, '1.9.4');
  const layer = L.tileLayer('fixture://tiles/{z}/{x}/{y}.png', {maxZoom: 19, referrerPolicy: 'origin'});
  const map = {options: {crs: L.CRS.Simple, fadeAnimation: fadeAnimated}, zoom: 11,
    _container: new Element('div'), _initPanes() {},
    getZoom() { return this.zoom; }, getCenter() { return L.latLng(0, 0); },
    getPixelOrigin() { return L.point(0, 0); }, getPixelWorldBounds() { return null; },
    project(latlng, zoom) { return L.CRS.Simple.latLngToPoint(L.latLng(latlng), zoom); },
    unproject(point, zoom = this.zoom) { return L.CRS.Simple.pointToLatLng(L.point(point), zoom); },
    getZoomScale(to, from) { return 2 ** (to - from); }, _getNewPixelOrigin() { return L.point(0, 0); }};
  // Execute Leaflet's own mapping from the documented map option to its internal state.
  L.Map.prototype._initLayout.call(map);
  assert.equal(map._fadeAnimated, fadeAnimated);
  layer._map = map; layer._container = new Element('div'); layer._tiles = {}; layer._levels = {};
  let range;
  // Only map geometry is synthetic; all tile creation, ready, abort, update, fade,
  // retention, pruning, classes, opacity, and event code below is actual Leaflet.
  layer._getTiledPixelBounds = () => L.bounds(range.min.multiplyBy(256), range.max.add([1, 1]).multiplyBy(256));
  function view(zoom) {
    map.zoom = zoom;
    range = zoom === 11 ? L.bounds([426, 777], [428, 779]) : L.bounds([212, 388], [214, 389]);
    layer._setView(map.getCenter(), zoom);
  }
  function finishCurrentTiles() {
    for (const tile of Object.values(layer._tiles).filter(t => t.current && !t.loaded)) {
      tile.el.complete = true; tile.el.naturalWidth = tile.el.naturalHeight = 256; tile.el.dispatch('load');
    }
  }
  function summarize(stage) {
    const tiles = Object.values(layer._tiles);
    const record = {stage, time: env.now, zoom: map.zoom, pendingFrames: env.frames.size, pendingTimers: env.timers.size,
      current: tiles.filter(t => t.current).map(t => ({key: layer._tileCoordsToKey(t.coords), loaded: t.loaded,
        active: !!t.active, opacity: t.el.style.opacity === '' ? 1 : +t.el.style.opacity,
        complete: t.el.complete, naturalWidth: t.el.naturalWidth, naturalHeight: t.el.naturalHeight, connected: !!t.el.parentNode})),
      retainedOtherZoom: tiles.filter(t => !t.current).map(t => ({key: layer._tileCoordsToKey(t.coords),
        loaded: t.loaded, active: !!t.active, opacity: t.el.style.opacity === '' ? 1 : +t.el.style.opacity,
        complete: t.el.complete, naturalWidth: t.el.naturalWidth, naturalHeight: t.el.naturalHeight, connected: !!t.el.parentNode}))};
    trace.push(record); return record;
  }
  view(11); env.now = 1027; finishCurrentTiles(); summarize('initial z11 images decode, before first fade frame');
  env.now = 1030; view(10); summarize('fit all parks at z10 before z11 fade frame');
  env.now = 1094; finishCurrentTiles();
  // A valid delayed-frame schedule: prune timers are serviced before the next
  // paint. The timers retain decoded z11 children because z10 is not active yet.
  env.dueTimers(1400); summarize('prune timers run while image fades have not painted');
  env.frame(1416); summarize('first delayed frame activates all z10 tiles; no next fade frame');
  // Leave more than the test's 350ms stable-observation window before filtering.
  env.dueTimers(2000); summarize('all-parks view stays settled for over 350ms');
  view(11); summarize('Playground returns to z11, reusing decoded retained tiles when present');
  finishCurrentTiles(); // Deliver any new images needed when non-fading pruning discarded old z11 tiles.
  env.dueTimers(18000); env.frame(18016);
  const final = summarize('after more than the 15-second readiness timeout');
  const failed = final.current.some(t => !t.active || t.opacity < 0.99);
  assert.equal(failed, fadeAnimated);
  assert.equal(final.current.length, 9);
  if (fadeAnimated) {
    assert.equal(final.pendingFrames, 0);
    assert.equal(final.pendingTimers, 0);
    assert.equal(final.retainedOtherZoom.length, 4);
    assert.ok(final.current.every(t => t.loaded && !t.active && t.opacity === 0));
    assert.ok(final.retainedOtherZoom.every(t => t.active && t.opacity === 1));
  }
  return {fadeAnimated, failed, trace};
}
// This is mechanism coverage, not browser rendering. The ordinary browser suite
// independently verifies geometry, visibility, interactions, and network/privacy rules.
const report = {
  sourceVersion: '1.9.4', sourceSha256: crypto.createHash('sha256').update(source).digest('hex'),
  method: 'Unmodified Leaflet executed in a Node VM with minimal DOM and controlled scheduling. No network.',
  limitation: 'Proves the delayed-paint lifecycle mechanism, not the failed WebKit run event order or production frequency.',
  cases: []
};
after(() => {
  fs.mkdirSync(output, {recursive: true});
  fs.writeFileSync(path.join(output, 'leaflet-fade-mechanism-trace.json'), JSON.stringify(report, null, 2) + '\n');
});
test('Leaflet default fading can strand retained decoded tiles after a delayed paint and zoom return', () => {
  const result = run(true); report.cases.push(result);
  const [decoded, zoomedOut, timersRun, painted, settled, reused, final] = result.trace;
  assert.equal(decoded.current.length, 9);
  assert.ok(decoded.current.every(tile => tile.loaded && !tile.active && tile.opacity === 0));
  assert.equal(decoded.pendingFrames, 1);
  assert.equal(zoomedOut.current.length, 6);
  assert.equal(zoomedOut.retainedOtherZoom.length, 9);
  assert.equal(timersRun.pendingTimers, 0);
  assert.equal(timersRun.pendingFrames, 1);
  assert.ok(timersRun.current.every(tile => !tile.active));
  assert.ok(painted.current.every(tile => tile.active && tile.opacity === 1));
  assert.equal(painted.retainedOtherZoom.length, 9);
  assert.equal(painted.pendingFrames, 0);
  assert.equal(settled.time - painted.time > 350, true);
  assert.equal(settled.pendingTimers, 0);
  assert.equal(settled.pendingFrames, 0);
  assert.equal(reused.current.length, 9);
  assert.equal(reused.retainedOtherZoom.length, 4);
  assert.equal(final.time - reused.time > 15000, true);
  assert.deepEqual(final.current, reused.current, 'No timer or frame remains to reactivate the decoded current tiles');
  assert.ok(final.current.every(tile => tile.connected && tile.complete && tile.naturalWidth === 256 && tile.naturalHeight === 256));
  assert.equal(final.pendingFrames, 0);
  assert.equal(final.pendingTimers, 0);
});
test('Leaflet documented fadeAnimation false keeps decoded current tiles active under the same schedule', () => {
  const result = run(false); report.cases.push(result);
  const final = result.trace.at(-1);
  assert.equal(result.failed, false);
  assert.equal(final.current.length, 9);
  assert.ok(final.current.every(tile => tile.loaded && tile.active && tile.opacity === 1 && tile.connected &&
    tile.complete && tile.naturalWidth === 256 && tile.naturalHeight === 256));
  assert.equal(final.retainedOtherZoom.length, 0);
  assert.equal(final.pendingFrames, 0);
  assert.equal(final.pendingTimers, 0);
});
test('Primary park-map initializer selects the documented non-fading path', () => {
  const html = fs.readFileSync(path.join(root, 'parks.html'), 'utf8');
  const match = html.match(/function initMap\(\) \{[\s\S]*?\n\}/);
  assert.ok(match, 'Find the actual primary map initializer');
  let receivedOptions;
  const fakeMap = {setView() { return this; }};
  const context = {
    COORDS: {example: [39.6, -104.8]},
    L: {
      map(id, options) { assert.equal(id, 'map'); receivedOptions = options; return fakeMap; },
      tileLayer() { return {addTo() { return this; }}; },
      layerGroup() { return {addTo() { return this; }}; }
    }
  };
  vm.runInNewContext(match[0] + '\ninitMap();', context);
  assert.equal(receivedOptions?.fadeAnimation, false,
    'Use the supported Leaflet map option in production, not a test-only opacity workaround');
});
