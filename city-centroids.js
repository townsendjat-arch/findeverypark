// Shared Front Range city centroids — single source of truth.
// Loaded by index.html (events ranking + nearestCityForGeo) and
// parks.html (nearestCityFromCoords geo routing). Keep keys in sync
// with the dataset keys in dataset-loader.js.
window.FEP_CITY_CENTROIDS = [
  { key: 'aurora',          lat: 39.7294, lng: -104.8319 },
  { key: 'denver',          lat: 39.7392, lng: -104.9903 },
  { key: 'centennial',      lat: 39.5807, lng: -104.8772 },
  { key: 'parker',          lat: 39.5186, lng: -104.7614 },
  { key: 'englewood',       lat: 39.6486, lng: -104.9878 },
  { key: 'highlands-ranch', lat: 39.5530, lng: -104.9691 },
  { key: 'littleton',       lat: 39.6133, lng: -105.0166 },
  { key: 'castle-rock',     lat: 39.3722, lng: -104.8561 },
  { key: 'westminster',     lat: 39.8367, lng: -105.0372 },
  { key: 'arvada',          lat: 39.8028, lng: -105.0875 },
  { key: 'lakewood',        lat: 39.7047, lng: -105.0814 },
  { key: 'broomfield',      lat: 39.9208, lng: -105.0866 },
  { key: 'thornton',        lat: 39.8680, lng: -104.9719 },
  { key: 'commerce-city',   lat: 39.8083, lng: -104.9339 },
  { key: 'brighton',        lat: 39.9855, lng: -104.8197 },
  { key: 'golden',          lat: 39.7555, lng: -105.2211 },
  { key: 'lone-tree',       lat: 39.5414, lng: -104.8725 }
];
