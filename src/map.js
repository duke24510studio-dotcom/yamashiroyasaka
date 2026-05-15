import { MAPTILER_API_KEY, MAPTILER_MAP_STYLE } from './config.js';

let map;
let popup;
let activeConfig;
const markerById = new Map();
const recordById = new Map();

export function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: getMapStyle(),
    center: [135.766, 34.867],
    zoom: 11.5,
    attributionControl: false,
    cooperativeGestures: true,
    refreshExpiredTiles: false,
    maxPitch: 0,
    pitchWithRotate: false,
    dragRotate: false,
  });

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  popup = new maplibregl.Popup({ closeButton: true, closeOnClick: false, maxWidth: '320px' });
}

export function renderMarkers(records, onSelect, appConfig) {
  activeConfig = appConfig;
  markerById.forEach((marker) => marker.remove());
  markerById.clear();
  recordById.clear();

  const bounds = new maplibregl.LngLatBounds();
  records.forEach((item) => {
    const marker = new maplibregl.Marker({ color: getMarkerColor(appConfig.id) })
      .setLngLat([item.lng, item.lat])
      .setPopup(new maplibregl.Popup({ maxWidth: '320px' }).setHTML(popupHtml(item)))
      .addTo(map);

    marker.getElement().addEventListener('click', () => onSelect(item.id));
    markerById.set(item.id, marker);
    recordById.set(item.id, item);
    bounds.extend([item.lng, item.lat]);
  });

  if (records.length === 1) {
    map.easeTo({ center: bounds.getCenter(), zoom: 15, duration: 250 });
  } else if (records.length > 1) {
    map.fitBounds(bounds, { padding: 38, maxZoom: 14.5, duration: 250 });
  }
}

export function focusMarker(id) {
  const marker = markerById.get(id);
  const item = recordById.get(id);
  if (!marker || !item) return;

  const lngLat = marker.getLngLat();
  map.easeTo({ center: lngLat, zoom: 15, duration: 250 });
  popup.setLngLat(lngLat).setHTML(popupHtml(item)).addTo(map);
}

function getMapStyle() {
  if (MAPTILER_API_KEY) {
    return `https://api.maptiler.com/maps/${MAPTILER_MAP_STYLE}/style.json?key=${MAPTILER_API_KEY}`;
  }

  return 'https://demotiles.maplibre.org/style.json';
}

function getMarkerColor(appId) {
  const colors = {
    accidents: '#0f7b63',
    violations: '#9a4f1f',
  };
  return colors[appId] ?? '#0f7b63';
}

function popupHtml(item) {
  const labels = activeConfig.tableLabels;
  return `
    <strong>${escapeHtml(item.location)}</strong>
    <dl class="popup-meta">
      <dt>${escapeHtml(labels.date)}</dt><dd>${escapeHtml(item.date)} ${escapeHtml(item.time)}</dd>
      <dt>${escapeHtml(labels.type)}</dt><dd>${escapeHtml(item.type)}</dd>
      <dt>${escapeHtml(labels.category)}</dt><dd>${escapeHtml(item.category)}</dd>
      <dt>${escapeHtml(labels.cause)}</dt><dd>${escapeHtml(item.cause)}</dd>
    </dl>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
