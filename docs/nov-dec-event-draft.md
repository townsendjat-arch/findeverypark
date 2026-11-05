# November–December 2026 family-event draft

Source checks: November 4, 2026 in America/Denver (November 5 UTC).
Base: `ea3c6d26236748aa090be7efe89cb57a3d6a70d0` on main, including the public GPS pause.
Review branch: `review/nov-dec-family-events-2026`.

## Scope and release gate

The owner approved these seven initial candidates for a draft FindEveryPark update. All seven now have essential official details verified. This draft appends ten dated occurrence records to the existing 58 records. Every inherited object, city, archive rule, category/city filter, park dataset and GPS setting is preserved. No Mighty Dads website change is included.

This is a draft for review, not approval to merge, deploy, publish or create a live preview. The exact final commit and terminal CI results are recorded in the PR. Tests do not reserve tickets or guarantee future availability. Recheck required registration, cancellation/weather notices and relevant terms near publication, then obtain explicit owner approval for the exact release.

## Included occurrences

All times are Mountain Standard Time, UTC−07:00. Every occurrence has its own explicit start/end, record ID and calendar appointment. At its end it leaves current cards and previews independently, while the normal collapsed archive retains it. No broad November-to-December continuous event or runtime change is needed.

| Candidate | Included dates and hours | Essential qualifications |
| --- | --- | --- |
| Stewardship Saturdays for Families | November 14, 9–11 a.m. | Free, all ages; registration required through November 12, closing hour unpublished. Exact activity route was freshly checked. Outdoor work; closed-toe shoes and sun protection. |
| Plains Conservation Center Free Days | November 14 and December 17, 10 a.m.–3 p.m. | Free, registration required. Both Eventbrite dates offered free tickets and a $0 total at the check. Sales-end dates match each event date; no closing hour shown. No total capacity count was displayed. |
| Santa’s Grand Arrival | November 20, 5–7 p.m. | Free admission; professional Santa photos are separate, with prices and appointment availability unverified. No general-admission RSVP requirement stated. |
| Four Mile Historic Park SCFD Free Days | November 20 and December 18, 10 a.m.–4 p.m. | Last entry 3:30 p.m. Free daytime general admission excludes special programs and Bright Nights. Groups expressly welcome without advance notice; house tours hold about 10. Optional ticket-page capacity unverified. |
| Parker Mayor’s Holiday Lighting | November 27, 5–7 p.m. | Lighting at 6 p.m. Free admission/activities; food extra. Free s’mores limited to first 1,000. Parking/road closures visible in the listing. |
| DeLaney Farm Holiday Open Days | December 5 and 13, 11 a.m.–2 p.m. | Free; no holiday-date registration requirement stated. Crafts, cocoa, cookies and historic buildings; allow 45–90 minutes. |
| Camp Gingerbread with the Grinch | December 20, 1–4 p.m. | Free admission; Santa photos and vendor purchases separate. Craft quantities, photo appointments and group capacity unverified. |

The source audit retains the full checked facts, URLs, exact UTC verification times, date-only registration cutoffs and point-in-time observations. Public cards do not advertise a remaining-seat count or guaranteed inventory. An active Register button is not a reservation. There are no held approved candidates after browser checks resolved the initial Stewardship and Plains registration gaps.

## Existing draft overlap

[PR #11](https://github.com/townsendjat-arch/findeverypark/pull/11) remains separate and unmodified. It contains earlier Stewardship and Parker proposals. This draft reuses their canonical IDs; it does not copy the other unapproved November listings or the separate discovery work from PR #3. If both event drafts are later selected, reconcile the two overlapping records before merging and rerun all checks. This draft includes current main’s GPS pause, not older GPS code from the prior event draft.

## Verification plan and limits

- The immutable baseline and ten exact additions are tested separately. Existing October/pumpkin/archive assertions remain intact; fixed-clock counts are extended for the new future records.
- New data checks cover required provenance, the reviewed source snapshot, unique IDs, MST timestamps, independent exact-end expiry, no unsupported cost/capacity promises, and preservation of all 58 baseline objects and cities.
- New local-only browser checks cover the ten cards, costs/registration/source links, calendar dates, independent expiry, archive, filters/history, previews, mobile layout and scoped accessibility in Chromium/WebKit.
- Existing event, All Events, GPS-pause, Near Me, Leaflet, map-selection and gesture-observation suites remain in the read-only exact-head CI job. Only the new review branch is added to the existing job allowlist. No deployment step, permission expansion or dependency-version change is included.
- Run commands: `npm ci --ignore-scripts --no-audit --no-fund`; `npm test`; `npm run test:browser`; `npm run test:nov-dec:browser`; `node tests/all-events.browser.js`; existing GPS/map regression commands in the workflow. Repeat event units with UTC, America/Denver, America/Los_Angeles and Asia/Tokyo.
- Browser engines and emulated viewport checks do not certify physical phones, native permission prompts, touch gestures or screen readers. Scoped axe is not whole-site accessibility certification.

[Exact proposed records and source audit](nov-dec-source-review-2026-11-04.json).
