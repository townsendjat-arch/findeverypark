# FindEveryPark: verification ledger

Updated: **2026-10-21 (UTC)**. Discovery evidence is separate from the corrected PR #2 baseline below.

## Separate discovery draft validation

- Base: `4247d0be71d913239a4a8cf42c8743218b1465b8`; branch `review/improve-event-discovery-2026`. Prior PR #2 checks do not establish discovery success.
- Local focused verification after the 11-listing rebase: original 14 + new 15 Node tests pass under UTC, America/Los_Angeles and Asia/Tokyo (87 executions). Further final commands, exact remote revision, terminal CI and inspected screenshots will be recorded here/the draft PR before review-ready status.
- Initial discovery head `e6318a619042119da5ba90ce8d07210a6de66054`, [run 39648941125](https://github.com/townsendjat-arch/findeverypark/actions/runs/39648941125): each engine passed 48/48 baseline checks and 36/52 discovery checks. Found real 320px city-tile overflow (354–356px page width), now addressed by stacking that existing grid below 360px. Other discovery failures were a navigation wait race and a test date regex accidentally matching the time 4:30, which left the test clock changed and caused cascading failures. Harness now waits for internal navigation, matches exact date tokens and resets time per check. Final rerun remains required; initial failure is not a pass.
- Browser suites cover date/city combinations, real recurring sessions, sold-out preview exclusion, October 30–November 1 DST/month boundary, empty November/December, keyboard select/action controls, URL/history/hash anchors, event→park→city-events→Back and narrow homepage overflow.
- Browser automation uses Chromium and Playwright WebKit in emulated 1440, 390, 320 and 400 CSS-pixel viewports. A 320px view is also a reflow proxy, not an actual 400% browser-zoom test. Physical iOS/Android, actual Safari, VoiceOver/TalkBack and live external booking inventory remain **NOT TESTED**.
- Local Chromium launch is blocked by `process_singleton_posix.cc socket() failed: Operation not permitted`; no local browser pass is claimed. Test-only PR workflow permits this one additional named draft branch with contents-read permissions, exact-head checkout and no deployment step; Node checks now run under UTC, Los Angeles and Tokyo in each job; permissions/triggers/deployment scope are unchanged.

## Corrected PR #2 baseline (not discovery evidence)

The following records describe the separate correction package only; they do not establish the discovery draft’s readiness.

Updated: **2026-10-21 (UTC)**. Scope: 11 active listings after the owner-requested sold-out removal and RSVP hold, not whole-site certification.

## Exact revision and results

The owner-requested removal and RSVP hold are a new code/data/test revision. Its exact SHA, terminal CI and screenshots are recorded in [PR final validation](https://github.com/townsendjat-arch/findeverypark/pull/2) and [checks](https://github.com/townsendjat-arch/findeverypark/pull/2/checks). Historical results below do not establish a pass for the removal/hold revision. A temporary shell disconnection affected preparation; it recovered and testing resumed. The PR records final-head local and CI results separately; no local browser pass is claimed.

| Evidence | Exact target | Result |
| --- | --- | --- |
| Historical 13-listing corrected data/test CI, [run 39647133538](https://github.com/townsendjat-arch/findeverypark/actions/runs/39647133538) | `f8d14df84967f59d5dab8d06119485f000b8480a` | PASS: 48/48 Chromium + 48/48 Playwright WebKit, 96 browser checks; 14/14 Node in each job |
| Historical local Node regression suite | Same corrected manifest/test content | PASS: 14 tests under UTC, America/Los_Angeles and Asia/Tokyo, 42 executions; zero failures/skips/cancellations |
| Historical 13-listing final head | `382bacc9562142cb70385e937451e343c45f5686`, [run 39647715578](https://github.com/townsendjat-arch/findeverypark/actions/runs/39647715578) | PASS: 48/48 Chromium + 48/48 WebKit; superseded by the removal/hold revision |
| Historical baseline | `4785a254a2dc54f6b45e8b3356dd2cc54c6d33f6`, [run 39639996775](https://github.com/townsendjat-arch/findeverypark/actions/runs/39639996775) | PASS before corrections: 33/33 Chromium + 33/33 WebKit; not evidence for the corrected content |

## Correction and regression coverage

- Node: original expiry/date/DST/status/provenance/park-ID/syntax checks, plus exact 11-record count, city distribution and audit/manifest equality; removed/held-record absence and preserved source history; warning preservation in existing 118-character previews; Hoofin price bands/qualified cutoff/date-only expiry; direct organizer provenance; zoo age/infant/availability qualifications and precise wristband copy.
- Chromium/WebKit: original city selection/history/aliases, calendar behavior, in-tab expiry, expanded schedules, homepage/city consistency, keyboard targets, no overflow and JavaScript errors; both removed/held events absent across events/homepage/city previews, Parker empty state, detached synthetic sold-out/RSVP coverage, and corrected Goodson/Hoofin/Spooky/zoo content; warning-card screenshots and short homepage/city-preview assertions.
- Viewports: 1440x1000, 390x844 and 320x740, with visitor time zones different from Colorado. Events-main-content axe WCAG 2 A/AA and 2.1 AA checks cover Aurora, Parker's empty state and the corrected Centennial warning cards. This is not whole-site accessibility certification.
- No layout/runtime/park-data changes were required. Existing badges and description prefixes convey the warnings, including shortened previews. 11 active listings and the three-card homepage cap remain; complete removed-event evidence is retained outside the manifest.

Commands and procedures: [event-system.md](../docs/event-system.md#regression-checks), [package.json](../package.json). Exact final results must come from the matching CI run, not anticipated test counts.

## Source verification is separate

Fresh source review finished **October 21, 2026 at 17:21 UTC**. [Listing report](../docs/events-review-2026-10-21.md) and [JSON audit](../docs/events-source-review-2026-10-21.json) contain source URLs and precise limitations.

- Parker attendee tickets were sold out at 17:18 UTC; the owner subsequently requested removal. The record is absent from the manifest and preserved only in audit/report history.
- Goodson fee/booking/capacity unresolved; adult 18+ accompaniment confirmed. Violet Bridge is held until a functioning family RSVP route is verified; its source record remains in history only. No free/walk-in assumptions.
- Hoofin has conflicting 5:30/5:35 p.m. cutoffs, unknown under-4 participant price and unknown end. Adult $22.45 and ages 4–14 $17.15 totals verified. Date-only expiry is policy, not a closing time.
- Spooky Streets now has direct organizer confirmation; earlier community-only qualification is superseded.
- Zoo selectors were sampled only for October 23 and 31 at 4:30 p.m.; quantity options are not guaranteed capacity. Organizer 4:30–9 p.m. schedule retained and conflicting 10 p.m. ticket heading disclosed.
- No new inventory guarantee, reservation, organizer contact or cancellation/weather guarantee. Future source checks remain necessary near publication.

## Screenshots and verification limits

Corrected card and short-preview screenshots are generated by each browser job in the linked run, with seven-day artifact retention. Historical 13-listing screenshots confirmed readable warnings. New removal-head checks must separately establish the remaining fee/registration qualifications and absence of both excluded events; synthetic sold-out/RSVP test data is never published. Final-head artifacts and validation are linked in the PR. A missing artifact is not a new pass.

- **UNVERIFIED:** physical iOS/Android, actual Safari application, VoiceOver/TalkBack and whole-site accessibility.
- **BLOCKED locally:** the earlier browser attempt hit process-socket/isolated-preview restrictions. No local browser pass is claimed; browser validation uses the exact-head GitHub Actions checkout.
- **NOT CLAIMED:** general production build/lint/typecheck, a release, live post-deployment validation, organizer contact or integration activation.
- Existing workflow rechecked: PR-only, named review branch, contents-read, exact-head checkout with no retained credentials, no deployment step. Browser tests block external action/analytics traffic. Main-only Pages history is not proof of hidden account/webhook configuration.

The owner-requested removal does not refresh source `verifiedAt`. [TASKS](TASKS.md#open-blockers-and-approvals) remains authoritative for owner decisions, manual QA and release gates.
