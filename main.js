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
  const response = await fetch(withCacheBust(source), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`CSVを読み込めませんでした: ${response.status}`);
  }

  return parseRecordCsv(await response.text());
}

function withCacheBust(source) {
  const url = new URL(source, window.location.href);
  url.searchParams.set('_ts', Date.now().toString());
  return url.toString();
}

export async function readCsvFile(file) {
  const buffer = await file.arrayBuffer();
  const utf8Text = new TextDecoder('utf-8').decode(buffer);
  if (!utf8Text.includes('\uFFFD')) {
    return utf8Text;
  }

  try {
    return new TextDecoder('shift_jis').decode(buffer);
  } catch {
    return utf8Text;
  }
}

export function parseRecordCsv(csvText) {
  const rows = parseCsv(csvText.replace(/^\uFEFF/, '').trim());
  const [headers, ...records] = rows;

  if (!headers?.length) {
    return [];
  }

  const normalizedHeaders = headers.map((header) => normalizeHeader(header));

  return records
    .map((row, index) => {
      const source = Object.fromEntries(normalizedHeaders.map((header, i) => [header, row[i] ?? '']));
      const date = source.date || '';
      const time = source.time || '';
      const { year, month } = dateParts(date);

      return {
        id: source.id || `row-${index + 1}`,
        date,
        year,
        month,
        time,
        timeBand: toTimeBand(time),
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
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
}

function dateParts(date) {
  const match = String(date).trim().match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (match) {
    return {
      year: match[1],
      month: match[2].padStart(2, '0'),
    };
  }

  return {
    year: String(date).slice(0, 4),
    month: String(date).slice(5, 7),
  };
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
    '事故id': 'id',
    'id': 'id',
    '日付': 'date',
    '発生日': 'date',
    '確認日': 'date',
    '乗車日': 'date',
    '時間': 'time',
    '時刻': 'time',
    '発生時刻': 'time',
    '場所': 'location',
    '発生場所': 'location',
    '乗車場所': 'location',
    '地点': 'location',
    '緯度': 'lat',
    '経度': 'lng',
    '区分': 'type',
    '事故区分': 'type',
    '違反区分': 'type',
    '取り締まり区分': 'type',
    '乗車区分': 'type',
    'カテゴリ': 'category',
    '違反カテゴリ': 'category',
    '種別': 'category',
    '分類': 'category',
    '損傷部位': 'detail',
    '対象': 'detail',
    '確認対象': 'detail',
    '乗車ポイント': 'detail',
    '詳細': 'detail',
    '原因概要': 'cause',
    '違反概要': 'cause',
    '注意概要': 'cause',
    '概要': 'cause',
    '再発防止ポイント': 'prevention',
    '改善ポイント': 'prevention',
    '運行注意ポイント': 'prevention',
    '配車・待機ポイント': 'prevention',
    'ポイント': 'prevention',
  };

  return aliases[key] || key;
}

function toNumber(value) {
  const normalized = String(value ?? '')
    .trim()
    .replace(/[０-９．－]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
  return Number(normalized);
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
