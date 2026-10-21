const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const context = { window: {}, document: { readyState: 'loading', addEventListener() {} } };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'city-events.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'data/events/events-manifest.js'), 'utf8'), context);
const rules = context.window.FEP_EVENTS;
const data = context.window.EVENTS_DATA;
const at = value => new Date(value);

test('expiry uses Colorado date, not UTC or the visitor timezone', () => {
  const event = { dateEnd: '2026-10-21' };
  assert.equal(rules.isCurrent(event, at('2026-10-22T05:59:59Z')), true);
  assert.equal(rules.isCurrent(event, at('2026-10-22T06:00:00Z')), false);
});
test('known end times expire exactly at their end, including legacy local timestamps', () => {
  for (const dateEnd of ['2026-10-24T13:00:00-06:00', '2026-10-24T13:00:00']) {
    assert.equal(rules.isCurrent({ dateEnd }, at('2026-10-24T18:59:59Z')), true);
    assert.equal(rules.isCurrent({ dateEnd }, at('2026-10-24T19:00:00Z')), false);
  }
});
test('November 1 daylight-saving fallback preserves both repeated hours', () => {
  assert.equal(rules.localStamp(at('2026-11-01T07:30:00Z')), '2026-11-01T01:30:00');
  assert.equal(rules.localStamp(at('2026-11-01T08:30:00Z')), '2026-11-01T01:30:00');
  const event = { dateEnd: '2026-11-01T01:45:00-07:00' };
  assert.equal(rules.isCurrent(event, at('2026-11-01T07:50:00Z')), true);
  assert.equal(rules.isCurrent(event, at('2026-11-01T08:45:00Z')), false);
  assert.equal(rules.isCurrent({ dateEnd: '2026-11-01' }, at('2026-11-02T06:59:59Z')), true);
  assert.equal(rules.isCurrent({ dateEnd: '2026-11-01' }, at('2026-11-02T07:00:00Z')), false);
});
test('legacy repeated-hour expiry chooses the later occurrence without reappearing', () => {
  const event = { dateEnd: '2026-11-01T01:45:00' };
  for (const instant of ['2026-11-01T07:44:59Z','2026-11-01T07:45:00Z','2026-11-01T08:00:00Z','2026-11-01T08:44:59Z']) assert.equal(rules.isCurrent(event, at(instant)), true);
  assert.equal(rules.isCurrent(event, at('2026-11-01T08:45:00Z')), false);
  assert.equal(rules.isCurrent(event, at('2026-11-01T09:00:00Z')), false);
  assert.equal(rules.isCurrent({ dateEnd: '2026-03-08T02:30:00' }, at('2026-03-08T08:00:00Z')), false);
});
test('future, ongoing and multi-day events stay current until their final end', () => {
  const now = at('2026-10-21T16:00:00Z');
  assert.equal(rules.isCurrent({ dateStart: '2026-10-31', dateEnd: '2026-11-01' }, now), true);
  assert.equal(rules.isCurrent({ series_start: '2026-09-26', series_end: '2026-10-31' }, now), true);
  assert.equal(rules.isCurrent({ series_end: '2026-10-25', dateEnd: '2026-10-25T15:00:00-06:00' }, at('2026-10-25T21:00:00Z')), false);
});
test('unknown end uses the known date, while invalid, pending and cancelled data fail closed', () => {
  assert.equal(rules.isCurrent({ dateStart: '2026-10-21T17:00:00-06:00' }, at('2026-10-22T05:00:00Z')), true);
  for (const event of [{}, { dateEnd: 'bad' }, { dateEnd: '2026-02-30' }, { dateEnd: '2026-10-21T25:00:00' }, { dateEnd: '2030-01-01', status: 'pending' }, { dateEnd: '2030-01-01', status: 'cancelled' }, { dateEnd: '2030-01-01', status: 'needs_review' }, { dateEnd: '2030-01-01', status: 'archived' }]) {
    assert.equal(rules.isCurrent(event, at('2026-10-21T16:00:00Z')), false, JSON.stringify(event));
  }
});
test('city normalization supports URL hyphens, spaces, case and legacy underscore keys', () => {
  for (const value of [' Highlands-Ranch ', 'highlands_ranch', 'Highlands Ranch']) assert.equal(rules.normCity(value), 'highlands_ranch');
});
test('all event IDs are unique and newly verified records have required provenance and valid park links', () => {
  const ids = data.events.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length);
  const datasets = {};
  for (const city of ['aurora','centennial','parker','denver']) {
    const ctx = { window: {} }; vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(path.join(root, city + '-parks-data.js'), 'utf8'), ctx);
    datasets[city] = ctx.window.PARKS;
  }
  const verified = data.events.filter(e => e.verifiedAt === '2026-10-21');
  assert.ok(verified.length >= 10, 'expected at least ten source-checked events');
  for (const event of verified) {
    for (const key of ['id','city','title','section','dateStart','dateEnd','dateLabel','timeLabel','locationLabel','costLabel','costType','audienceLabel','href','sourceType','verifiedAt','status']) assert.ok(event[key], `${event.id}: ${key}`);
    assert.equal(event.status, 'approved');
    assert.ok(data.cities[event.city], event.city);
    assert.ok(event.sourceUrls.length);
    assert.ok(event.sourceUrls.every(url => new URL(url).protocol === 'https:'));
    assert.ok(rules.validDate(event.dateStart)); assert.ok(rules.validDate(event.dateEnd));
    assert.ok(['featured','holiday','onetime','ongoing','community'].includes(event.section));
    assert.ok(['free','paid','unknown'].includes(event.costType));
    if (event.schedule?.length) assert.equal(event.recurring, true);
    for (const park of event.nearbyParks || []) assert.ok(datasets[park.city || event.city].some(p => p.id === park.id), `${event.id}: ${park.id}`);
  }
});
test('inline production JavaScript compiles', () => {
  for (const file of ['events.html', 'index.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const match of html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)) {
      // JSON-LD is data, not JavaScript.
      if (!match[0].includes('application/ld+json')) new vm.Script(match[1], { filename: file });
    }
  }
});
