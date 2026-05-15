# 交通事故発生マップ

山城ヤサカ交通の安全管理・運行分析向けに、交通事故、交通違反、取り締まり情報、お客様の乗車位置を地図、一覧、集計グラフで確認する静的Webアプリです。個人情報を扱わない前提で、地点、日付、区分、カテゴリ、概要、注意ポイントを可視化します。

## 機能

- MapLibre GL JS による地点マップ
- MapTiler APIキー設定時はMapTilerタイル、未設定時はOpenStreetMapタイルを表示
- 交通事故発生マップ、交通違反マップ、取り締まり情報マップ、お客様の乗車位置マップの4ページ構成
- 同梱CSV、Googleスプレッドシート公開CSV、任意のCSV URLからの読込
- 年、月、事故区分、カテゴリでの絞り込み
- 場所、損傷部位、原因概要での検索
- 事故一覧クリックによる地図ピンへの移動
- 時間帯別、カテゴリ別、場所別の集計表示
- データ内容に応じた再発防止ポイントの自動表示
- スマホ対応レイアウト
- 印刷用CSS

## ローカルでの使い方

1. このフォルダでローカルサーバーを起動します。

   ```bash
   python -m http.server 8000
   ```

2. ブラウザで `http://localhost:8000` を開きます。
3. 初期表示では各ページに対応したサンプルCSVを読み込みます。
4. 別のCSVを使う場合は、画面右上の「CSV読込」からファイルを選択します。
5. 管理者がデータ元CSVを更新したあと、サイト側の「再読み込み」を押すと最新データを再取得します。

## ページ

| ページ | URL | サンプルCSV |
| --- | --- | --- |
| 交通事故発生マップ | `index.html` | `data/accidents.csv` |
| 交通違反マップ | `violations.html` | `data/violations.csv` |
| 取り締まり情報マップ | `enforcement.html` | `data/enforcement.csv` |
| お客様の乗車位置マップ | `pickups.html` | `data/pickups.csv` |

## Googleスプレッドシートをデータ元にする

1. Googleスプレッドシートに `data/accidents.csv` と同じ列名で事故データを作ります。
2. スプレッドシートから `ファイル` → `共有` → `ウェブに公開` を選びます。
3. 公開形式を `カンマ区切り値（.csv）` にして公開します。
4. 発行されたCSV URLをコピーします。
5. [src/config.js](./src/config.js) の対象ページの `remoteCsvUrl` に貼り付けます。

```js
export const DATA_SOURCES = {
  accidents: {
    localCsvPath: './data/accidents.csv',
    remoteCsvUrl: 'https://docs.google.com/spreadsheets/d/e/xxxxxxxx/pub?gid=0&single=true&output=csv',
  },
};
```

Google側の公開反映には少し時間がかかる場合があります。サイト側ではキャッシュを避ける設定でCSVを取得していますが、反映されない場合は数分後に再読み込みしてください。

## MapTilerを無料枠で使う

MapTilerの背景地図を使う場合は、MapTiler Cloudの無料プランでAPIキーを取得して [src/config.js](./src/config.js) に設定します。

```js
export const MAPTILER_API_KEY = 'YOUR_MAPTILER_API_KEY';
export const MAPTILER_MAP_STYLE = 'basic-v2';
```

APIキーが空の場合は、OpenStreetMapタイルを表示します。GitHub Pagesなどで公開する場合は、MapTiler側でキーの利用制限を設定してください。無料プランには月ごとの利用上限があるため、公開後はMapTilerのダッシュボードで使用量を確認してください。

`basic-v2` は軽量表示を優先したスタイルです。日本語表記をさらに重視する場合は `jp-mierune-streets` も試せますが、環境によっては表示が重くなる場合があります。

## CSV URLを一時的に指定する

設定ファイルを変更せずに別CSVを試す場合は、URLパラメータ `csv` を使えます。

```text
https://example.github.io/traffic-accident-dashboard/?csv=https%3A%2F%2Fexample.com%2Faccidents.csv
```

外部CSVを使う場合、公開元がブラウザからの読み込みを許可している必要があります。Googleスプレッドシートの「ウェブに公開」CSVはこの用途に向いています。

## GitHub Pagesで公開する

このアプリはビルド不要です。GitHub Pagesでは次の手順で公開できます。

1. GitHubにリポジトリを作成し、このフォルダの内容をpushします。
2. GitHubのリポジトリ画面で `Settings` → `Pages` を開きます。
3. `Build and deployment` の `Source` を `Deploy from a branch` にします。
4. `Branch` を `main`、フォルダを `/root` にして保存します。
5. 表示されたURLを開きます。

## CSV形式

各CSVは同じ列名で作成してください。事故データは既存互換のため `damaged_part` も読み込めますが、新しく作る場合は `detail` を使うと3ページで共通化できます。

| 列名 | 内容 |
| --- | --- |
| id | 事故ID |
| date | 発生日。例: `2026-05-06` |
| time | 発生時刻。例: `10:30` |
| location | 発生場所 |
| lat | 緯度 |
| lng | 経度 |
| type | 事故区分。例: `物損`, `人身` |
| category | カテゴリ。例: `追突`, `後退時接触` |
| detail | 損傷部位、対象、確認対象など |
| cause | 原因概要 |
| prevention | 再発防止ポイント |

お客様の乗車位置マップでは、`category` に次の3種類を入れます。

- `ヤサカ無線`
- `GOアプリ`
- `DiDi`

## 個人情報の扱い

このアプリは、運転者名、乗客名、連絡先、車両番号、予約者名などの個人や個別車両を特定しやすい情報を表示しない前提で設計しています。乗車位置データも個人単位の履歴ではなく、地点と種別の集計・記録として扱ってください。CSVやGoogleスプレッドシートにも個人情報を含めないでください。

## 外部ライブラリ・サービス

- MapLibre GL JS 5.12.0
- MapTiler

MapTiler APIキーが未設定の場合、地図タイルは OpenStreetMap を利用します。
