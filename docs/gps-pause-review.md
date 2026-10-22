# Temporary public GPS pause

Draft only. No merge, deployment or restoration is authorized. Based on production `0620e051dd0e765c32b2a548fc962ebc035b66d7`, checked October 22, 2026.

## Scope

- Homepage GPS CTA and its instruction are hidden, replaced with manual “Browse parks by city.”
- Directory location controls, explanatory GPS copy and nearest-first option are hidden and disabled. The existing neutral city-confirmation route remains usable for bookmarked `?near=1` links. Normal city, search, amenity, sort, map and history behavior remains.
- The separate Trails “Find me” control and “You” legend are also hidden. Its native acquisition function is guarded without deleting its implementation.
- Static `hidden` markup and CSS fail closed before JavaScript and if the availability script fails. The directory request manager receives no geolocation provider while paused. Both public acquisition functions also return without requesting GPS.
- Original early coordinate cleanup, analytics safeguards, public-park map behavior and `near-me.js` remain intact. No event, pumpkin, park, coordinate, SEO or sitemap edits.

## Restoration gate

`gps-availability.js` is the single explicit release flag. It has no URL or storage override. The implementation remains present for future physical-iPhone diagnosis. Restoration requires a separately approved change after real-iPhone validation; simply passing automated mocks does not authorize it. The older Trails acquisition behavior centers its map on the visitor; review that privacy implication before enabling the shared flag. No new privacy claim is made for the disabled legacy Trails implementation.

## Tests and evidence

`tests/gps-pause.test.js` checks fail-closed markup, both native acquisition guards, retained request-manager hash and the manual CTA.
`tests/gps-pause.browser.js` tests the actual paused flag at 320, 390 and 1440px, no GPS calls, city confirmation, manual filtering/sorting/search/history, real Leaflet with local tiles, Trails, keyboard entry, scoped axe, missing-config and no-JavaScript states, and legacy-coordinate cleanup. Existing map/identity/events suites also run against the paused release.
`tests/near-me.browser.js` retains every original assertion, explicitly serving the availability flag as true only inside that isolated local test suite. This is regression evidence for the retained implementation, not for public availability or native-iPhone GPS.

A separate branch-gated PR-only workflow runs the existing full Chromium/WebKit suites plus the pause checks. This avoids editing the same allowlist line already changed independently in PR #10 and PR #11. It uses the same version-matched container and read-only permissions, has no deployment step, and uploads artifacts for seven days. Consider consolidating review workflows only in separately approved maintenance.

## Open PR coordination

PR #10 remains draft at `7faa4b5a25374b73bb1368ab9d7559d25ba4a3fe`; its two message strings and additional tests are not silently imported. It overlaps `parks.html` and `tests/near-me.browser.js`; merge compatibility and full exact-head testing must be rechecked in the selected release order. Its messaging improvement is not a fix for iPhone GPS and is dormant while paused.
PR #11 remains draft at `2a8ea711486b6547bb5cc78369fbc66f580d0d39`; its eight November additions are not imported, removed or altered. It changes event data/tests and the older workflow, not the new pause workflow. A future combined release still requires new exact-head CI and registration checks. PR #3 is untouched.

## Limitations

Browser-engine/mobile-width tests are not physical iPhone, VoiceOver or native permission validation. Fixtures do not establish live OSM availability. Previously documented short-viewport popup-title clipping and homepage narrow-tile overflow are separate; this draft does not import unrelated repairs. Final tested SHA and CI totals belong in the PR report to avoid a self-referential commit hash.
