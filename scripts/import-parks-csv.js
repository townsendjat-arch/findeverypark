#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = { input: "", output: "", dataset: "", city: "", state: "CO", stateName: "Colorado" };
  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i];
    const next = argv[i + 1];
    if (part === "--input") {
      args.input = next || "";
      i += 1;
    } else if (part === "--output") {
      args.output = next || "";
      i += 1;
    } else if (part === "--dataset") {
      args.dataset = next || "";
      i += 1;
    } else if (part === "--city") {
      args.city = next || "";
      i += 1;
    } else if (part === "--state") {
      args.state = next || "";
      i += 1;
    } else if (part === "--state-name") {
      args.stateName = next || "";
      i += 1;
    }
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let field = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(field);
      field = "";
      if (row.some((value) => String(value).trim() !== "")) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((value) => String(value).trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function boolValue(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "y";
}

function numberValue(value) {
  const numeric = Number(String(value || "").trim());
  return Number.isFinite(numeric) ? numeric : null;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pick(row, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key) && String(row[key]).trim() !== "") {
      return String(row[key]).trim();
    }
  }
  return "";
}

function mapRow(row, options) {
  const city = pick(row, ["city"]) || options.city;
  const name = pick(row, ["name", "park_name"]);
  const lat = numberValue(pick(row, ["lat", "latitude"]));
  const lng = numberValue(pick(row, ["lng", "lon", "long", "longitude"]));

  if (!name || !city || lat === null || lng === null) {
    return null;
  }

  return {
    id: [options.state.toLowerCase(), slugify(city), slugify(name)].join("-"),
    name,
    city,
    lat,
    lng,
    playground: boolValue(pick(row, ["playground"])),
    dog_park: boolValue(pick(row, ["dog_park"])),
    trails: boolValue(pick(row, ["trails"])),
    bathrooms: boolValue(pick(row, ["bathrooms", "restroom", "restrooms"])),
    parking: boolValue(pick(row, ["parking"])),
    description: pick(row, ["description", "notes"]),
    address: pick(row, ["address", "street_address"])
  };
}

function buildOutput(records, options) {
  const payload = JSON.stringify(records, null, 2);
  return `(function () {
  const records = ${payload};

  const parks = records.map((park) => ({
    ...park,
    state: ${JSON.stringify(options.state)},
    stateName: ${JSON.stringify(options.stateName)},
    a: park.address,
    d: park.description,
    f: {
      playground: park.playground ? 1 : 0,
      dog_park: park.dog_park ? 1 : 0,
      trails: park.trails ? 1 : 0,
      restroom: park.bathrooms ? 1 : 0,
      parking: park.parking ? 1 : 0
    },
    photos: []
  }));

  (window.registerParkDataset || function (_datasetKey, list) { window.PARKS = list; return list; })(
    ${JSON.stringify(options.dataset)},
    parks,
    {
      city: ${JSON.stringify(options.city || "")},
      state: ${JSON.stringify(options.state)},
      stateName: ${JSON.stringify(options.stateName)},
      brandName: (window.SITE_CONFIG && window.SITE_CONFIG.brandName) || "Find Every Park Colorado"
    }
  );
})();\n`;
}

function main() {
  const options = parseArgs(process.argv);
  if (!options.input || !options.output || !options.dataset) {
    console.error("Usage: node scripts/import-parks-csv.js --input data.csv --output city-data.js --dataset city-key [--city \"City\"] [--state CO] [--state-name Colorado]");
    process.exit(1);
  }

  const csvPath = path.resolve(process.cwd(), options.input);
  const outputPath = path.resolve(process.cwd(), options.output);
  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  if (!rows.length) {
    console.error("CSV file is empty:", csvPath);
    process.exit(1);
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map(normalizeHeader);
  const records = dataRows
    .map((cells) => {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = cells[index] || "";
      });
      return row;
    })
    .map((row) => mapRow(row, options))
    .filter(Boolean);

  fs.writeFileSync(outputPath, buildOutput(records, options), "utf8");
  console.log(`Wrote ${records.length} parks to ${outputPath}`);
}

main();
