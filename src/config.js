export const DATA_SOURCES = {
  accidents: {
    localCsvPath: './data/accidents.csv',
    remoteCsvUrl: '',
  },
  violations: {
    localCsvPath: './data/violations.csv',
    remoteCsvUrl: '',
  },
  enforcement: {
    localCsvPath: './data/enforcement.csv',
    remoteCsvUrl: '',
  },
  pickups: {
    localCsvPath: './data/pickups.csv',
    remoteCsvUrl: '',
  },
};

// MapTiler FreeプランのAPIキーを設定すると、地図背景がMapTilerタイルに切り替わります。
// 未設定の場合はOpenStreetMapタイルを表示します。
export const MAPTILER_API_KEY = '9sTROwglaOlAzPTK2UxJ';
export const MAPTILER_MAP_STYLE = 'basic-v2';
