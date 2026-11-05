#!/usr/bin/env node
'use strict';

// Build-time adapter only. Consumers fetch the generated JSON, never these
// scripts. The manifest owns content; FEP_EVENTS owns Mountain-time expiry.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = 'data/events/community-feed.v1.json';
const SOURCE_URL = 'https://findeverypark.com/events.html';
const DAY = 86400000;
// Match the consuming v1 contract. Fail loudly rather than silently truncate a
// valid source collection or publish a body the consumer must reject wholesale.
const MAX_EVENTS = 1000;
// The consumer caps JavaScript string length at 1,000,000 characters. A UTF-8
// byte ceiling of the same value is conservative for non-ASCII qualifications.
const MAX_FEED_BYTES = 1000000;
const REQUIRED_TEXT_FIELDS = ['description', 'dateLabel', 'timeLabel', 'locationLabel', 'costLabel'];
const TEXT_FIELDS = ['title', 'description', 'dateLabel', 'timeLabel',
  'locationLabel', 'costLabel', 'costType', 'audienceLabel',
  'registrationLabel', 'availabilityLabel', 'verifiedAt'];

function loadSources(root = ROOT) {
  // Suppress page mounting; no DOM, network or third-party scripts are run.
  const context = { window: {}, document: { readyState: 'loading', addEventListener() {} } };
  vm.createContext(context);
  for (const file of ['city-events.js', 'data/events/events-manifest.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {
      filename: file, timeout: 5000
    });
  }
  return { data: context.window.EVENTS_DATA, rules: context.window.FEP_EVENTS };
}

function expirationInstant(event, rules) {
  const end = rules.endValue(event);
  if (typeof end !== 'string' || !rules.validDate(end)) return null;
  // This UTC value is only a search anchor, NOT a timezone conversion. Ask the
  // actual shared predicate for the transition instead of copying its DST,
  // exact-end precedence, date-only, or legacy repeated-hour implementation.
  const anchor = Date.parse(end.length === 10 ? end + 'T00:00:00Z' :
    /(?:Z|[+-]\d{2}:\d{2})$/.test(end) ? end : end + 'Z');
  if (!Number.isFinite(anchor)) return null;
  let before = anchor - 2 * DAY;
  let after = anchor + 2 * DAY;
  if (rules.isExpired(event, new Date(before)) || !rules.isExpired(event, new Date(after))) return null;
  while (after - before > 1) {
    const middle = Math.floor((before + after) / 2);
    if (rules.isExpired(event, new Date(middle))) after = middle;
    else before = middle;
  }
  return after;
}

function startInstant(value, rules) {
  if (typeof value !== 'string' || !rules.validDate(value)) return null;
  if (value.length !== 10) return expirationInstant({ dateEnd: value }, rules);
  // A date-only start sorts at Mountain midnight, not UTC midnight. The
  // previous Mountain calendar day expires at exactly that start boundary.
  const previousDay = new Date(Date.parse(value + 'T00:00:00Z') - DAY).toISOString().slice(0, 10);
  return expirationInstant({ dateEnd: previousDay }, rules);
}

function safeHref(value) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password) return value;
  } catch (_) { /* Missing/unsafe links fall back to the source listing. */ }
  // Ordinary FEP cards do not expose stable HTML IDs. Do not invent anchors.
  return SOURCE_URL;
}

function omissionReason(event, rules) {
  if (!event || event.community_event) return 'self-hosted-community';
  // Legacy statusless records are intentionally not syndicated as approved.
  if (event.status !== 'approved') return 'not-approved';
  // V1 cannot express per-session availability/admission cutoffs or all the
  // pumpkin decision fields. Never flatten these into a misleading season.
  if (rules.isPumpkin(event) || event.pumpkin || event.category === 'pumpkin-patches' ||
      event.recurring || event.series_start || event.series_end || event.schedule) return 'unsupported-series';
  if (event.timezone && event.timezone !== rules.timeZone) return 'unsupported-timezone';
  if (typeof event.id !== 'string' || !event.id.trim() ||
      typeof event.city !== 'string' || !event.city.trim() ||
      typeof event.title !== 'string' || !event.title.trim()) return 'missing-identity';
  return null;
}

function invalidSource(event, reason) {
  throw new Error('Invalid approved event ' + JSON.stringify(event && event.id || '(missing ID)') + ': ' + reason +
    '. Correct the source manifest before generating or validating the feed.');
}

function validateSourceText(event) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}$/.test(event.id)) invalidSource(event, 'invalid v1 ID');
  for (const field of REQUIRED_TEXT_FIELDS) {
    if (typeof event[field] !== 'string' || !event[field].trim()) invalidSource(event, field + ' is required');
  }
  for (const field of TEXT_FIELDS) {
    if (event[field] != null && typeof event[field] !== 'string') invalidSource(event, field + ' must be plain text');
  }
  if (event.costType && !['free', 'paid', 'unknown'].includes(event.costType)) invalidSource(event, 'invalid costType');
  if (event.verifiedAt && (!/^\d{4}-\d{2}-\d{2}$/.test(event.verifiedAt) ||
      !Number.isFinite(Date.parse(event.verifiedAt + 'T00:00:00Z')) ||
      new Date(event.verifiedAt + 'T00:00:00Z').toISOString().slice(0, 10) !== event.verifiedAt)) {
    invalidSource(event, 'invalid verifiedAt');
  }
}

function buildFeed(data, rules) {
  if (!data || !Array.isArray(data.events) || rules.timeZone !== 'America/Denver') {
    throw new Error('Unsupported manifest or canonical timezone');
  }
  const contentUpdatedAt = typeof data.contentUpdatedAt === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(data.contentUpdatedAt) && rules.validDate(data.contentUpdatedAt)
    ? data.contentUpdatedAt : null;
  const events = [];
  const omitted = [];
  const seen = new Set();
  for (const event of data.events) {
    let reason = omissionReason(event, rules);
    // Deliberate ineligibility is an omission. A malformed approved single
    // occurrence is an editorial error, not a reason to publish an incomplete
    // replacement feed. Neither generation nor --check may silently drop it.
    if (['missing-identity', 'unsupported-timezone'].includes(reason)) invalidSource(event, reason);
    if (!reason) validateSourceText(event);
    if (!reason && seen.has(event.id)) throw new Error('Duplicate event ID: ' + event.id);
    if (!reason) seen.add(event.id);
    const dateStart = event && (event.dateStart || event.startDate);
    const expires = reason ? null : expirationInstant(event, rules);
    const starts = reason ? null : startInstant(dateStart, rules);
    if (!reason && (expires === null || starts === null || starts >= expires)) invalidSource(event, 'invalid-dates');
    // Check recommendability just before this record's own end, never against
    // the build clock. Future and historical approved candidates stay in JSON.
    if (!reason && !rules.isRecommendable(event, new Date(expires - 1))) reason = 'not-recommendable';
    if (reason) {
      omitted.push({ id: event && event.id || null, reason });
      continue;
    }
    const record = {
      id: event.id,
      city: event.city,
      cityLabel: typeof data.cities?.[event.city]?.label === 'string' ? data.cities[event.city].label : event.city
    };
    if (!record.cityLabel.trim()) invalidSource(event, 'cityLabel is required');
    for (const field of TEXT_FIELDS) record[field] = typeof event[field] === 'string' ? event[field] : '';
    record.dateStart = dateStart;
    record.dateEnd = rules.endValue(event);
    record.href = safeHref(event.href || event.link);
    record.sortAt = new Date(starts).toISOString();
    record.expiresAt = new Date(expires).toISOString();
    events.push(record);
    if (events.length > MAX_EVENTS) throw new Error('Community feed exceeds the v1 limit of ' + MAX_EVENTS +
      ' records. Review the source or consumer contract; the feed was not truncated.');
  }
  // ASCII tie-break avoids locale differences in build environments.
  events.sort((a, b) => a.sortAt < b.sortAt ? -1 : a.sortAt > b.sortAt ? 1 :
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  return { feed: { schemaVersion: 1, timeZone: rules.timeZone, contentUpdatedAt,
    sourceUrl: SOURCE_URL, events }, omitted };
}

function serialize(feed) {
  const result = JSON.stringify(feed, null, 2) + '\n';
  if (Buffer.byteLength(result, 'utf8') > MAX_FEED_BYTES) {
    throw new Error('Community feed exceeds the v1 limit of ' + MAX_FEED_BYTES +
      ' UTF-8 bytes. Review the source or consumer contract; the feed was not truncated.');
  }
  return result;
}

function main(args = process.argv.slice(2)) {
  if (args.some(arg => arg !== '--check')) throw new Error('Usage: node scripts/generate-community-feed.js [--check]');
  const { data, rules } = loadSources();
  const { feed, omitted } = buildFeed(data, rules);
  const expected = serialize(feed);
  const target = path.join(ROOT, OUTPUT);
  if (args.includes('--check')) {
    const fix = ' Run npm run events:feed and commit the generated JSON.';
    if (!fs.existsSync(target)) throw new Error(OUTPUT + ' is missing.' + fix);
    const actual = fs.readFileSync(target, 'utf8');
    try { JSON.parse(actual); }
    catch (_) { throw new Error(OUTPUT + ' contains malformed JSON.' + fix); }
    // Exact comparison also rejects structurally valid but wrong envelopes,
    // changed qualifications, omitted/extra records and noncanonical expiry.
    // This check is read-only: CI must not silently repair the artifact it tests.
    if (actual !== expected) {
      throw new Error(OUTPUT + ' is stale or inconsistent with its source.' + fix);
    }
    console.log('Community feed is deterministic and up to date.');
  } else {
    fs.writeFileSync(target, expected);
    console.log('Wrote ' + OUTPUT);
  }
  const counts = omitted.reduce((result, item) => {
    result[item.reason] = (result[item.reason] || 0) + 1;
    return result;
  }, {});
  console.log(JSON.stringify({ exported: feed.events.length, omitted: counts }));
}

if (require.main === module) {
  try { main(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { ROOT, OUTPUT, SOURCE_URL, TEXT_FIELDS, REQUIRED_TEXT_FIELDS, MAX_EVENTS, MAX_FEED_BYTES, loadSources,
  expirationInstant, startInstant, safeHref, buildFeed, serialize };
