'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { ROOT, OUTPUT, SOURCE_URL, TEXT_FIELDS, loadSources, expirationInstant,
  startInstant, buildFeed, serialize, safeHref } = require('../scripts/generate-community-feed');
const { data, rules } = loadSources();
const { feed, omitted } = buildFeed(data, rules);
const fixture = changes => ({ id: 'test-event', city: 'aurora', title: 'Fixture',
  status: 'approved', dateStart: '2026-11-14T09:00:00-07:00',
  dateEnd: '2026-11-14T11:00:00-07:00', ...changes });
const build = events => buildFeed({ ...data, events }, rules);

test('committed JSON is exactly the deterministic manifest-derived contract', () => {
  assert.equal(fs.readFileSync(path.join(ROOT, OUTPUT), 'utf8'), serialize(feed));
  assert.equal(serialize(buildFeed(data, rules).feed), serialize(feed));
  assert.deepEqual(Object.keys(feed), ['schemaVersion', 'timeZone', 'contentUpdatedAt', 'sourceUrl', 'events']);
  assert.equal(feed.schemaVersion, 1);
  assert.equal(feed.timeZone, 'America/Denver');
  assert.equal(feed.sourceUrl, SOURCE_URL);
  assert.equal(feed.contentUpdatedAt, data.contentUpdatedAt);
  assert.equal(feed.events.length, 28);
  assert.equal(new Set(feed.events.map(event => event.id)).size, feed.events.length);
  const fields = ['id', 'city', 'cityLabel', ...TEXT_FIELDS, 'dateStart', 'dateEnd', 'href', 'sortAt', 'expiresAt'].sort();
  for (const event of feed.events) {
    assert.deepEqual(Object.keys(event).sort(), fields);
    assert.match(event.sortAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.match(event.expiresAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.ok(Date.parse(event.sortAt) < Date.parse(event.expiresAt));
  }
});

test('all approved supported records and all ten current approved occurrences are included', () => {
  const supported = data.events.filter(event => event.status === 'approved' && !event.recurring && !event.community_event);
  assert.deepEqual(feed.events.map(event => event.id).sort(), Array.from(supported, event => event.id).sort());
  const expected = data.events.filter(event => event.verifiedAt === '2026-11-04').map(event => event.id).sort();
  const current = feed.events.filter(event => Date.parse('2026-11-05T06:00:00Z') < Date.parse(event.expiresAt));
  assert.equal(expected.length, 10);
  assert.deepEqual(current.map(event => event.id).sort(), Array.from(expected));
  assert.equal(feed.events.filter(event => Date.parse(event.expiresAt) < Date.parse('2026-11-05T06:00:00Z')).length, 18);
});

test('event text, verification dates and all visible qualifications are copied without clipping', () => {
  for (const exported of feed.events) {
    const source = data.events.find(event => event.id === exported.id);
    for (const field of TEXT_FIELDS) assert.equal(exported[field], source[field] || '', `${exported.id}: ${field}`);
    assert.equal(exported.cityLabel, data.cities[source.city].label);
    assert.equal(exported.href, source.href);
    assert.equal(exported.dateStart, source.dateStart);
    assert.equal(exported.dateEnd, source.dateEnd);
  }
  const plains = feed.events.find(event => event.id === 'aurora-plains-free-day-2026-11-14');
  assert.match(plains.registrationLabel, /required.*Eventbrite.*no closing hour/i);
  assert.match(plains.availabilityLabel, /Capacity can change/);
  const fourMile = feed.events.find(event => event.id === 'denver-four-mile-free-day-2026-11-20');
  assert.match(fourMile.description, /last entry 3:30 p\.m\./);
  assert.match(fourMile.costLabel, /special events and programs excluded/);
  const text = '<b>Unconfirmed & qualified</b> ' + 'Full material warning. '.repeat(50);
  const record = build([fixture({ description: text, registrationLabel: text, availabilityLabel: text })]).feed.events[0];
  for (const field of ['description', 'registrationLabel', 'availabilityLabel']) assert.equal(record[field], text);
});

test('single cutoff v1 explicitly fails closed for recurring/pumpkin data and self-hosted events', () => {
  const historicalSeries = Array.from(data.events.filter(event => event.status === 'approved' && event.recurring), event => event.id).sort();
  assert.equal(historicalSeries.length, 9);
  assert.deepEqual(omitted.filter(event => event.reason === 'unsupported-series').map(event => event.id).sort(), historicalSeries);
  assert.equal(omitted.filter(event => event.reason === 'self-hosted-community').length, 2);
  assert.ok(omitted.some(event => event.id === 'community-mighty-dads-coffee-parks'));
  for (const changes of [{ recurring: true }, { schedule: [] }, { series_start: '2026-11-14' },
    { series_end: '2026-11-14' }, { category: 'pumpkin-patches' },
    { category: 'pumpkin-patches', pumpkin: { operatingStatus: 'conflicting' } },
    { community_event: true }]) assert.equal(build([fixture(changes)]).feed.events.length, 0);
});

test('unapproved, invalid, reversed or unsupported candidates never enter the feed', () => {
  for (const status of [undefined, '', 'pending', 'needs_review', 'cancelled', 'archived']) {
    assert.equal(build([fixture({ status })]).feed.events.length, 0, String(status));
  }
  for (const changes of [{ id: '' }, { city: '' }, { title: '' }, { timezone: 'Asia/Tokyo' },
    { dateEnd: 'bad' }, { dateEnd: '2026-02-30' }, { dateEnd: '2026-11-14T25:00:00' },
    { dateStart: '' }, { dateStart: 'not-a-date' }, { dateStart: '2026-02-30' },
    { dateStart: '2026-11-14T11:00:00-07:00' }, { dateEnd: '2026-11-13' },
    { dateEnd: '2026-03-08T02:30:00' }]) assert.equal(build([fixture(changes)]).feed.events.length, 0, JSON.stringify(changes));
  const neverRecommend = { ...rules, isRecommendable() { return false; } };
  assert.equal(buildFeed({ ...data, events: [fixture()] }, neverRecommend).feed.events.length, 0);
  assert.throws(() => build([fixture(), fixture()]), /Duplicate event ID/);
});

test('expiry conversion exactly follows Mountain midnight, DST, explicit and legacy timestamps', () => {
  const cases = [
    ['2026-10-24', '2026-10-25T06:00:00.000Z'],
    ['2026-11-01', '2026-11-02T07:00:00.000Z'],
    ['2026-10-31', '2026-11-01T06:00:00.000Z'],
    ['2026-03-08', '2026-03-09T06:00:00.000Z'],
    ['2026-03-07', '2026-03-08T07:00:00.000Z'],
    ['2028-02-29', '2028-03-01T07:00:00.000Z'],
    ['2026-10-24T13:00:00-06:00', '2026-10-24T19:00:00.000Z'],
    ['2026-10-24T13:00', '2026-10-24T19:00:00.000Z'],
    ['2026-11-01T01:45:00-06:00', '2026-11-01T07:45:00.000Z'],
    ['2026-11-01T01:45:00-07:00', '2026-11-01T08:45:00.000Z'],
    ['2026-11-01T01:45:00', '2026-11-01T08:45:00.000Z'],
    ['2026-11-14T18:00:00.123Z', '2026-11-14T18:00:00.123Z']
  ];
  for (const [dateEnd, expected] of cases) {
    const event = { dateEnd };
    const cutoff = expirationInstant(event, rules);
    assert.equal(new Date(cutoff).toISOString(), expected, dateEnd);
    for (const offset of [-2 * 86400000, -1, 0, 1, 2 * 86400000]) {
      assert.equal(cutoff + offset < cutoff, !rules.isExpired(event, new Date(cutoff + offset)), dateEnd + ' ' + offset);
    }
  }
  for (const dateEnd of ['', 'bad', '2026-02-30', '2026-03-08T02:30:00', '2026-11-01T25:00:00']) {
    assert.equal(expirationInstant({ dateEnd }, rules), null, dateEnd);
  }
  assert.equal(expirationInstant({}, rules), null);
});

test('exact end precedence and unknown-time date fallback are canonical, not invented hours', () => {
  const exact = { dateEnd: '2026-10-25T15:00:00-06:00', series_end: '2026-10-25' };
  assert.equal(new Date(expirationInstant(exact, rules)).toISOString(), '2026-10-25T21:00:00.000Z');
  const noEnd = fixture({ dateEnd: undefined });
  const exported = build([noEnd]).feed.events[0];
  assert.equal(exported.dateEnd, '2026-11-14');
  assert.equal(exported.expiresAt, '2026-11-15T07:00:00.000Z');
  assert.equal(new Date(startInstant('2026-11-01', rules)).toISOString(), '2026-11-01T06:00:00.000Z');
  assert.equal(new Date(startInstant('2026-11-02', rules)).toISOString(), '2026-11-02T07:00:00.000Z');
});

test('canonical eligibility matches now < expiresAt for every exported record at its boundaries', () => {
  for (const event of feed.events) {
    const source = data.events.find(item => item.id === event.id);
    const end = Date.parse(event.expiresAt);
    for (const instant of [Date.parse(event.sortAt), end - 86400000, end - 1, end, end + 1, end + 86400000]) {
      assert.equal(instant < end, rules.isRecommendable(source, new Date(instant)), event.id + ': ' + instant);
    }
  }
});

test('past and distant future candidates remain present regardless of generation date', () => {
  const events = [fixture({ id: 'future', dateStart: '2126-11-14', dateEnd: '2126-11-15' }),
    fixture({ id: 'past', dateStart: '2020-01-01', dateEnd: '2020-01-01' })];
  assert.deepEqual(build(events).feed.events.map(event => event.id), ['past', 'future']);
  assert.equal(buildFeed({ ...data, contentUpdatedAt: undefined }, rules).feed.contentUpdatedAt, null);
  assert.equal(buildFeed({ ...data, contentUpdatedAt: '2026-02-30' }, rules).feed.contentUpdatedAt, null);
});

test('missing labels remain honestly empty and unsafe hrefs use a reliable source link', () => {
  const event = build([fixture({ href: 'javascript:alert(1)' })]).feed.events[0];
  assert.equal(event.description, '');
  assert.equal(event.verifiedAt, '');
  assert.equal(event.registrationLabel, '');
  assert.equal(event.href, SOURCE_URL);
  for (const url of [undefined, '', 'javascript:alert(1)', 'data:text/html,evil', 'http://example.com', 'https://user:pass@example.com']) {
    assert.equal(safeHref(url), SOURCE_URL);
  }
  assert.equal(safeHref('https://example.com/event?x=1&y=2'), 'https://example.com/event?x=1&y=2');
});

test('--check catches missing or stale output and never rewrites it', () => {
  execFileSync(process.execPath, ['scripts/generate-community-feed.js', '--check'], { cwd: ROOT });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'community-feed-'));
  try {
    for (const file of ['scripts/generate-community-feed.js', 'city-events.js', 'data/events/events-manifest.js', OUTPUT]) {
      fs.mkdirSync(path.dirname(path.join(tmp, file)), { recursive: true });
      fs.copyFileSync(path.join(ROOT, file), path.join(tmp, file));
    }
    const target = path.join(tmp, OUTPUT);
    fs.writeFileSync(target, '{"stale":true}\n');
    const stale = spawnSync(process.execPath, ['scripts/generate-community-feed.js', '--check'], { cwd: tmp, encoding: 'utf8' });
    assert.equal(stale.status, 1);
    assert.match(stale.stderr, /missing or stale/);
    assert.equal(fs.readFileSync(target, 'utf8'), '{"stale":true}\n');
    fs.unlinkSync(target);
    assert.equal(spawnSync(process.execPath, ['scripts/generate-community-feed.js', '--check'], { cwd: tmp }).status, 1);
    assert.equal(fs.existsSync(target), false);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test('serialized JSON is byte-identical across visitor/build time zones', () => {
  const script = "const g=require('./scripts/generate-community-feed');const {data,rules}=g.loadSources();process.stdout.write(g.serialize(g.buildFeed(data,rules).feed));";
  for (const TZ of ['UTC', 'America/Denver', 'America/Los_Angeles', 'Asia/Tokyo']) {
    assert.equal(execFileSync(process.execPath, ['-e', script], { cwd: ROOT, env: { ...process.env, TZ }, encoding: 'utf8' }), serialize(feed), TZ);
  }
});
