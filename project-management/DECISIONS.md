# FindEveryPark: decision log

Updated: **2026-10-21 (UTC)**. The narrow correction approval does not authorize release or new events; discovery improvements have a separate bounded draft-PR approval.

| Date | Decision and status | Consequence / evidence |
| --- | --- | --- |
| 2026-10-21 | APPROVED/IMPLEMENTED in a separate draft only: four bounded discovery changes | Real Friday–Sunday weekend preview; wrap existing narrow tiles; compact date filter with city/history; internal event anchors and accurate host/nearby park journey. Preserve park-first experience; no new events/parks/cities/section, merge or deploy |
| 2026-10-21 | VERIFIED FOR REVIEW, not released: discovery code head `d8c57f4` | [Exact-head CI](https://github.com/townsendjat-arch/findeverypark/actions/runs/39652020785) and screenshot inspection passed after the initial failed run; physical-device and existing narrow hero-overlap limits recorded in [TESTING](TESTING.md) |
| 2026-10-21 | STACKED REVIEW: discovery branch targets corrected PR #2 branch | Base `4247d0be71d913239a4a8cf42c8743218b1465b8`; independent discovery diff, explicit dependency. Keep corrections on PR #2 and require separate review/release decisions |
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
