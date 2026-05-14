import { DATA_SOURCES } from './config.js';

export function getConfiguredCsvSource(appId) {
  const sourceConfig = DATA_SOURCES[appId] ?? DATA_SOURCES.accidents;
  const params = new URLSearchParams(window.location.search);
  const csvFromUrl = params.get('csv');
  const source = csvFromUrl || sourceConfig.remoteCsvUrl || sourceConfig.localCsvPath;

  return {
    source,
    label: source === sourceConfig.localCsvPath ? '同梱サンプルCSV' : '外部公開CSV',
  };
}

export async function loadRecords(source) {
  const response = await fetch(source, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`CSVを読み込めませんでした: ${response.status}`);
  }

  return parseRecordCsv(await response.text());
}

export function parseRecordCsv(csvText) {
  const rows = parseCsv(csvText.trim());
  const [headers, ...records] = rows;

  if (!headers?.length) {
    return [];
  }

  return records
    .map((row, index) => {
      const source = Object.fromEntries(headers.map((header, i) => [header, row[i] ?? '']));
      const date = source.date || '';
      const time = source.time || '';

      return {
        id: source.id || `row-${index + 1}`,
        date,
        year: date.slice(0, 4),
        month: date.slice(5, 7),
        time,
        timeBand: toTimeBand(time),
        location: source.location || '',
        lat: Number(source.lat),
        lng: Number(source.lng),
        type: source.type || '',
        category: source.category || '',
        detail: source.detail || source.damaged_part || '',
        cause: source.cause || '',
        prevention: source.prevention || '',
      };
    })
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
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
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(field);
      if (row.some((value) => value.trim() !== '')) {
        rows.push(row.map((value) => value.trim()));
      }
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((value) => value.trim() !== '')) {
    rows.push(row.map((value) => value.trim()));
  }

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

