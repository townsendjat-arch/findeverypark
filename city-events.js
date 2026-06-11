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

  function normCity(value) {
    return String(value == null ? '' : value).trim().toLowerCase().replace(/_/g, '-');
  }

  function endDate(event) {
    if (event.series_end) return new Date(event.series_end + 'T23:59:59');
    if (event.dateEnd) return new Date(event.dateEnd);
    if (event.dateStart) return new Date(event.dateStart);
    return null;
  }

  function startDate(event) {
    return new Date(event.series_start ? event.series_start + 'T00:00:00' : event.dateStart || 0);
  }

  function isCurrent(event, today) {
    var end = endDate(event);
    return !end || end >= today;
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
      .filter(function (e) { return e && normCity(e.city) === normCity(cityKey) && isCurrent(e, today); })
      .sort(function (a, b) {
        if (Boolean(a.featured) !== Boolean(b.featured)) return a.featured ? -1 : 1;
        return startDate(a) - startDate(b);
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
    var date = event.recurrence_label || event.dateLabel || event.timeLabel || 'Upcoming';
    var href = event.href || event.link || './events.html';
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
    today.setHours(0, 0, 0, 0);

    Array.prototype.forEach.call(callouts, function (callout) {
      if (callout.querySelector('.city-event-grid')) return; // already mounted

      var cityKey = cityFromCallout(callout);
      if (!cityKey) return;
      if (!hasCityEvents(data.events, cityKey)) {
        callout.style.display = 'none';
        return;
      }

      var events = selectCityEvents(data.events, cityKey, today);
      if (!events.length) return; // hide-if-empty: keep the "View all events" link as-is

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
