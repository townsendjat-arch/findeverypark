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
const { execFileSync } = require('node:child_process');
const mainBaselineRef = '3a12e7b6bffad111c3a44a5ac25f7bf0c4aa73be';
try { execFileSync('git', ['cat-file','-e',mainBaselineRef + '^{commit}'], {cwd:root,stdio:'pipe'}); }
catch (_) { execFileSync('git', ['fetch','--no-tags','--depth=1','origin',mainBaselineRef], {cwd:root,stdio:'pipe'}); }
const baselineContext = {window:{}};
vm.runInNewContext(execFileSync('git', ['show',mainBaselineRef + ':data/events/events-manifest.js'], {cwd:root,encoding:'utf8'}), baselineContext);
const originalEvents = JSON.parse(JSON.stringify(baselineContext.window.EVENTS_DATA.events));
const originalIds = new Set(originalEvents.map(event => event.id));
const priorityAudit = JSON.parse(fs.readFileSync(path.join(root,'docs/priority-one-source-review-2026-10-21.json'),'utf8'));
const priorityIds = priorityAudit.events.map(event => event.id);
const hasNapa = priorityIds.includes('centennial-napa-trunk-treat-2026');
const novemberAudit = JSON.parse(fs.readFileSync(path.join(root,'docs/november-source-review-2026-10-22.json'),'utf8'));
const novemberIds = new Set(novemberAudit.events.map(event => event.id));
const preNovemberEvents = data.events.filter(event => !novemberIds.has(event.id));
// Required-reservation freshness could not be confirmed after the source returned 429.
const heldPriorityIds = ['parker-kiddie-academy-trunk-treat-2026'];



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

test('prior released 11 IDs and five added pumpkin records remain intact', () => {
  const verified = data.events.filter(e => originalIds.has(e.id) && e.verifiedAt === '2026-10-21');
  const audit = JSON.parse(fs.readFileSync(path.join(root, 'docs/events-source-review-2026-10-21.json')));
  assert.equal(verified.length, 16);
  assert.equal(audit.events.length, 11, 'the released source audit remains immutable');
  for (const original of audit.events) {
    const current = verified.find(event => event.id === original.id);
    assert.ok(current, original.id);
    if (original.id !== 'aurora-nicks-fall-fest-2026') assert.deepEqual(JSON.parse(JSON.stringify(current)), original);
    else {
      for (const field of ['id', 'city', 'title', 'href', 'dateStart', 'dateEnd', 'costLabel', 'verifiedAt']) assert.equal(current[field], original[field], field);
      assert.deepEqual(JSON.parse(JSON.stringify(current.nearbyParks)), original.nearbyParks);
    }
  }
  assert.deepEqual(verified.reduce((counts, event) => { counts[event.city] = (counts[event.city] || 0) + 1; return counts; }, {}),
    { aurora:5, denver:3, centennial:3, erie:1, thornton:1, platteville:1, kiowa:1, louisville:1 });
});
test('removed sold-out and held RSVP events survive only in source history', () => {
  const audit = JSON.parse(fs.readFileSync(path.join(root, 'docs/events-source-review-2026-10-21.json')));
  for (const [id, reason] of [
    ['parker-trunk-or-treat-mainstreet-2026-10-24', /Owner requested removal/],
    ['parker-all-treats-no-tricks-2026-10-30', /Owner requested hold until a functioning family RSVP route/]
  ]) {
    assert.equal(data.events.some(e => e.id === id), false);
    assert.equal(audit.events.some(e => e.id === id), false);
    const held = audit.heldBackEvents.find(item => item.event.id === id);
    assert.ok(held);
    assert.match(held.reason, reason);
    assert.ok(held.event.sourceUrls.length > 0);
  }
  assert.equal(audit.heldBackEvents.length, 2);
});
test('Goodson and historical RSVP warnings survive existing 118-character preview truncation', () => {
  const preview = e => e.description.length > 118 ? e.description.slice(0,115).replace(/\s+\S*$/, '') + '…' : e.description;
  const goodson = data.events.find(e => e.id === 'centennial-goodson-trick-or-treat-2026');
  assert.equal(goodson.costType, 'unknown');
  assert.match(preview(goodson), /Fee and booking rules unverified/);
  assert.match(preview(goodson), /Adult 18\+ must accompany children/);
  const audit = JSON.parse(fs.readFileSync(path.join(root, 'docs/events-source-review-2026-10-21.json')));
  const violet = audit.heldBackEvents.find(item => item.event.id === 'parker-all-treats-no-tricks-2026-10-30').event;
  assert.match(preview(violet), /Family RSVP required; signup link unavailable/);
  assert.match(preview(violet), /Do not assume walk-in entry/);
  assert.equal(violet.registrationUrl, undefined);
});
test('Hoofin preserves verified price bands, qualified cutoff and unknown-end expiry', () => {
  const event = data.events.find(e => e.id === 'centennial-hoofin-hollows-5k-2026');
  assert.match(event.costLabel, /Adult total \$22\.45; ages 4–14 total \$17\.15/);
  assert.match(event.costLabel, /under-4 price unknown/);
  assert.match(event.registrationLabel, /conflict on the cutoff/);
  assert.doesNotMatch(event.availabilityLabel, /Published registration deadline/);
  assert.equal(event.availabilityNote, undefined);
  assert.equal(event.dateEnd, '2026-10-24'); assert.equal(event.calendarDisabled, true);
  assert.equal(rules.isCurrent(event, at('2026-10-25T05:59:59Z')), true);
  assert.equal(rules.isCurrent(event, at('2026-10-25T06:00:00Z')), false);
});
test('Spooky Streets uses verified organizer provenance and zoo ticket details stay qualified', () => {
  const spooky = data.events.find(e => e.id === 'centennial-spooky-streets-2026');
  assert.equal(spooky.sourceType, 'organizer');
  assert.equal(spooky.href, 'https://www.shopsouthglenn.com/event/spooky-streets-2/');
  assert.equal(spooky.costLabel, 'Free');
  for (const id of ['denver-boo-at-zoo-2026','denver-boo-at-zoo-sensory-2026']) {
    const event = data.events.find(e => e.id === id);
    assert.match(event.costLabel, /youth ages 3–15/);
    assert.match(event.registrationLabel, /including a free ticket for each child age 2 or under/);
    assert.match(event.registrationLabel, /heading conflicts at 10 p\.m\./);
    assert.match(event.timeLabel, /4:30–9 p\.m\./);
    assert.match(event.availabilityLabel, /other slots were not tested/);
    assert.match(event.availabilityLabel, /current availability is not guaranteed/);
  }
  assert.match(data.events.find(e => e.id === 'aurora-nicks-fall-fest-2026').costLabel, /one use each of train, tractor, pedal karts and inflatable course/);
});


test('six canonical pumpkin records expose decision fields and match their source snapshot', () => {
  const pumpkins = data.events.filter(rules.isPumpkin);
  assert.equal(pumpkins.length, 6);
  assert.equal(pumpkins.filter(e => e.id === 'aurora-nicks-fall-fest-2026').length, 1);
  assert.deepEqual(Array.from(pumpkins, e => e.city).sort(), ['aurora','erie','kiowa','louisville','platteville','thornton']);
  const audit = JSON.parse(fs.readFileSync(path.join(root, 'docs/pumpkin-source-review-2026-10-21.json')));
  assert.deepEqual(JSON.parse(JSON.stringify(pumpkins)), audit.events);
  for (const event of pumpkins) {
    for (const field of ['pickingType','goodFit','entryCost','pumpkinCost','activityCost']) assert.ok(event.pumpkin[field], event.id + ': ' + field);
    assert.ok(event.pumpkin.warnings.length);
    assert.ok(event.pumpkin.essentials.length);
    assert.ok(event.schedule.length);
    for (const item of event.schedule) {
      assert.match(item.dateStart, /[+-]\d\d:\d\d$/);
      assert.match(item.dateEnd, /[+-]\d\d:\d\d$/);
      assert.ok(new Date(item.dateEnd) > new Date(item.dateStart));
      assert.equal(item.availability, 'unknown', 'published schedule never claims live inventory');
      assert.ok(item.time);
      if (item.date === '2026-11-01') assert.match(item.dateStart, /-07:00$/);
    }
    assert.match(rules.pumpkinPreview(event), /Entry:.*Pumpkins:.*Activities:.*Before you go:/);
    for (const url of [event.href, event.registrationUrl, ...event.sourceUrls].filter(Boolean)) {
      const parsed = new URL(url); assert.equal(parsed.protocol, 'https:'); assert.equal(parsed.username, ''); assert.equal(parsed.password, '');
    }
  }
});
test('pumpkin occurrences preserve metadata and do not infer daily season dates or session availability', () => {
  const sample = { status:'approved', category:'pumpkin-patches', pumpkin:{}, dateEnd:'2026-12-31', schedule:[
    { date:'2026-10-24', dateStart:'2026-10-24T09:00:00-06:00', dateEnd:'2026-10-24T18:00:00-06:00', availability:'sold_out', note:'Sold out session only' },
    { date:'2026-10-25', dateStart:'2026-10-25T09:00:00-06:00', dateEnd:'2026-10-25T18:00:00-06:00', availability:'unknown', lastEntry:'Last entry 5 p.m.', entryCutoff:'2026-10-25T17:00:00-06:00', note:'Check weather' }
  ] };
  const occurrences = rules.pumpkinOccurrences(sample, at('2026-10-21T16:00:00Z'));
  assert.equal(occurrences.length, 1); assert.equal(occurrences[0].note, 'Check weather');
  assert.equal(occurrences[0].entryCutoff, '2026-10-25T17:00:00-06:00');
  assert.equal(occurrences[0].availability, 'unknown');
  assert.equal(rules.isCurrent(sample, at('2026-10-25T23:30:00Z')), true, 'grounds closing is separate from last entry');
  assert.equal(rules.nextPumpkinVisits(sample, at('2026-10-25T23:00:00Z')).length, 0);
  assert.equal(rules.isRecommendable(sample, at('2026-10-25T23:30:00Z')), false);
  assert.equal(rules.isCurrent(sample, at('2026-10-26T00:00:00Z')), false, 'broad season cannot extend last verified occurrence');
  assert.equal(rules.isCurrent({...sample,schedule:[]}, at('2026-10-21T16:00:00Z')), false);
});
test('real pumpkin schedules retain closed weekdays, Sunday differences and November DST expiry', () => {
  const get = city => data.events.find(e => rules.isPumpkin(e) && e.city === city);
  const anderson = get('erie'), nick = get('aurora'), seventh = get('louisville'), patch = get('kiowa');
  assert.equal(anderson.schedule.some(item => new Date(item.date + 'T12:00:00Z').getUTCDay() === 2), false);
  assert.equal(patch.schedule.some(item => ['2026-10-24','2026-10-25','2026-10-31'].includes(item.date) === false), false);
  assert.match(nick.schedule.find(item => item.date === '2026-10-25').dateEnd, /T17:00:00-06:00$/);
  assert.equal(rules.nextPumpkinVisits(seventh, at('2026-10-26T16:00:00Z'))[0].date, '2026-10-29');
  assert.equal(rules.isCurrent(seventh, at('2026-11-02T00:59:59Z')), true);
  assert.equal(rules.isCurrent(seventh, at('2026-11-02T01:00:00Z')), false);
  assert.equal(rules.nextPumpkinVisits(nick, at('2026-10-22T00:00:00Z'))[0].date, '2026-10-22');
});
test('closure, picking, fee and uncertain-season qualifications cannot become confirmed claims', () => {
  const get = city => data.events.find(e => rules.isPumpkin(e) && e.city === city);
  const anderson = get('erie'), miller = get('platteville'), seventh = get('louisville'), maize = get('thornton');
  assert.equal(anderson.pumpkin.operatingStatus, 'conflicting');
  assert.equal(rules.isCurrent(anderson, at('2026-10-21T16:00:00Z')), true, 'qualified research card stays visible');
  assert.equal(rules.isRecommendable(anderson, at('2026-10-21T16:00:00Z')), false, 'do not promote conflicting operation');
  assert.match(anderson.pumpkin.warnings.join(' '), /closed|closure|no activities are currently open/i);
  assert.match(get('aurora').pumpkin.pickingType, /retail/i);
  assert.match(maize.pumpkin.pickingType, /stocked|preharvested|pre-harvested/i);
  assert.match(maize.pumpkin.warnings.join(' '), /conflict/i);
  assert.match(seventh.pumpkin.pumpkinCost + seventh.pumpkin.warnings.join(' '), /undated|2026.*unconfirmed/i);
  assert.match(seventh.pumpkin.entryCost + seventh.pumpkin.warnings.join(' '), /11\.37/);
  assert.equal(miller.seasonEndUnknown, true);
  assert.equal(miller.editorialReviewThrough, '2026-10-31');
  assert.equal(miller.schedule.some(item => item.date.startsWith('2026-11')), false);
  assert.match(miller.pumpkin.warnings.join(' '), /end.*(?:unknown|unconfirmed|not confirmed)|exact.*end/i);
});

test('readability pass preserves all historical records and 16 reviewed canonical records exactly', () => {
  const { execFileSync } = require('node:child_process');
  const beforeRef = '57b28792ba1fea69bc8b6426a8f0ed8768b2c62b';
  // CI may use a shallow checkout. Fetch only this immutable public commit object.
  try { execFileSync('git', ['cat-file', '-e', beforeRef + '^{commit}'], {cwd:root,stdio:'pipe'}); }
  catch (_) { execFileSync('git', ['fetch', '--no-tags', '--depth=1', 'origin', beforeRef], {cwd:root,stdio:'pipe'}); }
  const baseline = { window:{} };
  vm.createContext(baseline);
  vm.runInContext(execFileSync('git', ['show', beforeRef + ':data/events/events-manifest.js'], {cwd:root,encoding:'utf8'}), baseline);
  const original = JSON.parse(JSON.stringify(baseline.window.EVENTS_DATA.events));
  const current = JSON.parse(JSON.stringify(data.events.filter(event => originalIds.has(event.id))));
  assert.equal(original.length, 47);
  assert.equal(current.length, original.length);
  assert.equal(current.filter(event => event.verifiedAt === '2026-10-21').length, 16);
  for (const event of current) {
    if (!event.pumpkin) continue;
    // These are the only approved additive presentation fields. All old prices,
    // warnings, links, schedules, cutoffs, booking rules and metadata stay exact.
    delete event.pumpkin.fitLabel;
    delete event.pumpkin.costSummary;
    delete event.pumpkin.criticalWarnings;
    delete event.pumpkin.cutoffSummary;
  }
  assert.deepEqual(current, original);
});

test('concise pumpkin comparison fields remain complete and preserve visit-blocking warnings', () => {
  const pumpkins = data.events.filter(rules.isPumpkin);
  assert.equal(pumpkins.length, 6);
  for (const event of pumpkins) {
    const p = event.pumpkin;
    assert.equal(typeof p.fitLabel, 'string', event.id + ': family-fit summary');
    assert.ok(p.fitLabel.trim());
    assert.deepEqual(Object.keys(p.costSummary).sort(), ['activities','entry','pumpkins']);
    for (const field of ['entry','pumpkins','activities']) {
      assert.equal(typeof p.costSummary[field], 'string', event.id + ': ' + field);
      assert.ok(p.costSummary[field].trim());
      assert.match(p.costSummary[field], /\$[\d,.]+|\bFree\b|\bIncluded\b|\bExtra\b|\bNot listed\b/i,
        event.id + ': price-first amount or explicit cost status');
    }
    assert.ok(Array.isArray(p.criticalWarnings));
    assert.ok(p.criticalWarnings.every(warning => typeof warning === 'string' && warning.trim()));
    const collapsed = [p.pickingType,p.fitLabel,...Object.values(p.costSummary),...p.criticalWarnings].join(' ');
    assert.doesNotMatch(collapsed, /\beditorial\b|\b(?:un)?verified\b/i, event.id + ': parent-friendly main-card language');
    assert.doesNotMatch(collapsed, /guaranteed (?:entry|tickets|availability)|tickets available now/i);
  }
  const critical = city => pumpkins.find(event => event.city === city).pumpkin.criticalWarnings.join(' ');
  assert.match(critical('erie'), /conflict|disagree|contradict|(?:dates|festival).*but.*(?:closed|not open)|closed.*(?:dates|festival)/i);
  assert.match(critical('erie'), /open|closed|closure|operating/i);
  assert.match(critical('erie'), /check|confirm|call/i);
  assert.match(critical('thornton'), /ticket|book/i);
  const maizeCutoff = pumpkins.find(event => event.city === 'thornton').pumpkin.cutoffSummary;
  assert.match(maizeCutoff, /90 minutes.*2 hours.*before closing/i);
  assert.match(critical('thornton'), /check|confirm|conflict/i);
  assert.match(critical('platteville'), /waiver/i);
  assert.match(critical('platteville'), /required|every|each/i);
  assert.match(critical('kiowa'), /ticket/i);
  assert.match(critical('kiowa'), /waiver/i);
  assert.match(critical('kiowa'), /required|need|must/i);
});

// Priority 1 is an additive content-only release from merged pumpkin main.
test('Priority 1 preserves all 47 original objects and adds exactly the approved canonical IDs', () => {
  assert.equal(originalEvents.length, 47);
  const currentOriginal = data.events.filter(event => originalIds.has(event.id));
  assert.deepEqual(JSON.parse(JSON.stringify(currentOriginal)), originalEvents);
  const approvedIds = [
    'centennial-napa-trunk-treat-2026','castle-pines-fall-festival','aurora-midterm-monster-mash-2026',
    'parker-kiddie-academy-trunk-treat-2026','centennial-sos-spooktacular-2026',
    'centennial-gracepoint-carnival-costumes-2026','aurora-stanley-monster-mash-2026',
    'littleton-goblin','greenwood-music-darkened-theater-2026','parker-primrose-trunk-treat-2026',
    'castle-rock-sos-trunk-or-treat-2026','aurora-hallelujah-night-2026'
  ].filter(id => !heldPriorityIds.includes(id) && (hasNapa || id !== 'centennial-napa-trunk-treat-2026'));
  const additions = preNovemberEvents.filter(event => !originalIds.has(event.id));
  assert.deepEqual(Array.from(additions, event => event.id), approvedIds);
  assert.deepEqual(JSON.parse(JSON.stringify(additions)), priorityAudit.events);
  assert.equal(preNovemberEvents.length, hasNapa ? 58 : 57);
  assert.equal(novemberIds.size, 8, 'Only the eight approved November IDs may be excluded from the historical audit.');
  assert.equal(data.events.length, (hasNapa ? 58 : 57) + 8);
  assert.deepEqual(priorityAudit.heldBackEvents.map(item => item.id), heldPriorityIds);
  for (const id of heldPriorityIds) assert.equal(data.events.some(event => event.id === id), false);
  assert.equal(data.events.filter(rules.isPumpkin).length, 6);
  assert.equal(data.events.filter(e => e.id === 'aurora-nicks-fall-fest-2026').length, 1);
  for (const id of ['centennial-fellowship-trunk-treat-2026','greenwood-pumpkin-palooza-2026','aurora-fangtastic-festival-2026',
    'parker-trunk-or-treat-mainstreet-2026-10-24','parker-all-treats-no-tricks-2026-10-30']) {
    assert.equal(data.events.some(event => event.id === id), false, id);
  }
  const oldCities = baselineContext.window.EVENTS_DATA.cities;
  for (const [key, value] of Object.entries(oldCities)) assert.deepEqual(JSON.parse(JSON.stringify(data.cities[key])), JSON.parse(JSON.stringify(value)));
  assert.deepEqual(Object.keys(data.cities).filter(city => !oldCities[city]).sort(), ['castle_rock','greenwood_village','littleton']);
});
test('fixed October 22 release counts retain 30 archived and one excluded record, including NAPA fallback', () => {
  const now = at('2026-10-22T16:00:00Z');
  const counts = events => ({total:events.length, active:events.filter(e => rules.isCurrent(e,now)).length,
    archived:events.filter(e => rules.isPublishable(e) && !rules.isCurrent(e,now)).length,
    excluded:events.filter(e => !rules.isPublishable(e)).length});
  assert.deepEqual(counts(preNovemberEvents), {total:hasNapa ? 58 : 57,active:hasNapa ? 27 : 26,archived:30,excluded:1});
  assert.deepEqual(counts(data.events), {total:hasNapa ? 66 : 65,active:hasNapa ? 35 : 34,archived:30,excluded:1});
  assert.deepEqual(counts(preNovemberEvents.filter(event => event.id !== 'centennial-napa-trunk-treat-2026')), {total:57,active:26,archived:30,excluded:1});
  const cities = {};
  for (const event of data.events.filter(event => rules.isCurrent(event, now))) cities[event.city] = (cities[event.city] || 0) + 1;
  assert.deepEqual(cities, {aurora:10,denver:5,centennial:hasNapa ? 7 : 6,erie:1,thornton:1,platteville:1,kiowa:1,louisville:1,
    castle_pines:1,parker:3,littleton:1,greenwood_village:1,castle_rock:2});
});
test('Priority 1 source snapshot has fresh official checks, free-entry qualifications and no invented availability', () => {
  for (const event of priorityAudit.events) {
    assert.equal(event.verifiedAt, '2026-10-21');
    assert.equal(event.status,'approved'); assert.equal(event.costType,'free');
    assert.equal(event.recurring,false); assert.equal(event.timezone,'America/Denver');
    assert.match(event.dateStart, /T\d\d:\d\d:00-06:00$/);
    assert.ok(event.description && event.registrationLabel && event.availabilityLabel, event.id);
    const evidence = priorityAudit.verification.find(item => item.id === event.id);
    assert.ok(evidence && evidence.checkedAtUtc && evidence.sources.length, event.id + ': source evidence');
    assert.ok(new Date(evidence.checkedAtUtc) >= new Date('2026-10-21T22:43:00Z'), event.id + ': fresh after approval');
    for (const url of [event.href,event.registrationUrl,...event.sourceUrls].filter(Boolean)) {
      const parsed = new URL(url); assert.equal(parsed.protocol,'https:'); assert.equal(parsed.username,''); assert.equal(parsed.password,'');
    }
    assert.doesNotMatch(event.availabilityLabel, /guaranteed entry|guaranteed tickets|reserved for you|tickets available now/i);
    assert.equal(event.nearbyParks, undefined, 'no unverified park relationship introduced');
  }
});
test('Priority 1 booking, costume, cost and cancellation qualifications survive 118-character previews', () => {
  const get = id => data.events.find(event => event.id === id);
  const preview = event => event.description.length > 118 ? event.description.slice(0,115).replace(/\s+\S*$/, '') + '…' : event.description;
  const checks = {
    'castle-pines-fall-festival': [/chili.*cancel/i,/festival/i],
    'aurora-midterm-monster-mash-2026': [/registration required/i,/weapon/i],
    'parker-kiddie-academy-trunk-treat-2026': [/reserve|RSVP/i,/food.*extra/i],
    'centennial-sos-spooktacular-2026': [/RSVP/i,/no diagnosis/i],
    'centennial-gracepoint-carnival-costumes-2026': [/RSVP/i,/non-scary/i],
    'aurora-stanley-monster-mash-2026': [/free/i,/purchases|food|shops/i,/new winter-clothing/i],
    'littleton-goblin': [/free/i],
    'greenwood-music-darkened-theater-2026': [/end time.*not published/i],
    'parker-primrose-trunk-treat-2026': [/public|community/i,/free/i,/food.*extra/i],
    'castle-rock-sos-trunk-or-treat-2026': [/RSVP/i,/sensory/i,/costumes optional/i],
    'aurora-hallelujah-night-2026': [/church/i,/scary|gory/i,/demon/i,/witch/i,/RSVP availability unconfirmed/i]
  };
  if (hasNapa) checks['centennial-napa-trunk-treat-2026'] = [/tickets not required/i,/optional RSVP/i];
  for (const [id,patterns] of Object.entries(checks).filter(([id]) => !heldPriorityIds.includes(id))) for (const pattern of patterns) assert.match(preview(get(id)),pattern,id);
  const castle = get('castle-pines-fall-festival');
  assert.match(castle.costLabel,/\$25/); assert.match(castle.costLabel,/food.*extra|purchases.*extra/i);
  assert.match(castle.registrationLabel,/Oct(?:ober)? 22.*5 p\.m\./);
  assert.match(castle.registrationLabel,/Oct(?:ober)? 23.*noon/);
  assert.match(castle.registrationLabel,/not.*(?:attendance|admission)|attendance.*(?:no|unticketed)/i);
  const heldKiddie = priorityAudit.heldBackEvents.find(item => item.id === 'parker-kiddie-academy-trunk-treat-2026');
  assert.match(heldKiddie.reason,/429|blocked/);
  assert.match(heldKiddie.reason,/not.*sold.out|no.*sold.out/i);
  assert.match(heldKiddie.event.costLabel,/first 300/i);
  assert.match(get('aurora-hallelujah-night-2026').costLabel,/optional \$3/i);
});
test('concert unknown end disables calendar, expires only after its Colorado date and never invents duration', () => {
  const music = data.events.find(event => event.id === 'greenwood-music-darkened-theater-2026');
  assert.equal(music.dateStart,'2026-10-25T15:00:00-06:00');
  assert.equal(music.dateEnd,'2026-10-25'); assert.equal(music.calendarDisabled,true);
  assert.match(music.timeLabel,/end time not published/);
  assert.equal(rules.isCurrent(music,at('2026-10-26T05:59:59Z')),true);
  assert.equal(rules.isCurrent(music,at('2026-10-26T06:00:00Z')),false);
  for (const event of priorityAudit.events.filter(event => event.id !== music.id)) {
    assert.match(event.dateEnd,/-06:00$/);
    const end = new Date(event.dateEnd);
    assert.equal(rules.isCurrent(event,new Date(end.getTime()-1)),true,event.id);
    assert.equal(rules.isCurrent(event,end),false,event.id);
  }
});


test('the shared Before You Go notice preserves approved copy and safe existing source fallbacks', () => {
  const html = fs.readFileSync(path.join(root,'events.html'),'utf8');
  const start = html.indexOf('  function officialEventSource(event) {');
  const end = html.indexOf('  function renderEventRow(event, options) {',start);
  assert.ok(start > 0 && end > start);
  const helpers = {};
  vm.createContext(helpers);
  helpers.URL = URL;
  helpers.escapeHtml = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  vm.runInContext(html.slice(start,end),helpers);
  for (const event of data.events) assert.equal(helpers.officialEventSource(event),event.href || event.link || event.sourceUrls[0]);
  assert.equal(helpers.officialEventSource({href:'javascript:alert(1)',link:'data:text/html,bad',sourceUrls:['','/relative']}),'');
  assert.equal(helpers.officialEventSource({href:'bad',sourceUrls:['https://example.org/event']}),'https://example.org/event');
  assert.equal(helpers.officialEventSource({link:' https://example.org/linked '}),'https://example.org/linked');
  const missing = helpers.renderBeforeYouGo({title:'No source'});
  assert.match(missing,/Official source not provided/);
  assert.doesNotMatch(missing,/<a |href=/);
  const approved = '⚠️ Before You Go: Event dates, times, prices, registration requirements, and weather or cancellation policies may change. Please check the official event website before attending.';
  const rendered = helpers.renderBeforeYouGo({title:'Test',href:'https://example.org/'});
  assert.ok(rendered.replace(/<[^>]*>/g,'').includes(approved));
  assert.match(rendered,/Official event source/);
  assert.equal((html.match(/renderBeforeYouGo\(event\) \+/g)||[]).length,3,'shared notice on regular, pumpkin and row renderers');
});
