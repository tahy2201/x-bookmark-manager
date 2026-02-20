# X Bookmark Manager - Claude Code ガイド

## プロジェクト概要

XのブックマークをGoogleスプレッドシートで管理するWebアプリ。
**無料で動作すること**が絶対条件。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React + TypeScript（Vite） |
| 認証 | Google Identity Services（OAuth 2.0） |
| データストレージ | Google Sheets API v4（直接呼び出し、GAS不使用） |
| ツイート取得 | X oEmbed API（Cloudflare Workers CORSプロキシ経由） |
| ホスティング | GitHub Pages |

## 開発コマンド

```bash
npm run dev       # 開発サーバー起動（localhost:5173）
npm run build     # 本番ビルド
npm run lint      # ESLint
```

## デプロイ

`git tag v1.0.0 && git push origin v1.0.0` でGitHub Pagesへ自動デプロイ。
または GitHub Releases から Release を Publish。

必要な GitHub Secrets: `VITE_GOOGLE_CLIENT_ID`, `VITE_OEMBED_PROXY_URL`, `ANTHROPIC_API_KEY`

## 詳細ドキュメント

- @rules/architecture.md — アーキテクチャ決定事項・データ構造
- @rules/structure.md — ディレクトリ構成・環境変数
