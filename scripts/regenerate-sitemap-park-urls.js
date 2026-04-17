const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const SITEMAP_PATH = path.join(ROOT, "sitemap.xml");

function discoverDatasets(root, allowedKeys) {
  const allowed = new Set(allowedKeys || []);

  return fs.readdirSync(root)
    .filter((filename) => filename.endsWith("-parks-data.js"))
    .reduce((acc, filename) => {
      const key = filename.replace("-parks-data.js", "");
      if (allowed.has(key)) {
        acc[key] = filename;
      }
      return acc;
    }, {});
}

function createBrowserContext() {
  const window = {
    SITE_CONFIG: {},
    PARK_COORDS: {},
    PARK_PHOTO_MANIFEST: { version: 1, parks: {} },
    localStorage: { getItem() { return ""; }, setItem() {} },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {}
  };

  const context = {
    window,
    console,
    CustomEvent: function CustomEvent(type, init) {
      this.type = type;
      this.detail = init && init.detail ? init.detail : {};
    }
  };

  context.global = context;
  context.globalThis = context;
  vm.createContext(context);
  return context;
}

function runScript(context, filename) {
  const fullPath = path.join(ROOT, filename);
  const source = fs.readFileSync(fullPath, "utf8");
  vm.runInContext(source, context, { filename: fullPath });
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildParkUrl(datasetKey, park) {
  return (
    "https://findeverypark.com/park.html?dataset=" +
    encodeURIComponent(datasetKey) +
    "&id=" +
    encodeURIComponent(park.id)
  );
}

function buildParkSection(context, datasetScripts) {
  const lines = ["  <!-- Park Pages -->"];
  const seenUrls = new Set();

  Object.entries(datasetScripts).forEach(([datasetKey, scriptName]) => {
    runScript(context, scriptName);
    const parks = context.window.getParkDataset(datasetKey) || [];

    parks.forEach((park) => {
      if (!park || !park.id) {
        throw new Error("Missing park id for dataset " + datasetKey + ": " + JSON.stringify(park));
      }

      const parkUrl = buildParkUrl(datasetKey, park);
      if (seenUrls.has(parkUrl)) {
        return;
      }

      seenUrls.add(parkUrl);
      lines.push("  <url><loc>" + xmlEscape(parkUrl) + "</loc></url>");
    });
  });

  return lines.join("\n");
}

function replaceParkSection(xml, replacement) {
  const pattern = /  <!-- Park Pages -->[\s\S]*<\/urlset>\s*$/;
  if (!pattern.test(xml)) {
    throw new Error("Could not find park section in sitemap.xml");
  }

  return xml.replace(pattern, replacement + "\n\n</urlset>\n");
}

function main() {
  const context = createBrowserContext();
  runScript(context, "park-data-registry.js");
  const allowedKeys = Object.keys((context.window.PARK_SITE && context.window.PARK_SITE.datasetsMeta) || {});
  const datasetScripts = discoverDatasets(ROOT, allowedKeys);

  console.log("Discovered datasets:", Object.keys(datasetScripts).join(", "));

  const sitemapXml = fs.readFileSync(SITEMAP_PATH, "utf8");
  const parkSection = buildParkSection(context, datasetScripts);
  const updatedXml = replaceParkSection(sitemapXml, parkSection);

  fs.writeFileSync(SITEMAP_PATH, updatedXml);
  console.log("Updated sitemap.xml park URLs to canonical ?id= format.");
}

main();
