# AGENTS

## 開発方針

- ビルド不要の静的HTML/CSS/JavaScriptとして保つ。
- ページは `index.html`、`violations.html` の2つを基本とする。
- 地図はMapLibre GL JSを使う。
- CSVには個人情報を含めない。
- データ列は `id,date,time,location,lat,lng,type,category,detail,cause,prevention` を標準とする。
- 公開前にCSV読込、地図表示、フィルター、一覧クリック、印刷表示を確認する。
