# Community event data feed, version 1

`data/events/community-feed.v1.json` is a deterministic, static projection of
`data/events/events-manifest.js`, the only editorial event source. The generator
uses the existing `FEP_EVENTS` rules from `city-events.js` at build/test time.
Consumers fetch JSON only; they must not load either FindEveryPark application
script. There is no backend, scheduled job, deployment action or new dependency.
The read-only integrity check validates committed output; it does not regenerate
or publish a replacement behind the editor's back.

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
`verifiedAt`, `sortAt` and `expiresAt`. Supported approved occurrences must have
nonempty title, description, date/time/location/cost labels and city identity;
IDs must match `[a-zA-Z0-9][a-zA-Z0-9_-]{0,119}` so a consumer cannot silently drop
an otherwise accepted generated record. Malformed supported approved records
fail generation/validation with the source ID and reason. Unknown facts must be
represented by an honest source label, never invented by the generator.
The v1 output is limited to 1,000 records and 1,000,000 bytes of UTF-8 JSON. The
byte cap is conservative relative to the consumer's 1,000,000-character limit.
Exceeding either fails validation; records and warning
text are never silently truncated to fit.
Missing optional text is the empty string, not an inferred claim. Full description, cost, audience, registration and
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

After an authorized manifest or lifecycle-rule edit (or a generator change):

```
npm run events:feed
npm run events:feed:check
npm test
```

Commit the generated JSON with the source change. `--check` reads and compares
the exact deterministic projection and exits nonzero for missing, malformed,
stale or source-inconsistent output without rewriting it. CI deliberately checks
before generation, so it cannot hide an editor's missing generated-file commit.
The default `npm test` and focused `npm run test:feed` both start with this guard.
Never edit the feed by hand or update editorial verification dates merely to
make a check pass.

The `Event feed safeguards` workflow runs on **every pull request**, without
branch-name or changed-path filters, and on pushes to `main`, merge groups and
manual dispatch. Its stable `Event feed integrity` job checks the exact PR head
or pushed/group SHA and runs the unit/maintenance suite. Chromium and WebKit
regressions depend on that job succeeding. The workflow has only `contents: read`
permission, does not commit generated files, and never deploys.

Maintenance tests make isolated temporary copies, edit the event source, prove
the old feed fails, then explicitly regenerate and validate the new projection.
They also cover missing/malformed/edited output and legitimate additions,
updates, cancellation and removal. Current-source properties cover field and
eligibility parity, exact canonical expiry, links and deterministic generation.
Historical UI/lifecycle regressions use a pinned reviewed manifest fixture, not
frozen counts imposed on the evolving editorial source. The real checkout is
also tested directly. A future content edit does not require changing incidental
total-count assertions.

### Enforcement prerequisite before release

As verified on November 5, 2026, `main` is not protected and has no required status
checks or repository rulesets. The existing GitHub-managed Pages route checks out
`main` and uploads it directly (`.nojekyll`); it does not run npm commands or wait
for this workflow. **A green PR check is not currently a server-enforced merge or
deployment gate.** Push-to-main checks detect a problem after a push; they cannot
prevent that independent Pages deployment. This draft does not change repository
settings or the deployment route.

Before relying on this safeguard for production, an owner must separately approve
and configure a protected `main`/ruleset that requires the stable `Event feed
integrity` check, requires PRs and branches up to date (or a validated merge queue),
and prevents bypass/direct pushes. PR runs check the exact head rather than an
untested merge result; merge-group runs check the group's combined SHA. Existing relevant
PRs must receive the new workflow and run it before merging. Changing or deleting
the workflow itself also requires owner review. Alternatively, separately approve
moving Pages to a controlled build that generates, validates and publishes the
same tested artifact; adding a parallel CI job alone does not change Pages.

The containing PR/test evidence identifies the exact checked revision. Browser
layout, accessibility, feed failure and refresh behavior belong to the consuming
site's review. Neither a committed feed nor passing tests authorizes publication.
Newsletter ingestion is not part of this pipeline; only the canonical approved
manifest is read. Do not add newsletter-derived records under this integration.

## Release checks, only after owner approval

The intended URL is
`https://findeverypark.com/data/events/community-feed.v1.json`. It will not exist
on production until an approved release includes it. Verify the actual response,
JSON content type, cache behavior and CORS headers from the consumer's origin.
Do not promise cross-origin fetching before that live check. Deploy FindEveryPark's
approved feed first and verify it before releasing the consuming integration.
If this fails, the consumer must retain its reliable FindEveryPark fallback link.
