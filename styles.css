import { CSV_SOURCES, MAPTILER_API_KEY, MAPTILER_MAP_STYLE } from './config.js';

const APPS = {
  accidents: {
    title: '交通事故発生マップ',
    eyebrow: '山城ヤサカ交通 安全管理',
    sourceName: '事故データ',
    listTitle: '事故一覧',
    searchPlaceholder: '場所・損傷部位・原因概要',
    csvFileName: 'accidents_template.csv',
    labels: {
      type: '事故区分',
      category: 'カテゴリ',
      date: '発生日',
      detail: '損傷部位',
      cause: '原因概要',
      prevention: '再発防止ポイント',
      topCategory: '最多カテゴリ',
      topLocation: '重点場所',
    },
    markerColor: '#0f7b63',
    points: {
      後退時接触: '後退開始前の降車確認、誘導者確認、バックモニター確認を標準動作として再点検する。',
      追突: '車間距離と速度管理を朝礼で確認し、前方不注意が起きやすい時間帯を共有する。',
      接触: '狭い場所では一時停止し、必要に応じて降車確認を行う。',
      自損: '車高、張り出し物、路面段差を確認し、無理な進入や転回を避ける。',
    },
  },
  violations: {
    title: '交通違反マップ',
    eyebrow: '山城ヤサカ交通 コンプライアンス確認',
    sourceName: '違反データ',
    listTitle: '違反一覧',
    searchPlaceholder: '場所・対象・違反概要',
    csvFileName: 'violations_template.csv',
    labels: {
      type: '違反区分',
      category: '違反カテゴリ',
      date: '確認日',
      detail: '対象',
      cause: '違反概要',
      prevention: '改善ポイント',
      topCategory: '最多違反',
      topLocation: '重点場所',
    },
    markerColor: '#9a4f1f',
    points: {
      一時停止不履行: '一時停止線の手前で完全停止し、左右確認を声出しで徹底する。',
      速度超過: '速度が上がりやすい区間を点呼で共有し、法定速度と社内基準速度を再確認する。',
      進入禁止: '標識確認が必要な交差点を地図で共有し、進入前の標識確認を習慣化する。',
      ながら運転: '運転中の端末操作を禁止し、連絡は安全な停車後に行う。',
    },
  },
};

const TIME_ORDER = ['朝', '昼', '夕方', '夜', '深夜', '不明'];
const TEMPLATE_HEADERS = ['日付', '時間', '場所', '緯度', '経度', '区分', 'カテゴリ', '詳細', '概要', 'ポイント'];
const appId = document.body.dataset.app || 'accidents';
const config = APPS[appId] || APPS.accidents;
let records = [];
let selectedId = null;
let activeSourceLabel = '同梱CSV';
let map;
let popup;
const markers = new Map();
const recordById = new Map();

const $ = (selector) => document.querySelector(selector);
const elements = {
  title: $('#appTitle'),
  eyebrow: $('#appEyebrow'),
  navLinks: document.querySelectorAll('.app-nav a'),
  sourceLabel: $('#sourceLabel'),
  sourceStatus: $('#sourceStatus'),
  year: $('#yearFilter'),
  month: $('#monthFilter'),
  type: $('#typeFilter'),
  category: $('#categoryFilter'),
  typeLabel: $('#typeFilterLabel'),
  categoryLabel: $('#categoryFilterLabel'),
  search: $('#searchInput'),
  csvInput: $('#csvInput'),
  reload: $('#reloadButton'),
  print: $('#printButton'),
  template: $('#templateButton'),
  totalCount: $('#totalCount'),
  topCategory: $('#topCategory'),
  topTimeBand: $('#topTimeBand'),
  topLocation: $('#topLocation'),
  totalLabel: $('#totalLabel'),
  topCategoryLabel: $('#topCategoryLabel'),
  topLocationLabel: $('#topLocationLabel'),
  timeStats: $('#timeStats'),
  categoryStats: $('#categoryStats'),
  locationStats: $('#locationStats'),
  preventionList: $('#preventionList'),
  preventionTitle: $('#preventionTitle'),
  listTitle: $('#listTitle'),
  activeFilterText: $('#activeFilterText'),
  table: $('#recordTable'),
  tableHeaders: document.querySelectorAll('[data-table-key]'),
};

bootstrap();

async function bootstrap() {
  applyPageText();
  initMap();
  bindEvents();
  await loadConfiguredCsv();
}

function applyPageText() {
  document.title = `${config.title} | 山城ヤサカ交通`;
  elements.title.textContent = config.title;
  elements.eyebrow.textContent = config.eyebrow;
  elements.typeLabel.firstChild.nodeValue = `${config.labels.type}\n`;
  elements.categoryLabel.firstChild.nodeValue = `${config.labels.category}\n`;
  elements.search.placeholder = config.searchPlaceholder;
  elements.totalLabel.textContent = '表示件数';
  elements.topCategoryLabel.textContent = config.labels.topCategory;
  elements.topLocationLabel.textContent = config.labels.topLocation;
  elements.preventionTitle.textContent = config.labels.prevention;
  elements.listTitle.textContent = config.listTitle;
  elements.tableHeaders.forEach((header) => {
    const labels = {
      date: config.labels.date,
      time: '時間',
      location: '場所',
      type: config.labels.type,
      category: config.labels.category,
      detail: config.labels.detail,
      cause: config.labels.cause,
    };
    header.textContent = labels[header.dataset.tableKey];
  });
  elements.navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.dataset.appLink === appId);
  });
}

function bindEvents() {
  [elements.year, elements.month, elements.type, elements.category, elements.search].forEach((input) => {
    input.addEventListener('input', render);
    input.addEventListener('change', render);
  });
  elements.reload.addEventListener('click', loadConfiguredCsv);
  elements.print.addEventListener('click', () => window.print());
  elements.template?.addEventListener('click', downloadTemplate);
  elements.csvInput.addEventListener('click', () => {
    elements.csvInput.value = '';
  });
  elements.csvInput.addEventListener('change', loadUserCsv);
}

function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: mapStyle(),
    center: [135.766, 34.867],
    zoom: 11.2,
    attributionControl: false,
    cooperativeGestures: true,
    maxPitch: 0,
    pitchWithRotate: false,
    dragRotate: false,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  popup = new maplibregl.Popup({ closeButton: true, closeOnClick: false, maxWidth: '320px' });
}

function mapStyle() {
  if (MAPTILER_API_KEY) {
    return `https://api.maptiler.com/maps/${MAPTILER_MAP_STYLE}/style.json?key=${MAPTILER_API_KEY}`;
  }
  return {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  };
}

async function loadConfiguredCsv() {
  try {
    activeSourceLabel = '同梱CSV';
    setStatus(activeSourceLabel, `${config.sourceName}を読み込んでいます。`);
    records = parseCsvText(await fetchText(csvSource()));
    resetFilters();
    populateFilters();
    setStatus(activeSourceLabel, loadedMessage(records.length));
    render();
  } catch (error) {
    console.error(error);
    records = [];
    render();
    setStatus(activeSourceLabel, 'CSVを読み込めませんでした。CSVの場所と列名を確認してください。');
  }
}

function csvSource() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('csv') || CSV_SOURCES[appId] || CSV_SOURCES.accidents;
  activeSourceLabel = params.get('csv') ? '外部CSV' : '同梱CSV';
  return source;
}

async function fetchText(source) {
  const url = new URL(source, window.location.href);
  url.searchParams.set('_', Date.now().toString());
  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) throw new Error(`CSV fetch failed: ${response.status}`);
  return response.text();
}

async function loadUserCsv(event) {
  const [file] = event.target.files;
  if (!file) return;
  records = parseCsvText(await readFileText(file));
  selectedId = null;
  activeSourceLabel = `手元のCSV: ${file.name}`;
  resetFilters();
  populateFilters();
  setStatus(activeSourceLabel, loadedMessage(records.length));
  render();
}

async function readFileText(file) {
  const buffer = await file.arrayBuffer();
  const utf8Text = new TextDecoder('utf-8').decode(buffer);
  if (!utf8Text.includes('\uFFFD')) return utf8Text;
  try {
    return new TextDecoder('shift_jis').decode(buffer);
  } catch {
    return utf8Text;
  }
}

function parseCsvText(text) {
  const rows = parseCsv(text.replace(/^\uFEFF/, '').trim());
  const [headers, ...body] = rows;
  if (!headers) return [];
  const normalized = headers.map(normalizeHeader);
  return body
    .map((row, index) => {
      const source = Object.fromEntries(normalized.map((header, i) => [header, row[i] ?? '']));
      const date = source.date || '';
      const { year, month } = dateParts(date);
      return {
        id: source.id || `row-${index + 1}`,
        date,
        year,
        month,
        time: source.time || '',
        timeBand: timeBand(source.time || ''),
        location: source.location || '',
        lat: toNumber(source.lat),
        lng: toNumber(source.lng),
        type: source.type || '',
        category: source.category || '',
        detail: source.detail || source.damaged_part || '',
        cause: source.cause || '',
        prevention: source.prevention || '',
      };
    })
    .filter((record) => Number.isFinite(record.lat) && Number.isFinite(record.lng));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(header) {
  const key = header.replace(/^\uFEFF/, '').trim().toLowerCase();
  const aliases = {
    id: 'id',
    date: 'date',
    time: 'time',
    location: 'location',
    lat: 'lat',
    latitude: 'lat',
    lng: 'lng',
    lon: 'lng',
    longitude: 'lng',
    type: 'type',
    category: 'category',
    detail: 'detail',
    damaged_part: 'damaged_part',
    cause: 'cause',
    prevention: 'prevention',
    日付: 'date',
    発生日: 'date',
    確認日: 'date',
    時間: 'time',
    時刻: 'time',
    場所: 'location',
    発生場所: 'location',
    地点: 'location',
    緯度: 'lat',
    経度: 'lng',
    区分: 'type',
    事故区分: 'type',
    違反区分: 'type',
    カテゴリ: 'category',
    違反カテゴリ: 'category',
    種別: 'category',
    分類: 'category',
    損傷部位: 'detail',
    対象: 'detail',
    詳細: 'detail',
    原因概要: 'cause',
    違反概要: 'cause',
    概要: 'cause',
    再発防止ポイント: 'prevention',
    改善ポイント: 'prevention',
    ポイント: 'prevention',
  };
  return aliases[key] || key;
}

function dateParts(date) {
  const match = String(date).trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (match) return { year: match[1], month: match[2].padStart(2, '0') };
  return { year: String(date).slice(0, 4), month: String(date).slice(5, 7) };
}

function timeBand(time) {
  const hour = Number(String(time).slice(0, 2));
  if (!Number.isFinite(hour)) return '不明';
  if (hour < 6) return '深夜';
  if (hour < 10) return '朝';
  if (hour < 14) return '昼';
  if (hour < 18) return '夕方';
  if (hour < 22) return '夜';
  return '深夜';
}

function toNumber(value) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/[０-９．－]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
  return Number(normalized);
}

function populateFilters() {
  fillSelect(elements.year, unique('year'), 'すべて');
  fillSelect(elements.month, unique('month'), 'すべて');
  fillSelect(elements.type, unique('type'), 'すべて');
  fillSelect(elements.category, unique('category'), 'すべて');
}

function fillSelect(select, values, allLabel) {
  select.replaceChildren(option('all', allLabel), ...values.map((value) => option(value, value)));
}

function unique(key) {
  return [...new Set(records.map((record) => record[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ja-JP'));
}

function option(value, label) {
  const element = document.createElement('option');
  element.value = value;
  element.textContent = label;
  return element;
}

function resetFilters() {
  elements.search.value = '';
  [elements.year, elements.month, elements.type, elements.category].forEach((select) => {
    select.value = 'all';
  });
}

function render() {
  const filtered = filteredRecords();
  elements.activeFilterText.textContent = activeFilterText();
  renderMarkers(filtered);
  renderSummary(filtered);
  renderBars(elements.timeStats, countBy(filtered, 'timeBand'), TIME_ORDER);
  renderBars(elements.categoryStats, countBy(filtered, 'category'));
  renderBars(elements.locationStats, countBy(filtered, 'location'), null, 5);
  renderPrevention(filtered);
  renderTable(filtered);
}

function filteredRecords() {
  const query = normalizeText(elements.search.value);
  return records.filter((record) => {
    const matchesSelects =
      matches(elements.year.value, record.year) &&
      matches(elements.month.value, record.month) &&
      matches(elements.type.value, record.type) &&
      matches(elements.category.value, record.category);
    const searchTarget = normalizeText(`${record.location} ${record.detail} ${record.cause}`);
    return matchesSelects && (!query || searchTarget.includes(query));
  });
}

function matches(selected, value) {
  return selected === 'all' || selected === value;
}

function normalizeText(value) {
  return String(value).toLocaleLowerCase('ja-JP').trim();
}

function activeFilterText() {
  const parts = [
    ['年', elements.year],
    ['月', elements.month],
    [config.labels.type, elements.type],
    [config.labels.category, elements.category],
  ]
    .filter(([, select]) => select.value !== 'all')
    .map(([label, select]) => `${label}: ${select.value}`);
  if (elements.search.value.trim()) parts.push(`検索: ${elements.search.value.trim()}`);
  return parts.length ? parts.join(' / ') : '全件を表示中';
}

function renderMarkers(items) {
  markers.forEach((marker) => marker.remove());
  markers.clear();
  recordById.clear();
  const bounds = new maplibregl.LngLatBounds();
  items.forEach((record) => {
    const marker = new maplibregl.Marker({ color: config.markerColor })
      .setLngLat([record.lng, record.lat])
      .setPopup(new maplibregl.Popup({ maxWidth: '320px' }).setHTML(popupHtml(record)))
      .addTo(map);
    marker.getElement().addEventListener('click', () => selectRecord(record.id));
    markers.set(record.id, marker);
    recordById.set(record.id, record);
    bounds.extend([record.lng, record.lat]);
  });
  if (items.length === 1) {
    map.easeTo({ center: bounds.getCenter(), zoom: 15, duration: 250 });
  } else if (items.length > 1) {
    map.fitBounds(bounds, { padding: 36, maxZoom: 14.5, duration: 250 });
  }
}

function selectRecord(id) {
  selectedId = id;
  const marker = markers.get(id);
  const record = recordById.get(id);
  if (marker && record) {
    const lngLat = marker.getLngLat();
    map.easeTo({ center: lngLat, zoom: 15, duration: 250 });
    popup.setLngLat(lngLat).setHTML(popupHtml(record)).addTo(map);
  }
  document.querySelectorAll('#recordTable tr').forEach((row) => {
    row.classList.toggle('is-selected', row.dataset.id === id);
  });
}

function popupHtml(record) {
  return `
    <strong>${escapeHtml(record.location)}</strong>
    <dl class="popup-meta">
      <dt>${escapeHtml(config.labels.date)}</dt><dd>${escapeHtml(record.date)} ${escapeHtml(record.time)}</dd>
      <dt>${escapeHtml(config.labels.type)}</dt><dd>${escapeHtml(record.type)}</dd>
      <dt>${escapeHtml(config.labels.category)}</dt><dd>${escapeHtml(record.category)}</dd>
      <dt>${escapeHtml(config.labels.cause)}</dt><dd>${escapeHtml(record.cause)}</dd>
    </dl>
  `;
}

function renderSummary(items) {
  elements.totalCount.textContent = String(items.length);
  elements.topCategory.textContent = topValue(items, 'category')?.label ?? '-';
  elements.topTimeBand.textContent = topValue(items, 'timeBand')?.label ?? '-';
  elements.topLocation.textContent = topValue(items, 'location')?.label ?? '-';
}

function renderBars(container, counts, preferredOrder = null, limit = 10) {
  const entries = Object.entries(counts);
  const sorted = preferredOrder
    ? preferredOrder.filter((label) => counts[label]).map((label) => [label, counts[label]])
    : entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja-JP')).slice(0, limit);
  const max = Math.max(...sorted.map(([, count]) => count), 1);
  container.replaceChildren(
    ...(sorted.length
      ? sorted.map(([label, count]) => {
          const row = document.createElement('div');
          row.className = 'bar-row';
          row.innerHTML = `<span class="bar-label">${escapeHtml(label)}</span><span class="bar-track"><span style="width:${(count / max) * 100}%"></span></span><strong>${count}</strong>`;
          return row;
        })
      : [emptyText('該当データがありません')]),
  );
}

function renderPrevention(items) {
  const categoryCounts = countBy(items, 'category');
  const generated = Object.entries(config.points)
    .filter(([category]) => categoryCounts[category])
    .map(([, point]) => point);
  const fromCsv = [...new Set(items.map((record) => record.prevention).filter(Boolean))].slice(0, 4);
  const points = [...generated, ...fromCsv].slice(0, 6);
  elements.preventionList.replaceChildren(
    ...(points.length ? points : ['該当データがありません']).map((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    }),
  );
}

function renderTable(items) {
  elements.table.replaceChildren(
    ...items.map((record) => {
      const row = document.createElement('tr');
      row.dataset.id = record.id;
      row.tabIndex = 0;
      row.classList.toggle('is-selected', record.id === selectedId);
      row.innerHTML = `
        <td>${escapeHtml(record.date)}</td>
        <td>${escapeHtml(record.time)}</td>
        <td>${escapeHtml(record.location)}</td>
        <td>${escapeHtml(record.type)}</td>
        <td>${escapeHtml(record.category)}</td>
        <td>${escapeHtml(record.detail)}</td>
        <td>${escapeHtml(record.cause)}</td>
      `;
      row.addEventListener('click', () => selectRecord(record.id));
      row.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectRecord(record.id);
        }
      });
      return row;
    }),
  );
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const label = item[key] || '不明';
    counts[label] = (counts[label] || 0) + 1;
    return counts;
  }, {});
}

function topValue(items, key) {
  return Object.entries(countBy(items, key))
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'ja-JP'))[0];
}

function loadedMessage(count) {
  if (count === 0) return '0件です。CSVの列名、緯度、経度を確認してください。';
  return `${count}件の${config.sourceName}を読み込みました。`;
}

function setStatus(label, status) {
  elements.sourceLabel.textContent = label;
  elements.sourceStatus.textContent = status;
}

function emptyText(text) {
  const span = document.createElement('span');
  span.textContent = text;
  return span;
}

function downloadTemplate() {
  const sample =
    appId === 'accidents'
      ? ['A-001', '2026/5/10', '13:11', 'タイムズ四条烏丸', '35.00476261', '135.7602095', '自損', '後退時接触', '天井', '立体駐車場で接触', '車高と後退前確認を徹底']
      : ['V-001', '2026/5/10', '08:20', '近鉄大久保駅前', '34.874240', '135.778200', '道路交通法違反', '一時停止不履行', '交差点進入', '停止確認が不十分', '停止線手前で完全停止'];
  const rows = [['id', ...TEMPLATE_HEADERS], sample];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = config.csvFileName;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
