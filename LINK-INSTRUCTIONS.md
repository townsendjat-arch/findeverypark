# Project maintenance instructions

Last updated: **2026-10-21 (UTC)**. This guide organizes authorized work and does not grant new action permissions.

## Start here

1. [TASKS](project-management/TASKS.md): current review/launch state, completed work, blockers and deferred items.
2. [TESTING](project-management/TESTING.md): exact code-tested revision, browser/Node/source evidence and verification limits.
3. [DECISIONS](project-management/DECISIONS.md): decisions and links to current versus historical documents.
4. [Existing PR #2](https://github.com/townsendjat-arch/findeverypark/pull/2), [event maintenance guide](docs/event-system.md), [dated listing report](docs/events-review-2026-10-21.md), [JSON source audit](docs/events-source-review-2026-10-21.json), [photo guide](docs/photo-system.md).

## Scope and source-of-truth rules

- October 21 exception: FindEveryPark work only; Charles is paused today. This does not reverse the broader priority order. Review project packages separately.
- Current Priority 1 content work uses `review/priority-one-halloween-2026`, based directly on freshly checked main `3a12e7b6bffad111c3a44a5ac25f7bf0c4aa73be` (merged PR #4). Read remote head and working-tree changes first. Leave draft PR #3 and its older base unchanged; do not copy or cherry-pick its discovery work.
- Current authorization: only the approved Priority 1 shortlist, now 11 additions after the owner agreed to hold Kiddie Academy and retain Hallelujah with unconfirmed optional-RSVP availability, the required event-city metadata for Castle Rock, Greenwood Village and Littleton, focused regression/browser tests and review evidence in a new draft PR. Preserve all 47 existing record objects, six pumpkin records and Nick’s single ID. No redesign/features, park datasets, merge, deployment or preview publication is authorized.
- NAPA is conditional on a separately approved release being live by October 22, 2026 at 5 p.m. MDT (23:00 UTC). This is an editorial lead-time gate, not an attendee deadline. If missed, omit NAPA rather than substitute another event. Recheck sources and exact release scope before seeking publication approval. All other new facts must remain source-backed and visibly qualified.
- Use `data/events/events-manifest.js` as the single events source. Follow the existing maintenance guide rather than hand-editing HTML cards or inventing another event system. The park-first homepage and existing three-card preview are intentional.
- Keep unknown costs/end times/registration rules and source provenance explicit. Never infer available tickets from a link. A date-only expiry does not invent an end time. Change `verifiedAt` only after an actual source recheck.
- Keep the existing sponsor CSV as the single outreach tracker. Older April reports are historical snapshots, not fresh approvals or proof of launch.
- Never place private contact information, credentials or unneeded personal data in these public tracking files.

## Maintain evidence without duplication

Update these files alongside authorized progress, using exact PR/branch/commit, verification date/time zone, result and evidence link. Keep detailed source records, test methods and architecture in their existing documents. Do not change a source verification date merely because documentation changed.

Distinguish implemented, tested, ready for review, approved, released and post-release verified. Record blocked, failed and never-run checks honestly. Browser-engine/mobile viewport tests are not real-device or screen-reader signoff; scoped axe is not whole-site certification. A successful build/test does not establish live registration inventory or release approval.

Before a push, inspect workflow/deployment triggers, confirm every changed path is within the current authorization, validate links/whitespace and preserve unrelated production/workflow files. Publish only to the new Priority 1 review branch after checking its current head. The existing test-only workflow may add only this branch to its allowlist; do not expand permissions or change deployment settings. Verify the remote SHA and any triggered CI through terminal status on that exact SHA; report new documentation heads separately from earlier tested code. PR checks and commit history identify the containing revision without a self-referential hash inside its own content.

Do not add a scheduled maintenance service or automation merely because the event guide describes weekly work. For any future authorized source/data edit, follow that guide, rerun affected tests and preserve manual/source limitations. Before marking launch-ready, resolve or explicitly disposition the [remaining gates](project-management/TASKS.md#open-blockers-and-approvals) and obtain owner approval for the exact release. After authorized deployment, record actual release and live-verification evidence.
