# Mobile map interaction research (priority 3, research only)

No map interaction mode changes are implemented. Browser measurements are written by `tests/mobile-map-gestures.browser.js` to `test-results/mobile-map-research-{chromium,webkit}.json`, with screenshots at 320px and 390px.

## Evidence boundaries

The harness loads the real application and Leaflet 1.9.4, intercepts app files from the working tree, supplies labeled synthetic tiles, and aborts other requests. It does not contact live map tile providers. Contexts have mobile viewport handling and touch capability enabled; they are not physical phones.

Measured operations:

- Mouse wheel before the map versus over the map: page scroll, map zoom and center deltas.
- Mouse drag over the map: page scroll versus map pan. This is not a finger swipe.
- Keyboard ArrowRight while the map is focused; Shift+Tab exit and forward Tab traversal (up to 200 steps).
- Touch tap on the zoom-in control. This is not pinch zoom.

Each observation preserves before/after scroll position, available page scroll range, map bounds, center, zoom, enabled handlers, focus, computed touch-action, and viewport. The script records observed behavior rather than treating a particular interaction mode as the expected answer. Successful script execution is a measurement pass, not proof that all interaction behavior is desirable.

Playwright's public [Touchscreen API](https://playwright.dev/docs/api/class-touchscreen) supports taps only. Manually dispatched DOM touch events are not substituted for native browser scrolling or trusted finger gestures. Its [device emulation](https://playwright.dev/docs/emulation) simulates device settings; it does not establish physical-device behavior.

## Physical-device verification still needed

On at least iOS Safari and Android Chrome, with representative narrow and standard-width phones:

1. Swipe the page above the map, start a one-finger swipe on the map, then start outside the map and cross it. Record whether the page scrolls, the map pans, or input stalls; test both directions.
2. Test two-finger pan/pinch in and out, then one-finger page scrolling immediately afterward. Check accidental zoom, gesture cancellation, momentum and overscroll.
3. Test zoom buttons and park selection with touch, including repeated taps and the overlapping-location chooser.
4. Scroll with browser chrome expanded/collapsed; rotate and return; test the map at the viewport edge.
5. Verify VoiceOver/TalkBack reading order, map controls, selection, and returning to the page. Browser keyboard traversal is not a screen-reader pass.

Do not recommend a cooperative/gesture-gated interaction mode based solely on wheel behavior or narrow viewport emulation. First establish a reproducible finger-scroll conflict, compare the proposed mode on that same task, and verify that map discovery, control access and ordinary scrolling improve without trapping users.

## Status

Initial browser evidence from CI run [39813890141](https://github.com/townsendjat-arch/findeverypark/actions/runs/39813890141), Chromium at both 320px and 390px:

- Wheel before the map scrolled the page 300px without zooming or panning the map.
- Wheel over the map left page scroll unchanged and zoomed the map out two levels. This establishes wheel capture, not finger-scroll capture.
- Mouse drag panned the map without scrolling the page. Touch-tapping the zoom-in control increased zoom by one level.
- Focused ArrowRight panned the map. Shift+Tab exited immediately. Forward Tab reached the footer after 91 stops through marker and map controls. This is substantial traversal effort, but not a keyboard trap; it is recorded for review, not changed by priority 3.
- Computed map touch-action was `none`. This configuration observation is not an empirical finger-swipe result.

Mobile WebKit rejected `mouse.wheel` as unsupported. The revised harness records that exact capability gap and continues supported measurements; no desktop-mode substitution is presented as mobile evidence. Revised WebKit results are pending.

No interaction-mode change is recommended from these observations alone. A wheel-capture result does not establish that a cooperative touch mode is necessary or beneficial. No physical-device verification has been performed.
