(function () {
  const siteConfig = window.SITE_CONFIG || {};
  const site = (window.PARK_SITE = window.PARK_SITE || {
    defaultDataset: "aurora",
    datasetsMeta: {
      aurora: {
        city: "Aurora",
        state: "CO",
        stateName: "Colorado",
        brandName: siteConfig.brandName || "Find Every Park Colorado"
      },
      centennial: {
        city: "Centennial",
        state: "CO",
        stateName: "Colorado",
        brandName: siteConfig.brandName || "Find Every Park Colorado"
      },
      parker: {
        city: "Parker",
        state: "CO",
        stateName: "Colorado",
        brandName: siteConfig.brandName || "Find Every Park Colorado"
      },
      englewood: {
        city: "Englewood",
        state: "CO",
        stateName: "Colorado",
        brandName: siteConfig.brandName || "Find Every Park Colorado"
      },
      "highlands-ranch": {
        city: "Highlands Ranch",
        state: "CO",
        stateName: "Colorado",
        brandName: siteConfig.brandName || "Find Every Park Colorado"
      },
      littleton: {
        city: "Littleton",
        state: "CO",
        stateName: "Colorado",
        brandName: siteConfig.brandName || "Find Every Park Colorado"
      },
      "castle-rock": {
        city: "Castle Rock",
        state: "CO",
        stateName: "Colorado",
        brandName: siteConfig.brandName || "Find Every Park Colorado"
      },
      "lone-tree": {
        city: "Lone Tree",
        state: "CO",
        stateName: "Colorado",
        brandName: siteConfig.brandName || "Find Every Park Colorado"
      },
      denver: {
        city: "Denver",
        state: "CO",
        stateName: "Colorado",
        brandName: siteConfig.brandName || "Find Every Park Colorado"
      }
    }
  });

  const datasets = (window.PARK_DATASETS = window.PARK_DATASETS || {});
  const photoManifest = (window.PARK_PHOTO_MANIFEST = window.PARK_PHOTO_MANIFEST || {
    version: 1,
    parks: {}
  });

  function slugify(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getDataset(datasetKey) {
    if (datasets[datasetKey]) {
      return datasets[datasetKey];
    }

    if (datasetKey === site.defaultDataset && Array.isArray(window.PARKS)) {
      return window.PARKS;
    }

    return null;
  }

  function normalizeBoolean(value) {
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (!normalized) return false;
      return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "y";
    }

    return value === true || value === 1;
  }

  function normalizePark(park, datasetKey) {
    const meta = site.datasetsMeta[datasetKey] || {};
    const name = park.n || park.name || "";
    const city = park.city || meta.city || "";
    const state = park.state || meta.state || "";
    const stateName = park.stateName || meta.stateName || "";
    const address = park.a || park.address || "";
    const features = park.f || park.features || {};
    const datasetCoords = (window.PARK_COORDS && window.PARK_COORDS[datasetKey]) || {};
    const coordPair = Array.isArray(datasetCoords[name]) ? datasetCoords[name] : null;
    const lat = Number.isFinite(Number(park.lat)) ? Number(park.lat) : coordPair ? Number(coordPair[0]) : null;
    const lng = Number.isFinite(Number(park.lng)) ? Number(park.lng) : coordPair ? Number(coordPair[1]) : null;
    const acreage =
      typeof park.ac === "number"
        ? park.ac
        : typeof park.acreage === "number"
          ? park.acreage
          : Number(park.ac || park.acreage) || 0;
    const description = park.description || park.d || "";
    const baseId = park.id || [state.toLowerCase(), slugify(city), slugify(name)].filter(Boolean).join("-");
    const manifestPhotos = Array.isArray(photoManifest.parks[baseId]) ? photoManifest.parks[baseId].slice() : [];
    const inlinePhotos = Array.isArray(park.photos)
      ? park.photos.map((src, index) => ({
          id: baseId + "-inline-" + (index + 1),
          role: index === 0 ? "hero" : "gallery",
          src,
          thumb: src,
          alt: name + " photo",
          caption: "",
          creditName: "",
          creditUrl: "",
          license: "",
          sourceType: "legacy",
          status: "approved",
          sortOrder: index + 1
        }))
      : [];
    const photoRecords = (manifestPhotos.length ? manifestPhotos : inlinePhotos)
      .slice()
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const heroPhoto = photoRecords.find((photo) => photo.role === "hero") || photoRecords[0] || null;

    return {
      ...park,
      id: baseId,
      n: name,
      name,
      a: address,
      address,
      ac: acreage,
      acreage,
      f: features,
      features,
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      playground: normalizeBoolean(park.playground) || normalizeBoolean(features.playground),
      dog_park: normalizeBoolean(park.dog_park) || normalizeBoolean(features.dog_park),
      trails: normalizeBoolean(park.trails) || normalizeBoolean(features.trails),
      bathrooms: normalizeBoolean(park.bathrooms) || normalizeBoolean(park.restroom) || normalizeBoolean(features.bathrooms) || normalizeBoolean(features.restroom),
      parking: normalizeBoolean(park.parking) || normalizeBoolean(features.parking),
      description,
      d: description,
      photos: photoRecords.map((photo) => photo.src),
      photoGallery: photoRecords,
      heroPhoto,
      city,
      state,
      stateName,
      datasetKey
    };
  }

  window.normalizePark = function (park, datasetKey) {
    return normalizePark(park, datasetKey || site.defaultDataset);
  };

  window.slugifyParkValue = slugify;
  window.getParkDataset = getDataset;

  window.waitForParkDataset = function (datasetKey, options) {
    const key = datasetKey || site.defaultDataset;
    const timeout = options && typeof options.timeout === "number" ? options.timeout : 4000;
    const existing = getDataset(key);

    if (existing && existing.length) {
      return Promise.resolve(existing);
    }

    return new Promise((resolve, reject) => {
      let timerId = 0;

      function cleanup() {
        window.removeEventListener("park-dataset-ready", handleReady);
        if (timerId) {
          window.clearTimeout(timerId);
        }
      }

      function handleReady(event) {
        const detail = event && event.detail ? event.detail : {};
        if (detail.datasetKey !== key) {
          return;
        }

        const list = getDataset(key);
        if (list && list.length) {
          cleanup();
          resolve(list);
        }
      }

      window.addEventListener("park-dataset-ready", handleReady);
      timerId = window.setTimeout(() => {
        cleanup();
        reject(new Error("Timed out waiting for park dataset: " + key));
      }, timeout);
    });
  };

  window.findParkInDataset = function (datasetKey, query) {
    const raw = String(query || "").trim();
    if (!raw) {
      return null;
    }

    const normalized = slugify(raw);
    const parks = getDataset(datasetKey) || [];

    return parks.find((park) => {
      const name = park.name || park.n || "";
      return (
        String(park.id || "").toLowerCase() === raw.toLowerCase() ||
        String(park.id || "").toLowerCase() === normalized ||
        name.toLowerCase() === raw.toLowerCase() ||
        slugify(name) === normalized
      );
    }) || null;
  };

  window.findParkByIdInDataset = function (datasetKey, parkId) {
    const raw = String(parkId || "").trim().toLowerCase();
    if (!raw) {
      return null;
    }

    const parks = getDataset(datasetKey) || [];
    return parks.find((park) => String(park.id || "").toLowerCase() === raw) || null;
  };

  window.registerParkDataset = function (datasetKey, parks, meta) {
    if (meta) {
      site.datasetsMeta[datasetKey] = {
        ...(site.datasetsMeta[datasetKey] || {}),
        ...meta
      };
    }

    const normalized = (parks || []).map((park) => normalizePark(park, datasetKey));
    datasets[datasetKey] = normalized;

    if (!window.PARKS || datasetKey === site.defaultDataset) {
      window.PARKS = normalized;
    }

    window.ALL_PARKS = Object.values(datasets).flat();
    window.dispatchEvent(
      new CustomEvent("park-dataset-ready", {
        detail: {
          datasetKey,
          count: normalized.length
        }
      })
    );
    return normalized;
  };
})();
