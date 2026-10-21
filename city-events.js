/* Shared event rules. All local dates/times are in Colorado, not the visitor's
   time zone. This file is loaded by the events page, homepage and city guides. */
(function (root) {
  var timeZone = 'America/Denver';
  function localStamp(now) {
    var parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(now || new Date());
    var values = {};
    parts.forEach(function (part) { values[part.type] = part.value; });
    return values.year + '-' + values.month + '-' + values.day + 'T' +
      values.hour + ':' + values.minute + ':' + values.second;
  }
  function validDate(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value || '');
    if (!match) return false;
    var date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
    return date.getUTCFullYear() === +match[1] && date.getUTCMonth() === +match[2] - 1 && date.getUTCDate() === +match[3];
  }
  function endValue(event) {
    // A verified exact final end takes precedence over a date-only series end.
    return event.dateEnd || event.endDate || event.series_end ||
      String(event.dateStart || event.startDate || '').slice(0, 10);
  }
  function isPublishable(event) {
    return !!event && (!event.status || event.status === 'approved' || event.status === 'archived');
  }
  var localEndCache = new Map();
  function localEndInstant(value) {
    if (localEndCache.has(value)) return localEndCache.get(value);
    var wall = Date.parse(value + 'Z');
    if (!Number.isFinite(wall)) return NaN;
    var candidates = [];
    // Sampling both sides of a transition obtains the zone's actual offsets.
    // For a repeated legacy wall time, use the later occurrence, once only.
    [-12, 12].forEach(function (hours) {
      var sample = wall + hours * 60 * 60 * 1000;
      var offset = Date.parse(localStamp(new Date(sample)) + 'Z') - sample;
      var instant = wall - offset;
      if (localStamp(new Date(instant)) === value) candidates.push(instant);
    });
    var result = candidates.length ? Math.max.apply(null, candidates) : NaN;
    localEndCache.set(value, result);
    return result;
  }
  function isExpired(event, now) {
    now = now || new Date();
    var end = endValue(event);
    // Missing/invalid dates must never produce immortal current listings.
    if (!validDate(end)) return true;
    if (end.length === 10) return localStamp(now).slice(0, 10) > end;
    if (/(?:Z|[+-]\d{2}:\d{2})$/.test(end)) {
      var instant = Date.parse(end);
      return !Number.isFinite(instant) || now.getTime() >= instant;
    }
    if (!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(end)) return true;
    var localInstant = localEndInstant(end.length === 16 ? end + ':00' : end);
    return !Number.isFinite(localInstant) || now.getTime() >= localInstant;
  }
  function isCurrent(event, now) {
    return isPublishable(event) && event.status !== 'archived' && !isExpired(event, now);
  }
  function normCity(value) {
    return String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  }
  function startValue(event) {
    return event.series_start || event.dateStart || event.startDate || '';
  }
  function addDays(date, count) {
    var value = new Date(date + 'T12:00:00Z');
    value.setUTCDate(value.getUTCDate() + count);
    return value.toISOString().slice(0, 10);
  }
  function displayDay(date) {
    return new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', {
      timeZone: timeZone, weekday: 'short', month: 'short', day: 'numeric'
    });
  }
  function weekendWindow(now) {
    var date = localStamp(now || new Date()).slice(0, 10);
    var day = new Date(date + 'T12:00:00Z').getUTCDay();
    // Friday–Sunday use the ongoing weekend; Monday moves to the next one.
    var start = addDays(date, day === 0 ? -2 : 5 - day);
    var end = addDays(start, 2);
    return { start: start, end: end,
      label: displayDay(start) + ' – ' + displayDay(end) + ', ' + end.slice(0, 4) + ' · Colorado time' };
  }
  function normalizeDateView(value) {
    return ['weekend', '2026-10', '2026-11', '2026-12'].indexOf(value) !== -1 ? value : 'all';
  }
  function dateWindow(view, now) {
    view = normalizeDateView(view);
    if (view === 'weekend') return weekendWindow(now);
    if (view === 'all') return null;
    var end = view + (view === '2026-11' ? '-30' : '-31');
    return { start: view + '-01', end: end,
      label: new Date(view + '-01T12:00:00Z').toLocaleDateString('en-US', { timeZone: timeZone, month: 'long', year: 'numeric' }) };
  }
  function instant(value, end) {
    if (!validDate(value)) return NaN;
    if (value.length === 10) return localEndInstant((end ? addDays(value, 1) : value) + 'T00:00:00');
    if (/(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return Date.parse(value);
    return localEndInstant(value.length === 16 ? value + ':00' : value);
  }
  function occurrences(event, now) {
    now = now || new Date();
    if (!isCurrent(event, now)) return [];
    var recurring = event.recurring === true || event.display_mode === 'recurring_series';
    // A season boundary is not evidence of a session. Unenumerated series fail closed.
    var schedule = recurring ? (Array.isArray(event.schedule) ? event.schedule : []) : [{ dateStart: event.dateStart || event.startDate,
      dateEnd: endValue(event), time: event.timeLabel }];
    return schedule.map(function (item) {
      if (typeof item === 'string') item = { date: item };
      if (!item || typeof item !== 'object') return null;
      var start = item.dateStart || item.startDate || item.date;
      var end = item.dateEnd || item.endDate || String(start || '').slice(0, 10);
      var startAt = instant(start, false), endAt = instant(end, true);
      if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || endAt <= startAt || now.getTime() >= endAt) return null;
      return { date: localStamp(new Date(startAt)).slice(0, 10), start: start, end: end,
        time: item.time || item.timeLabel || event.timeLabel || '', startAt: startAt, endAt: endAt };
    }).filter(Boolean).sort(function (a, b) { return a.startAt - b.startAt; });
  }
  function matchingOccurrences(event, view, now) {
    var range = dateWindow(view, now);
    return occurrences(event, now).filter(function (item) {
      return !range || (item.startAt < instant(range.end, true) && item.endAt > instant(range.start, false));
    });
  }
  function occurrenceLabel(event, view, now) {
    return matchingOccurrences(event, view, now).map(function (item) {
      var finalDate = localStamp(new Date(item.endAt - 1)).slice(0, 10);
      return displayDay(item.date) + (finalDate !== item.date ? ' – ' + displayDay(finalDate) : '') +
        (item.time ? ' · ' + item.time : '');
    }).join('; ');
  }
  function isSoldOut(event) {
    return event.availabilityStatus === 'sold_out' || /\bsold[ -]out\b/i.test((event.costLabel || '') + ' ' + (event.availabilityLabel || ''));
  }
  function eventUrl(event, view) {
    view = normalizeDateView(view);
    return './events.html?city=' + encodeURIComponent(normCity(event.city).replace(/_/g, '-')) +
      (view === 'all' ? '' : '&date=' + encodeURIComponent(view)) + '#event-' + encodeURIComponent(event.id);
  }
  function parkDataset(city) {
    var key = normCity(city).replace(/_/g, '-');
    var supported = ['aurora', 'centennial', 'parker', 'englewood', 'highlands-ranch', 'littleton', 'castle-rock', 'westminster', 'arvada', 'lakewood', 'broomfield', 'thornton', 'commerce-city', 'greenwood-village', 'brighton', 'golden', 'lone-tree', 'denver'];
    return supported.indexOf(key) !== -1 ? key : '';
  }
  root.FEP_EVENTS = { timeZone: timeZone, localStamp: localStamp, validDate: validDate,
    endValue: endValue, startValue: startValue, isPublishable: isPublishable,
    isExpired: isExpired, isCurrent: isCurrent, normCity: normCity, weekendWindow: weekendWindow,
    dateWindow: dateWindow, normalizeDateView: normalizeDateView, occurrences: occurrences,
    matchingOccurrences: matchingOccurrences, occurrenceLabel: occurrenceLabel,
    isSoldOut: isSoldOut, eventUrl: eventUrl, parkDataset: parkDataset };
})(typeof window === 'undefined' ? globalThis : window);

/* city-events.js — injects live, city-specific events into the .events-callout
   block on city pages. Reads the city from the callout's "events.html?city=..."
   link, so no per-page configuration is needed. Self-contained: depends only on
   window.EVENTS_DATA (from data/events/events-manifest.js). */
(function () {
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  var rules = window.FEP_EVENTS;
  var normCity = rules.normCity;
  var isCurrent = rules.isCurrent;

  function startDate(event) {
    return rules.startValue(event);
  }

  function oneLine(event) {
    var text = (event.notes || event.dadNote || event.description || '').replace(/\s+/g, ' ').trim();
    return text.length > 118 ? text.slice(0, 115).replace(/\s+\S*$/, '') + '\u2026' : text;
  }

  function cityFromCallout(callout) {
    var link = callout.querySelector('a[href*="events.html"]');
    if (!link) return '';
    try {
      var qs = (link.getAttribute('href') || '').split('?')[1] || '';
      return (new URLSearchParams(qs).get('city') || '').trim().toLowerCase();
    } catch (e) {
      return '';
    }
  }

  // City's own current events: featured first, then soonest, capped at 3.
  function selectCityEvents(allEvents, cityKey, today) {
    return allEvents
      .filter(function (e) { return e && normCity(e.city) === normCity(cityKey) && isCurrent(e, today) && !rules.isSoldOut(e) && rules.matchingOccurrences(e, "all", today).length; })
      .sort(function (a, b) {
        if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
        return startDate(a).localeCompare(startDate(b));
      })
      .slice(0, 3);
  }

  function hasCityEvents(allEvents, cityKey) {
    return allEvents.some(function (e) {
      return e && normCity(e.city) === normCity(cityKey);
    });
  }

  function cardHtml(event) {
    var location = event.locationLabel || event.venue_name || event.park_name || '';
    var view = rules.normalizeDateView(new URLSearchParams(window.location.search).get('date'));
    var date = view === 'all' ? (event.recurrence_label || event.dateLabel || event.timeLabel || 'Upcoming') : rules.occurrenceLabel(event, view, new Date());
    var href = rules.eventUrl(event, view);
    return [
      '<article class="city-event-card" data-event-id="' + esc(event.id) + '">',
        '<div class="city-event-date">' + esc(date) + '</div>',
        '<h3 class="city-event-title">' + esc(event.title) + '</h3>',
        (location ? '<div class="city-event-location">' + esc(location) + '</div>' : ''),
        '<p class="city-event-desc">' + esc(oneLine(event)) + '</p>',
        '<p class="city-event-cost">' + esc(event.costLabel) + '</p>',
        '<p class="city-event-availability">' + esc(event.availabilityLabel || 'Confirm requirements and availability with the organizer.') + '</p>',
        '<a class="city-event-cta" href="' + esc(href) + '">View Event</a>',
      '</article>'
    ].join('');
  }

  var STYLE_ID = 'city-events-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      '.events-callout{background:#fff;border:1px solid #e4ddd4;border-radius:24px;padding:24px;margin-top:24px;box-shadow:0 14px 36px rgba(20,31,23,0.08);}',
      ".events-callout-text h2{font-family:'Fraunces',serif;font-size:24px;letter-spacing:-0.03em;color:#1a1a1a;margin-bottom:6px;}",
      '.events-callout-text p{color:#637168;font-size:14px;line-height:1.6;}',
      '.city-event-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:14px;margin:18px 0;}',
      '.city-event-card{background:#f7faf8;border:1px solid #e4ddd4;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:7px;}',
      '.city-event-date{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#0f6e56;}',
      ".city-event-title{font-family:'Outfit',sans-serif;font-size:16px;font-weight:600;line-height:1.2;color:#1a1a1a;}",
      '.city-event-location{font-size:13px;color:#637168;}',
      '.city-event-cost,.city-event-availability{font-size:13px;line-height:1.5;color:#314039;}.city-event-cost{font-weight:600;}',
      '.city-event-desc{font-size:13px;line-height:1.5;color:#314039;}',
      '.city-event-cta{display:inline-flex;align-items:center;min-height:44px;margin-top:auto;font-size:13px;font-weight:700;color:#0f6e56;text-decoration:none;}',
      '.city-event-cta:hover{color:#085041;}.city-event-cta:focus-visible{outline:3px solid #0f6e56;outline-offset:3px;}'
    ].join('');
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function mount() {
    var data = window.EVENTS_DATA;
    if (!data || !Array.isArray(data.events)) return;

    var callouts = document.querySelectorAll('.events-callout');
    if (!callouts.length) return;

    // Style the callout consistently whether or not it ends up with events.
    injectStyles();

    var today = new Date();

    Array.prototype.forEach.call(callouts, function (callout) {
      if (callout.querySelector('.city-event-grid')) return; // already mounted

      var cityKey = cityFromCallout(callout);
      if (!cityKey) return;
      if (!hasCityEvents(data.events, cityKey)) {
        callout.style.display = 'none';
        return;
      }

      var view = rules.normalizeDateView(new URLSearchParams(window.location.search).get('date'));
      var events = selectCityEvents(data.events.filter(function (event) {
        return rules.matchingOccurrences(event, view, today).length;
      }), cityKey, today);
      var allLink = callout.querySelector('a[href*="events.html"]');
      if (allLink && view !== 'all') {
        var destination = new URL(allLink.href);
        destination.searchParams.set('date', view);
        allLink.href = destination.href;
      }
      if (!events.length) {
        callout.style.display = 'none';
        return;
      }

      var grid = document.createElement('div');
      grid.className = 'city-event-grid';
      grid.innerHTML = events.map(cardHtml).join('');

      var link = callout.querySelector('a[href*="events.html"]');
      if (link) {
        callout.insertBefore(grid, link); // text -> live cards -> "View all" link
      } else {
        callout.appendChild(grid);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
