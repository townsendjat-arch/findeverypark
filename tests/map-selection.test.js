'use strict';
// Exact-ID selection/grouping unit regressions. No browser or network.
// Production functions are extracted verbatim; Leaflet/DOM side effects are
// recorded here, then independently exercised with real Leaflet in the browser suite.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const html = read('parks.html');
function productionFunction(name) {
  const found = html.match(new RegExp('function ' + name + '\\([^]*?\\n\\}'));
  assert.ok(found, 'Find production function ' + name);
  return found[0];
}
function datasets() {
  const window = {dispatchEvent() {}};
  const context = vm.createContext({window, CustomEvent: class {constructor(type, options) {this.type = type; this.detail = options.detail;}}});
  for (const file of ['site-config.js', 'park-data-registry.js', ...fs.readdirSync(root).filter(file => file.endsWith('-parks-data.js')).sort()]) {
    vm.runInContext(read(file), context, {filename: file});
  }
  return plain(window.PARK_DATASETS);
}
const cities = datasets();
function harness(parks, city = 'aurora', legacy = {}) {
  const layers = [], operations = [];
  const context = vm.createContext({
    FEPNearMe: require('../near-me.js'), URLSearchParams,
    COORDS: legacy, DATASET_KEY: city, allParks: parks, visibleParks: parks, currentFiltered: parks,
    visited: new Set(), mapMode: 'all', window: {_activeSet: new Set()},
    parkMarkers: Object.create(null), popupOpener: null,
    activeFilters: {}, FILTERS_KEY: 'fixture', writeStored() {},
    map: {closePopup() {operations.push(['close']);}, setView(coords, zoom) {operations.push(['view', plain(coords), zoom]);}},
    document: {querySelector(selector) {assert.equal(selector, '.map-section'); return {scrollIntoView() {operations.push(['scroll']);}};}},
    ensureMap() {return true;}, focusPopup(marker) {operations.push(['focus', marker.selectedId]);},
    parkPopupContent(park) {return {id: park.id};},
    createParkMarker(group, matches) {
      const marker = {parkGroup: group, matches: [...matches], selectedId: null,
        getLatLng() {const coords = context.parkCoords(group[0]); return {lat: coords[0], lng: coords[1]};},
        setPopupContent(content) {this.selectedId = content.id; return this;},
        openPopup() {operations.push(['open', this.selectedId]); return this;}};
      layers.push(marker);
      for (const park of group) context.parkMarkers[park.id] = marker;
      return marker;
    },
    markersLayer: {clearLayers() {layers.length = 0;}, getLayers() {return layers.slice();},
      removeLayer(marker) {const index = layers.indexOf(marker); if (index >= 0) layers.splice(index, 1);}}
  });
  vm.runInContext(['parkName', 'parkCoords', 'parkGuideUrl', 'getVisibleMarkerParks', 'renderMarkers', 'focusMapOnPark']
    .map(productionFunction).join('\n'), context);
  return {context, layers, operations};
}
function coordinateKey(park) {return JSON.stringify([park.lat, park.lng]);}
function isMapped(park) {return Number.isFinite(park.lat) && Number.isFinite(park.lng);}

for (const [city, parks] of Object.entries(cities)) {
  test(city + ': every normalized ID maps to its exact marker group and mini-guide', () => {
    const before = JSON.stringify(parks);
    assert.ok(parks.length > 0);
    assert.ok(parks.every(park => typeof park.id === 'string' && park.id.length));
    assert.equal(new Set(parks.map(park => park.id)).size, parks.length, 'Every city record has a unique ID');
    const {context, layers, operations} = harness(parks, city);
    context.renderMarkers(parks);
    const mapped = parks.filter(isMapped);
    const expectedGroups = new Map();
    for (const park of mapped) {
      const key = coordinateKey(park);
      if (!expectedGroups.has(key)) expectedGroups.set(key, []);
      expectedGroups.get(key).push(park.id);
    }
    assert.equal(layers.length, expectedGroups.size, 'Only identical coordinate pairs share a marker');
    assert.deepEqual(Object.keys(context.parkMarkers).sort(), mapped.map(park => park.id).sort());
    for (const park of mapped) {
      const marker = context.parkMarkers[park.id];
      assert.deepEqual(plain(marker.parkGroup.map(item => item.id)).sort(), expectedGroups.get(coordinateKey(park)).sort());
      const opener = {fixture: park.id};
      operations.length = 0;
      context.focusMapOnPark(park.id, opener);
      assert.equal(marker.selectedId, park.id, 'Popup selection uses ID, not coordinate tolerance or display name');
      assert.equal(context.popupOpener, opener);
      assert.deepEqual(operations.filter(item => item[0] === 'open'), [['open', park.id]], 'Exactly the requested popup opens');
      assert.deepEqual(operations.find(item => item[0] === 'view'), ['view', [park.lat, park.lng], 15]);
      const guide = new URL(context.parkGuideUrl(park), 'https://example.test/');
      assert.equal(guide.pathname, '/park.html');
      assert.equal(guide.searchParams.get('dataset'), city);
      assert.equal(guide.searchParams.get('id'), park.id);
    }
    assert.equal(JSON.stringify(parks), before, 'Rendering/selection does not mutate park source objects');
  });
}

test('all 18 existing city datasets are covered, including the actual shared-coordinate regressions', () => {
  assert.equal(Object.keys(cities).length, 18);
  const pair = cities.aurora.filter(park => ['co-aurora-cottonwood-grove', 'co-aurora-cottonwood-park'].includes(park.id));
  assert.equal(pair.length, 2);
  assert.deepEqual(pair.map(park => [park.lat, park.lng]), [[39.7540906, -104.8254529], [39.7540906, -104.8254529]]);
  assert.equal(pair[0].features.trails, true);
  assert.equal(pair[1].features.playground, true);
});

test('same names and nearby coordinates remain distinct while exact coordinates share one marker', () => {
  const parks = [
    {id: 'first', name: 'Same name', lat: 39.7, lng: -104.8},
    {id: 'second', name: 'Same name', lat: 39.7001, lng: -104.8001},
    {id: 'shared', name: 'Shared location', lat: 39.7, lng: -104.8},
    {id: '__proto__', name: 'Prototype-looking ID', lat: 39.6, lng: -104.9}
  ];
  const {context, layers, operations} = harness(parks);
  context.renderMarkers(parks);
  assert.equal(layers.length, 3);
  assert.equal(context.parkMarkers.first, context.parkMarkers.shared);
  assert.notEqual(context.parkMarkers.first, context.parkMarkers.second);
  assert.ok(Object.hasOwn(context.parkMarkers, '__proto__'));
  for (const park of parks) {
    operations.length = 0; context.focusMapOnPark(park.id);
    assert.deepEqual(operations.filter(item => item[0] === 'open'), [['open', park.id]]);
  }
  operations.length = 0; context.focusMapOnPark('Same name');
  assert.deepEqual(operations, [], 'A display name cannot accidentally select a different ID');
});

test('filtered and visited-only marker groups contain only their visible members', () => {
  const parks = cities.aurora.filter(park => ['co-aurora-cottonwood-grove', 'co-aurora-cottonwood-park'].includes(park.id));
  const {context, layers} = harness(parks);
  context.window._activeSet.add('playground');
  const filtered = parks.filter(park => park.features.playground);
  context.renderMarkers(filtered);
  assert.equal(layers.length, 1);
  assert.deepEqual(Object.keys(context.parkMarkers), [filtered[0].id]);
  assert.deepEqual(plain(layers[0].parkGroup.map(park => park.id)), [filtered[0].id]);
  context.mapMode = 'visited'; context.visited.add(parks[0].name);
  context.renderMarkers(parks);
  assert.equal(layers.length, 1);
  assert.deepEqual(plain(layers[0].parkGroup.map(park => park.id)), [parks[0].id]);
});

test('card selection outside a visited-only map selects its exact ID without changing filters', () => {
  const parks = cities.aurora.filter(park => ['co-aurora-cottonwood-grove', 'co-aurora-cottonwood-park'].includes(park.id));
  const {context, layers, operations} = harness(parks);
  context.mapMode = 'visited'; context.visited.add(parks[0].name); context.renderMarkers(parks);
  operations.length = 0; context.focusMapOnPark(parks[1].id);
  assert.deepEqual(operations.filter(item => item[0] === 'open'), [['open', parks[1].id]]);
  assert.equal(context.mapMode, 'visited');
  assert.equal(context.parkMarkers[parks[1].id].selectedId, parks[1].id);
  assert.equal(layers.length, 1, 'Transient selection merges only with the existing exact-coordinate peer');
  assert.equal(context.parkMarkers[parks[0].id], context.parkMarkers[parks[1].id]);
  assert.deepEqual(plain(layers[0].parkGroup.map(park => park.id)).sort(), parks.map(park => park.id).sort());
  context.renderMarkers(parks);
  assert.equal(layers.length, 1);
  assert.deepEqual(Object.keys(context.parkMarkers), [parks[0].id], 'Next render removes the transient selection, preserving visited-only scope');
});

test('unmapped and nonexistent park IDs do not open a guessed nearby marker', () => {
  const parks = [{id: 'mapped', name: 'Mapped', lat: 39.7, lng: -104.8}, {id: 'unmapped', name: 'Unmapped', lat: null, lng: null}];
  const {context, operations} = harness(parks);
  context.renderMarkers(parks);
  assert.deepEqual(Object.keys(context.parkMarkers), ['mapped']);
  context.focusMapOnPark('unmapped'); context.focusMapOnPark('missing');
  assert.deepEqual(operations, []);
});

test('validated numeric strings and signed zero group exactly; out-of-range or blank coordinates are excluded', () => {
  const parks = [
    {id: 'zero-number', name: 'Zero number', lat: 0, lng: -0},
    {id: 'zero-string', name: 'Zero string', lat: '0', lng: '0'},
    {id: 'numeric-string', name: 'Numeric string', lat: '39.7', lng: '-104.8'},
    {id: 'numeric-number', name: 'Numeric number', lat: 39.7, lng: -104.8},
    {id: 'invalid-lat', name: 'Invalid latitude', lat: 90.001, lng: 0},
    {id: 'invalid-lng', name: 'Invalid longitude', lat: 0, lng: -180.001},
    {id: 'blank', name: 'Blank', lat: '', lng: ''},
    {id: 'missing', name: 'Missing', lat: null, lng: null}
  ];
  const {context, layers} = harness(parks);
  context.renderMarkers(parks);
  assert.equal(layers.length, 2);
  assert.deepEqual(Object.keys(context.parkMarkers).sort(), ['numeric-number', 'numeric-string', 'zero-number', 'zero-string']);
  assert.equal(context.parkMarkers['zero-number'], context.parkMarkers['zero-string']);
  assert.equal(context.parkMarkers['numeric-number'], context.parkMarkers['numeric-string']);
  assert.notEqual(context.parkMarkers['zero-number'], context.parkMarkers['numeric-number']);
});
