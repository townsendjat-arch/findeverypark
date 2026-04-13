(function () {
  const params = new URLSearchParams(window.location.search);
  const requestedDataset = params.get("dataset");
  const savedDataset = window.localStorage ? localStorage.getItem("activeDataset") : "";
  const pageName = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const shouldIgnoreSavedDataset = pageName === "park.html" && !requestedDataset;

  const datasetScripts = {
    aurora: "aurora-parks-data.js",
    centennial: "centennial-parks-data.js",
    parker: "parker-parks-data.js",
    "lone-tree": "lone-tree-parks-data.js",
    denver: "denver-parks-data.js"
  };

  function resolveDatasetKey(value) {
    return value && datasetScripts[value] ? value : "";
  }

  const siteDefaultDataset = resolveDatasetKey(window.PARK_SITE && window.PARK_SITE.defaultDataset) || "aurora";
  const activeDataset =
    resolveDatasetKey(requestedDataset) ||
    (!shouldIgnoreSavedDataset ? resolveDatasetKey(savedDataset) : "") ||
    siteDefaultDataset;

  if (window.localStorage) {
    localStorage.setItem("activeDataset", activeDataset);
  }

  window.REQUESTED_DATASET_KEY = requestedDataset || "";
  window.REQUESTED_DATASET_INVALID = !!requestedDataset && activeDataset !== requestedDataset;
  window.ACTIVE_DATASET_KEY = activeDataset;
  window.PARK_SITE = window.PARK_SITE || {};
  window.PARK_SITE.defaultDataset = activeDataset;

  const scriptName = datasetScripts[activeDataset] || datasetScripts.aurora;
  const existingDataset = window.getParkDataset && window.getParkDataset(activeDataset);
  if (existingDataset && existingDataset.length) {
    window.DATASET_LOAD_PROMISE = Promise.resolve(existingDataset);
    return;
  }

  const existingScript = document.querySelector('script[data-dataset-key="' + activeDataset + '"]');
  if (existingScript) {
    window.DATASET_LOAD_PROMISE = window.DATASET_LOAD_PROMISE || Promise.resolve();
    return;
  }

  window.DATASET_LOAD_PROMISE = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptName;
    script.async = false;
    script.dataset.datasetKey = activeDataset;
    script.onload = () => resolve(window.getParkDataset ? window.getParkDataset(activeDataset) : true);
    script.onerror = () => reject(new Error("Failed to load dataset script: " + scriptName));
    document.body.appendChild(script);
  });
})();
