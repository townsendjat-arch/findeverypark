(function () {
  const params = new URLSearchParams(window.location.search);
  const requestedDataset = params.get("dataset");
  let savedDataset = "";
  try { savedDataset = localStorage.getItem("activeDataset") || ""; } catch (_) {}
  const pageName = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const shouldIgnoreSavedDataset = pageName === "park.html" && !requestedDataset;

  const datasetScripts = {
    aurora: "aurora-parks-data.js",
    centennial: "centennial-parks-data.js",
    parker: "parker-parks-data.js",
    englewood: "englewood-parks-data.js",
    "highlands-ranch": "highlands-ranch-parks-data.js",
    littleton: "littleton-parks-data.js",
    "castle-rock": "castle-rock-parks-data.js",
    westminster: "westminster-parks-data.js",
    arvada: "arvada-parks-data.js",
    lakewood: "lakewood-parks-data.js",
    broomfield: "broomfield-parks-data.js",
    thornton: "thornton-parks-data.js",
    "commerce-city": "commerce-city-parks-data.js",
    "greenwood-village": "greenwood-village-parks-data.js",
    brighton: "brighton-parks-data.js",
    golden: "golden-parks-data.js",
    "lone-tree": "lone-tree-parks-data.js",
    denver: "denver-parks-data.js"
  };

  function resolveDatasetKey(value) {
    return typeof value === "string" && Object.prototype.hasOwnProperty.call(datasetScripts, value) ? value : "";
  }

  const siteDefaultDataset = resolveDatasetKey(window.PARK_SITE && window.PARK_SITE.defaultDataset) || "aurora";
  const activeDataset =
    resolveDatasetKey(requestedDataset) ||
    (!shouldIgnoreSavedDataset ? resolveDatasetKey(savedDataset) : "") ||
    siteDefaultDataset;

  try { localStorage.setItem("activeDataset", activeDataset); } catch (_) {}

  window.REQUESTED_DATASET_KEY = requestedDataset || "";
  window.REQUESTED_DATASET_INVALID = !!requestedDataset && activeDataset !== requestedDataset;
  window.ACTIVE_DATASET_KEY = activeDataset;
  window.PARK_SITE = window.PARK_SITE || {};
  window.PARK_SITE.defaultDataset = activeDataset;

  const scriptName = datasetScripts[activeDataset] || datasetScripts.aurora;

  function setActiveParksGlobal(datasetKey, parks) {
    const activeParks =
      Array.isArray(parks) && parks.length
        ? parks
        : window.getParkDataset
          ? window.getParkDataset(datasetKey)
          : window.PARK_DATASETS && window.PARK_DATASETS[datasetKey];

    if (Array.isArray(activeParks)) {
      window.PARKS = activeParks;
    }

    return activeParks;
  }

  // Loading a script does not select its city. The directory commits only the latest request.
  const pending = new Map();
  window.loadParkDataset = function (value) {
    const key = resolveDatasetKey(value);
    if (!key) return Promise.reject(new Error("Unsupported city"));
    const existing = window.getParkDataset && window.getParkDataset(key);
    if (Array.isArray(existing)) return Promise.resolve(existing);
    if (pending.has(key)) return pending.get(key);
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = datasetScripts[key];
      script.async = true;
      script.dataset.datasetKey = key;
      script.onload = () => {
        const parks = window.getParkDataset && window.getParkDataset(key);
        if (Array.isArray(parks)) resolve(parks);
        else { pending.delete(key); script.remove(); reject(new Error("Park dataset unavailable")); }
      };
      script.onerror = () => { pending.delete(key); script.remove(); reject(new Error("Park dataset unavailable")); };
      document.body.appendChild(script);
    });
    pending.set(key, promise);
    return promise;
  };
  window.DATASET_LOAD_PROMISE = window.loadParkDataset(activeDataset).then(parks => window.ACTIVE_DATASET_KEY === activeDataset ? setActiveParksGlobal(activeDataset, parks) : parks);
})();
