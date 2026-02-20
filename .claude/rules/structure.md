# ディレクトリ構成・環境変数

## ディレクトリ構成

```
x-bookmark-manager/
├── oembed-proxy/          # Cloudflare Workers（デプロイ済み）
│   ├── worker.ts
│   └── wrangler.toml
├── src/
│   ├── App.tsx            # ルート: ログイン/メイン画面の切り替え
│   ├── types/index.ts     # Bookmark, Tag, OEmbedData, GoogleUser
│   ├── lib/
│   │   ├── googleSheets.ts  # Sheets API操作（全CRUD）
│   │   ├── oembed.ts        # oEmbed取得（プロキシ経由）
│   │   └── utils.ts         # URL正規化・バリデーション・タグ変換
│   ├── hooks/
│   │   ├── useBookmarks.ts  # ブックマーク状態管理・検索フィルター
│   │   └── useTags.ts       # タグ状態管理
│   └── components/
│       ├── LoginScreen.tsx
│       ├── MainScreen.tsx
│       ├── BookmarkCard.tsx
│       ├── AddBookmarkModal.tsx
│       ├── EditBookmarkModal.tsx
│       └── TagManagerModal.tsx
├── .github/workflows/
│   ├── ci.yml             # PR時: TypeScript + ESLint + Build
│   ├── claude.yml         # @claudeメンション時に応答
│   └── deploy.yml         # タグ or リリース作成時にGitHub Pagesへデプロイ
└── .env.example
```

## 環境変数

| 変数 | 説明 |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google Cloud Console で発行したOAuthクライアントID |
| `VITE_OEMBED_PROXY_URL` | `wrangler deploy` 後に確定するWorkerのURL |

ローカル開発時は `.env.local` に設定すること（`.gitignore` 済み）。
