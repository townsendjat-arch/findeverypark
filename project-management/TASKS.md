# FindEveryPark: tasks and release gates

## Current map-usability draft

Owner-authorized priorities 1 and 2 are isolated on `fix/park-selection-accessibility`, based on main `0ed9598`: exact-ID selection, exact-coordinate chooser and popup contrast/readability. Priority 3 stays research-only. No dataset/SEO/PR #3 changes or merge/deployment authorization. Review evidence and remaining gates: [map selection](MAP_SELECTION_ACCESSIBILITY.md).

Updated: **2026-10-21 (UTC)**. Today's exception: FindEveryPark only, Charles paused. Separate project reviews and approvals remain required.

## Current Priority 1 draft, October 21

- The owner approved the revised 12-event first release in its explicit implementation order, with NAPA conditional. The candidate is based on main `3a12e7b6bffad111c3a44a5ac25f7bf0c4aa73be`, including merged PR #4; prior pumpkin-draft states below are historical, not the current release state.
- Scope: 11 event additions from the approved 12, plus only `castle_rock`, `greenwood_village` and `littleton` event-city metadata. All original 47 objects, 30 archived records, one excluded record, six pumpkins and Nick’s single identity are preserved. Parker gains Primrose only. Kiddie Academy is held after its fresh booking check hit an explicit 429 rate limit; the owner agreed to leave it out. Mainstreet/Violet Bridge remain held. Hallelujah is retained with owner-approved, visible unconfirmed optional-RSVP availability. PR #3 remains separate and unmodified.
- The owner-approved “Before You Go” notice and official-source link are implemented on every full event listing, including existing and revealed archive rows, outside per-event disclosures. Specific warnings and miniature previews are unchanged. Exact-head automated and mobile evidence is required before review handoff.
- Deliverable: [draft PR #5](https://github.com/townsendjat-arch/findeverypark/pull/5) on `review/priority-one-halloween-2026`; exact revision, CI run and screenshots are recorded in that PR’s validation section and checks. Review the [source snapshot](../docs/priority-one-source-review-2026-10-21.json) and [verification scope](TESTING.md#priority-1-content-batch).
- **Not released; merge, deployment and preview publication are not authorized.** Content/visual approval, source recheck, manual-QA disposition and exact-candidate release permission remain gates. Read-only research or CI success does not grant release approval.
- **NAPA deadline:** publication by October 22 at 5 p.m. MDT (23:00 UTC). Recommended owner review by noon MDT that day leaves time for final source checks and any separately approved release; this is a planning recommendation, not a promised user deadline. If the publication gate cannot be met, remove NAPA, rerun exact-head checks and proceed with the other 10 without substitution.
- Castle Pines’s October 22 at 5 p.m. deadline is for optional $25 race kits only, with pickup by October 23 at noon. The free October 24 festival is not canceled; only the chili cookoff is. After the kit cutoff, recheck and label kit sales closed unless the organizer explicitly changes it. Do not transform it into a festival attendance deadline.
- Later-release recommendation only: Fellowship, Pumpkin Palooza and Fangtastic for October 30–31; no second-batch records are added here.

## Historical PR #4 readability continuation


- Owner requested shorter parent-friendly cards on October 21 after screenshot review, with the same design and six listings. Implemented one next day, concise fit copy, price-first rows and only critical visible warnings. Full source facts remain in expanded details.
- **Ready for owner review: YES**, subject to the containing documentation revision’s exact-head checks. Readability code/test head `652f85da5c1d847ee98030b772e56f64d6460353` passed [run 39672476566](https://github.com/townsendjat-arch/findeverypark/actions/runs/39672476566): 93/93 Chromium + 93/93 WebKit and 20/20 Node in each job. Independent visual review found no unresolved defect; all six collapsed cards are 38–54% shorter across the two mobile widths/engines. Update only the existing owner-only preview after the final checks. **Ready for production launch: NO.**
- No new feature, park dataset, PR #3 change, production merge or deployment is authorized. The following completed first-pass evidence is retained, not substituted for this new revision’s checks.

## Completed first pumpkin draft status

- **Implemented; ready for owner review: YES**, subject to the containing revision’s exact-head checks: six pumpkin decision cards in the existing Holiday & Seasonal Events experience; exactly 16 reviewed canonical records (the released 11 plus five new records, with Nick enriched in place).
- Baseline verified **October 21, 2026 (UTC)**: main `d178a64ebb896ec1b1e9f66429c46796004a3fe9`, merged PR #2. New branch: `review/six-pumpkin-patches-2026`; [draft PR #4](https://github.com/townsendjat-arch/findeverypark/pull/4).
- **Ready for launch: NO.** Code/test head `968a4f8411db372b0d7f2e5bb40aa1ea1cc0121c` passed [run 39669630609](https://github.com/townsendjat-arch/findeverypark/actions/runs/39669630609). The owner approved an existing owner-only preview after checks; preview/content approval, manual-QA disposition, near-publication source checks and exact production release approval remain distinct gates. PR #4 is draft and unmerged; no production deployment has occurred.
- **PR #3 remains separate:** `ceb3f2873eb79aea8b92c1082687ea68c82218f7` was not imported or changed. Its date/weekend/discovery features remain deferred here. Category + existing city/history is the bounded navigation change.
- Anderson's conflicting closed banner stays visible in Events but excludes it from homepage/city recommendations. Miller's actual season end remains unknown; October 31 is an editorial verified-date coverage boundary, not a published closing date. Every other pricing/booking/cutoff uncertainty stays visible.
- Current six-listing sources and data snapshot: [pumpkin source review](../docs/pumpkin-source-review-2026-10-21.json). The original 11-record source audit remains historical and unchanged.
- Existing homepage overflow is unchanged from exact main (Chromium 436px; WebKit 434px at 320/390px), explicitly accepted as a separate PR #3 issue. Pumpkin Events and preview-module bounds pass.
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
