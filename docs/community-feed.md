# Community event data feed, version 1

`data/events/community-feed.v1.json` is a deterministic, static projection of
`data/events/events-manifest.js`, the only editorial event source. The generator
uses the existing `FEP_EVENTS` rules from `city-events.js` at build/test time.
Consumers fetch JSON only; they must not load either FindEveryPark application
script. There is no backend, scheduled job, deployment action or new dependency.

## Contract

- `schemaVersion`: `1`.
- `timeZone`: `America/Denver`.
- `contentUpdatedAt`: the manifest's editorial date, unchanged, or `null` when
  absent/invalid. It is not the build date or an all-record verification claim.
- `sourceUrl`: `https://findeverypark.com/events.html`.
- `events`: approved, supported candidates, including both past and future
  records. Generation never filters by the current clock.

Each event has string fields `id`, `city`, `cityLabel`, `title`, `description`,
`dateStart`, `dateEnd`, `dateLabel`, `timeLabel`, `locationLabel`, `costLabel`,
`costType`, `audienceLabel`, `href`, `registrationLabel`, `availabilityLabel`,
`verifiedAt`, `sortAt` and `expiresAt`. Missing optional text is the empty string,
not an inferred claim. Full description, cost, audience, registration and
availability strings are copied without summarization or truncation. Verification
dates retain each source record's actual date. Links retain a safe HTTPS source
`href`; missing/unsafe links fall back to the source Events page. Ordinary event
cards have no stable HTML IDs, so the fallback does not invent a deep-link anchor.

The projection does not include research-only `uncertaintyNotes`, source-audit
URLs, booking URLs or nearby-park data. Material visitor qualifications must
remain in the included description/label fields; if future records require
additional fields to be truthful, extend the reviewed contract before syndicating
them. All ten currently upcoming source records already include their material
qualifications in the projected fields and have no separate `uncertaintyNotes`.

`sortAt` and `expiresAt` are exact ISO UTC instants. Sort by `sortAt`, then `id`.
`dateStart` and `dateEnd` retain source date syntax for provenance/display, and
must not be interpreted in a visitor's local timezone. A missing end falls back
to the known start date, following the canonical rules. `expiresAt` is a listing
expiry policy, not an invented event closing time or an admission guarantee.

The consumer must:

1. Validate the envelope version/timezone, individual records and finite ISO
   instants. Treat feed text as text, never HTML; validate links before rendering.
2. On page load, at least every minute, and when a tab becomes visible, retain
   only records where `now < Date.parse(expiresAt)`, then sort and apply its cap.
   Refill vacated card slots from the complete candidate list.
3. Keep material cost, age, registration and availability qualifications visible
   or readily available without implying a free event has no signup restrictions.
   Do not imply live inventory or re-verification merely because a feed loaded.
4. Provide an ordinary link to `sourceUrl` for empty, stale, invalid or failed
   responses. Do not silently substitute a second manually maintained event list.

## Canonical expiry without a second DST implementation

The generator asks `FEP_EVENTS.isExpired` for the exact boundary, using a bounded
millisecond binary search around the source end date. The anchor is only a search
window, not a timezone conversion. This keeps exact-end precedence, Mountain
midnight, DST, the later legacy repeated hour and invalid spring-forward times
in the existing shared rules. Date-only starts sort at the previous Mountain
calendar day's expiry. A record must be recommendable immediately before its own
end. This is independent of the wall clock when the feed is generated.

Examples: October 31, 2026 expires at November 1 06:00 UTC; November 1 expires at
November 2 07:00 UTC. An explicit November 14 11 a.m. MST end expires at 18:00 UTC,
not at midnight. Invalid dates, missing identity, reversed ranges and unsupported
timezones fail closed.

## Deliberate version 1 limitations

Only explicit `status: "approved"` records are syndicated. Unlike the legacy FEP
page, a statusless record is not treated as approval. Pending, needs-review,
cancelled and archived records are excluded. Any truthy `community_event` flag
is also excluded, keeping FindEveryPark/Mighty Dads self-hosted gatherings out of
the generic community rail. Consumer-specific gatherings stay separate.

Recurring records, any schedule/series fields and pumpkin records are excluded,
even when approved. A flat single cutoff cannot safely represent per-session
cancellation, sold-out status, admission cutoffs, unknown season ends, changing
locations or the complete pumpkin qualifications. No season range is expanded
into invented visits. The initial feed has 28 approved single occurrences,
including all ten November–December occurrences. Nine historical approved series,
29 other unapproved/legacy records and two self-hosted community entries are
omitted. Omission counts are printed by the generator, not included as visitor
content.

Future recurring support needs a reviewed contract with source-backed occurrence
IDs, per-occurrence dates and expiry, per-session availability and admission
cutoffs, parent-series identity, and all required qualifications. It must preserve
`isRecommendable` parity, not merely use the final season end. This version does
not imply support for those records.

## Maintenance and verification

After an authorized manifest or lifecycle-rule edit:

```
npm run events:feed
npm run events:feed:check
npm test
```

Commit the generated JSON with the source change. `--check` compares exact bytes
and exits nonzero for stale/missing output without rewriting it. The default
test command includes this guard and the dedicated feed suite. Focused tests
cover source-field parity, all ten released November–December entries, exclusion
rules, invalid/missing data, link fallback, date-only/exact boundaries, both DST
transitions, legacy timestamps, deterministic output across four host timezones,
and historical/distant-future candidates. Existing source-preservation tests keep
all released event objects, verification dates and FEP runtime byte-identical.

The added PR workflow is read-only and scoped to
`review/mighty-dads-data-feed-2026`. It runs the Node suite and inherited event,
November–December and event-page browser regressions in Chromium and WebKit,
using the version-matched official Playwright container, and never deploys.
The containing PR/test evidence identifies the exact checked revision. Browser
layout, accessibility, feed failure and refresh behavior belong to the consuming
site's review. Neither a committed feed nor passing tests authorizes publication.

## Release checks, only after owner approval

The intended URL is
`https://findeverypark.com/data/events/community-feed.v1.json`. It will not exist
on production until an approved release includes it. Verify the actual response,
JSON content type, cache behavior and CORS headers from the consumer's origin.
Do not promise cross-origin fetching before that live check. Deploy FindEveryPark's
approved feed first and verify it before releasing the consuming integration.
If this fails, the consumer must retain its reliable FindEveryPark fallback link.
