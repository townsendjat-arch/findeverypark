(function () {
  const params = new URLSearchParams(window.location.search);
  const requestedDataset = params.get("dataset");
  const savedDataset = window.localStorage ? localStorage.getItem("activeDataset") : "";
  const activeDataset =
    requestedDataset ||
    savedDataset ||
    (window.PARK_SITE && window.PARK_SITE.defaultDataset) ||
    "aurora";

  if (window.localStorage) {
    localStorage.setItem("activeDataset", activeDataset);
  }

  window.ACTIVE_DATASET_KEY = activeDataset;
  window.PARK_SITE = window.PARK_SITE || {};
  window.PARK_SITE.defaultDataset = activeDataset;

  const datasetScripts = {
    aurora: "parks-data.js",
    centennial: "centennial-parks-data.js",
    parker: "parker-parks-data.js"
  };
  const scriptName = datasetScripts[activeDataset] || datasetScripts.aurora;
  document.write('<script src="' + scriptName + '"><\/script>');
})();
