# November 2026 family-event draft

This isolated draft adds the eight owner-approved candidates to production baseline `0620e051dd0e765c32b2a548fc962ebc035b66d7`. It does not authorize merge, publication or deployment.

## Content and boundaries

- Eight new records, 20 actual November occurrences; 66 total records. At the fixed October22 test clock:35 current/upcoming,30 archived,1 excluded.
- All58 original event objects, all city metadata and all six pumpkin records remain unchanged. The existing November1 7th Generation Farm occurrence is not added again.
- Aurora: Fall Bird Walk (November7,9–11a.m., ages8+, registered adult required for minors) and Stewardship Saturdays (November14,9–11a.m., all ages). Registration is required through November5 and November12 respectively; organizer cutoff hours are not published.
- Centennial: Family Tabletop Game Night (November2,5–6p.m., families with children ages5 through teens), with required registration closing November2 at5p.m.
- Denver: DMNS free general admission on November7,5–10p.m., and November16,9a.m.–5p.m.; ticketed extras excluded. Mile High Tree nightly November20–30,5–10p.m.
- Castle Rock: Starlighting November21,2–6p.m.; ceremony5p.m., lighting about5:30p.m., subject to weather/fire conditions. No unresolved parking, shuttle, road-closure or stage-location claims.
- Parker: Mayor’s Holiday Lighting November27,5–7p.m., lighting6p.m.; complimentary s’mores limited to the first1,000 guests. Hometown characters November28–29,noon–3p.m.; encounters are not guaranteed, and food/shopping/skating are separate.
- All listed occurrence times are MST (`-07:00`), after the November1 daylight-saving transition. The source-review date itself is October22, still MDT.
- All eight offer free general admission. Visible copy distinguishes extra purchases, age guidance, required booking and dated availability. No remaining-seat count is advertised as guaranteed availability.

The [dated source review](november-source-review-2026-10-22.json) contains official URLs, exact proposed records, verification timestamps, qualifications and baseline digests. Sources were checked October22,2026. No enrollment, booking, account creation or checkout was performed.

## Recurrence and expiration

The existing runtime is unchanged. DMNS has two nonconsecutive sessions; Tree has11 November nights; Parker characters has two November dates. Each remains one record with an explicit schedule. Recurring calendar actions are suppressed rather than creating a false continuous appointment.

Tree and Parker titles explicitly describe November dates. Their known November endpoints expire only that coverage; the wider organizer season continues in December. Future approved December coverage must extend the same canonical2026 IDs, not add duplicate listings. Generic series remain current between their listed sessions; their visible schedule defines the actual attendance dates.

Registration deadlines are visible facts, not a new automatic registration-closing feature. Existing event expiration still occurs at the actual session/series end. The availability message is a dated observation, not a reservation guarantee.

## Validation and owner gate

- Preserve and run inherited event, pumpkin, All events navigation, Near Me, map-selection, gesture and accessibility checks.
- Add immutable58-object/city/pumpkin digests; exact eight-record/source checks; per-event booking URLs;20-occurrence schedules; visible preview restrictions; MST endpoints and November1 DST regression.
- Run Node checks under UTC, America/Denver, America/Los_Angeles and Asia/Tokyo.
- Test Chromium and Playwright WebKit at320×740,390×844 and1440×1000, including full cards, real homepage/city previews, schedule disclosure, calendar links, in-tab expiry, layout bounds and scoped accessibility. Test traffic is local-only; no registration or analytics requests are sent.
- The test-only workflow adds this exact review branch to the existing version-matched official Playwright container job. It retains PR-only triggers, exact-head checkout, read-only contents permission, no retained credentials, no deployment steps and unchanged dependency versions.
- Exact tested commit, terminal CI results and screenshots belong in the draft PR’s final validation report. Older-head checks do not establish readiness for a later revision.

Before publication, recheck the three limited-registration pages, organizer cancellations and weather notices, then obtain the owner’s explicit publication/merge/deployment approval. No automatic schedule or monitor is created. Held candidates, new features, park/coordinate/photo changes, the separate Near Me wording PR and PR3 remain outside scope.

Physical iPhone/Android browsers, real OS permission prompts and assistive-technology certification are not established by Playwright emulation or scoped axe checks. No production post-deployment test is claimed.
