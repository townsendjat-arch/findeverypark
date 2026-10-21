# FindEveryPark: verification ledger

Updated: **2026-10-21 (UTC)**. Current scope: six pumpkin cards and 16 reviewed canonical records; prior 11-listing release evidence is retained below. This is not whole-site certification.

## Readability continuation (current)

The October 21 owner-requested copy pass uses first-pass head `57b28792ba1fea69bc8b6426a8f0ed8768b2c62b` as its immutable before/after baseline. Additive display fields shorten collapsed cards; every prior source field and all 47 records are regression-checked unchanged. Visible prices, visit-blocking warnings and cutoffs remain explicit; secondary explanations move to details. Local Node: 20/20 passing. Exact-head browser results, both-width height/word comparisons and updated screenshots are pending and must pass before the existing owner-only preview is updated.

## Completed first pumpkin draft validation

- Baseline: main `d178a64ebb896ec1b1e9f66429c46796004a3fe9`; branch `review/six-pumpkin-patches-2026`. [Draft PR #4](https://github.com/townsendjat-arch/findeverypark/pull/4) and its exact-head checks identify the containing revision; never substitute a previous SHA's checks.
- Focused Node coverage: released 11-ID preservation (ten records unchanged and deliberate Nick enrichment), six pumpkin records/16 total, source snapshot equality, explicit occurrence metadata, closed weekdays, individual sold-out/cancelled dates, gate versus activity cutoffs, final expiry, November 1 MST, unknown Miller end, pricing/booking warnings and safe official URLs.
- Chromium/WebKit coverage: prior regression suite plus six unique pumpkin cards, visible picking/cost/warning fields outside disclosures, category/city query and Back/Forward/anchors, unsupported-city park-link absence, empty results, keyboard interaction, in-tab next-occurrence changes, 320/390/1440 widths, scoped axe, deterministic October 21 screenshots.
- Local Node checks passed 18/18 under UTC, America/Los_Angeles and Asia/Tokyo (54 executions, zero failures/skips), repeated on `968a4f8411db372b0d7f2e5bb40aa1ea1cc0121c`. Code/test head browser CI passed as recorded below. npm dependencies installed with a writable temporary cache; local browser execution could not start because the browser binary was absent, and a supported installer download returned invalid/truncated ZIP bytes. No local browser pass or production verification is claimed. The documentation-only containing revision must also have green exact-head PR checks before preview handoff.
- Existing GitHub Actions remains pull-request-only, contents-read, exact-head checkout, no retained credentials or deployment step. The only workflow change extends its branch condition with `review/six-pumpkin-patches-2026`.
- No PR #3 code, date filter, homepage layout, park datasets, dependency versions, hosting settings, production branch or deployment configuration changed. Preview is a separate parent-coordinated approval, not release authorization.

### Completed code/test validation

- **PASS**, October 21, 2026 at 20:23 UTC: `968a4f8411db372b0d7f2e5bb40aa1ea1cc0121c`, [run 39669630609](https://github.com/townsendjat-arch/findeverypark/actions/runs/39669630609), **87/87 Chromium + 87/87 Playwright WebKit**, with **18/18 Node in each job**. No failures or skipped browser checks. Desktop 1440×1000, mobile 390×844 and narrow 320×740; deterministic October 21, 2026 baseline.
- Screenshots and axe/baseline JSON: [Chromium artifact](https://github.com/townsendjat-arch/findeverypark/actions/runs/39669630609/artifacts/12379735957), [WebKit artifact](https://github.com/townsendjat-arch/findeverypark/actions/runs/39669630609/artifacts/12379606098). GitHub retains these for seven days. The entire six-card set, collapsed warnings, separate costs, filters and disclosures are exercised at every viewport. Scoped axe reports pass, not whole-site certification.
- The last source research remains October 21 at 19:42–19:44:53 UTC, not the software-test time. Source coverage is the researched 2026 season; undated seventh-generation price examples remain explicitly unverified for 2026. Miller is enumerated only through October 31; additional November dates are **not yet verified**, not a confirmed season end. November 1 is verified/tested for Seventh Generation with MST offsets.
- No runtime/data change follows this validated code/test head in the final tracking update. Nevertheless the documentation-only containing revision has its own [exact-head checks](https://github.com/townsendjat-arch/findeverypark/pull/4/checks), which must pass before the owner-only preview is updated. Release/merge remains unauthorized.

### Initial pumpkin CI and scoped correction

[Run 39667510771](https://github.com/townsendjat-arch/findeverypark/actions/runs/39667510771) on `6d999fb419a99fb4cb0ef233cab04a72b723dea2`: 18/18 Node in both jobs; Chromium 85/87 and WebKit 85/87. Both failures were the newly added whole-homepage overflow assertion at 390/320px on the Erie fallback route, not Anderson exclusion or pumpkin-card layout. All Events/category/price/warning/DST/accessibility checks passed in that run; this is not a final-head all-pass claim.

The corrective test compares exact main `d178a64` homepage/data/shared rules with the candidate at identical dates, URLs and viewports, logs out-of-bounds elements, and requires no increased whole-page width. It separately requires the changed preview section/cards to fit the viewport and have no internal horizontal overflow. Existing city/intent-tile wrapping remains owned by PR #3, not silently imported here. [Comparison run 39669204708](https://github.com/townsendjat-arch/findeverypark/actions/runs/39669204708) on `2620be96bc05a61fba5fd2c507b2828867fade2a` measured identical candidate/main width at both 390px and 320px: **436px in Chromium, 434px in WebKit**. Candidate preview section bounds were 24–366px / 24–296px; preview-card bounds 43–347px / 43–277px, with scrollWidth equal to clientWidth. The inherited 390px offenders are intent tiles; 320px includes city and intent tiles. The first comparator incorrectly expected a city-tile culprit at both widths, producing one diagnostic-test failure in each engine (Chromium 86/87 and WebKit 86/87), not a new UI regression. That diagnostic now recognizes both inherited tile families without relaxing exact-main or preview bounds assertions. The owner explicitly accepted unchanged baseline overflow remaining separate in PR #3. The corrected code/test head passed the complete rerun below.

## Historical PR #2 evidence

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
