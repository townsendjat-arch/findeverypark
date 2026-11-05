'use strict';
/* Explicit historical test fixture, never application input. Retain the reviewed
 * November 4 release's examples so old editorial/count assertions do not freeze
 * future event updates. Browser suites still use the exact-checkout UI/rules and
 * separately test the exact-checkout manifest with source-derived expectations.
 * No mutable branch reads and no duplicate production manifest in the repo. */
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const historicalRevision = 'f8c4de1a2177994bfb3fbea97d81731e365222af';
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
try { git(['cat-file', '-e', historicalRevision + '^{commit}']); }
catch (_) { git(['fetch', '--no-tags', '--depth=1', 'origin', historicalRevision]); }
function historicalFile(file) {
  if (!/^[a-zA-Z0-9_./-]+$/.test(file) || file.split('/').includes('..')) throw new Error('Invalid fixture path');
  return git(['show', historicalRevision + ':' + file]);
}
const historicalManifest = historicalFile('data/events/events-manifest.js');
const context = { window: {} };
vm.runInNewContext(historicalManifest, context, { filename: 'historical-events-manifest.js', timeout: 5000 });
const historicalData = JSON.parse(JSON.stringify(context.window.EVENTS_DATA));
module.exports = { historicalRevision, historicalFile, historicalManifest, historicalData };
