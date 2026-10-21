# Project maintenance instructions

Last updated: **2026-10-21 (UTC)**. This guide organizes authorized work and does not grant new action permissions.

## Start here

1. [TASKS](project-management/TASKS.md): current review/launch state, completed work, blockers and deferred items.
2. [TESTING](project-management/TESTING.md): exact code-tested revision, browser/Node/source evidence and verification limits.
3. [DECISIONS](project-management/DECISIONS.md): decisions and links to current versus historical documents.
4. [Existing PR #2](https://github.com/townsendjat-arch/findeverypark/pull/2), [event maintenance guide](docs/event-system.md), [dated listing report](docs/events-review-2026-10-21.md), [JSON source audit](docs/events-source-review-2026-10-21.json), [photo guide](docs/photo-system.md).

## Scope and source-of-truth rules

- October 21 exception: FindEveryPark work only; Charles is paused today. This does not reverse the broader priority order. Review project packages separately.
- Current pumpkin work uses `review/six-pumpkin-patches-2026`, based directly on main `d178a64ebb896ec1b1e9f66429c46796004a3fe9` (merged PR #2). Read remote head and working-tree changes first. Leave draft PR #3 and its branch unchanged; do not copy or cherry-pick its discovery work.
- Current authorization: six pumpkin decision cards inside Events, Nick reused, plus focused tests and maintenance evidence in a new draft PR. No merge or production deployment. The owner subsequently approved updating the existing owner-only interactive preview after exact-head tests pass; this does not authorize production release. No new park datasets, homepage sections, outside contact, registrations, purchases or integrations. Near-me and PR #3 date/weekend features remain separate.
- Use `data/events/events-manifest.js` as the single events source. Follow the existing maintenance guide rather than hand-editing HTML cards or inventing another event system. The park-first homepage and existing three-card preview are intentional.
- Keep unknown costs/end times/registration rules and source provenance explicit. Never infer available tickets from a link. A date-only expiry does not invent an end time. Change `verifiedAt` only after an actual source recheck.
- Keep the existing sponsor CSV as the single outreach tracker. Older April reports are historical snapshots, not fresh approvals or proof of launch.
- Never place private contact information, credentials or unneeded personal data in these public tracking files.

## Maintain evidence without duplication

Update these files alongside authorized progress, using exact PR/branch/commit, verification date/time zone, result and evidence link. Keep detailed source records, test methods and architecture in their existing documents. Do not change a source verification date merely because documentation changed.

Distinguish implemented, tested, ready for review, approved, released and post-release verified. Record blocked, failed and never-run checks honestly. Browser-engine/mobile viewport tests are not real-device or screen-reader signoff; scoped axe is not whole-site certification. A successful build/test does not establish live registration inventory or release approval.

Before a push, inspect workflow/deployment triggers, confirm every changed path is within the current authorization, validate links/whitespace and preserve unrelated production/workflow files. Publish only to the new pumpkin review branch after checking its current head. The existing test-only workflow may add only this branch to its allowlist; do not expand permissions or change deployment settings. Verify the remote SHA and any triggered CI through terminal status on that exact SHA; report new documentation heads separately from earlier tested code. PR checks and commit history identify the containing revision without a self-referential hash inside its own content.

Do not add a scheduled maintenance service or automation merely because the event guide describes weekly work. For any future authorized source/data edit, follow that guide, rerun affected tests and preserve manual/source limitations. Before marking launch-ready, resolve or explicitly disposition the [remaining gates](project-management/TASKS.md#open-blockers-and-approvals) and obtain owner approval for the exact release. After authorized deployment, record actual release and live-verification evidence.
