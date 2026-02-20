# X Bookmark Manager

XのブックマークをGoogleスプレッドシートで管理するWebアプリ。**完全無料**で動作します。

## 特徴

- Googleアカウントでログイン（OAuth 2.0）
- ツイートのブックマークをGoogleスプレッドシートに保存
- タグによる分類・フィルタリング
- ツイート本文・投稿者名での検索
- ツイートが削除されても内容を保持
- GitHub Pagesで無料ホスティング

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React + TypeScript（Vite） |
| 認証 | Google Identity Services（OAuth 2.0） |
| データストレージ | Google Sheets API v4 |
| ツイート取得 | X oEmbed API（Cloudflare Workers CORSプロキシ） |
| ホスティング | GitHub Pages |

## セットアップ

### 1. 必要なものを用意する

- Google Cloud Console で OAuth 2.0 クライアントID を取得
  - 承認済みの JavaScript 生成元に `http://localhost:5173` と `https://<your-username>.github.io` を追加
- Cloudflare Workers の oEmbed プロキシをデプロイ
  ```bash
  cd oembed-proxy
  npm install
  wrangler deploy
  ```

### 2. 環境変数を設定する

`.env.example` をコピーして `.env.local` を作成し、値を入力する。

```bash
cp .env.example .env.local
```

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_OEMBED_PROXY_URL=https://x-bookmark-oembed-proxy.YOUR_USERNAME.workers.dev
```

### 3. ローカルで起動する

```bash
npm install
npm run dev
```

## デプロイ（GitHub Pages）

### GitHub Secrets の設定

リポジトリの **Settings → Secrets and variables → Actions** に以下を登録する。

| Secret名 | 値 |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuthクライアントID |
| `VITE_OEMBED_PROXY_URL` | CloudflareワーカーのURL |
| `ANTHROPIC_API_KEY` | Claude Code Action用（オプション） |

### GitHub Pages の設定

**Settings → Pages** で Source を `gh-pages` ブランチに設定する。

### リリース手順

```bash
git tag v1.0.0
git push origin v1.0.0
```

または GitHub の **Releases** から Release を Publish するとデプロイが走ります。

## 開発

```bash
npm run dev       # 開発サーバー起動
npm run build     # 本番ビルド
npm run lint      # ESLint
```

## ライセンス

MIT
