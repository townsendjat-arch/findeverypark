# FindEveryPark: tasks and release gates

Updated: **2026-10-21 (UTC)**. Today's exception: FindEveryPark only, Charles paused. Separate project reviews and approvals remain required.

## Current pumpkin draft status

- **Implementation in progress:** six pumpkin decision cards in the existing Holiday & Seasonal Events experience; exactly 16 reviewed canonical records (the released 11 plus five new records, with Nick enriched in place).
- Baseline verified **October 21, 2026 (UTC)**: main `d178a64ebb896ec1b1e9f66429c46796004a3fe9`, merged PR #2. New branch: `review/six-pumpkin-patches-2026`.
- **Ready for launch: NO.** New draft PR, final-head CI, interactive preview/content review, manual-QA disposition, near-publication source checks and exact release approval are distinct gates. No merge/deploy authorized by implementation approval.
- **PR #3 remains separate:** `ceb3f2873eb79aea8b92c1082687ea68c82218f7` was not imported or changed. Its date/weekend/discovery features remain deferred here. Category + existing city/history is the bounded navigation change.
- Anderson's conflicting closed banner stays visible in Events but excludes it from homepage/city recommendations. Miller's actual season end remains unknown; October 31 is an editorial verified-date coverage boundary, not a published closing date. Every other pricing/booking/cutoff uncertainty stays visible.
- Current six-listing sources and data snapshot: [pumpkin source review](../docs/pumpkin-source-review-2026-10-21.json). The original 11-record source audit remains historical and unchanged.
- Test results for the containing revision are tracked in [TESTING](TESTING.md) and its exact PR checks. Browser viewports are not physical iPhone, Android or assistive-technology signoff.

## Historical PR #2 status at the prior tracking update

The entries below record the pre-release review state and are superseded by the verified main baseline above; they do not describe the current pumpkin draft.

### Prior current status

- **Ready for owner review: YES**, subject to the exact-head test results in [TESTING](TESTING.md) and [PR #2](https://github.com/townsendjat-arch/findeverypark/pull/2). The correction pass now contains 11 listings: Aurora 5, Centennial 3, Parker 0, Denver 3. Parker Trunk or Treat is removed and Violet Bridge held at the owner's request.
- **Ready for launch: NO.** Content/visual approval, manual-QA disposition, near-publication source checks and explicit release authorization remain outstanding.
- **Released: NO.** PR #2 remains draft and unmerged. Main remains `4cc92478c04cd281dc8d0cd2eab4b9f5627f8579`; this package is not the [July 10 Pages deployment](https://github.com/townsendjat-arch/findeverypark/actions/runs/29118368222).
- Branch: `review/activate-events-october-2026`. The previous 13-listing revision was `382bacc9562142cb70385e937451e343c45f5686`. The owner-requested removal and hold create a new 11-listing revision; its exact SHA and terminal CI are recorded in [PR final validation](https://github.com/townsendjat-arch/findeverypark/pull/2) and [checks](https://github.com/townsendjat-arch/findeverypark/pull/2/checks). Earlier runs do not establish later-head success.

## Status index

- **Completed:** the bounded corrections below, new regression coverage, dated source report/audit, and preservation of expansion research. No new event or discovery feature added.
- **In Progress:** exact-head validation is recorded in the verification ledger and PR; no additional implementation is implied by this tracker.
- **Pending:** publication-adjacent source/inventory checks, physical-device/assistive-technology QA and eventual post-release verification.
- **Blocked:** launch until the gates below are completed or explicitly dispositioned and release is approved.
- **Awaiting Approval:** final content/visual review, manual-QA risk disposition and exact-candidate merge/deployment. Sagebrush park-data correction and event expansion need separate approval. The four approved discovery improvements belong only in a separate draft PR.

## Completed correction scope

| Item | Corrected state | Evidence / release limit |
| --- | --- | --- |
| Parker Trunk or Treat | Removed from active manifest at owner's request; complete source record retained in held-back audit/history, not rendered | Ticket Tailor checked October 21 at 17:18 UTC. No ticket availability claim |
| Hoofin' 5K | 5:30/5:35 p.m. cutoff conflict explicitly qualified; adult $22.45 and ages 4–14 $17.15 totals retained | Under-4 participant price and end unknown; date-only expiry and no calendar export preserved |
| Goodson | Fee/booking uncertainty in badge and preview-leading copy; adult 18+ accompaniment stated | Registration access denied; fee/rules/capacity unresolved. Not labeled free or walk-in |
| Violet Bridge | Held outside the active manifest until a functioning family RSVP route is verified; complete source history retained | No attendee signup route/capacity established; not rendered or offered as walk-in |
| Spooky Streets | Direct organizer URL/provenance now confirms October 23, 4:30–7:30 p.m., free, Commons Park along Commons Avenue | Prior organizer-source blocker resolved; no public-park classification inferred |
| Zoo and Nick's | Youth ages 3–15, free infant timed-ticket requirement, narrowly sampled availability and ticket-heading conflict qualified; wristband is one use each of four named attractions | No inventory guarantee or unlimited-ride implication |
| Scope preserved | 11 active records after the requested removal and hold, legacy archive, city filters, expiry/DST behavior, park-first homepage and three-card cap | No layout/runtime, park-record, workflow, hosting, discovery or new-event changes |

Full sources and qualifications: [existing listing report](../docs/events-review-2026-10-21.md), [structured audit](../docs/events-source-review-2026-10-21.json). Software evidence: [TESTING](TESTING.md). Goodson remains with prominent fee/booking warnings and Hoofin with verified prices/qualified registration, as requested. Violet Bridge is held until a functioning RSVP route is verified. No unresolved fact is claimed resolved.

## Open blockers and approvals

| ID | Gate and next action | Needed evidence/decision |
| --- | --- | --- |
| F1 | Review corrected content and presentation | Owner content/visual approval; confirm sold-out removal and preserve unresolved-requirement warnings |
| F2 | Review remaining source limitations | Goodson fee/booking/capacity; Hoofin cutoff, under-4 price and end; zoo ticket-heading conflict. Keep honest qualifications; do not restore Violet Bridge without verifying a functioning RSVP route |
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
