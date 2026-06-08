(function () {
  const TOP_AURORA_PARK_IDS = new Set([
    "co-aurora-utah-park",
    "co-aurora-great-plains-park",
    "co-aurora-red-tailed-hawk-park",
    "co-aurora-central-park",
    "co-aurora-del-mar-park",
    "co-aurora-aurora-reservoir",
    "co-aurora-expo-park",
    "co-aurora-sports-park",
    "co-aurora-meadowood-park",
    "co-aurora-village-green-park"
  ]);

  const WEEKEND_PAGE_URL = "./this-weekend-aurora.html";
  const SPONSOR_PAGE_URL = "./sponsor-aurora-guides.html";
  const WEEKEND_EMAIL_KEY = "fep_aurora_weekend_email";

  function resolveTarget(target) {
    if (!target) return null;
    if (typeof target === "string") return document.querySelector(target);
    return target;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function buildMailto(email, source) {
    const subject = "Aurora weekend park ideas signup";
    const body = [
      "Please add this email to the Aurora weekend park ideas list.",
      "",
      "Email: " + email,
      "Source: " + source,
      "Date: " + new Date().toISOString()
    ].join("\n");
    return "mailto:jason@findeverypark.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function mountEmailCapture(target, options) {
    const el = resolveTarget(target);
    if (!el) return;
    const opts = options || {};
    const source = opts.source || "site";
    const title = opts.title || "Get 3 family park ideas this weekend in Aurora";
    const copy = opts.copy || "This lightweight signup opens a prefilled email to Jason so you can get the Aurora weekend shortlist without adding a backend.";
    const buttonLabel = opts.buttonLabel || "Get weekend ideas";
    const secondaryLabel = opts.secondaryLabel || "See this weekend's Aurora picks";
    const savedEmail = window.localStorage ? window.localStorage.getItem(WEEKEND_EMAIL_KEY) || "" : "";

    el.innerHTML =
      '<div class="growth-card">' +
        '<span class="growth-eyebrow">Aurora Weekend Ideas</span>' +
        '<h2 class="growth-title">' + escapeHtml(title) + '</h2>' +
        '<p class="growth-copy">' + escapeHtml(copy) + '</p>' +
        '<form class="growth-form" novalidate>' +
          '<input class="growth-input" type="email" name="email" placeholder="Your email address" value="' + escapeHtml(savedEmail) + '" required>' +
          '<button class="growth-button" type="submit">' + escapeHtml(buttonLabel) + '</button>' +
        '</form>' +
        '<div class="growth-helper">Static-site friendly for now. If your mail app does not open, email <a href="mailto:jason@findeverypark.com">jason@findeverypark.com</a>.</div>' +
        '<div class="growth-links"><a class="growth-secondary-link" href="' + WEEKEND_PAGE_URL + '">' + escapeHtml(secondaryLabel) + '</a></div>' +
        '<div class="growth-status" aria-live="polite"></div>' +
      '</div>';

    const form = el.querySelector("form");
    const input = el.querySelector("input[name='email']");
    const status = el.querySelector(".growth-status");
    if (!form || !input || !status) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = input.value.trim();
      if (!validEmail(email)) {
        status.textContent = "Enter a valid email address first.";
        return;
      }
      if (window.localStorage) {
        window.localStorage.setItem(WEEKEND_EMAIL_KEY, email);
      }
      status.textContent = "Opening your email app with a prefilled signup message.";
      window.location.href = buildMailto(email, source);
    });
  }

  function mountWeekendTeaser(target, options) {
    const el = resolveTarget(target);
    if (!el) return;
    const opts = options || {};
    const title = opts.title || "This Weekend in Aurora";
    const copy = opts.copy || "Start with three easy Aurora park ideas, then jump into the Aurora events page when you want community happenings too.";
    el.innerHTML =
      '<div class="growth-card">' +
        '<span class="growth-eyebrow">Repeat Visit Hook</span>' +
        '<h2 class="growth-title">' + escapeHtml(title) + '</h2>' +
        '<p class="growth-copy">' + escapeHtml(copy) + '</p>' +
        '<div class="growth-links">' +
          '<a class="growth-link" href="' + WEEKEND_PAGE_URL + '">Open Aurora weekend page</a>' +
          '<a class="growth-secondary-link" href="./events.html?city=aurora">Open Aurora events</a>' +
        '</div>' +
      '</div>';
  }

  function isTopAuroraPark(parkId) {
    return TOP_AURORA_PARK_IDS.has(parkId);
  }

  function getNearParkLinks(park) {
    const parkId = park && park.id;
    const parkName = park && (park.name || park.n) || "this park";
    if (!isTopAuroraPark(parkId)) return null;

    function mapsLink(term) {
      return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(term + " near " + parkName + " Aurora CO");
    }

    return {
      title: "Near This Park",
      copy: "Useful nearby searches now, with a sponsor-ready slot built in for future local partners.",
      items: [
        { label: "Coffee nearby", note: "Easy pre-park stop", href: mapsLink("coffee") },
        { label: "Lunch nearby", note: "Simple family meal options", href: mapsLink("family lunch") },
        { label: "Treats nearby", note: "Ice cream or dessert after the park", href: mapsLink("ice cream") },
        { label: "Indoor backup nearby", note: "Rain, wind, or tired-kid fallback", href: mapsLink("indoor kids activities") }
      ],
      sponsorHref: SPONSOR_PAGE_URL
    };
  }

  window.FEPGrowth = {
    weekendPageUrl: WEEKEND_PAGE_URL,
    sponsorPageUrl: SPONSOR_PAGE_URL,
    mountEmailCapture,
    mountWeekendTeaser,
    isTopAuroraPark,
    getNearParkLinks
  };
})();
