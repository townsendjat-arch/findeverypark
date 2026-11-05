const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/community-feed-review.yml'), 'utf8');
const pkg = require('../package.json');

// Guard the intentionally simple checked-in configuration, not a general YAML parser.
test('feed workflow reports a stable integrity check on every PR without path or head-branch exclusions', () => {
  const triggers = workflow.slice(workflow.indexOf('\non:'), workflow.indexOf('\npermissions:'));
  const prTrigger = triggers.slice(triggers.indexOf('\n  pull_request:'), triggers.indexOf('\n  push:'));
  assert.match(prTrigger, /types: \[opened, synchronize, reopened, ready_for_review, edited\]/);
  assert.doesNotMatch(prTrigger, /branches|paths/);
  assert.doesNotMatch(workflow, /github\.head_ref|paths-ignore|pull_request_target/);
  assert.match(triggers, /push:\n    branches: \[main\]/);
  assert.match(triggers, /merge_group:\n    types: \[checks_requested\]/);
  const integrity = workflow.slice(workflow.indexOf('\n  feed-integrity:'), workflow.indexOf('\n  event-browsers:'));
  assert.match(integrity, /name: Event feed integrity/);
  assert.doesNotMatch(integrity, /\n\s+if:/);
  assert.match(integrity, /ref: \$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}/);
  assert.match(integrity, /- run: npm test/);
  assert.match(pkg.scripts.test, /^node scripts\/generate-community-feed\.js --check &&/);
  assert.match(pkg.scripts.test, /tests\/feed-maintenance\.test\.js/);
  assert.doesNotMatch(integrity, /run:.*(?:events:feed(?!:check)|generate-community-feed\.js(?! --check))/);
});

test('browser jobs depend on integrity; workflow is read-only and has no deployment or auto-commit step', () => {
  assert.match(workflow, /permissions:\n  contents: read\n/);
  assert.match(workflow, /needs: feed-integrity/);
  assert.match(workflow, /browser: \[chromium, webkit\]/);
  assert.equal((workflow.match(/persist-credentials: false/g) || []).length, 2);
  assert.doesNotMatch(workflow, /(?:pages|id-token|contents): write|deploy-pages|git push|git commit|continue-on-error:/);
});
