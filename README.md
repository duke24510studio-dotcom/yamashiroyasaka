# 交通事故・交通違反マップ

山城ヤサカ交通の安全管理向けに、交通事故と交通違反を地図・一覧・集計グラフで確認する静的Webアプリです。個人情報を扱わない前提で、地点、日付、区分、カテゴリ、概要、注意ポイントを可視化します。

## ファイル構成

```text
.
├── index.html
├── violations.html
├── components.html
├── data/
│   ├── accidents.csv
│   └── violations.csv
└── src/
    ├── config.js
    ├── app.js
    ├── styles.css
    └── components.css
```

ビルド不要・依存パッケージ不要です。CSVを差し替えれば、サイト側の「再読み込み」で最新内容を読み込みます。

## 機能

- MapLibre GL JS による地点マップ
- MapTiler APIキー設定時はMapTiler、未設定時はOpenStreetMap系フォールバックを表示
- 交通事故発生マップと交通違反マップの2ページ構成
- 同梱CSV、Googleスプレッドシート公開CSV、任意のCSV URL、手元CSVファイルの読込
- 年、月、区分、カテゴリ、キーワード検索
- 一覧クリックで地図ピンへ移動
- 時間帯別、カテゴリ別、場所別の集計
- 再発防止ポイント／改善ポイントの自動表示
- スマホ対応、印刷用CSS

## ローカルでの使い方

```bash
python -m http.server 8000
```

ブラウザで `http://localhost:8000/index.html` を開きます。

| ページ | URL | CSV |
| --- | --- | --- |
| 交通事故発生マップ | `index.html` | `data/accidents.csv` |
| 交通違反マップ | `violations.html` | `data/violations.csv` |
| UI部品 | `components.html` | なし |

## CSVを更新する

`data/accidents.csv` または `data/violations.csv` を差し替えます。サイト側はキャッシュを避けてCSVを取得するため、差し替え後に「再読み込み」を押すと反映されます。

CSV列は次を標準にしてください。

| 列名 | 内容 |
| --- | --- |
| id | 一意なID |
| date | 日付。例: `2026-05-06` または `2026/5/6` |
| time | 時刻。例: `10:30` |
| location | 場所 |
| lat | 緯度 |
| lng | 経度 |
| type | 区分 |
| category | カテゴリ |
| detail | 損傷部位、対象など |
| cause | 原因・概要 |
| prevention | 再発防止／改善ポイント |

既存互換として、`damaged_part` も `detail` として読み込みます。日本語列名、UTF-8 BOM付きCSV、Shift-JIS系CSVにも対応しています。

## Googleスプレッドシートを使う

1. GoogleスプレッドシートをCSV形式で「ウェブに公開」します。
2. 発行されたCSV URLを `src/config.js` に設定します。

```js
export const CSV_SOURCES = {
  accidents: 'https://docs.google.com/spreadsheets/d/e/xxxxxxxx/pub?gid=0&single=true&output=csv',
  violations: './data/violations.csv',
};
```

一時的に別CSVを試す場合は、URLパラメータ `csv` を使えます。

```text
index.html?csv=https%3A%2F%2Fexample.com%2Faccidents.csv
```

## MapTiler

`src/config.js` にAPIキーを設定します。空文字列にするとOpenStreetMap系フォールバックを使います。

```js
export const MAPTILER_API_KEY = 'YOUR_MAPTILER_API_KEY';
export const MAPTILER_MAP_STYLE = 'basic-v2';
```

公開する場合はMapTiler側でリファラ制限を設定してください。

```text
https://duke24510studio-dotcom.github.io/yamashiroyasaka/*
```

## GitHub Pagesで公開する

GitHub Actionsワークフロー `.github/workflows/deploy-pages.yml` を同梱しています。

1. リポジトリの `Settings` → `Pages` を開きます。
2. `Build and deployment` の `Source` を `GitHub Actions` にします。
3. `main` ブランチへアップロードまたはpushします。
4. Actions完了後、以下で公開されます。

```text
https://duke24510studio-dotcom.github.io/yamashiroyasaka/
```

## 個人情報の扱い

CSVには運転者名、乗客名、連絡先、車両番号、予約者名など、個人や個別車両を特定しやすい情報を含めないでください。

## 外部ライブラリ・サービス

- MapLibre GL JS 5.12.0
- MapTiler

