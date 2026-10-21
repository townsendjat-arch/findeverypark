# Project maintenance instructions

Last updated: **2026-10-21 (UTC)**. This guide organizes authorized work and does not grant new action permissions.

## Start here

1. [TASKS](project-management/TASKS.md): current review/launch state, completed work, blockers and deferred items.
2. [TESTING](project-management/TESTING.md): exact code-tested revision, browser/Node/source evidence and verification limits.
3. [DECISIONS](project-management/DECISIONS.md): decisions and links to current versus historical documents.
4. [Existing PR #2](https://github.com/townsendjat-arch/findeverypark/pull/2), [event maintenance guide](docs/event-system.md), [dated listing report](docs/events-review-2026-10-21.md), [JSON source audit](docs/events-source-review-2026-10-21.json), [photo guide](docs/photo-system.md).

## Scope and source-of-truth rules

- October 21 exception: FindEveryPark work only; Charles is paused today. This does not reverse the broader priority order. Review project packages separately.
- Use existing branch `review/activate-events-october-2026` and PR #2. Read remote head and working-tree changes first; preserve concurrent work.
- Current authorization: narrowly correct the original 13 October listings and remove sold-out Parker Trunk or Treat at the owner's request (12 active listings), rerun affected tests, update this tracker, preserve separate expansion research and recommend a Sagebrush data correction without editing its park record. No new events/features or discovery implementation in PR #2. Four discovery improvements are approved only in a separate draft PR, preserving park-first navigation and design. October, November and December are the only event-content priorities. No merge/deploy, integration activation, purchases or outside contact without approval. Near-me remains deferred.
- Use `data/events/events-manifest.js` as the single events source. Follow the existing maintenance guide rather than hand-editing HTML cards or inventing another event system. The park-first homepage and existing three-card preview are intentional.
- Keep unknown costs/end times/registration rules and source provenance explicit. Never infer available tickets from a link. A date-only expiry does not invent an end time. Change `verifiedAt` only after an actual source recheck.
- Keep the existing sponsor CSV as the single outreach tracker. Older April reports are historical snapshots, not fresh approvals or proof of launch.
- Never place private contact information, credentials or unneeded personal data in these public tracking files.

## Maintain evidence without duplication

Update these files alongside authorized progress, using exact PR/branch/commit, verification date/time zone, result and evidence link. Keep detailed source records, test methods and architecture in their existing documents. Do not change a source verification date merely because documentation changed.

Distinguish implemented, tested, ready for review, approved, released and post-release verified. Record blocked, failed and never-run checks honestly. Browser-engine/mobile viewport tests are not real-device or screen-reader signoff; scoped axe is not whole-site certification. A successful build/test does not establish live registration inventory or release approval.

Before a push, inspect workflow/deployment triggers, confirm every changed path is within the current authorization, validate links/whitespace and preserve unrelated production/workflow files. Publish only to the existing authorized review branch after checking the current head. Verify the remote SHA and any triggered CI through terminal status on that exact SHA; report new documentation heads separately from earlier tested code. PR checks and commit history identify the containing revision without a self-referential hash inside its own content.

Do not add a scheduled maintenance service or automation merely because the event guide describes weekly work. For any future authorized source/data edit, follow that guide, rerun affected tests and preserve manual/source limitations. Before marking launch-ready, resolve or explicitly disposition the [remaining gates](project-management/TASKS.md#open-blockers-and-approvals) and obtain owner approval for the exact release. After authorized deployment, record actual release and live-verification evidence.
