# FindEveryPark: tasks and release gates

Updated: **2026-10-21 (UTC)**. Today's exception: FindEveryPark only, Charles paused. Separate project reviews and approvals remain required.

## Current status

- **Ready for owner review: YES**, subject to the exact-head test results in [TESTING](TESTING.md) and [PR #2](https://github.com/townsendjat-arch/findeverypark/pull/2). The correction pass retains 13 listings: Aurora 5, Centennial 3, Parker 2, Denver 3.
- **Ready for launch: NO.** Content/visual approval, manual-QA disposition, near-publication source checks and explicit release authorization remain outstanding.
- **Released: NO.** PR #2 remains draft and unmerged. Main remains `4cc92478c04cd281dc8d0cd2eab4b9f5627f8579`; this package is not the [July 10 Pages deployment](https://github.com/townsendjat-arch/findeverypark/actions/runs/29118368222).
- Branch: `review/activate-events-october-2026`. Corrected data/test revision: `f8d14df84967f59d5dab8d06119485f000b8480a`. A following tracking/backlog-only revision has its own SHA and CI, recorded in the [PR's final validation](https://github.com/townsendjat-arch/findeverypark/pull/2) and [checks](https://github.com/townsendjat-arch/findeverypark/pull/2/checks). Earlier runs do not establish later-head success.

## Status index

- **Completed:** the bounded corrections below, new regression coverage, dated source report/audit, and preservation of expansion research. No new event or discovery feature added.
- **In Progress:** exact-head validation is recorded in the verification ledger and PR; no additional implementation is implied by this tracker.
- **Pending:** publication-adjacent source/inventory checks, physical-device/assistive-technology QA and eventual post-release verification.
- **Blocked:** launch until the gates below are completed or explicitly dispositioned and release is approved.
- **Awaiting Approval:** final content/visual review, manual-QA risk disposition and exact-candidate merge/deployment. Sagebrush park-data correction and event expansion need separate approval. The four approved discovery improvements belong only in a separate draft PR.

## Completed correction scope

| Item | Corrected state | Evidence / release limit |
| --- | --- | --- |
| Parker Trunk or Treat | Prominent SOLD OUT in existing badge and first description sentence; attendee status, not vendor status. Registration/calendar CTAs removed; informational organizer link retained | Ticket Tailor checked October 21 at 17:18 UTC. No ticket availability claim |
| Hoofin' 5K | 5:30/5:35 p.m. cutoff conflict explicitly qualified; adult $22.45 and ages 4–14 $17.15 totals retained | Under-4 participant price and end unknown; date-only expiry and no calendar export preserved |
| Goodson | Fee/booking uncertainty in badge and preview-leading copy; adult 18+ accompaniment stated | Registration access denied; fee/rules/capacity unresolved. Not labeled free or walk-in |
| Violet Bridge | Required family RSVP and missing signup link in badge and preview-leading copy | Capacity unresolved; expressly no assumed walk-in admission |
| Spooky Streets | Direct organizer URL/provenance now confirms October 23, 4:30–7:30 p.m., free, Commons Park along Commons Avenue | Prior organizer-source blocker resolved; no public-park classification inferred |
| Zoo and Nick's | Youth ages 3–15, free infant timed-ticket requirement, narrowly sampled availability and ticket-heading conflict qualified; wristband is one use each of four named attractions | No inventory guarantee or unlimited-ride implication |
| Scope preserved | Existing 13 records, legacy archive, city filters, expiry/DST behavior, park-first homepage and three-card cap | No layout/runtime, park-record, workflow, hosting, discovery or new-event changes |

Full sources and qualifications: [existing listing report](../docs/events-review-2026-10-21.md), [structured audit](../docs/events-source-review-2026-10-21.json). Software evidence: [TESTING](TESTING.md). Retaining Goodson and Violet Bridge is recommended because the unresolved requirements are visible on both full and shortened cards, not hidden behind expansion or a booking CTA. These unknowns are not claimed resolved.

## Open blockers and approvals

| ID | Gate and next action | Needed evidence/decision |
| --- | --- | --- |
| F1 | Review corrected content and presentation | Owner content/visual approval; keep sold-out and unresolved-requirement warnings |
| F2 | Review remaining source limitations | Goodson fee/booking/capacity; Violet Bridge RSVP route/capacity; Hoofin cutoff, under-4 price and end; zoo ticket-heading conflict. Accept honest qualifications or request holds |
| F3 | Recheck time-sensitive sources near publication/events | Cancellations, weather, prices, booking rules and inventory. Point-in-time checks are not future guarantees |
| F4 | Complete physical iOS/Android and VoiceOver/TalkBack review, or explicitly accept residual risk | Automated browser engines and viewports do not establish real-device or assistive-technology signoff |
| F5 | Approve exact release candidate, merge/deployment and rollback plan separately | New checks after later code/rebase changes. No release authorization supplied |
| F6 | After authorized deployment, verify released commit and live events/city/homepage behavior | Actual release and live-verification evidence before marking launched |
| F7 | High priority: Sagebrush playground accuracy | Approve a dated playground-unavailable warning based on Aurora's safety closure/removal notice. Do not mark the entire park closed. Recommendation only; no park record changed |

## Preserved future work

- **October, November and December only:** event-content priorities. The [expansion backlog](../docs/events-review-2026-10-21.md#future-research-backlog-front-range-expansion) preserves October Front Range events and event-connected parks for separate consideration; it does not establish verified November/December coverage or authorize additions.
- **Separate approved discovery draft PR:** correct the existing Friday–Sunday Colorado-time preview (maximum three matching events); wrap/stack existing narrow-screen homepage tiles; add the compact All upcoming / This weekend / October / November / December 2026 date control while preserving city/URL/history; distinguish actual park hosts from optional nearby stops and add one contextual city-events link on park profiles. No new listings, homepage section or unrelated features. None is implemented in PR #2; preserve park discovery first.
- **Sagebrush and other park research:** recommendation/evidence in the same backlog; no park record or photo changes. Public-access, amenity, coordinate and photo-rights gaps remain explicit.
- **Near-me, importers and future services:** deferred; no new service required for static manifest maintenance.
- **Sponsor work:** retain the [existing CSV](../docs/aurora-sponsor-outreach-tracker.csv) as the single outreach tracker and [context](../docs/aurora-sponsor-outreach.md). No outside contact authorized.
- **Historical April reports:** preserved as snapshots, not current release evidence. See [DECISIONS](DECISIONS.md#existing-documentation-and-history).

Next decision: review the corrected PR and manual/source qualifications. Merge/deployment remains a separate exact-candidate approval. No purchases, integrations, outside contact or new events authorized. Discovery changes remain scoped to the separately approved draft PR, not PR #2.
