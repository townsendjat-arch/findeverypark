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
  function isPumpkin(event) {
    return !!event && event.category === 'pumpkin-patches' && !!event.pumpkin;
  }
  function pumpkinOccurrences(event, now) {
    if (!isPumpkin(event)) return [];
    // Only explicit source-backed dates. Never expand the broad season range.
    // Retain the complete record: cutoffs, warnings and per-session status matter.
    return (event.schedule || []).filter(function (item) {
      return item && validDate(item.dateStart) && validDate(item.dateEnd) &&
        !['cancelled', 'closed', 'sold_out'].includes(item.availability) &&
        !isExpired({ dateEnd: item.dateEnd }, now);
    }).map(function (item) { return Object.assign({}, item); })
      .sort(function (a, b) { return a.dateStart.localeCompare(b.dateStart); });
  }
  function nextPumpkinVisits(event, now) {
    return pumpkinOccurrences(event, now).filter(function (item) {
      // An attraction/wagon cutoff is NOT a grounds admission cutoff.
      return !item.entryCutoff || !isExpired({ dateEnd: item.entryCutoff }, now);
    });
  }
  function isCurrent(event, now) {
    return isPublishable(event) && event.status !== 'archived' &&
      (isPumpkin(event) ? pumpkinOccurrences(event, now).length > 0 : !isExpired(event, now));
  }
  function isRecommendable(event, now) {
    return isCurrent(event, now) && (!isPumpkin(event) ||
      (event.pumpkin.operatingStatus !== 'conflicting' && nextPumpkinVisits(event, now).length > 0));
  }
  function pumpkinPreviewDate(event, now) {
    var next = nextPumpkinVisits(event, now)[0];
    if (!next) return 'No later verified admission dates';
    return 'Next published: ' + new Date(next.dateStart).toLocaleDateString('en-US', {
      timeZone: timeZone, month: 'short', day: 'numeric'
    }) + ' · ' + next.time + (next.lastEntry ? ' · ' + next.lastEntry : '');
  }
  function pumpkinPreview(event) {
    if (!isPumpkin(event)) return '';
    var p = event.pumpkin, preview = p.preview || {};
    // Material cost/booking qualifications are never clipped to 118 characters.
    return p.pickingType + ' Entry: ' + (preview.entry || p.entryCost) +
      ' Pumpkins: ' + (preview.pumpkins || p.pumpkinCost) +
      ' Activities: ' + (preview.activities || p.activityCost) +
      ' Before you go: ' + (preview.warning || (p.warnings || []).join(' '));
  }
  function normCity(value) {
    return String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  }
  function startValue(event) {
    return event.series_start || event.dateStart || event.startDate || '';
  }
  root.FEP_EVENTS = { timeZone: timeZone, localStamp: localStamp, validDate: validDate,
    endValue: endValue, startValue: startValue, isPublishable: isPublishable,
    isExpired: isExpired, isCurrent: isCurrent, normCity: normCity,
    isPumpkin: isPumpkin, pumpkinOccurrences: pumpkinOccurrences, nextPumpkinVisits: nextPumpkinVisits,
    isRecommendable: isRecommendable, pumpkinPreview: pumpkinPreview, pumpkinPreviewDate: pumpkinPreviewDate };
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
  var isCurrent = rules.isRecommendable;

  function startDate(event) {
    return rules.startValue(event);
  }

  function oneLine(event) {
    if (rules.isPumpkin(event)) return rules.pumpkinPreview(event);
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
      .filter(function (e) { return e && normCity(e.city) === normCity(cityKey) && isCurrent(e, today); })
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
    var date = rules.isPumpkin(event) ? rules.pumpkinPreviewDate(event, new Date()) : event.recurrence_label || event.dateLabel || event.timeLabel || 'Upcoming';
    var href = rules.isPumpkin(event) ? './events.html?category=pumpkin-patches&city=' + encodeURIComponent(event.city) + '#' + encodeURIComponent(event.id) : event.href || event.link || './events.html';
    return [
      '<article class="city-event-card">',
        '<div class="city-event-date">' + esc(date) + '</div>',
        '<h3 class="city-event-title">' + esc(event.title) + '</h3>',
        (location ? '<div class="city-event-location">' + esc(location) + '</div>' : ''),
        '<p class="city-event-desc">' + esc(oneLine(event)) + '</p>',
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
      '.city-event-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:18px 0;}',
      '.city-event-card{background:#f7faf8;border:1px solid #e4ddd4;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:7px;}',
      '.city-event-date{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#0f6e56;}',
      ".city-event-title{font-family:'Outfit',sans-serif;font-size:16px;font-weight:600;line-height:1.2;color:#1a1a1a;}",
      '.city-event-location{font-size:13px;color:#637168;}',
      '.city-event-desc{font-size:13px;line-height:1.5;color:#314039;}',
      '.city-event-cta{margin-top:auto;font-size:13px;font-weight:700;color:#0f6e56;text-decoration:none;}',
      '.city-event-cta:hover{color:#085041;}'
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

      var events = selectCityEvents(data.events, cityKey, today);
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
