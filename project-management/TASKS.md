# FindEveryPark: tasks and release gates

Last verified: **2026-10-21 (UTC)**. Charles's flooring website remains Priority #1; this package is reviewed separately.

## Current status

- **Ready for owner review: YES**, as a bounded events package with the documented source/manual-QA caveats. Final owner content approval is pending.
- **Ready for launch: NO.** Review/disposition of remaining uncertainties, manual QA and explicit release approval are still needed.
- **Released from this review package: NO.** [PR #2](https://github.com/townsendjat-arch/findeverypark/pull/2) remains draft and unmerged. Implemented changes are not live functionality.
- Existing branch: `review/activate-events-october-2026`; code-tested commit: `7d9fcd5b52ae63b3987e829d09810527392f9b5f`.
- Observed `main`: `4cc92478c04cd281dc8d0cd2eab4b9f5627f8579`, last deployed by [2026-07-10 Pages run 29118368222](https://github.com/townsendjat-arch/findeverypark/actions/runs/29118368222). That is not this events package.
- The four-file tracking addition is documentation-only and creates a distinct head. [PR commits](https://github.com/townsendjat-arch/findeverypark/pull/2/commits) and [checks](https://github.com/townsendjat-arch/findeverypark/pull/2/checks) identify the current exact revision and its own result, separately from the code-tested baseline above.

## Completed development and source review

| Item | Development/review state | Release state | Evidence |
| --- | --- | --- | --- |
| October 21-November 1 event research | 13 source-checked proposed listings: Aurora 5, Centennial 3, Parker 2, Denver 3 | Not launched; caveats and content approval remain | [Listing/source report](../docs/events-review-2026-10-21.md), [structured audit](../docs/events-source-review-2026-10-21.json) |
| City selection and mobile behavior | URL aliases/history, current-only counts, empty states, keyboard/pressed state and 44px targets fixed and tested | Not launched | [Testing ledger](TESTING.md) |
| Expiry and calendar behavior | Shared America/Denver rules, exact/date-only expiry, DST, invalid-date handling and multi-session calendar behavior fixed and tested | Not launched | [Maintenance guide](../docs/event-system.md), tests |
| Existing homepage preview | Three-card preview remains below park discovery; shares manifest/expiry with city and events pages | Proposed changes not launched; no homepage redesign | [Review recommendation](../docs/events-review-2026-10-21.md#homepage-recommendation) |
| Browser/accessibility checks | 33/33 Chromium and 33/33 WebKit; scoped axe reported no violations | Not whole-site or real-device signoff | [Testing ledger](TESTING.md) |
| Project tracking | Four requested files added on the existing review branch; detailed reports preserved | Documentation only | [Maintenance instructions](../LINK-INSTRUCTIONS.md) |

## Open blockers and approvals

| ID | Gate and next action | Needed evidence/decision |
| --- | --- | --- |
| F1 | Owner review of the event content, presentation and existing PR package | Content/visual approval with the source qualifications below retained |
| F2 | Resolve or explicitly accept honest labeling of Goodson admission/registration, Hoofin's unpublished end and child processing fee, and Spooky Streets' community-source basis | Do not invent price, closing time or organizer verification. Hoofin uses date-only expiry and no calendar export; Spooky Streets' direct organizer page was inaccessible |
| F3 | Recheck time-sensitive sources near publication/event dates | Weather/cancellations, published prices, registration requirements and live inventory; a source link or successful test is not proof of available tickets |
| F4 | Complete physical iOS/Android and VoiceOver/TalkBack review; record disposition of manual findings | Playwright WebKit and viewport emulation are not real Safari/device/assistive-technology verification |
| F5 | Approve the exact release candidate and merge/deployment separately, with a rollback plan | New exact-head checks after any code/rebase change; no release authorized by the tracker |
| F6 | After authorized deployment, verify the released commit and live event/city/homepage behavior | Actual release evidence before marking these fixes launched |

For every listing's qualifications and the candidates held back for insufficient evidence, use the [existing source report](../docs/events-review-2026-10-21.md). The record's **13 source-checked listings** does not mean every field, live inventory or direct-organizer source is verified.

## Deferred and historical work

- **Near-me functionality: deferred and out of scope.** No implementation is authorized by this tracking request.
- **Sponsor work:** [the existing CSV](../docs/aurora-sponsor-outreach-tracker.csv) remains the single contact/status tracker, with [existing context](../docs/aurora-sponsor-outreach.md). Do not create a duplicate outreach list or contact anyone without approval.
- **Older April reports:** preserved as historical research/reviews, not proof of current release status or current facts. See [DECISIONS.md](DECISIONS.md#existing-documentation-and-history).
- **Future editor/importer/service work:** an option in the maintenance guide, not implemented or authorized here. No new provider is needed for the current static manifest workflow.

No further design/features, integrations, purchases, outside contact, merge or deployment is authorized. Next owner decision: review this PR separately from Charles's package and decide the source/manual-QA dispositions before any release decision.
