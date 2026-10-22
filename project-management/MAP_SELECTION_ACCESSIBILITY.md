# Map selection and popup accessibility draft

October 22, 2026. Based on verified main `0ed959823a7ee254f3ca214f5af3da06a2080ddb`. Draft-only authorization: no merge, deployment, hosted preview, or changes to PR #3.

## Scope

Only `parks.html` changes production behavior. Card, gallery Map, top-pick and hover lookups use existing unique park IDs. Existing numeric coordinate normalization supplies exact coordinate keys; no tolerance, clustering, proximity grouping or dataset edits. Pins at exactly identical coordinates offer a small named native-button chooser. Each card opens its own park directly, including cards outside the Visited-only map via a temporary marker or explicit addition to an already-visible exact-coordinate group, without resetting the user's filters. Rerendering clears temporary markers. Markers are keyboard focusable and named; Enter/Space opens them, chooser buttons are native controls, selection focuses the guide link, and close/Escape restores a still-connected opener. Map mode, search, amenity and city data remain unchanged.

Popup name/address/guide values are escaped. Secondary text changes from #aaa/#999 to #595959 on white (7:1); links use #075e49. Secondary text is 12px with the existing 1.5 line height. The popup is bounded to 230px content width with word wrapping. This is a narrow readability correction, not a redesign or a claim of whole-site accessibility.

## Preserved boundaries

The PR #8 map visibility/resize lifecycle, `fadeAnimation: false`, canonical OSM endpoint, per-image origin-only referrer, page-wide no-referrer and memory-only GPS privacy are unchanged. No live tile provider requests, GPS persistence, new amenity content, park IDs/coordinates/data, SEO/sitemap changes or interaction mode are introduced. [Mobile gestures](../docs/mobile-map-research.md) are research-only and retain explicit physical-device limitations.

## Verification

The existing events, All Events, Near Me and real Leaflet regression suites continue in both Chromium and WebKit. The old marker correspondence helper is adapted for the authorized exact-coordinate grouping/ID interface, without removing geometry, tile coverage, privacy or filter assertions. The Near Me spy gains the no-op Leaflet event/element methods needed by the current production API; rendering and chooser evidence comes only from the real Leaflet suites.

New selection suites cover every city dataset, exact IDs and duplicate groups, all mapped card handlers, no-coordinate fallback, keyboard chooser and focus, filtered groups, and 320px/390px normal-text contrast/readability. Existing Cottonwood Grove / Cottonwood Park provide an actual equal-coordinate regression fixture; no production data is changed. All provider/font/analytics traffic is fulfilled or aborted by local fixtures. Synthetic tiles are not live OSM acceptance evidence.

Local Chromium cannot launch in this sandbox: process socket creation is denied before tests run. Local inherited event tests also lack their required historical Git object; exact-head CI uses GitHub checkout and retains the existing baseline fetch. These are not test passes. The final head's GitHub Actions logs/artifacts and draft PR validation section are authoritative for executed browser counts and outcomes. Prior-head CI is never substituted for final-head CI.

## Remaining risks

Automated Chromium/WebKit is not physical iOS/Android, VoiceOver/TalkBack or touch swipe/pinch signoff. Small text remains subject to human readability review; numerical contrast does not certify the entire page. Existing sticky controls can obstruct desktop map scrolling; this separate page-layout behavior is not redesigned here. Live-provider acceptance and production deployment remain outside this draft. Exact-head CI and owner review are required before any separate release decision.

## CI setup correction

The initial run [39811160643](https://github.com/townsendjat-arch/findeverypark/actions/runs/39811160643) on `dd0ac867a2d3f2b458cc23632023352a539eab31` exhausted the inherited 15-minute job limit while Ubuntu's Azure package mirror downloaded browser dependencies very slowly. WebKit never reached browser tests. Chromium passed the event and All Events browser suites but was canceled during Near Me; the new selection suite did not run. Those partial results are not final verification.

This branch now has an isolated test job using the official version-matched `mcr.microsoft.com/playwright:v1.62.1-noble` image, which includes browsers/system dependencies ([official documentation](https://playwright.dev/docs/docker)). The original branches' test job is unchanged. The new job retains exact-head checkout, read-only repository permissions, no persisted checkout credentials, the same pinned npm dependencies, every inherited suite, fixture-only map traffic and no deployment. It does not change a provider/network security setting or weaken a test. Final results still require both complete engine jobs at the new exact head.
