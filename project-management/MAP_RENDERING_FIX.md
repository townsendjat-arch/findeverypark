# Draft map-rendering correction after Phase 1 Near Me

This draft starts from main `4a0e9099387bab1091955e210eb5a9e5280d6dc4` (tree `7c0d7b195a7bfc18aee5ed99b2d656beeee57cc0`). It does not authorize merge, deployment, a hosted preview or rollback.

## Two separate root causes

1. **Hidden Leaflet initialization.** Near Me initially sets `.browse-shell.hidden = true` while waiting for a city confirmation. Initial dataset completion still called `ensureMap()`, which previously initialized Leaflet against the hidden map. Its zero-delay invalidation also ran while hidden. City confirmation revealed the shell, but `ensureMap()` did nothing for an existing map and bounds were computed using stale dimensions. Production DOM evidence showed a 540.5×280 panel with a 0×0 SVG and marker paths beginning `M0 0`; direct-city entry in the same browser had a 649×336 SVG and meaningful marker geometry. This distinguishes the sizing defect from tile delivery.
2. **Tile-request policy conflict.** Phase 1's necessary page-wide `no-referrer` suppressed the browser Referer for the pre-existing OSM layer. OSM's published raster policy requires an identifying Referer on web requests and the canonical HTTPS endpoint. The old layer used the legacy `{s}.tile.openstreetmap.org` subdomains. Production images visibly said `403` and `Access blocked`, but the HTTP status and server-side reason were not captured. The configuration conflict is confirmed; it is not proof that this single issue caused the provider's block or that changing it removes a block.

## Narrow production changes

Only `parks.html` runtime changes:

- Initialize only after a populated city dataset and visible, nonzero map container exist. Awaiting-city/history states do not initialize or size a hidden map.
- Refresh Leaflet size synchronously before fitting bounds or focusing a public park. Re-render once delayed Leaflet becomes available. Observe layout resizing without refitting the visitor's chosen map view.
- Use `https://tile.openstreetmap.org/{z}/{x}/{y}.png` and Leaflet 1.9.4's per-image `referrerPolicy: 'origin'`. The browser generates the actual page origin, not a fabricated production identity; paths, query strings, fragments and coordinates are excluded.
- Preserve page-wide `no-referrer`, early URL cleanup, sanitized existing analytics, memory-only location handling and public-park map centres. Add a visible linked OSM copyright attribution.
- Disable the main map's optional fade with Leaflet's documented `fadeAnimation: false`. Decoded tiles become active immediately; Leaflet's short popup fade also disappears. Zoom/pan animation settings, attribution, native caching and the origin-only referrer are unchanged. This avoids the retained-tile lifecycle defect described below.

No proxy, alternate provider, IP rotation, header spoofing, automatic retries, cache-bypass headers, prefetching or offline tile download is introduced. Browser caching remains native. Existing Esri public-park mini-map code is unchanged. Its lazy-loaded card selection can reflect nearest ordering; this is not a promise that all viewed public-park choices are independent of a visitor's interests or location. No visitor GPS position is encoded as a tile centre or sent in tile metadata.

All SEO, sitemap/robots, event records, park datasets, city definitions and PR #3 are outside the edit scope. Leaflet 1.9.4 is a pinned **development-only** addition so tests execute the exact existing CDN library version rather than a stub. Production continues using its existing Leaflet CDN assets.

## Policy and browser references

Checked 2026-10-22:

- OSMF raster tile policy: https://operations.osmfoundation.org/policies/tiles/
- Leaflet 1.9.4 tile layer referrer option: https://leafletjs.com/reference.html#tilelayer-referrerpolicy
- HTML image referrer-policy semantics: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/referrerPolicy

OSMF requires correct endpoint, visible attribution, valid browser Referer, native caching and normal interactive viewport use. It does not guarantee service or removal of an existing block. An origin-only browser-generated Referer identifies the site without transmitting its private URL contents. No new provider account or agreement is accepted by this draft.

## Test design and limits

`npm run test:maps:browser` uses real Leaflet 1.9.4 JS/CSS and clearly labeled generated tile fixtures, with public providers and analytics fully intercepted. It measures map/SVG/marker geometry, visible tile coverage, attribution, popups, city switching, filtering, history reveal, delayed loading and 320/390/1440 layouts. Native HTTP referrers are checked at a separate loopback receiver, not inferred solely from DOM attributes. Synthetic location and legacy coordinate inputs exercise the privacy boundary. This proves rendering and browser configuration, not actual OSM imagery or provider acceptance. Playwright request interception disables normal browser caching and can add test-only no-cache headers; this fixture harness must not be reused unmodified against a public tile provider. Production caching is left to the browser, but real provider response/cache behavior is not certified by these tests.

Existing suites remain unchanged: 26 inherited event Node tests, 44 Near Me Node tests, 111 events browser checks, 33 All Events browser checks and 79 Near Me browser checks per engine. Browser CI runs Chromium and WebKit at the exact PR head with read-only repository permissions, no retained checkout credentials and no deploy step. The workflow's only scope expansion includes this draft branch and its additional map suite.

Local Node validation passed 26/26 inherited and 44/44 Near Me checks. The inherited suite used verified existing historical Git objects for its required baseline. Local Chromium could not launch because the sandbox denied its process socket; an environment escalation failed before running the test. No local browser pass is claimed. Exact-head CI results and screenshots must be read from this PR's checks; a prior revision's pass is not evidence for a later revision.

## Remaining release gates

### WebKit release-gate failure and correction

The ready-for-review run [39726854416](https://github.com/townsendjat-arch/findeverypark/actions/runs/39726854416) checked out `5153d0ae9bc3e4291ebebe58ba1f364b2b197eaf`. Chromium passed all 20 map scenarios; WebKit passed 19 and timed out after the 1440px Playground filter. All inherited suites passed. Merge and deployment stopped. The earlier same-head green run is not substituted for that failed release gate.

The failure snapshot shows a correctly sized 440×430 map and meaningful markers, but nine decoded current zoom-11 tiles at opacity zero with no active flag. Four older zoom-10 tiles remained opaque beneath them. The preceding all-parks snapshot already contained the nine retained zoom-11 tiles. The current-tile visibility assertion was valid: older fallback imagery was not proof that the requested zoom had finished rendering.

The deterministic `tests/leaflet-fade.test.js` regression executes the unmodified installed Leaflet 1.9.4 distribution with a minimal synthetic DOM, map geometry and controlled paint/timer scheduler. Actual tile creation, load events, update, abort, fade and pruning methods produce the same nine-current/four-retained state. If the 250ms prune timers run before a delayed first fade frame, the new zoom-10 tiles are not yet active, so pruning retains decoded zoom-11 children. The delayed frame activates all zoom-10 tiles together but schedules no further fade or prune. Returning to zoom 11 reuses its retained tiles without restarting their interrupted fade. They remain transparent even after more than 15 simulated seconds, with no pending frame or timer. This is an asynchronous lifecycle defect, not simply an insufficient wait. Disabling the optional fade avoids that lifecycle and makes decoded tiles active immediately.

This deterministic mechanism evidence is not a browser rendering test and does not establish the exact event ordering or production frequency of the original failure. The original browser artifacts are retained in [artifact 12403397410](https://github.com/townsendjat-arch/findeverypark/actions/runs/39726854416/artifacts/12403397410), SHA-256 `719971b3177f5bd1676958a350f61ff574a0262875d2b64b68b407b979096839`. No live provider request was involved.

The full real-Leaflet browser suite retains every current-tile active/opacity requirement, nonzero geometry check, 25-point coverage check and privacy assertion. It adds a 21st scenario that repeatedly toggles the real Playground filter six times between zooms 10 and 11, verifies markers and opaque coverage after each transition, then checks the Abbott search and popup. No test-side tile repair or production map mutation is used. CI runs the deterministic lifecycle regression before the browser map suite and saves its trace alongside the browser screenshots. A new head must pass both complete engine jobs before another release decision; no new merge or deploy authorization is implied.

- **Actual OSM basemap acceptance is not verified.** The already-blocked cloud provider session was not retried or bypassed. There is no authorized hosted draft/preview on which to check a production-origin Referer. Local fixture imagery and loopback headers must never be labeled live OSM evidence. A future permitted, ordinary human viewport check must inspect actual pixels as well as HTTP/header evidence and stop on any denial. Such a check needs an authorized review/release context; this draft does not create one.
- Physical iOS/Android permission dialogs, physical-device layout/Back/Forward and assistive-technology behavior are not certified by automated WebKit/Chromium.
- Existing desktop Map-button scrolling can place the popup partly beneath sticky controls. DOM popup visibility/content/link checks do not establish unobstructed desktop hit targets. This separate scroll/layout issue is unchanged; mobile screenshots and current-map geometry checks do not erase that limitation.
- Current GA4/Search Console owner exports remain a separate open baseline requirement. No analytics account or measurement settings change here.
- Merge, deployment and rollback each still require explicit owner authorization.
