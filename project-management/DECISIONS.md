# FindEveryPark: decision log

Updated: **2026-10-21 (UTC)**. Approval to create tracking documentation does not approve a release or additional features.

| Date | Decision and status | Consequence / evidence |
| --- | --- | --- |
| 2026-10-21 | IMPLEMENTED for review: use the existing shared events manifest and static workflow | No new backend/provider/service. [Event maintenance guide](../docs/event-system.md) |
| 2026-10-21 | PRESERVED: park discovery first, with the existing three-card events preview below it | No carousel, hero promotion, modal or homepage redesign. [Review report](../docs/events-review-2026-10-21.md#homepage-recommendation) |
| 2026-10-21 | IMPLEMENTED for review: shared America/Denver expiry, current-event filters/history and corrected calendar behavior | Exact/date-only/DST/multi-session behavior tested on the recorded code head; not yet deployed. [Testing ledger](TESTING.md) |
| 2026-10-21 | SOURCE REVIEW: 13 proposed listings with explicit uncertainty labels; insufficiently supported candidates held back | Source-checked does not mean ticket availability, complete fields or independent organizer confirmation for every listing. [Source report](../docs/events-review-2026-10-21.md), [JSON audit](../docs/events-source-review-2026-10-21.json) |
| 2026-10-21 | DEFERRED: near-me work and any future spreadsheet/CSV importer | Not part of this PR or authorized tracking update |
| 2026-10-21 | APPROVED: four-file tracking structure on the existing review branch | Reuse/link documentation; keep development, review approval and launch separate; keep exact evidence/date records current |
| 2026-10-21 | PRIORITY / review sequencing: Charles remains Priority #1; review existing project PR packages separately | No coupled release decision |
| 2026-10-21 | NOT APPROVED: further design/features, merge/deploy, integrations, purchases or outside contact | No organizer/sponsor contact or service activation under this task |

## Existing documentation and history

Preserve these sources instead of creating parallel plans or trackers:

- [Documentation index](../docs/README.md), [event-system guide](../docs/event-system.md) and [photo-system guide](../docs/photo-system.md): existing architecture/maintenance references.
- [October event review](../docs/events-review-2026-10-21.md) and [structured audit](../docs/events-source-review-2026-10-21.json): current package's dated source evidence.
- [Sponsor outreach CSV](../docs/aurora-sponsor-outreach-tracker.csv): the single sponsor/contact-status tracker; [outreach context](../docs/aurora-sponsor-outreach.md) is supporting background, not new contact authorization.
- [April 17 growth review](../docs/aurora-growth-review-2026-04-17.md), [April 21 task review](../docs/aurora-task-14-review-2026-04-21.md) and [April 21 project report](../docs/findeverypark-report-2026-04-21.md): historical snapshots, not current release or source-verification evidence.
- [Parker parks research](../docs/parker-public-parks-research.md): background research; recheck facts before using them for a new change.

## Pending owner decisions

Review the events PR and source qualifications, record the manual-QA disposition, and approve an exact release candidate/merge/deployment separately if desired. The gate list lives in [TASKS.md](TASKS.md), not a duplicate plan here. Add dated decisions with scope and evidence as work progresses; do not silently turn a recommendation or implementation into owner approval.
