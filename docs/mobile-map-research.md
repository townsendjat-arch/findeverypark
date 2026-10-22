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

Harness syntax checked. Browser execution and findings are pending CI artifact review. No physical-device verification has been performed.
