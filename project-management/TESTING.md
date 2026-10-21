# FindEveryPark: verification ledger

Evidence checked: **2026-10-21 (UTC)**. Scope: the proposed events package, not a whole-site production-readiness certification.

## Exact revision and results

| Evidence | Exact target | Result |
| --- | --- | --- |
| Browser CI, [run 39636336535](https://github.com/townsendjat-arch/findeverypark/actions/runs/39636336535) | `7d9fcd5b52ae63b3987e829d09810527392f9b5f`, [PR #2](https://github.com/townsendjat-arch/findeverypark/pull/2) | PASS: 33/33 Chromium + 33/33 Playwright WebKit, 66 browser checks total |
| Local Node regression suite, recorded in PR #2 | Same code-tested commit | PASS: 9 tests under each of UTC, America/Los_Angeles and Asia/Tokyo, 27 executions; not 27 distinct tests |
| New tracking revision | Documentation-only descendant of `7d9fcd5b52ae63b3987e829d09810527392f9b5f` | Distinct SHA; earlier run does not prove its own CI. See [current commits](https://github.com/townsendjat-arch/findeverypark/pull/2/commits) and [current checks](https://github.com/townsendjat-arch/findeverypark/pull/2/checks) |

## Passed scope

- Node: exact ends, date-only expiry, future/multi-day events, repeated DST hour, nonexistent spring time, invalid/pending/cancelled records, source provenance, park IDs and syntax, independent of visitor time zone.
- Chromium/WebKit at 1440x1000, 390x844 and 320x740: four-city selection, aliases/history, no horizontal overflow, hours/registration/park links, calendar output, expiry in an open tab, retained expanded schedules, homepage/city consistency, 44px filter targets, keyboard use and no uncaught JavaScript errors.
- Scoped axe WCAG 2 A/AA and 2.1 AA checks on events-page main content in both engines at all three widths: no reported violations. Earlier contrast findings were corrected; WebKit checks wait for existing color transitions to finish. This is not whole-site WCAG certification.
- The existing park-first homepage placement, three-card preview cap, map and hosting configuration were preserved.

Commands and maintenance procedure: [event-system.md](../docs/event-system.md#regression-checks). Detailed changes and test limitations: [events review](../docs/events-review-2026-10-21.md#tests-and-limits). Do not duplicate the complete research or test narrative here.

## Source verification is separate from software tests

The [dated source report](../docs/events-review-2026-10-21.md) and [JSON audit](../docs/events-source-review-2026-10-21.json) record 13 proposed listings checked on 2026-10-21 for the October 21-November 1 window: Aurora 5, Centennial 3, Parker 2, Denver 3. Event times are America/Denver. This tracker does not represent a new independent source recheck.

Important unresolved qualifications:

- Goodson Halloween event admission/registration requirements remain unknown.
- Hoofin's end time is unpublished; the date-only expiry is policy, not a claimed closing time. Calendar export is disabled. Child processing fee remains unspecified.
- Spooky Streets has a dated community-calendar source and participating-gallery corroboration; the direct organizer page was inaccessible, so strict independent 2026 organizer verification was not achieved.
- Registration links do not verify available tickets. Capacity, weather, cancellations, price changes and late organizer updates remain time-sensitive.
- Held-back candidates in the source report are not verified current listings and must not be promoted merely because the code tests pass.

## Screenshots and evidence retention

Desktop/mobile event headers/cards, homepage and preview screenshots are in the Chromium/WebKit artifacts attached to [run 39636336535](https://github.com/townsendjat-arch/findeverypark/actions/runs/39636336535), with seven-day retention, expected through 2026-10-28. Selected screenshots were delivered separately for review. Retain needed evidence through an authorized destination before expiry; a missing artifact is not a new pass.

## Unverified or blocked

- Physical iOS/Android devices, VoiceOver/TalkBack, and live registration inventory are unverified. Playwright WebKit is not the Safari application or a physical Apple device.
- Local browser startup was blocked by process-socket restrictions; the isolated local server was not reachable from the cloud preview browser. No local visual pass is claimed. Exact-head browser tests ran on GitHub Actions instead.
- No general production build, lint, typecheck or whole-site audit is claimed. The configured commands are the Node and browser suites in [package.json](../package.json).
- No release, live-site post-deployment verification, organizer contact or integration activation occurred.

## Documentation revision and future verification

Prepublication validation on 2026-10-21 (UTC) passed: exactly the four requested new Markdown paths, 43 valid relative-link targets, clean whitespace, and no edits to existing production/workflow/report files. The nine Node tests passed again under UTC, America/Los_Angeles and Asia/Tokyo with the docs present: 27 executions, no failures/skips/cancellations. These local checks are not a new browser run. Read current remote head before publishing to preserve concurrent work. Git history identifies the containing docs revision without confusing it with the earlier tested code.

The existing [review workflow](../.github/workflows/events-review-tests.yml) is PR-only, restricted to the named review branch, contents-read, with no retained checkout credentials or deployment step. Browser tests block external actions/analytics. Observed Pages history is main-only; account-level settings/hidden webhooks were not audited. After publishing docs, wait for that exact head's triggered CI and report it separately. Future code/data changes or rebases require new exact-head tests; source `verifiedAt` changes require actual source rechecking.

Use [TASKS.md](TASKS.md#open-blockers-and-approvals) for remaining approval/manual/source/release gates. Passing the scoped suite means ready for bounded review, not launched or generally production-ready.
