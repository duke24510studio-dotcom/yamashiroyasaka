// 山城ヤサカ交通マップ — 設定ファイル
// このファイルを書き換えるだけでデータ元と地図背景を切り替えられます。

// 各ページが読み込むCSVの場所。
// 同梱の data/*.csv を差し替えるか、Googleスプレッドシートの
// 「ファイル → 共有 → ウェブに公開（CSV）」で発行したURLを貼り付けてください。
export const CSV_SOURCES = {
  accidents: './data/accidents.csv',
  violations: './data/violations.csv',
  enforcement: './data/enforcement.csv',
  pickups: './data/pickups.csv',
};

// MapTiler Cloud Freeプランで取得したAPIキー。
// 空文字列の場合は OpenStreetMap タイルを表示します。
export const MAPTILER_API_KEY = '9sTROwglaOlAzPTK2UxJ';
export const MAPTILER_MAP_STYLE = 'basic-v2';
