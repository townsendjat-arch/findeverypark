/* Discovery rules are evaluated without a browser or visitor-timezone assumptions. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const context = { window: {}, document: { readyState: 'loading', addEventListener() {} } };
vm.createContext(context);
for (const file of ['city-events.js', 'data/events/events-manifest.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const rules = context.window.FEP_EVENTS;
const data = context.window.EVENTS_DATA;
const now = new Date('2026-10-21T16:00:00Z');
const plain = value => JSON.parse(JSON.stringify(value));
const dates = value => plain(value.map(item => item.date));
const event = id => {
  const found = data.events.find(item => item.id === id);
  assert.ok(found, id);
  return found;
};
const bounds = value => ({ start: value.start, end: value.end });

// Friday through Sunday remains one Colorado calendar weekend, even across DST.
test('weekend uses Friday–Sunday, retains the current weekend, and rolls only on Mountain Monday', () => {
  for (const stamp of ['2026-10-19T06:00:00Z', '2026-10-21T16:00:00Z', '2026-10-23T06:00:00Z', '2026-10-24T23:00:00Z', '2026-10-26T05:59:59Z']) {
    assert.deepEqual(bounds(rules.weekendWindow(new Date(stamp))), { start: '2026-10-23', end: '2026-10-25' }, stamp);
  }
  assert.deepEqual(bounds(rules.weekendWindow(new Date('2026-10-26T06:00:00Z'))), { start: '2026-10-30', end: '2026-11-01' });
  assert.match(rules.weekendWindow(now).label, /Oct.*23.*Oct.*25.*2026/);
});

test('October 30–November 1 weekend survives both repeated DST hours and Sunday midnight', () => {
  for (const stamp of ['2026-10-30T06:00:00Z', '2026-11-01T07:30:00Z', '2026-11-01T08:30:00Z', '2026-11-02T06:59:59Z']) {
    assert.deepEqual(bounds(rules.weekendWindow(new Date(stamp))), { start: '2026-10-30', end: '2026-11-01' }, stamp);
  }
  assert.deepEqual(bounds(rules.weekendWindow(new Date('2026-11-02T07:00:00Z'))), { start: '2026-11-06', end: '2026-11-08' });
});

test('date views normalize safely and month bounds are inclusive calendar dates', () => {
  for (const view of ['all', 'weekend', '2026-10', '2026-11', '2026-12']) assert.equal(rules.normalizeDateView(view), view);
  for (const value of [null, undefined, '', 'garbage', '2026-13', '2026-00', '2026-10-23', '2027-01', '<script>']) assert.equal(rules.normalizeDateView(value), 'all');
  for (const [view, last] of [['2026-10', '31'], ['2026-11', '30'], ['2026-12', '31']]) {
    assert.deepEqual(bounds(rules.dateWindow(view, now)), { start: view + '-01', end: view + '-' + last });
  }
  assert.equal(rules.dateWindow('all', now), null);
  assert.deepEqual(bounds(rules.dateWindow('weekend', now)), bounds(rules.weekendWindow(now)));
});

test('selected-night series matches actual sessions, never an invented season-long span', () => {
  const zoo = event('denver-boo-at-zoo-2026');
  assert.deepEqual(dates(rules.occurrences(zoo, now)), ['2026-10-23', '2026-10-24', '2026-10-25', '2026-10-30']);
  assert.deepEqual(dates(rules.matchingOccurrences(zoo, 'weekend', now)), ['2026-10-23', '2026-10-24', '2026-10-25']);
  assert.deepEqual(dates(rules.matchingOccurrences(zoo, 'weekend', new Date('2026-10-26T16:00:00Z'))), ['2026-10-30']);
  assert.equal(rules.matchingOccurrences(zoo, '2026-11', now).length, 0);
  const unenumerated = { recurring: true, status: 'approved', series_start: '2026-10-01', series_end: '2026-12-31' };
  assert.equal(rules.occurrences(unenumerated, now).length, 0, 'season dates alone cannot establish sessions');
});

test('each recurring session expires exactly at its own known end and never reappears', () => {
  const nature = event('aurora-trick-or-treat-nature-trail-2026');
  assert.deepEqual(dates(rules.occurrences(nature, new Date('2026-10-24T20:59:59Z'))), ['2026-10-24', '2026-10-25']);
  for (const stamp of ['2026-10-24T21:00:00Z', '2026-10-25T03:00:00Z', '2026-10-25T15:59:59Z']) {
    assert.deepEqual(dates(rules.occurrences(nature, new Date(stamp))), ['2026-10-25'], stamp);
  }
  assert.equal(rules.occurrences(nature, new Date('2026-10-25T21:00:00Z')).length, 0);
  const zoo = event('denver-boo-at-zoo-2026');
  assert.deepEqual(dates(rules.occurrences(zoo, new Date('2026-10-26T03:00:00Z'))), ['2026-10-30']);
  assert.equal(rules.matchingOccurrences(zoo, 'weekend', new Date('2026-10-26T03:00:00Z')).length, 0, 'Sunday night must not borrow next Friday');
});

test('Nick’s daily sessions retain verified different Sunday hours and independent expiry', () => {
  const nicks = event('aurora-nicks-fall-fest-2026');
  const weekend = rules.matchingOccurrences(nicks, 'weekend', now);
  assert.deepEqual(dates(weekend), ['2026-10-23', '2026-10-24', '2026-10-25']);
  assert.equal(weekend[0].start, '2026-10-23T08:00:00-06:00');
  assert.equal(weekend[0].end, '2026-10-23T18:00:00-06:00');
  assert.equal(weekend[2].start, '2026-10-25T09:00:00-06:00');
  assert.equal(weekend[2].end, '2026-10-25T17:00:00-06:00');
  assert.equal(rules.matchingOccurrences(nicks, 'weekend', new Date('2026-10-25T23:00:00Z')).length, 0);
});

test('known recurring offset disambiguates DST and no session spans a gap between dates', () => {
  const fixture = {
    recurring: true, status: 'approved', dateStart: '2026-10-30', dateEnd: '2026-11-01T01:45:00-07:00',
    schedule: [
      { date: '2026-10-30', dateStart: '2026-10-30T18:00:00-06:00', dateEnd: '2026-10-30T20:00:00-06:00', time: '6–8 p.m. MDT' },
      { date: '2026-11-01', dateStart: '2026-11-01T01:00:00-07:00', dateEnd: '2026-11-01T01:45:00-07:00', time: '1–1:45 a.m. MST' }
    ]
  };
  assert.deepEqual(dates(rules.matchingOccurrences(fixture, 'weekend', new Date('2026-10-30T16:00:00Z'))), ['2026-10-30', '2026-11-01']);
  assert.deepEqual(dates(rules.matchingOccurrences(fixture, '2026-11', new Date('2026-10-30T16:00:00Z'))), ['2026-11-01']);
  assert.equal(rules.occurrences(fixture, new Date('2026-11-01T07:50:00Z')).length, 1);
  assert.equal(rules.occurrences(fixture, new Date('2026-11-01T08:45:00Z')).length, 0);
});

test('month matching uses real overlap but an exact-midnight end does not claim the next day', () => {
  const fixture = { status: 'approved', dateStart: '2026-10-31T20:00:00-06:00', dateEnd: '2026-11-01T00:00:00-06:00' };
  assert.equal(rules.matchingOccurrences(fixture, '2026-10', now).length, 1);
  assert.equal(rules.matchingOccurrences(fixture, '2026-11', now).length, 0);
  fixture.dateEnd = '2026-11-01T00:01:00-06:00';
  assert.equal(rules.matchingOccurrences(fixture, '2026-11', now).length, 1);
  fixture.dateEnd = '2026-11-01';
  assert.equal(rules.matchingOccurrences(fixture, '2026-11', now).length, 1, 'an explicit all-day end includes its calendar date');
});

test('invalid, backwards, cancelled and expired sessions cannot enter discovery', () => {
  const fixture = { recurring: true, status: 'approved', dateEnd: '2026-12-31', schedule: [
    null, 42, {}, { date: '2026-02-30' }, { date: 'bad' },
    { dateStart: '2026-10-24T25:00:00', dateEnd: '2026-10-25T10:00:00-06:00' },
    { dateStart: '2026-10-24T09:00:00-06:00', dateEnd: '2026-10-24T25:00:00' }, { dateStart: '2026-10-24T20:00:00-06:00', dateEnd: '2026-10-24T19:00:00-06:00' },
    { dateStart: '2026-10-20T09:00:00-06:00', dateEnd: '2026-10-20T10:00:00-06:00' }
  ] };
  assert.equal(rules.occurrences(fixture, now).length, 0);
  for (const schedule of [{}, 'not-a-schedule', 42]) assert.equal(rules.occurrences({ ...fixture, schedule }, now).length, 0);
  for (const status of ['cancelled', 'pending', 'needs_review', 'archived']) {
    assert.equal(rules.matchingOccurrences({ ...fixture, status, schedule: [{ date: '2026-10-24' }] }, 'weekend', now).length, 0, status);
  }
});

test('unknown end remains date-only rather than inventing a time or losing the date', () => {
  const hoofin = event('centennial-hoofin-hollows-5k-2026');
  assert.equal(rules.matchingOccurrences(hoofin, 'weekend', now)[0].end, '2026-10-24');
  assert.equal(rules.occurrences(hoofin, new Date('2026-10-25T05:59:59Z')).length, 1);
  assert.equal(rules.occurrences(hoofin, new Date('2026-10-25T06:00:00Z')).length, 0);
  assert.equal(hoofin.calendarDisabled, true);
});

test('synthetic sold-out status never implies availability or preview eligibility', () => {
  const sold = { status:'approved', dateStart:'2026-10-24T13:00:00-06:00', dateEnd:'2026-10-24T17:00:00-06:00', availabilityStatus:'sold_out', costLabel:'SOLD OUT — synthetic fixture', calendarDisabled:true };
  assert.equal(sold.availabilityStatus, 'sold_out');
  assert.equal(rules.isSoldOut(sold), true);
  assert.equal(rules.isSoldOut({ costLabel: 'SOLD OUT — free timed tickets' }), true);
  assert.equal(rules.isSoldOut({ availabilityLabel: 'Attendee tickets sold-out.' }), true);
  assert.equal(rules.isSoldOut(event('denver-boo-at-zoo-2026')), false, 'a sell-out warning is not sold-out evidence');
  assert.equal(rules.isCurrent(sold, now), true);
  assert.equal(rules.matchingOccurrences(sold, 'weekend', now).length, 1);
  assert.equal(sold.registrationUrl, undefined);
  assert.equal(sold.calendarDisabled, true);
});

test('preview event URLs point at the exact internal card and keep city/date context', () => {
  for (const item of data.events.filter(item => item.verifiedAt === '2026-10-21')) {
    for (const view of ['all', 'weekend', '2026-10', '2026-11', '2026-12']) {
      const url = new URL(rules.eventUrl(item, view), 'https://findeverypark.test/');
      assert.equal(url.origin, 'https://findeverypark.test');
      assert.equal(url.pathname, '/events.html');
      assert.equal(rules.normCity(url.searchParams.get('city')), rules.normCity(item.city));
      assert.equal(rules.normalizeDateView(url.searchParams.get('date')), view);
      assert.equal(decodeURIComponent(url.hash), '#event-' + item.id);
    }
  }
  const alias = new URL(rules.eventUrl({ city: 'Highlands Ranch', id: 'a-safe-id' }, 'weekend'), 'https://findeverypark.test/');
  assert.equal(alias.searchParams.get('city'), 'highlands-ranch');
});

test('only two verified park-host relationships are promoted; Goodson stays nearby and held Parker venues stay absent', () => {
  const hosts = [];
  for (const item of data.events.filter(item => item.verifiedAt === '2026-10-21')) {
    for (const park of item.nearbyParks || []) if (park.relationship === 'host') hosts.push([item.id, park.id]);
  }
  assert.deepEqual(hosts.sort(), [
    ['aurora-trick-or-treat-nature-trail-2026', 'co-aurora-star-k-ranch'],
    ['centennial-hoofin-hollows-5k-2026', 'co-centennial-dekoevend-park']
  ]);
  assert.ok(event('centennial-goodson-trick-or-treat-2026').nearbyParks.every(park => park.relationship !== 'host'));
  for (const id of ['parker-trunk-or-treat-mainstreet-2026-10-24', 'parker-all-treats-no-tricks-2026-10-30']) {
    assert.equal(data.events.some(item => item.id === id), false, 'held private venues must not be restored as park-host events: ' + id);
  }
});

test('park routing has exactly the eighteen supported existing datasets, including aliases', () => {
  const registry = { window: {} };
  vm.createContext(registry);
  vm.runInContext(fs.readFileSync(path.join(root, 'park-data-registry.js'), 'utf8'), registry);
  const supported = Object.keys(registry.window.PARK_SITE.datasetsMeta);
  assert.equal(supported.length, 18);
  for (const city of supported) {
    assert.equal(rules.parkDataset(city), city);
    assert.equal(rules.parkDataset(city.replace(/-/g, '_')), city);
    assert.equal(rules.parkDataset(city.replace(/-/g, ' ').toUpperCase()), city);
    assert.ok(fs.existsSync(path.join(root, city + '-parks-data.js')), city);
  }
  for (const city of ['castle_pines', 'wheat_ridge', 'not-a-city', '', null, '../aurora']) assert.equal(rules.parkDataset(city), '', String(city));
});

test('new discovery runtime scripts compile without requiring a browser', () => {
  for (const file of ['events.html', 'index.html', 'park.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)) {
      if (!match[0].includes('application/ld+json')) new vm.Script(match[1], { filename: file });
    }
  }
});
