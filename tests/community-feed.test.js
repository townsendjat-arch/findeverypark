'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ROOT, OUTPUT, SOURCE_URL, TEXT_FIELDS, REQUIRED_TEXT_FIELDS, MAX_EVENTS, MAX_FEED_BYTES, loadSources, expirationInstant,
  startInstant, buildFeed, serialize, safeHref } = require('../scripts/generate-community-feed');
const { data, rules } = loadSources();
const { feed, omitted } = buildFeed(data, rules);
const fixture = changes => ({ id: 'test-event', city: 'aurora', title: 'Fixture',
  description: 'Synthetic event fixture.', dateLabel: 'November 14, 2026',
  timeLabel: '9–11 a.m. MST', locationLabel: 'Test venue', costLabel: 'Fee unverified',
  status: 'approved', dateStart: '2026-11-14T09:00:00-07:00',
  dateEnd: '2026-11-14T11:00:00-07:00', ...changes });
const build = events => buildFeed({ ...data, events }, rules);

// Derive eligibility from the current source and canonical predicates, not the
// size/date/IDs of any historical editorial batch. Explicit fixture cases below
// cover exclusions even when the live manifest happens not to contain them.
const isSeries = event => rules.isPumpkin(event) || event.pumpkin ||
  event.category === 'pumpkin-patches' || event.recurring ||
  event.series_start || event.series_end || event.schedule;
function eligibleSource(event) {
  if (!event || event.status !== 'approved' || event.community_event || isSeries(event) ||
      (event.timezone && event.timezone !== rules.timeZone)) return false;
  if (['id', 'city', 'title'].some(field => typeof event[field] !== 'string' || !event[field].trim())) return false;
  const starts = startInstant(event.dateStart || event.startDate, rules);
  const expires = expirationInstant(event, rules);
  return starts !== null && expires !== null && starts < expires &&
    rules.isRecommendable(event, new Date(expires - 1));
}

test('committed JSON is exactly the deterministic manifest-derived contract', () => {
  assert.equal(fs.readFileSync(path.join(ROOT, OUTPUT), 'utf8'), serialize(feed));
  assert.equal(serialize(buildFeed(data, rules).feed), serialize(feed));
  assert.deepEqual(Object.keys(feed), ['schemaVersion', 'timeZone', 'contentUpdatedAt', 'sourceUrl', 'events']);
  assert.equal(feed.schemaVersion, 1);
  assert.equal(feed.timeZone, 'America/Denver');
  assert.equal(feed.sourceUrl, SOURCE_URL);
  assert.equal(feed.contentUpdatedAt, typeof data.contentUpdatedAt === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(data.contentUpdatedAt) && rules.validDate(data.contentUpdatedAt) ? data.contentUpdatedAt : null);
  assert.equal(new Set(feed.events.map(event => event.id)).size, feed.events.length);
  assert.ok(feed.events.length <= MAX_EVENTS);
  assert.ok(Buffer.byteLength(serialize(feed), 'utf8') <= MAX_FEED_BYTES);
  const fields = ['id', 'city', 'cityLabel', ...TEXT_FIELDS, 'dateStart', 'dateEnd', 'href', 'sortAt', 'expiresAt'].sort();
  for (const event of feed.events) {
    assert.deepEqual(Object.keys(event).sort(), fields);
    assert.match(event.sortAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.match(event.expiresAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    assert.ok(Date.parse(event.sortAt) < Date.parse(event.expiresAt));
    assert.match(event.id, /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/);
    for (const field of ['id', 'city', 'cityLabel', 'title', ...REQUIRED_TEXT_FIELDS]) assert.ok(event[field].trim(), field);
  }
  const sorted = [...feed.events].sort((a, b) => a.sortAt < b.sortAt ? -1 : a.sortAt > b.sortAt ? 1 :
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  assert.deepEqual(feed.events, sorted);
});

test('every eligible source record is included exactly once, regardless of editorial batch or current date', () => {
  const supported = data.events.filter(eligibleSource);
  assert.deepEqual(feed.events.map(event => event.id).sort(), Array.from(supported, event => event.id).sort());
  assert.equal(feed.events.length + omitted.length, data.events.length);
  for (const event of data.events.filter(event => !eligibleSource(event))) {
    assert.ok(!feed.events.some(exported => exported.id === event?.id), event?.id);
  }
});

test('event text, verification dates and all visible qualifications are copied without clipping', () => {
  for (const exported of feed.events) {
    const source = data.events.find(event => event.id === exported.id);
    for (const field of TEXT_FIELDS) assert.equal(exported[field], typeof source[field] === 'string' ? source[field] : '', `${exported.id}: ${field}`);
    assert.equal(exported.cityLabel, typeof data.cities?.[source.city]?.label === 'string' ? data.cities[source.city].label : source.city);
    assert.equal(exported.href, safeHref(source.href || source.link));
    assert.equal(exported.dateStart, source.dateStart || source.startDate);
    assert.equal(exported.dateEnd, rules.endValue(source));
  }
  const text = '<b>Unconfirmed & qualified</b> ' + 'Full material warning. '.repeat(50);
  const record = build([fixture({ description: text, registrationLabel: text, availabilityLabel: text })]).feed.events[0];
  for (const field of ['description', 'registrationLabel', 'availabilityLabel']) assert.equal(record[field], text);
});

test('single cutoff v1 explicitly fails closed for recurring/pumpkin data and self-hosted events', () => {
  const series = Array.from(data.events.filter(event => event && event.status === 'approved' && !event.community_event && isSeries(event)), event => event.id).sort();
  assert.deepEqual(omitted.filter(event => event.reason === 'unsupported-series').map(event => event.id).sort(), series);
  assert.equal(omitted.filter(event => event.reason === 'self-hosted-community').length,
    data.events.filter(event => !event || event.community_event).length);
  for (const changes of [{ recurring: true }, { schedule: [] }, { series_start: '2026-11-14' },
    { series_end: '2026-11-14' }, { category: 'pumpkin-patches' },
    { category: 'pumpkin-patches', pumpkin: { operatingStatus: 'conflicting' } },
    { community_event: true }]) assert.equal(build([fixture(changes)]).feed.events.length, 0);
});

test('unapproved candidates are omitted; malformed approved single occurrences fail the build', () => {
  for (const status of [undefined, '', 'pending', 'needs_review', 'cancelled', 'archived']) {
    assert.equal(build([fixture({ status })]).feed.events.length, 0, String(status));
  }
  for (const changes of [{ id: '' }, { city: '' }, { title: '' }, { timezone: 'Asia/Tokyo' },
    { dateEnd: 'bad' }, { dateEnd: '2026-02-30' }, { dateEnd: '2026-11-14T25:00:00' },
    { dateStart: '' }, { dateStart: 'not-a-date' }, { dateStart: '2026-02-30' },
    { dateStart: '2026-11-14T11:00:00-07:00' }, { dateEnd: '2026-11-13' },
    { dateEnd: '2026-03-08T02:30:00' }, { description: ['not plain text'] },
    { costType: 'invented-price-type' }, { verifiedAt: '2026-02-30' },
    { id: '_invalid-start' }, { id: 'x'.repeat(121) }, { id: 'bad id' },
    ...REQUIRED_TEXT_FIELDS.flatMap(field => [{ [field]: undefined }, { [field]: '' }, { [field]: '   ' }])]) {
    assert.throws(() => build([fixture(changes)]), /Invalid approved event/, JSON.stringify(changes));
  }
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

test('truly optional labels remain honestly empty and unsafe hrefs use a reliable source link', () => {
  const event = build([fixture({ href: 'javascript:alert(1)' })]).feed.events[0];
  assert.equal(event.description, 'Synthetic event fixture.');
  assert.equal(event.verifiedAt, '');
  assert.equal(event.registrationLabel, '');
  assert.equal(event.href, SOURCE_URL);
  for (const url of [undefined, '', 'javascript:alert(1)', 'data:text/html,evil', 'http://example.com', 'https://user:pass@example.com']) {
    assert.equal(safeHref(url), SOURCE_URL);
  }
  assert.equal(safeHref('https://example.com/event?x=1&y=2'), 'https://example.com/event?x=1&y=2');
});

test('v1 record limit permits the boundary but never truncates excess candidates', () => {
  const source = Array.from({ length: MAX_EVENTS }, (_, index) => fixture({ id: 'boundary-' + index }));
  const result = build(source).feed;
  assert.equal(result.events.length, MAX_EVENTS);
  assert.doesNotThrow(() => serialize(result));
  assert.throws(() => build([...source, fixture({ id: 'one-too-many' })]), /exceeds the v1 limit of 1000 records/);
  assert.equal(source.length, MAX_EVENTS);
});

test('v1 body limit counts UTF-8 bytes and never truncates material qualifications', () => {
  const result = build([fixture()]).feed;
  const baselineBytes = Buffer.byteLength(serialize(result), 'utf8');
  result.events[0].description += 'x'.repeat(MAX_FEED_BYTES - baselineBytes);
  assert.equal(Buffer.byteLength(serialize(result), 'utf8'), MAX_FEED_BYTES);
  const boundary = result.events[0].description;
  for (const extra of ['x', 'é']) {
    result.events[0].description = boundary + extra;
    assert.throws(() => serialize(result), /exceeds the v1 limit of 1000000 UTF-8 bytes/);
    assert.equal(result.events[0].description, boundary + extra);
  }
});

test('serialized JSON is byte-identical across visitor/build time zones', () => {
  const script = "const g=require('./scripts/generate-community-feed');const {data,rules}=g.loadSources();process.stdout.write(g.serialize(g.buildFeed(data,rules).feed));";
  for (const TZ of ['UTC', 'America/Denver', 'America/Los_Angeles', 'Asia/Tokyo']) {
    assert.equal(execFileSync(process.execPath, ['-e', script], { cwd: ROOT, env: { ...process.env, TZ }, encoding: 'utf8' }), serialize(feed), TZ);
  }
});
