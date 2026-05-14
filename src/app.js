import { CSV_SOURCES, MAPTILER_API_KEY, MAPTILER_MAP_STYLE } from './config.js';

// ===== ページごとのラベル =====
const APP_CONFIGS = {
  accidents: {
    title: '交通事故発生マップ',
    eyebrow: '山城ヤサカ交通 安全管理',
    sourceName: '事故データ',
    listTitle: '事故一覧',
    mapLabel: '事故発生地点の地図',
    searchPlaceholder: '場所・損傷部位・原因概要',
    summary: { total: '表示件数', topCategory: '最多カテゴリ', topTimeBand: '最多時間帯', topLocation: '重点場所' },
    filter: { type: '事故区分', category: 'カテゴリ' },
    table: { date: '発生日', time: '時間', location: '場所', type: '事故区分', category: 'カテゴリ', detail: '損傷部位', cause: '原因概要' },
    stats: { time: '時間帯別', category: 'カテゴリ別', location: '場所別', prevention: '再発防止ポイント' },
    color: '#0f7b63',
    points: {
      '後退時接触': '後退開始前の降車確認、誘導者確認、バックモニター確認を標準動作として再点検する。',
      '追突': '車間距離と速度管理を朝礼で確認し、前方不注意が起きやすい時間帯を共有する。',
      '歩行者接触': '横断歩道・乗降場所付近では徐行と左右確認を徹底し、死角確認の声かけを行う。',
      '物損': '狭路・駐車場では一時停止、ミラー確認、切り返し判断を早める。',
    },
  },
  violations: {
    title: '交通違反マップ',
    eyebrow: '山城ヤサカ交通 コンプライアンス確認',
    sourceName: '違反データ',
    listTitle: '違反一覧',
    mapLabel: '交通違反発生地点の地図',
    searchPlaceholder: '場所・対象・違反概要',
    summary: { total: '表示件数', topCategory: '最多違反', topTimeBand: '最多時間帯', topLocation: '重点場所' },
    filter: { type: '違反区分', category: '違反カテゴリ' },
    table: { date: '確認日', time: '時間', location: '場所', type: '違反区分', category: '違反カテゴリ', detail: '対象', cause: '違反概要' },
    stats: { time: '時間帯別', category: '違反カテゴリ別', location: '場所別', prevention: '改善ポイント' },
    color: '#9a4f1f',
    points: {
      '一時停止不履行': '一時停止線の手前で完全停止し、左右確認を声出しで徹底する。',
      '速度超過': '速度が上がりやすい区間を点呼で共有し、法定速度と社内基準速度を再確認する。',
      '進入禁止': '標識確認が必要な交差点を地図で共有し、進入前の標識確認を習慣化する。',
      'ながら運転': '運転中の端末操作を禁止し、連絡は安全な停車後に行う。',
    },
  },
  enforcement: {
    title: '取り締まり情報マップ',
    eyebrow: '山城ヤサカ交通 運行注意情報',
    sourceName: '取り締まり情報',
    listTitle: '取り締まり情報一覧',
    mapLabel: '取り締まり地点の地図',
    searchPlaceholder: '場所・対象・注意概要',
    summary: { total: '表示件数', topCategory: '最多種別', topTimeBand: '多い時間帯', topLocation: '注意場所' },
    filter: { type: '取り締まり区分', category: '種別' },
    table: { date: '確認日', time: '時間', location: '場所', type: '取り締まり区分', category: '種別', detail: '対象', cause: '注意概要' },
    stats: { time: '時間帯別', category: '種別別', location: '場所別', prevention: '運行注意ポイント' },
    color: '#246b86',
    points: {
      '速度取締': '速度確認区間では早めに減速し、周囲の流れに流されない運転を徹底する。',
      '一時停止': '見通しのよい交差点でも停止線手前で完全停止し、左右確認を省略しない。',
      '携帯電話': '停車中を含め、端末操作の可否を社内ルールに沿って確認する。',
      'シートベルト': '出庫前と乗務交代時に着用確認を行う。',
    },
  },
  pickups: {
    title: 'お客様の乗車位置マップ',
    eyebrow: '山城ヤサカ交通 乗車需要分析',
    sourceName: '乗車位置データ',
    listTitle: '乗車位置一覧',
    mapLabel: 'お客様の乗車位置の地図',
    searchPlaceholder: '場所・乗車ポイント・概要',
    summary: { total: '表示件数', topCategory: '最多種別', topTimeBand: '多い時間帯', topLocation: '重点乗車場所' },
    filter: { type: '乗車区分', category: '種別' },
    table: { date: '確認日', time: '時間', location: '乗車場所', type: '乗車区分', category: '種別', detail: '乗車ポイント', cause: '概要' },
    stats: { time: '時間帯別', category: '種別別', location: '乗車場所別', prevention: '配車・待機ポイント' },
    color: '#5c5aa7',
    points: {
      'ヤサカ無線': '無線配車が多い場所は、建物入口や待ち合わせ位置を乗務員間で共有する。',
      'GOアプリ': 'アプリ配車が集中する地点は、迎車しやすい停車位置を整理する。',
      'DiDi': 'DiDi配車が多い地点は、迎車動線と停車しやすい場所を確認する。',
    },
  },
};

// ===== 起動 =====
const appId = document.body.dataset.app || 'accidents';
const conf = APP_CONFIGS[appId];
const csvOverride = new URLSearchParams(location.search).get('csv');
let csvUrl = csvOverride || CSV_SOURCES[appId];
let userCsvName = null;

const el = q({
  appTitle: '#appTitle',
  appEyebrow: '#appEyebrow',
  navLinks: '.app-nav a',
  yearFilter: '#yearFilter',
  monthFilter: '#monthFilter',
  typeFilter: '#typeFilter',
  categoryFilter: '#categoryFilter',
  typeFilterLabel: '#typeFilterLabel',
  categoryFilterLabel: '#categoryFilterLabel',
  searchInput: '#searchInput',
  csvInput: '#csvInput',
  printButton: '#printButton',
  reloadButton: '#reloadButton',
  sourceLabel: '#sourceLabel',
  sourceStatus: '#sourceStatus',
  totalLabel: '#totalLabel',
  topCategoryLabel: '#topCategoryLabel',
  topTimeBandLabel: '#topTimeBandLabel',
  topLocationLabel: '#topLocationLabel',
  totalCount: '#totalCount',
  topCategory: '#topCategory',
  topTimeBand: '#topTimeBand',
  topLocation: '#topLocation',
  timeStatsTitle: '#timeStatsTitle',
  categoryStatsTitle: '#categoryStatsTitle',
  locationStatsTitle: '#locationStatsTitle',
  preventionTitle: '#preventionTitle',
  timeStats: '#timeStats',
  categoryStats: '#categoryStats',
  locationStats: '#locationStats',
  preventionList: '#preventionList',
  listTitle: '#listTitle',
  activeFilterText: '#activeFilterText',
  tableHeaders: '[data-table-key]',
  mapEl: '#map',
  recordTable: '#accidentTable',
});

let records = [];
let selectedId = null;
let map;
let popup;
const markerById = new Map();
const recordById = new Map();

applyAppText();
initMap();
['input', 'change'].forEach((ev) => {
  [el.yearFilter, el.monthFilter, el.typeFilter, el.categoryFilter, el.searchInput].forEach((c) =>
    c.addEventListener(ev, render),
  );
});
el.printButton.addEventListener('click', () => window.print());
el.reloadButton.addEventListener('click', () => loadData());
el.csvInput.addEventListener('change', handleUserCsv);
await loadData();

// ===== データ読込（常にキャッシュを回避）=====
async function loadData() {
  if (userCsvName) {
    userCsvName = null;
    csvUrl = csvOverride || CSV_SOURCES[appId];
  }
  try {
    setSourceStatus(sourceLabel(csvUrl), `${conf.sourceName}を読み込み中…`);
    const url = bustCache(csvUrl);
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    records = parseCsv(await res.text());
    selectedId = null;
    populateFilters();
    setSourceStatus(sourceLabel(csvUrl), `${records.length}件を表示中 / 元データ: ${csvUrl}`);
    render();
  } catch (err) {
    showEmpty(`CSVを読み込めませんでした (${err.message})。READMEの手順と公開URLを確認してください。`);
    setSourceStatus(sourceLabel(csvUrl), 'CSVを読み込めませんでした。');
    console.error(err);
  }
}

async function handleUserCsv(event) {
  const [file] = event.target.files;
  if (!file) return;
  userCsvName = file.name;
  records = parseCsv(await file.text());
  selectedId = null;
  populateFilters();
  setSourceStatus('手元のCSVファイル', `${records.length}件を表示中 / ファイル: ${file.name}`);
  render();
}

function bustCache(url) {
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}_=${Date.now()}`;
}

function sourceLabel(url) {
  if (userCsvName) return '手元のCSVファイル';
  if (url.startsWith('./data/') || url.startsWith('data/')) return '同梱CSV';
  if (url.includes('docs.google.com')) return 'Googleスプレッドシート公開CSV';
  return '外部CSV';
}

// ===== CSVパース =====
function parseCsv(csvText) {
  const text = csvText.replace(/^﻿/, '').trim();
  const rows = csvRows(text);
  const [headers, ...rest] = rows;
  if (!headers?.length) return [];
  return rest
    .map((row, i) => {
      const r = Object.fromEntries(headers.map((h, j) => [h, row[j] ?? '']));
      const date = r.date || '';
      const time = r.time || '';
      return {
        id: r.id || `row-${i + 1}`,
        date,
        year: date.slice(0, 4),
        month: date.slice(5, 7),
        time,
        timeBand: toTimeBand(time),
        location: r.location || '',
        lat: Number(r.lat),
        lng: Number(r.lng),
        type: r.type || '',
        category: r.category || '',
        detail: r.detail || r.damaged_part || '',
        cause: r.cause || '',
        prevention: r.prevention || '',
      };
    })
    .filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lng));
}

function csvRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some((v) => v.trim() !== '')) rows.push(row.map((v) => v.trim()));
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((v) => v.trim() !== '')) rows.push(row.map((v) => v.trim()));
  return rows;
}

function toTimeBand(time) {
  const hour = Number(time.slice(0, 2));
  if (!Number.isFinite(hour)) return '不明';
  if (hour < 6) return '深夜';
  if (hour < 10) return '朝';
  if (hour < 14) return '昼';
  if (hour < 18) return '夕方';
  if (hour < 22) return '夜';
  return '深夜';
}

// ===== フィルタ =====
function populateFilters() {
  fillSelect(el.yearFilter, uniq(records, 'year'));
  fillSelect(el.monthFilter, uniq(records, 'month'));
  fillSelect(el.typeFilter, uniq(records, 'type'));
  fillSelect(el.categoryFilter, uniq(records, 'category'));
}

function applyFilters() {
  const y = el.yearFilter.value;
  const m = el.monthFilter.value;
  const t = el.typeFilter.value;
  const c = el.categoryFilter.value;
  const q = el.searchInput.value.toLocaleLowerCase('ja-JP').trim();
  return records.filter((r) => {
    if (y !== 'all' && r.year !== y) return false;
    if (m !== 'all' && r.month !== m) return false;
    if (t !== 'all' && r.type !== t) return false;
    if (c !== 'all' && r.category !== c) return false;
    if (q && !`${r.location} ${r.detail} ${r.cause}`.toLocaleLowerCase('ja-JP').includes(q)) return false;
    return true;
  });
}

function describeActiveFilters() {
  const parts = [];
  const pairs = [
    ['年', el.yearFilter],
    ['月', el.monthFilter],
    [conf.filter.type, el.typeFilter],
    [conf.filter.category, el.categoryFilter],
  ];
  pairs.forEach(([label, sel]) => {
    if (sel.value !== 'all') parts.push(`${label}: ${sel.selectedOptions[0]?.textContent ?? sel.value}`);
  });
  if (el.searchInput.value.trim()) parts.push(`検索: ${el.searchInput.value.trim()}`);
  return parts.length ? parts.join(' / ') : '全件を表示中';
}

function fillSelect(select, values) {
  const current = select.value || 'all';
  select.replaceChildren(opt('all', 'すべて'), ...values.map((v) => opt(v, v)));
  select.value = values.includes(current) ? current : 'all';
}

// ===== 描画 =====
function render() {
  const filtered = applyFilters();
  el.activeFilterText.textContent = describeActiveFilters();
  renderMarkers(filtered);
  renderSummary(filtered);
  renderStats(filtered);
  renderPrevention(filtered);
  renderTable(filtered);
}

function renderSummary(items) {
  el.totalCount.textContent = String(items.length);
  el.topCategory.textContent = top(items, 'category') ?? '-';
  el.topTimeBand.textContent = top(items, 'timeBand') ?? '-';
  el.topLocation.textContent = top(items, 'location') ?? '-';
}

function renderStats(items) {
  renderBars(el.timeStats, countBy(items, 'timeBand'), ['朝', '昼', '夕方', '夜', '深夜', '不明']);
  renderBars(el.categoryStats, countBy(items, 'category'));
  renderBars(el.locationStats, countBy(items, 'location'), null, 5);
}

function renderBars(container, counts, order = null, limit = 10) {
  const entries = Object.entries(counts);
  const sorted = order
    ? order.filter((k) => counts[k]).map((k) => [k, counts[k]])
    : entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja-JP')).slice(0, limit);
  const max = Math.max(...sorted.map(([, n]) => n), 1);
  container.replaceChildren(
    ...sorted.map(([label, n]) => {
      const div = document.createElement('div');
      div.className = 'bar-row';
      div.innerHTML = `
        <span class="bar-label">${esc(label)}</span>
        <span class="bar-track"><span style="width: ${(n / max) * 100}%"></span></span>
        <strong>${n}</strong>
      `;
      return div;
    }),
  );
  if (!sorted.length) container.textContent = '該当データがありません';
}

function renderPrevention(items) {
  const cats = countBy(items, 'category');
  const generated = Object.entries(conf.points)
    .filter(([k]) => cats[k])
    .map(([, v]) => v);
  const fromCsv = [...new Set(items.map((i) => i.prevention).filter(Boolean))].slice(0, 4);
  const list = [...generated, ...fromCsv].slice(0, 6);
  el.preventionList.replaceChildren(
    ...(list.length ? list : ['該当データがありません']).map((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    }),
  );
}

function renderTable(items) {
  el.recordTable.replaceChildren(
    ...items.map((item) => {
      const tr = document.createElement('tr');
      tr.dataset.id = item.id;
      tr.classList.toggle('is-selected', item.id === selectedId);
      tr.tabIndex = 0;
      tr.innerHTML = `
        <td>${esc(item.date)}</td>
        <td>${esc(item.time)}</td>
        <td>${esc(item.location)}</td>
        <td>${esc(item.type)}</td>
        <td>${esc(item.category)}</td>
        <td>${esc(item.detail)}</td>
        <td>${esc(item.cause)}</td>
      `;
      tr.addEventListener('click', () => selectRecord(item.id));
      tr.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectRecord(item.id);
        }
      });
      return tr;
    }),
  );
}

function selectRecord(id) {
  selectedId = id;
  focusMarker(id);
  document.querySelectorAll('#accidentTable tr').forEach((row) => {
    row.classList.toggle('is-selected', row.dataset.id === id);
  });
}

// ===== 地図 =====
function initMap() {
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

function getMapStyle() {
  if (MAPTILER_API_KEY) {
    return `https://api.maptiler.com/maps/${MAPTILER_MAP_STYLE}/style.json?key=${MAPTILER_API_KEY}`;
  }
  return {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  };
}

function renderMarkers(items) {
  markerById.forEach((m) => m.remove());
  markerById.clear();
  recordById.clear();
  const bounds = new maplibregl.LngLatBounds();
  items.forEach((item) => {
    const marker = new maplibregl.Marker({ color: conf.color })
      .setLngLat([item.lng, item.lat])
      .setPopup(new maplibregl.Popup({ maxWidth: '320px' }).setHTML(popupHtml(item)))
      .addTo(map);
    marker.getElement().addEventListener('click', () => selectRecord(item.id));
    markerById.set(item.id, marker);
    recordById.set(item.id, item);
    bounds.extend([item.lng, item.lat]);
  });
  if (items.length === 1) {
    map.easeTo({ center: bounds.getCenter(), zoom: 15, duration: 250 });
  } else if (items.length > 1) {
    map.fitBounds(bounds, { padding: 38, maxZoom: 14.5, duration: 250 });
  }
}

function focusMarker(id) {
  const marker = markerById.get(id);
  const item = recordById.get(id);
  if (!marker || !item) return;
  const lngLat = marker.getLngLat();
  map.easeTo({ center: lngLat, zoom: 15, duration: 250 });
  popup.setLngLat(lngLat).setHTML(popupHtml(item)).addTo(map);
}

function popupHtml(item) {
  const t = conf.table;
  return `
    <strong>${esc(item.location)}</strong>
    <dl class="popup-meta">
      <dt>${esc(t.date)}</dt><dd>${esc(item.date)} ${esc(item.time)}</dd>
      <dt>${esc(t.type)}</dt><dd>${esc(item.type)}</dd>
      <dt>${esc(t.category)}</dt><dd>${esc(item.category)}</dd>
      <dt>${esc(t.cause)}</dt><dd>${esc(item.cause)}</dd>
    </dl>
  `;
}

// ===== 共通UI =====
function applyAppText() {
  document.title = `${conf.title} | 山城ヤサカ交通`;
  el.appTitle.textContent = conf.title;
  el.appEyebrow.textContent = conf.eyebrow;
  el.mapEl.setAttribute('aria-label', conf.mapLabel);
  el.searchInput.placeholder = conf.searchPlaceholder;
  el.typeFilterLabel.childNodes[0].nodeValue = `${conf.filter.type}\n`;
  el.categoryFilterLabel.childNodes[0].nodeValue = `${conf.filter.category}\n`;
  el.totalLabel.textContent = conf.summary.total;
  el.topCategoryLabel.textContent = conf.summary.topCategory;
  el.topTimeBandLabel.textContent = conf.summary.topTimeBand;
  el.topLocationLabel.textContent = conf.summary.topLocation;
  el.timeStatsTitle.textContent = conf.stats.time;
  el.categoryStatsTitle.textContent = conf.stats.category;
  el.locationStatsTitle.textContent = conf.stats.location;
  el.preventionTitle.textContent = conf.stats.prevention;
  el.listTitle.textContent = conf.listTitle;
  el.tableHeaders.forEach((th) => {
    th.textContent = conf.table[th.dataset.tableKey];
  });
  el.navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.dataset.appLink === appId);
  });
}

function setSourceStatus(label, status) {
  el.sourceLabel.textContent = label;
  el.sourceStatus.textContent = status;
}

function showEmpty(message) {
  el.recordTable.innerHTML = `<tr><td colspan="7">${esc(message)}</td></tr>`;
}

// ===== ユーティリティ =====
function q(map) {
  const out = {};
  for (const [key, sel] of Object.entries(map)) {
    out[key] = sel.startsWith('#') ? document.querySelector(sel) : document.querySelectorAll(sel);
  }
  return out;
}

function uniq(items, key) {
  return [...new Set(items.map((i) => i[key]).filter(Boolean))].sort();
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const k = item[key] || '不明';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function top(items, key) {
  return Object.entries(countBy(items, key)).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja-JP'),
  )[0]?.[0];
}

function opt(value, label) {
  const o = document.createElement('option');
  o.value = value;
  o.textContent = label;
  return o;
}

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
