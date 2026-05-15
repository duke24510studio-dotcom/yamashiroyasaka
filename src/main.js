import { getCurrentAppConfig } from './app-configs.js';
import { getConfiguredCsvSource, loadRecords, parseRecordCsv } from './data.js';
import { applyFilters, describeActiveFilters, populateFilters, setupFilters } from './filters.js';
import { focusMarker, initMap, renderMarkers } from './map.js';
import { setupRecordForm } from './record-form.js';

const appConfig = getCurrentAppConfig();

const elements = {
  appTitle: document.querySelector('#appTitle'),
  appEyebrow: document.querySelector('#appEyebrow'),
  navLinks: document.querySelectorAll('.app-nav a'),
  map: document.querySelector('#map'),
  yearFilter: document.querySelector('#yearFilter'),
  monthFilter: document.querySelector('#monthFilter'),
  typeFilter: document.querySelector('#typeFilter'),
  categoryFilter: document.querySelector('#categoryFilter'),
  typeFilterLabel: document.querySelector('#typeFilterLabel'),
  categoryFilterLabel: document.querySelector('#categoryFilterLabel'),
  searchInput: document.querySelector('#searchInput'),
  csvInput: document.querySelector('#csvInput'),
  printButton: document.querySelector('#printButton'),
  reloadButton: document.querySelector('#reloadButton'),
  sourceLabel: document.querySelector('#sourceLabel'),
  sourceStatus: document.querySelector('#sourceStatus'),
  totalLabel: document.querySelector('#totalLabel'),
  topCategoryLabel: document.querySelector('#topCategoryLabel'),
  topTimeBandLabel: document.querySelector('#topTimeBandLabel'),
  topLocationLabel: document.querySelector('#topLocationLabel'),
  totalCount: document.querySelector('#totalCount'),
  topCategory: document.querySelector('#topCategory'),
  topTimeBand: document.querySelector('#topTimeBand'),
  topLocation: document.querySelector('#topLocation'),
  timeStatsTitle: document.querySelector('#timeStatsTitle'),
  categoryStatsTitle: document.querySelector('#categoryStatsTitle'),
  locationStatsTitle: document.querySelector('#locationStatsTitle'),
  preventionTitle: document.querySelector('#preventionTitle'),
  timeStats: document.querySelector('#timeStats'),
  categoryStats: document.querySelector('#categoryStats'),
  locationStats: document.querySelector('#locationStats'),
  preventionList: document.querySelector('#preventionList'),
  listTitle: document.querySelector('#listTitle'),
  activeFilterText: document.querySelector('#activeFilterText'),
  tableHeaders: document.querySelectorAll('[data-table-key]'),
  recordTable: document.querySelector('#accidentTable'),
};

let records = [];
let selectedId = null;
let activeSource = getConfiguredCsvSource(appConfig.id);

applyAppText();
await initMap();
setupFilters(elements, render);
elements.printButton.addEventListener('click', () => window.print());
elements.reloadButton.addEventListener('click', () => loadConfiguredSource());
elements.csvInput.addEventListener('change', loadUserCsv);
setupRecordForm(
  appConfig,
  () => records,
  (record) => {
    records.push({
      ...record,
      year: record.date?.slice(0, 4) ?? '',
      month: record.date?.slice(5, 7) ?? '',
      timeBand: toTimeBand(record.time ?? ''),
    });
    populateFilters(records, elements);
    render();
  },
  (message) => setSourceStatus(activeSource.label, message),
);

await loadConfiguredSource();

function toTimeBand(time) {
  const hour = Number(String(time).slice(0, 2));
  if (!Number.isFinite(hour)) return '不明';
  if (hour < 6) return '深夜';
  if (hour < 10) return '朝';
  if (hour < 14) return '昼';
  if (hour < 18) return '夕方';
  if (hour < 22) return '夜';
  return '深夜';
}

async function loadConfiguredSource() {
  try {
    setSourceStatus(activeSource.label, `${appConfig.sourceName}を読み込んでいます。`);
    records = await loadRecords(activeSource.source);
    selectedId = null;
    populateFilters(records, elements);
    setSourceStatus(activeSource.label, `${records.length}件の${appConfig.sourceName}を読み込みました。`);
    render();
  } catch (error) {
    showEmptyState('CSVを読み込めませんでした。READMEの手順と公開URLを確認してください。');
    setSourceStatus(activeSource.label, 'CSVを読み込めませんでした。');
    console.error(error);
  }
}

function render() {
  const filtered = applyFilters(records, elements);
  elements.activeFilterText.textContent = describeActiveFilters(elements);
  renderMarkers(filtered, selectRecord, appConfig);
  renderSummary(filtered);
  renderStats(filtered);
  renderPrevention(filtered);
  renderTable(filtered);
}

function selectRecord(id) {
  selectedId = id;
  focusMarker(id);
  document.querySelectorAll('#accidentTable tr').forEach((row) => {
    row.classList.toggle('is-selected', row.dataset.id === id);
  });
}

function renderSummary(items) {
  const topCategory = topValue(items, 'category');
  const topTimeBand = topValue(items, 'timeBand');
  const topLocation = topValue(items, 'location');

  elements.totalCount.textContent = String(items.length);
  elements.topCategory.textContent = topCategory?.label ?? '-';
  elements.topTimeBand.textContent = topTimeBand?.label ?? '-';
  elements.topLocation.textContent = topLocation?.label ?? '-';
}

function renderStats(items) {
  renderBars(elements.timeStats, countBy(items, 'timeBand'), ['朝', '昼', '夕方', '夜', '深夜', '不明']);
  renderBars(elements.categoryStats, countBy(items, 'category'));
  renderBars(elements.locationStats, countBy(items, 'location'), null, 5);
}

function renderBars(container, counts, preferredOrder = null, limit = 10) {
  const entries = Object.entries(counts);
  const sorted = preferredOrder
    ? preferredOrder.filter((label) => counts[label]).map((label) => [label, counts[label]])
    : entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja-JP')).slice(0, limit);

  const max = Math.max(...sorted.map(([, count]) => count), 1);
  container.replaceChildren(
    ...sorted.map(([label, count]) => {
      const item = document.createElement('div');
      item.className = 'bar-row';
      item.innerHTML = `
        <span class="bar-label">${escapeHtml(label)}</span>
        <span class="bar-track"><span style="width: ${(count / max) * 100}%"></span></span>
        <strong>${count}</strong>
      `;
      return item;
    }),
  );

  if (!sorted.length) {
    container.textContent = '該当データがありません';
  }
}

function renderPrevention(items) {
  const categoryCounts = countBy(items, 'category');
  const generated = Object.entries(appConfig.generatedPoints)
    .filter(([category]) => categoryCounts[category])
    .map(([, point]) => point);

  const fromCsv = [...new Set(items.map((item) => item.prevention).filter(Boolean))].slice(0, 4);
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
  elements.recordTable.replaceChildren(
    ...items.map((item) => {
      const row = document.createElement('tr');
      row.dataset.id = item.id;
      row.classList.toggle('is-selected', item.id === selectedId);
      row.tabIndex = 0;
      row.innerHTML = `
        <td>${escapeHtml(item.date)}</td>
        <td>${escapeHtml(item.time)}</td>
        <td>${escapeHtml(item.location)}</td>
        <td>${escapeHtml(item.type)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(item.detail)}</td>
        <td>${escapeHtml(item.cause)}</td>
      `;
      row.addEventListener('click', () => selectRecord(item.id));
      row.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectRecord(item.id);
        }
      });
      return row;
    }),
  );
}

async function loadUserCsv(event) {
  const [file] = event.target.files;
  if (!file) return;

  const isExcel = /\.(xlsx|xls)$/i.test(file.name);
  let csvText;
  let sourceLabel;
  if (isExcel) {
    csvText = await readExcelAsCsv(file, appConfig.id);
    sourceLabel = '手元のExcelファイル';
  } else {
    csvText = await file.text();
    sourceLabel = '手元のCSVファイル';
  }

  records = parseRecordCsv(csvText);
  selectedId = null;
  activeSource = { source: file.name, label: sourceLabel };
  populateFilters(records, elements);
  setSourceStatus(activeSource.label, `${records.length}件の${appConfig.sourceName}を読み込みました。`);
  render();

  event.target.value = '';
}

async function readExcelAsCsv(file, appId) {
  if (typeof XLSX === 'undefined') {
    throw new Error('Excel 読込ライブラリが読み込まれていません。ページを再読み込みしてください。');
  }
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const preferred = { accidents: '事故', violations: '違反' }[appId];
  const candidates = [preferred, ...workbook.SheetNames];
  let pickedSheet = null;
  for (const name of candidates) {
    if (!name) continue;
    const sheet = workbook.Sheets[name];
    if (!sheet) continue;
    const csv = XLSX.utils.sheet_to_csv(sheet);
    const firstLine = csv.split(/\r?\n/, 1)[0] ?? '';
    if (/(^|,)(id|date|location|lat|lng)(,|$)/i.test(firstLine)) {
      pickedSheet = csv;
      break;
    }
  }
  if (!pickedSheet) {
    throw new Error('Excelファイルから列名(id,date,location...)を含むシートが見つかりませんでした。');
  }
  return pickedSheet;
}

function applyAppText() {
  document.title = `${appConfig.title} | 山城ヤサカ交通`;
  elements.appTitle.textContent = appConfig.title;
  elements.appEyebrow.textContent = appConfig.eyebrow;
  elements.map.setAttribute('aria-label', appConfig.mapLabel);
  elements.searchInput.placeholder = appConfig.searchPlaceholder;
  elements.typeFilterLabel.childNodes[0].nodeValue = `${appConfig.filterLabels.type}\n`;
  elements.categoryFilterLabel.childNodes[0].nodeValue = `${appConfig.filterLabels.category}\n`;
  elements.totalLabel.textContent = appConfig.summaryLabels.total;
  elements.topCategoryLabel.textContent = appConfig.summaryLabels.topCategory;
  elements.topTimeBandLabel.textContent = appConfig.summaryLabels.topTimeBand;
  elements.topLocationLabel.textContent = appConfig.summaryLabels.topLocation;
  elements.timeStatsTitle.textContent = appConfig.stats.time;
  elements.categoryStatsTitle.textContent = appConfig.stats.category;
  elements.locationStatsTitle.textContent = appConfig.stats.location;
  elements.preventionTitle.textContent = appConfig.stats.prevention;
  elements.listTitle.textContent = appConfig.listTitle;
  elements.tableHeaders.forEach((header) => {
    header.textContent = appConfig.tableLabels[header.dataset.tableKey];
  });
  elements.navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.dataset.appLink === appConfig.id);
  });
}

function setSourceStatus(label, status) {
  elements.sourceLabel.textContent = label;
  elements.sourceStatus.textContent = status;
}

function showEmptyState(message) {
  elements.recordTable.innerHTML = `<tr><td colspan="7">${escapeHtml(message)}</td></tr>`;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

