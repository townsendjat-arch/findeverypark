'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { ROOT, OUTPUT } = require('../scripts/generate-community-feed');

const SOURCE = 'data/events/events-manifest.js';
const GENERATOR = 'scripts/generate-community-feed.js';
// Synthetic test content only. No real event is edited, published or reverified.
const fixture = {
  id: 'maintenance-fixture', city: 'aurora', title: 'Maintenance fixture',
  description: 'A source-to-feed test, not a public event.', status: 'approved',
  dateStart: '2042-11-14T09:00:00-07:00', dateEnd: '2042-11-14T11:00:00-07:00',
  dateLabel: 'November 14, 2042', timeLabel: '9–11 a.m. MST',
  locationLabel: 'Test location', costLabel: 'Fee unknown', costType: 'unknown',
  audienceLabel: 'Test audience', href: 'https://example.com/fixture',
  registrationLabel: 'Registration unverified.', availabilityLabel: 'Capacity unverified.',
  verifiedAt: '2042-11-01', timezone: 'America/Denver'
};

function run(root, args = ['--check']) {
  return spawnSync(process.execPath, [GENERATOR, ...args], { cwd: root, encoding: 'utf8' });
}
function expectPass(result) { assert.equal(result.status, 0, result.stderr || result.stdout); }
function appendSource(root, code) { fs.appendFileSync(path.join(root, SOURCE), '\n' + code + '\n'); }
function readFeed(root) { return fs.readFileSync(path.join(root, OUTPUT), 'utf8'); }
function updateFixture(root, changes) {
  appendSource(root, 'Object.assign(window.EVENTS_DATA.events.find(event => event.id === ' +
    JSON.stringify(fixture.id) + '), ' + JSON.stringify(changes) + ');');
}
function sandbox(t, withFixture = false) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feed-maintenance-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const file of [GENERATOR, 'city-events.js', SOURCE, OUTPUT, 'tests/community-feed.test.js']) {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.copyFileSync(path.join(ROOT, file), path.join(root, file));
  }
  if (withFixture) {
    appendSource(root, 'window.EVENTS_DATA.events.push(' + JSON.stringify(fixture) + ');');
    expectPass(run(root, []));
  }
  return root;
}
function expectReadOnlyFailure(root, pattern) {
  const before = fs.existsSync(path.join(root, OUTPUT)) ? readFeed(root) : null;
  const result = run(root);
  assert.equal(result.status, 1, result.stdout);
  assert.match(result.stderr, pattern);
  if (before === null) assert.equal(fs.existsSync(path.join(root, OUTPUT)), false);
  else assert.equal(readFeed(root), before, '--check must not repair its input');
}
function assertContract(root) {
  // The parent test runner marks child processes. Remove that marker so this
  // intentional isolated runner actually executes, rather than skipping a
  // recursively detected node:test run and returning a false-positive exit 0.
  const { NODE_TEST_CONTEXT, ...env } = process.env;
  const result = spawnSync(process.execPath, ['--test', 'tests/community-feed.test.js'], { cwd: root, env, encoding: 'utf8' });
  expectPass(result);
  assert.match(result.stdout, /(?:#|ℹ) tests [1-9]\d*\b/);
  assert.match(result.stdout, /(?:#|ℹ) pass [1-9]\d*\b/);
}

test('unchanged checkout passes the same CLI check used by CI', t => {
  const root = sandbox(t);
  const before = readFeed(root);
  expectPass(run(root));
  assert.equal(readFeed(root), before);
});

test('missing and malformed generated files fail without rewriting or recreating them', async t => {
  for (const [name, content, message] of [
    ['missing', null, /is missing/],
    ['truncated JSON', '{"events": [', /malformed JSON/],
    ['executable script', 'window.EVENTS_DATA = {};', /malformed JSON/],
    ['empty file', '', /malformed JSON/]
  ]) await t.test(name, child => {
    const root = sandbox(child);
    if (content === null) fs.unlinkSync(path.join(root, OUTPUT));
    else fs.writeFileSync(path.join(root, OUTPUT), content);
    expectReadOnlyFailure(root, message);
    expectPass(run(root, []));
    expectPass(run(root));
  });
});

test('valid JSON cannot hide source-inconsistent schema, text, IDs or expiry', async t => {
  const changes = [
    ['wrong envelope', feed => { feed.schemaVersion = 999; }],
    ['missing records', feed => { feed.events = []; }],
    ['changed qualification', feed => { feed.events[0].registrationLabel = 'No registration needed'; }],
    ['invented expiry', feed => { feed.events[0].expiresAt = '2099-01-01T00:00:00.000Z'; }],
    ['duplicate event', feed => { feed.events.push(feed.events[0]); }],
    ['unexpected event', feed => { feed.events.push({ ...feed.events[0], id: 'invented-record' }); }],
    ['wrong timezone', feed => { feed.timeZone = 'UTC'; }],
    ['noncanonical serialization', feed => feed]
  ];
  for (const [name, change] of changes) await t.test(name, child => {
    const root = sandbox(child, true);
    const feed = JSON.parse(readFeed(root));
    change(feed);
    fs.writeFileSync(path.join(root, OUTPUT), JSON.stringify(feed));
    expectReadOnlyFailure(root, /stale or inconsistent with its source/);
    expectPass(run(root, []));
    expectPass(run(root));
  });
});

test('source additions, updates, cancellations and removals require regeneration and remain future-safe', async t => {
  const scenarios = [
    ['add', root => appendSource(root, 'window.EVENTS_DATA.events.push(' + JSON.stringify({ ...fixture,
      id: 'next-maintenance-fixture', dateStart: '2043-01-03', dateEnd: '2043-01-03' }) + ');'),
      feed => assert.ok(feed.events.some(event => event.id === 'next-maintenance-fixture'))],
    ['update', root => updateFixture(root, { title: 'Updated fixture',
      dateEnd: '2042-11-14T12:00:00-07:00', registrationLabel: 'Advance signup required.' }),
      feed => {
        const event = feed.events.find(event => event.id === fixture.id);
        assert.equal(event.title, 'Updated fixture');
        assert.equal(event.registrationLabel, 'Advance signup required.');
        assert.equal(event.expiresAt, '2042-11-14T19:00:00.000Z');
      }],
    ['cancel', root => updateFixture(root, { status: 'cancelled' }),
      feed => assert.ok(!feed.events.some(event => event.id === fixture.id))],
    ['remove', root => appendSource(root, 'window.EVENTS_DATA.events = window.EVENTS_DATA.events.filter(event => event.id !== ' +
      JSON.stringify(fixture.id) + ');'), feed => assert.ok(!feed.events.some(event => event.id === fixture.id))]
  ];
  for (const [name, change, verify] of scenarios) await t.test(name, child => {
    const root = sandbox(child, true);
    const committed = readFeed(root);
    change(root);
    assert.equal(readFeed(root), committed, 'editing the source must not silently rewrite the checked-in JSON');
    expectReadOnlyFailure(root, /stale or inconsistent with its source/);
    expectPass(run(root, []));
    assert.notEqual(readFeed(root), committed);
    expectPass(run(root));
    verify(JSON.parse(readFeed(root)));
    assertContract(root);
  });
});

test('editorial metadata, city labels and canonical lifecycle changes invalidate the old feed', async t => {
  const scenarios = [
    ['content date', root => appendSource(root, 'window.EVENTS_DATA.contentUpdatedAt = "2042-11-02";')],
    ['city label', root => appendSource(root, 'window.EVENTS_DATA.cities.aurora.label = "Updated fixture city";')],
    ['lifecycle rule', root => {
      const file = path.join(root, 'city-events.js');
      const original = fs.readFileSync(file, 'utf8');
      const changed = original.replace('now.getTime() >= instant;', 'now.getTime() >= instant + 1000;');
      assert.notEqual(changed, original, 'fixture must alter the exact-end predicate in its private copy');
      fs.writeFileSync(file, changed);
    }]
  ];
  for (const [name, change] of scenarios) await t.test(name, child => {
    const root = sandbox(child, true);
    const before = readFeed(root);
    change(root);
    expectReadOnlyFailure(root, /stale or inconsistent with its source/);
    expectPass(run(root, []));
    assert.notEqual(readFeed(root), before);
    expectPass(run(root));
  });
});

test('malformed approved single-occurrence sources fail both generation and check without replacing the feed', async t => {
  for (const changes of [{ id: '' }, { dateEnd: 'not-a-date' }, { dateEnd: '2042-11-13' },
    { description: ['not plain text'] }, { registrationLabel: { html: 'bad' } },
    { verifiedAt: '2042-02-30' }, { costType: 'invented' }, { timezone: 'Asia/Tokyo' }]) {
    await t.test(JSON.stringify(changes), child => {
      const root = sandbox(child, true);
      const committed = readFeed(root);
      updateFixture(root, changes);
      for (const args of [['--check'], []]) {
        const result = run(root, args);
        assert.equal(result.status, 1);
        assert.match(result.stderr, /Invalid approved event/);
        assert.equal(readFeed(root), committed);
      }
    });
  }
});

test('missing required v1 display fields fail the CLI before publishing unusable cards', async t => {
  for (const field of ['id', 'city', 'title', 'description', 'dateLabel', 'timeLabel', 'locationLabel', 'costLabel']) {
    await t.test(field, child => {
      const root = sandbox(child, true);
      const committed = readFeed(root);
      appendSource(root, 'delete window.EVENTS_DATA.events.find(event => event.id === ' + JSON.stringify(fixture.id) + ')[' + JSON.stringify(field) + '];');
      for (const args of [['--check'], []]) {
        const result = run(root, args);
        assert.equal(result.status, 1);
        assert.match(result.stderr, /Invalid approved event/);
        assert.equal(readFeed(root), committed);
      }
    });
  }
});

test('oversized v1 envelopes fail the CLI without truncation or replacement', async t => {
  for (const kind of ['records', 'bytes']) await t.test(kind, child => {
    const root = sandbox(child);
    const committed = readFeed(root);
    if (kind === 'records') {
      appendSource(root, 'window.EVENTS_DATA.events = Array.from({length:1001}, (_, index) => ({...' +
        JSON.stringify(fixture) + ', id:"limit-fixture-" + index}));');
    } else {
      appendSource(root, 'window.EVENTS_DATA.events = [{...' + JSON.stringify(fixture) +
        ', description:"é".repeat(1024 * 1024)}];');
    }
    for (const args of [['--check'], []]) {
      const result = run(root, args);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /exceeds the v1 limit/);
      assert.equal(readFeed(root), committed);
    }
  });
});

test('deliberately excluded records are not mistaken for malformed approved occurrences', t => {
  const root = sandbox(t, true);
  const before = readFeed(root);
  const excluded = [
    { id: 'pending-test', status: 'pending' }, { id: 'archived-test', status: 'archived' },
    { id: 'cancelled-test', status: 'cancelled' }, { id: 'legacy-test' },
    { id: 'community-test', status: 'approved', community_event: true },
    { id: 'recurring-test', status: 'approved', recurring: true },
    { id: 'pumpkin-test', status: 'approved', category: 'pumpkin-patches', pumpkin: {} }
  ];
  appendSource(root, 'window.EVENTS_DATA.events.push(...' + JSON.stringify(excluded) + ');');
  expectPass(run(root));
  expectPass(run(root, []));
  assert.equal(readFeed(root), before);
  assertContract(root);
});

test('unrelated newsletter files are outside the explicit local input boundary', t => {
  const root = sandbox(t);
  const before = readFeed(root);
  const directory = path.join(root, 'data/newsletter');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'events-manifest.js'), 'throw new Error("Newsletter data must never execute");');
  fs.writeFileSync(path.join(directory, 'events.json'), JSON.stringify({ events: [fixture] }));
  expectPass(run(root));
  expectPass(run(root, []));
  assert.equal(readFeed(root), before);
});

test('invalid source JavaScript fails closed without altering the previous artifact', t => {
  const root = sandbox(t);
  const before = readFeed(root);
  appendSource(root, 'window.EVENTS_DATA.events.push(');
  for (const args of [['--check'], []]) assert.equal(run(root, args).status, 1);
  assert.equal(readFeed(root), before);
});
