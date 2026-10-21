# FindEveryPark: decision log

Updated: **2026-10-21 (UTC)**. The six-listing pumpkin draft and test-gated owner-only preview are approved; production release and the separate discovery PR remain distinct.

## Pumpkin implementation decision, October 21, 2026

The owner approved all six researched listings and the decision-first card structure in a new draft PR against current main. Nick must retain its canonical ID, material uncertainty must remain visible, and implementation does not authorize merge or deployment. The owner requires an interactive preview before final release approval.

- Build directly from main `d178a64ebb896ec1b1e9f66429c46796004a3fe9`; do not change/import PR #3 (`ceb3f2873eb79aea8b92c1082687ea68c82218f7`). Implement the smallest pumpkin-specific occurrence extension using main's Colorado expiry rules.
- The date control in the proposal was conditional on adoption of PR #3. It remains absent here; category + existing city/history is implemented independently. A future integration needs explicit compatibility review, not silent duplication.
- Add event geography only for Erie, Platteville, Kiowa and Louisville. Thornton/Aurora already exist. No extra candidate or park dataset is authorized.
- Keep Anderson's published dates as qualified research, never confirmed opening/availability. Exclude it from promotional previews while the conflict remains.
- Miller's October 31 coverage endpoint is editorial; the organizer's approximate mid-November season end is not converted into an invented date.
- Extend only the existing test workflow's branch allowlist, with no permission or deployment changes. Browser network tests remain read-only.

### Follow-up review decisions

- The owner approved updating only the existing owner-only preview after all release-related checks pass. No production deployment, merge, new preview host or wider access is authorized.
- The owner accepted unchanged homepage tile overflow as a documented pre-existing main issue, still owned by PR #3. Compare the exact main baseline and preserve strict Events/preview-module mobile bounds; do not import the separate tile fix.
- PR #4 is the six-listing review deliverable. Final content/visual approval, near-publication source checks, real-device/assistive-technology disposition and exact production release approval remain outstanding.

## Historical decisions before the pumpkin approval

| Date | Decision and status | Consequence / evidence |
| --- | --- | --- |
| 2026-10-21 | IMPLEMENTED for review: use the existing shared events manifest and static workflow | No new backend/provider/service. [Event maintenance guide](../docs/event-system.md) |
| 2026-10-21 | PRESERVED: park discovery first, with the existing three-card events preview below it | No carousel, hero promotion, modal or homepage redesign. [Review report](../docs/events-review-2026-10-21.md#homepage-recommendation) |
| 2026-10-21 | IMPLEMENTED for review: shared America/Denver expiry, current-event filters/history and corrected calendar behavior | Exact/date-only/DST/multi-session behavior tested on the recorded code head; not yet deployed. [Testing ledger](TESTING.md) |
| 2026-10-21 | SOURCE REVIEW: 13 proposed listings with explicit uncertainty labels; insufficiently supported candidates held back | Source-checked does not mean ticket availability, complete fields or independent organizer confirmation for every listing. [Source report](../docs/events-review-2026-10-21.md), [JSON audit](../docs/events-source-review-2026-10-21.json) |
| 2026-10-21 | DEFERRED: near-me work and any future spreadsheet/CSV importer | Not part of this PR or authorized tracking update |
| 2026-10-21 | APPROVED: four-file tracking structure on the existing review branch | Reuse/link documentation; keep development, review approval and launch separate; keep exact evidence/date records current |
| 2026-10-21 | DATED EXCEPTION: FindEveryPark only today; Charles paused today | Broader priority order and separate project release approvals preserved |
| 2026-10-21 | NOT APPROVED: further design/features, merge/deploy, integrations, purchases or outside contact | No organizer/sponsor contact or service activation under this task |
| 2026-10-21 | APPROVED: narrow corrections to the existing 13 October listings, tests and tracker | Parker sold out; Hoofin cutoff/prices; prominent Goodson/Violet warnings; Spooky organizer provenance; zoo/Nick precision. [Source report](../docs/events-review-2026-10-21.md) |
| 2026-10-21 | HISTORICAL: initially retained all 13 records; superseded for Parker by the owner-requested removal below | Goodson and Violet retained with warnings visible in full and short cards; unresolved requirements stay explicit |
| 2026-10-21 | RECOMMENDATION ONLY: Sagebrush playground warning and expansion park research | No park record/photo edits. [Preserved backlog](../docs/events-review-2026-10-21.md#future-research-backlog-front-range-expansion) |
| 2026-10-21 | CONTENT PRIORITIES: October, November and December only | No new month/event content added by this correction pass |
| 2026-10-21 | SEPARATELY APPROVED: four discovery improvements in a distinct draft PR | Correct weekend membership, wrap/stack existing mobile tiles, compact 2026 date control, and accurate park connections/contextual link. Preserve city/URL/history and park-first design. No new events/sections, merge or deploy; none implemented in PR #2 |
| 2026-10-21 | OWNER REQUEST: remove sold-out Parker Trunk or Treat from the candidate | 12 active listings at that checkpoint; source evidence retained only in held-back audit/report history. No replacement event, merge or deployment |
| 2026-10-21 | OWNER DECISION: hold Violet Bridge until a functioning RSVP route is verified; keep Goodson warnings and Hoofin qualifications | Final candidate has 11 active listings. Both Parker records remain in held-back history only; no new listings, merge or deploy |

## Existing documentation and history

Preserve these sources instead of creating parallel plans or trackers:

- [Documentation index](../docs/README.md), [event-system guide](../docs/event-system.md) and [photo-system guide](../docs/photo-system.md): existing architecture/maintenance references.
- [October event review](../docs/events-review-2026-10-21.md) and [structured audit](../docs/events-source-review-2026-10-21.json): current package's dated source evidence.
- [Sponsor outreach CSV](../docs/aurora-sponsor-outreach-tracker.csv): the single sponsor/contact-status tracker; [outreach context](../docs/aurora-sponsor-outreach.md) is supporting background, not new contact authorization.
- [April 17 growth review](../docs/aurora-growth-review-2026-04-17.md), [April 21 task review](../docs/aurora-task-14-review-2026-04-21.md) and [April 21 project report](../docs/findeverypark-report-2026-04-21.md): historical snapshots, not current release or source-verification evidence.
- [Parker parks research](../docs/parker-public-parks-research.md): background research; recheck facts before using them for a new change.

## Pending owner decisions

Review the events PR and source qualifications, record the manual-QA disposition, and approve an exact release candidate/merge/deployment separately if desired. The gate list lives in [TASKS.md](TASKS.md), not a duplicate plan here. Add dated decisions with scope and evidence as work progresses; do not silently turn a recommendation or implementation into owner approval.
