(function () {
  const config = window.PLAYGROUND_PAGE_CONFIG || {};
  const datasetKey = config.datasetKey || "";
  const city = config.city || "";
  const limit = typeof config.limit === "number" ? config.limit : 12;

  const FEATURE_LABELS = {
    playground: "Playground",
    trails: "Trails",
    bathrooms: "Restrooms",
    parking: "Parking",
    dog_park: "Dog Park",
    sprayground: "Splash Pad"
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function plainText(value) {
    return String(value || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\*\*/g, " ")
      .replace(/[`#_]/g, " ")
      .replace(/[\u2600-\u27BF]/g, " ")
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function shortDescription(park) {
    const fallback = city ? city + " playground park for families." : "Family-friendly playground park.";
    const raw = plainText(park.description || park.d || "");
    if (!raw) return fallback;
    const sentences = raw.match(/[^.!?]+[.!?]?/g) || [raw];
    let summary = "";
    for (let i = 0; i < sentences.length; i += 1) {
      const next = (summary ? summary + " " : "") + sentences[i].trim();
      if (next.length > 220 && summary) break;
      summary = next;
      if (summary.length >= 140) break;
    }
    return summary || raw.slice(0, 220);
  }

  function featureSummary(park) {
    const items = [];
    const features = park.features || park.f || {};
    if (park.playground) items.push(FEATURE_LABELS.playground);
    if (park.trails) items.push(FEATURE_LABELS.trails);
    if (park.bathrooms) items.push(FEATURE_LABELS.bathrooms);
    if (park.parking) items.push(FEATURE_LABELS.parking);
    if (park.dog_park) items.push(FEATURE_LABELS.dog_park);
    if (features.sprayground) items.push(FEATURE_LABELS.sprayground);
    return items.join(" • ");
  }

  function parkUrl(park) {
    return "./park.html?dataset=" + encodeURIComponent(datasetKey) + "&id=" + encodeURIComponent(park.id || park.name || park.n);
  }

  function isPlaceholderDescription(park) {
    const text = plainText(park.description || park.d || "");
    return /^A Denver playground location kept in the background dataset/i.test(text);
  }

  function scorePark(park) {
    const features = park.features || park.f || {};
    let score = 0;
    if (!isPlaceholderDescription(park) && plainText(park.description || park.d || "")) score += 5;
    if (park.trails) score += 2;
    if (park.bathrooms) score += 2;
    if (park.parking) score += 2;
    if (park.dog_park) score += 1;
    if (features.sprayground) score += 2;
    if (park.address || park.a) score += 1;
    if (park.heroPhoto && park.heroPhoto.src) score += 1;
    if (Number(park.acreage || park.ac || 0) > 0) score += 1;
    return score;
  }

  function buildList(parks) {
    const byName = new Map(parks.map((park) => [park.name || park.n, park]));
    const editorialByName = (window.TOP_PICK_EDITORIAL && window.TOP_PICK_EDITORIAL[datasetKey]) || {};
    const editorialNames = ((window.TOP_PICKS && window.TOP_PICKS[datasetKey]) || [])
      .filter((name) => {
        const park = byName.get(name);
        return park && park.playground;
      });

    const used = new Set();
    const editorialItems = editorialNames.map((name) => {
      used.add(name);
      return { park: byName.get(name), editorial: editorialByName[name] || null };
    });

    const remaining = parks
      .filter((park) => !used.has(park.name || park.n))
      .sort((a, b) => {
        const diff = scorePark(b) - scorePark(a);
        if (diff !== 0) return diff;
        return String(a.name || a.n).localeCompare(String(b.name || b.n));
      })
      .map((park) => ({ park, editorial: null }));

    return editorialItems.concat(remaining).slice(0, limit);
  }

  const parks = (window.getParkDataset ? window.getParkDataset(datasetKey) : []) || [];
  const playgroundParks = parks.filter((park) => park.playground);
  const items = buildList(playgroundParks);
  const grid = document.getElementById("best-grid");
  const empty = document.getElementById("empty-state");

  if (!grid) return;

  if (!items.length) {
    if (empty) empty.style.display = "";
    return;
  }

  if (empty) empty.style.display = "none";
  items.forEach(({ park, editorial }) => {
    const article = document.createElement("article");
    article.className = "best-card";
    const photo = park.heroPhoto && park.heroPhoto.src ? park.heroPhoto.src : "";
    const mediaStyle = photo ? ' style="background-image:url(' + "'" + photo + "'" + ')"' : "";
    const featureLine = featureSummary(park);
    const badge = editorial && editorial.label ? editorial.label : "Playground Pick";
    const tip = editorial && editorial.local_tip ? editorial.local_tip : "";
    article.innerHTML =
      '<div class="best-media"' + mediaStyle + '><span class="best-badge">' + escapeHtml(badge) + '</span></div>' +
      '<div class="best-body">' +
        '<div class="best-meta">' + escapeHtml(city) + ' playground</div>' +
        '<h2 class="best-title">' + escapeHtml(park.name || park.n) + '</h2>' +
        '<p class="best-description">' + escapeHtml(shortDescription(park)) + '</p>' +
        (featureLine ? '<div class="best-feature-line">' + escapeHtml(featureLine) + '</div>' : "") +
        (tip ? '<p class="best-tip"><strong>Local tip:</strong> ' + escapeHtml(tip) + '</p>' : "") +
        '<div class="best-actions">' +
          '<a class="text-btn" href="' + parkUrl(park) + '">Open park page</a>' +
          '<a class="text-btn" href="./parks.html?dataset=' + encodeURIComponent(datasetKey) + '&search=' + encodeURIComponent(park.name || park.n) + '">Show on ' + escapeHtml(city) + ' map</a>' +
        '</div>' +
      '</div>';
    grid.appendChild(article);
  });
})();
