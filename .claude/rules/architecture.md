# アーキテクチャ決定事項

## oEmbed取得タイミング
**保存時に取得してSheetsに保存する**方式。
- ツイート削除後も内容が残る
- 表示が速い
- ツイート編集後は最新内容を反映しない（許容）

## URLの正規化
保存前に `x.com` → `twitter.com` に統一する（`src/lib/utils.ts: normalizeTweetUrl`）。

## タグのデータ構造
- `bookmarks` シートの `tags` カラム: カンマ区切り文字列（例: `"技術,Python"`）
- アプリ内部では `string[]` として扱う
- タグ削除時は全 `bookmarks` の `tags` 列を一括更新する

## 検索
フロントエンド側でフィルタリング（Sheets API のクエリ機能は使わない）。
検索対象: `text`（ツイート本文）、`author_name`（投稿者名）。

## access_token の管理
- Reactの `state` で管理（`localStorage` には保存しない）
- ページリロードで再ログイン必要（仕様）
- GSI トークンは1時間で期限切れ → エラー時は再ログインを促す

## widgets.js
`index.html` に1回だけ読み込む。ツイート表示後に `window.twttr?.widgets?.load()` を呼ぶこと。

## Google Sheets データ構造

### bookmarks シート（1行目ヘッダー）
| カラム | 型 |
|---|---|
| id | UUID |
| url | 正規化済みURL（twitter.com） |
| author_name | 投稿者名 |
| text | ツイート本文（プレーンテキスト） |
| embedded_html | oEmbed HTML |
| tags | カンマ区切りタグ名 |
| saved_at | ISO 8601 |

### tags シート（1行目ヘッダー）
| カラム | 型 |
|---|---|
| id | UUID |
| name | タグ名 |
| created_at | ISO 8601 |
