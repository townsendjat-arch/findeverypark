/* Pure distance and cancellable request helpers. No URL, storage, analytics or logging. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FEPNearMe = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';
  function coordinatePair(lat, lng) {
    const number = (value) => (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) ? Number(value) : NaN;
    lat = number(lat); lng = number(lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lat, lng] : null;
  }
  function distanceMiles(lat1, lng1, lat2, lng2) {
    const a = coordinatePair(lat1, lng1), b = coordinatePair(lat2, lng2);
    if (!a || !b) return null;
    const radians = Math.PI / 180;
    const h = Math.sin((b[0] - a[0]) * radians / 2) ** 2 + Math.cos(a[0] * radians) * Math.cos(b[0] * radians) * Math.sin((b[1] - a[1]) * radians / 2) ** 2;
    return 3958.8 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
  }
  function compareDistances(a, b) {
    const left = Number.isFinite(a.dist) ? a.dist : Infinity;
    const right = Number.isFinite(b.dist) ? b.dist : Infinity;
    return left === right ? (a.origIdx || 0) - (b.origIdx || 0) : left - right;
  }
  function nearestCity(origin, cities) {
    if (!origin || !coordinatePair(origin[0], origin[1])) return null;
    return cities.map((city, origIdx) => ({ ...city, origIdx, dist: distanceMiles(origin[0], origin[1], city.lat, city.lng) }))
      .filter(city => city.dist !== null).sort(compareDistances)[0] || null;
  }
  function distanceLabel(miles) {
    return !Number.isFinite(miles) ? 'Distance unavailable' : miles < 0.1 ? '<0.1 mi' : miles < 10 ? miles.toFixed(1) + ' mi' : Math.round(miles) + ' mi';
  }
  function createRequestManager(options) {
    let sequence = 0, pending = false, timer = null, remaining = 15000, started = 0, hidden = false;
    const now = options.now || (() => performance.now());
    const schedule = options.setTimeout || setTimeout, unschedule = options.clearTimeout || clearTimeout;
    function stopTimer() { if (timer !== null) unschedule(timer); timer = null; }
    function cancel() { sequence++; pending = false; stopTimer(); if (options.onPending) options.onPending(false); }
    function finish(token, callback, value) { if (!pending || token !== sequence) return; cancel(); callback(value); }
    function arm(token) {
      started = now();
      timer = schedule(() => finish(token, options.onError, 'deadline'), remaining);
    }
    function start() {
      if (pending) return false;
      if (!options.geolocation) { options.onError('unsupported'); return false; }
      pending = true; remaining = 15000; const token = ++sequence;
      if (options.onPending) options.onPending(true);
      if (!hidden) arm(token);
      try {
        options.geolocation.getCurrentPosition(position => {
          const pair = coordinatePair(position && position.coords && position.coords.latitude, position && position.coords && position.coords.longitude);
          finish(token, pair ? options.onSuccess : options.onError, pair || 'unavailable');
        }, error => finish(token, options.onError, error && error.code === 1 ? 'denied' : error && error.code === 3 ? 'timeout' : 'unavailable'),
        { timeout: 8000, maximumAge: 0, enableHighAccuracy: false });
      } catch (_) { finish(token, options.onError, 'unavailable'); }
      return true;
    }
    function setHidden(value) {
      if (hidden === value) return;
      hidden = value;
      if (!pending) return;
      if (hidden) { remaining = Math.max(0, remaining - (now() - started)); stopTimer(); }
      else arm(sequence);
    }
    return { start, cancel, setHidden, isPending: () => pending };
  }
  return { coordinatePair, distanceMiles, compareDistances, nearestCity, distanceLabel, createRequestManager };
});
