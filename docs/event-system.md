# Event system and maintenance

The site already uses one data-driven source: `data/events/events-manifest.js`. Do not hand-edit individual event cards in `events.html`. The same manifest supplies the events page, the existing three-card homepage preview, and city-guide callouts. GitHub Pages remains a static site; no paid service or new backend is required.

## Weekly editorial workflow

1. Collect official organizer/city links in `event-workspace/inbox/`. A reputable community calendar is acceptable when clearly identified; do not present it as independently confirmed by the organizer.
2. Normalize a draft in `event-workspace/processed/`. Verify the year, dates, daily hours, venue/address, admission price/fees, age restrictions, and registration URL. Record any unspecified field honestly. Do not infer “free,” available tickets, or an end time.
3. Put reviewed source notes in `event-workspace/approved/` and update the shared manifest on a review branch. Mark unverified proposals `pending` or `needs_review`; these do not render. Only approved records belong in current listings.
4. Run `npm test`, then browser checks (`npm ci`, `npx playwright install chromium`, `npm run test:browser`). Review desktop/mobile screenshots and source links. Update `verifiedAt` only after actually rechecking the source.
5. Review and approve the PR separately. Merging/deployment remains an owner decision. Recheck weather changes, cancellations, registration inventory and prices near the event date. Automatic expiry is not automatic source verification.

For a future nontechnical editor workflow, a spreadsheet/CSV-to-manifest importer can be added without changing HTML or hosting. Keep review/approval before publication; no unsupervised scraping or new service is enabled by this change.

## Fields

Required: `id` (unique), `city` (manifest city key), `title`, `section` (`featured`, `holiday`, `ongoing`, `onetime`, `community`), `description`, `dateStart`, `dateEnd`, `dateLabel`, `timeLabel`, `locationLabel`, `costLabel`, `costType` (`free`, `paid`, `unknown`), `audienceLabel`, `href`, `sourceType`, `sourceUrls`, `verifiedAt` (`YYYY-MM-DD`), and `status` (`approved`, `pending`, `needs_review`, `cancelled`, `archived`).

Optional: `registrationUrl`, `registrationLabel`, `availabilityLabel`, `uncertaintyNotes`, `nearbyParks: [{ id, name, city? }]`, `calendarDisabled`, and `featured`. Use the organizer's own booking link when exposed. A registration link does not prove availability. All published strings are plain text, not HTML.

For multi-session events: use `recurring: true`, `series_start`, `series_end`, `recurrence_label` (include actual dates, not just “selected nights”), and `schedule: [{date, time, location, note?}]`. Never imply a festival operates continuously overnight. A series does not get one misleading multi-day calendar entry. The October import's schedules enumerate remaining dates within the requested research window, not past sessions.

`nearbyParks` IDs must exist in that city's existing park dataset. These are suggested park stops, not guaranteed walking routes or opening/access promises. If no specific park has been checked, link to that city's existing park browse page instead.

## Dates, time zones and expiry

Shared rules live at the top of `city-events.js` as `window.FEP_EVENTS`; all three listing surfaces use them. All Colorado wall-clock dates use `America/Denver`, independent of the visitor's time zone.

- Prefer ISO timestamps with an explicit offset for known hours: `2026-10-24T13:00:00-06:00`. November 1, 2026 changes from MDT to MST; use the correct offset (`-07:00` after fallback). Explicit offsets disambiguate repeated 1 a.m. hours.
- A known end expires exactly at that instant. Events with only a known date remain through the end of that Mountain calendar day. If an end time is not published, use a date-only `dateEnd`, label “end time not published,” and set `calendarDisabled: true`; this is an expiry policy, not a claimed closing time.
- `dateEnd` takes precedence over `series_end`. An exact verified last-session end should therefore be included when known. Legacy local timestamps are interpreted as Mountain wall times. Repeated legacy fall-back times resolve to the later occurrence so an expired event cannot reappear; nonexistent spring-forward times fail closed. New records should always use explicit offsets.
- Missing/invalid dates, pending, cancelled and needs-review records never become current. Legacy records without status are preserved for backwards compatibility. Past approved/legacy records remain inside the collapsed archive, not current results.
- The events page refreshes expiry within one minute while open and when returning to the tab. Idle refreshes leave expanded schedules alone. Homepage/city previews evaluate expiry at page load.
- City URLs and pill clicks agree, normalize hyphen/underscore aliases, update browser history, and restore correctly on Back/Forward. Counts and empty states refer to current events, not archived rows.

## Regression checks

`npm test` uses Node's built-in runner for source data, valid park IDs, exact end times, date-only expiry, future/multi-day/series events, missing fields, statuses and November 1 DST. Run under multiple `TZ` values to confirm visitor independence.

`npm run test:browser` serves the exact checkout locally, uses a fixed research-date clock, and checks city selection, mobile widths, keyboard controls, date details, calendar/park/registration links, expiry, homepage/city preview consistency, and automated WCAG checks. Chromium/WebKit CI is scoped to the review branch and has only read permission. It never deploys or contacts event organizers; external action/analytics traffic is blocked. Real-device and screen-reader testing is still a separate manual review.


## Pumpkin decision cards (October 21 draft)

This bounded extension stays in the shared manifest and existing Holiday & Seasonal Events section. Use category `pumpkin-patches` and an optional `pumpkin` object containing human-readable pickingType, goodFit, entryCost, pumpkinCost, activityCost, warnings, essentials and concise preview fields. The six canonical IDs include the existing Nick record; never add duplicate category records. The original 11-listing source audit remains historical; the pumpkin audit stores the six enriched/new records and research timestamps.

Enumerate source-backed occurrences with date, dateStart/dateEnd (explicit Colorado UTC offsets), time, availability and any note. `availability: unknown` means only a published schedule, not known ticket capacity. Per-session cancelled/closed/sold_out dates are excluded independently; they must not suppress later valid dates. No recurrence is generated from a broad season range. `entryCutoff` is only a verified grounds-admission cutoff. `activityCutoff` and the readable lastEntry label preserve earlier wagon/maze limits without closing the grounds. Final expiry uses dateEnd; November 1, 2026 is MST (-07:00). Remaining visits refresh in open tabs while disclosures remain open.

`isCurrent` preserves qualified pumpkin research cards with future occurrences. `isRecommendable` additionally excludes conflicting operation and dates past admission cutoff from the existing homepage/city previews. `pumpkinPreview` preserves separate fee categories and material warnings without the legacy 118-character truncation. This changes preview content/eligibility only, not homepage layout or selection features.

Miller's actual season end is unknown. `seasonEndUnknown` and `editorialReviewThrough` distinguish the conservatively enumerated October 31 coverage endpoint from a venue closing date. Recheck sources before extending it. After that coverage boundary the listing leaves current recommendations and is omitted from the past archive, because an unknown-end season cannot truthfully receive a Past Event badge. The empty state explains that later November dates need verification. A broad approximate season must never keep a listing immortal.

The Events category filter composes with the existing city filter, preserves query parameters/anchors and Back/Forward, and uses an explicit Pumpkin Patches subsection. No date control or PR #3 discovery code is imported. Cities are event metadata, not claims of park-dataset coverage. Pumpkin cards without verified park relationships omit park-specific actions. Conflicting operating status, comparison prices, visit-blocking booking requirements and arrival cutoffs stay visible. External information and optional ticket routes are distinct and never promise inventory.

### Focused readability pass

The owner requested shorter cards without changing the design. Additive `fitLabel`, `costSummary` (entry/pumpkins/activities), `criticalWarnings` and optional `cutoffSummary` are presentation-only: keep every original full field unchanged for expanded details and the source audit. Show one next listed day with any necessary gate/activity cutoff; complete dates remain in details. Emphasize prices/free/included/extra with escaped semantic strong text, not manifest HTML. Secondary caveats and the Seventh Generation date-specific $11.37 sample belong in details, not a generalized headline price. No source verification timestamp changes without new research.

Regression tests compare all 47 original records (16 reviewed and 31 legacy) with pre-readability head `57b28792ba1fea69bc8b6426a8f0ed8768b2c62b`, removing only these presentation fields. Browser evidence compares closed-card height/word count against that exact head, separately from the unchanged main-homepage overflow baseline. Both collapsed and expanded cards receive keyboard/overflow/scoped axe checks.
