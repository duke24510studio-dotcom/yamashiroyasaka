# 交通事故発生マップ

山城ヤサカ交通の安全管理・運行分析向けに、交通事故、交通違反、取り締まり情報、お客様の乗車位置を地図・一覧・集計グラフで確認する静的Webアプリです。個人情報を扱わない前提で、地点、日付、区分、カテゴリ、概要、注意ポイントを可視化します。

## ファイル構成（とてもシンプル）

```
.
├── index.html         交通事故発生マップ
├── violations.html    交通違反マップ
├── enforcement.html   取り締まり情報マップ
├── pickups.html       お客様の乗車位置マップ
├── data/              4ページが読み込むCSV（書き換えればそのまま反映）
│   ├── accidents.csv
│   ├── violations.csv
│   ├── enforcement.csv
│   └── pickups.csv
└── src/
    ├── config.js      CSVの場所とMapTilerキーだけを書く設定ファイル
    ├── app.js         アプリ本体（地図・絞り込み・集計・一覧）
    └── styles.css     スタイル
```

ビルド不要・依存パッケージなし。CSVを差し替えれば常に最新内容が読み込まれます（毎回キャッシュを回避して取得）。

## 機能

- MapLibre GL JS による地点マップ
- MapTiler APIキー設定時はMapTilerタイル、未設定時はOpenStreetMapタイルを表示
- 4ページ構成（事故・違反・取り締まり・乗車位置）
- 同梱CSV / Googleスプレッドシート公開CSV / 任意のCSV URL / 手元のCSVファイル の読込
- 年・月・区分・カテゴリでの絞り込みと、場所・対象・概要のキーワード検索
- 一覧クリックで地図ピンへ移動
- 時間帯別・カテゴリ別・場所別の集計表示
- カテゴリ内容に応じた再発防止／改善ポイントの自動表示
- スマホ対応レイアウトと印刷用CSS

## ローカルでの使い方

```bash
python -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。初期表示では各ページに対応した `data/*.csv` を読み込みます。

- 別のCSVを使う場合は、画面右上の「CSV読込」からファイルを選択。
- `data/*.csv` を更新したあとは「再読み込み」ボタンを押すと最新内容で読み直します。

## CSVを更新する

最も簡単な運用方法は `data/` 配下のCSVを書き換えることです。サイト側はキャッシュを毎回回避（`?_=<timestamp>` を付与）して取得するため、ファイルを差し替えれば再読み込みでそのまま反映されます。

| ページ | URL | 差し替えるCSV |
| --- | --- | --- |
| 交通事故発生マップ | `index.html` | `data/accidents.csv` |
| 交通違反マップ | `violations.html` | `data/violations.csv` |
| 取り締まり情報マップ | `enforcement.html` | `data/enforcement.csv` |
| お客様の乗車位置マップ | `pickups.html` | `data/pickups.csv` |

## Googleスプレッドシートをデータ元にする

1. スプレッドシートに `data/accidents.csv` と同じ列名で作成。
2. `ファイル → 共有 → ウェブに公開` で `カンマ区切り値（.csv）` を選択。
3. 発行されたCSV URLを [`src/config.js`](./src/config.js) の対応するエントリに貼り付け。

```js
export const CSV_SOURCES = {
  accidents: 'https://docs.google.com/spreadsheets/d/e/xxxxxxxx/pub?gid=0&single=true&output=csv',
  violations: './data/violations.csv',
  enforcement: './data/enforcement.csv',
  pickups: './data/pickups.csv',
};
```

## MapTilerを無料枠で使う

[`src/config.js`](./src/config.js) でAPIキーを設定します。空文字列なら OpenStreetMap タイルを使います。

```js
export const MAPTILER_API_KEY = 'YOUR_MAPTILER_API_KEY';
export const MAPTILER_MAP_STYLE = 'basic-v2';
```

GitHub Pagesなどで公開する場合は、MapTiler側でキーの利用制限（リファラ）を設定してください。

## CSV URLを一時的に指定する

設定ファイルを変更せずに別CSVを試す場合は、URLパラメータ `csv` を使えます。

```
http://localhost:8000/index.html?csv=https%3A%2F%2Fexample.com%2Faccidents.csv
```

外部CSVを使う場合、公開元がブラウザからの読み込みを許可している必要があります。Googleスプレッドシートの「ウェブに公開」CSVはこの用途に向いています。

## GitHub Pagesで公開する

ビルド不要です。

1. リポジトリにこのフォルダの内容をpush。
2. `Settings → Pages` で `Deploy from a branch` を選び、`Branch: main / root` で保存。
3. 表示されたURLを開く。

## CSV形式

各CSVは同じ列名で作成します（事故データは既存互換のため `damaged_part` も読み込めますが、新規作成では `detail` を使うと4ページで統一できます）。

| 列名 | 内容 |
| --- | --- |
| id | 一意なID |
| date | 発生日（例: `2026-05-06`） |
| time | 発生時刻（例: `10:30`） |
| location | 発生場所 |
| lat | 緯度 |
| lng | 経度 |
| type | 区分（例: 物損 / 人身、道路交通法違反 など） |
| category | カテゴリ（例: 追突、後退時接触、速度取締、ヤサカ無線 など） |
| detail | 損傷部位／対象／確認対象など |
| cause | 原因・概要 |
| prevention | 再発防止／改善ポイント |

お客様の乗車位置マップでは、`category` に次の3種類を入れます。

- `ヤサカ無線`
- `GOアプリ`
- `DiDi`

## 個人情報の扱い

このアプリは、運転者名、乗客名、連絡先、車両番号、予約者名などの個人や個別車両を特定しやすい情報を表示しない前提で設計しています。乗車位置データも個人単位の履歴ではなく、地点と種別の集計・記録として扱ってください。CSVやスプレッドシートにも個人情報を含めないでください。

## 外部ライブラリ・サービス

- MapLibre GL JS 5.12.0
- MapTiler（APIキー未設定時は OpenStreetMap タイル）
