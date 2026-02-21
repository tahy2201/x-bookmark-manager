# X Bookmark Manager - 作業引き継ぎ記録

最終更新: 2026-02-20

---

## プロジェクト概要

XのブックマークをGoogleスプレッドシートで管理するWebアプリ。
無料で動作することが絶対条件。

| レイヤー | 技術 |
|---|---|
| フロントエンド | React + TypeScript（Vite） |
| UIライブラリ | **antd v5** + @ant-design/icons |
| 認証 | Google Identity Services（OAuth 2.0） |
| データストレージ | Google Sheets API v4 |
| ツイート取得 | oEmbed API（Cloudflare Workers CORSプロキシ経由） |
| ホスティング | GitHub Pages |

---

## 今セッションで完了した実装

### 1. antd 導入・全コンポーネント移行

`package.json` に `antd`, `@ant-design/icons` を追加。
全コンポーネントで antd の Button, Input, Modal, Tag, Typography, Space 等を使用。

### 2. ダークモード対応（App.tsx）

```tsx
// OS設定をリアルタイム検知してConfigProviderに渡す
const [isDark, setIsDark] = useState(
  window.matchMedia("(prefers-color-scheme: dark)").matches
);
useEffect(() => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}, []);

return (
  <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
    ...
  </ConfigProvider>
);
```

### 3. モック開発モード（useBookmarks.ts / useTags.ts）

`VITE_USE_MOCK=true` で Google Sheets API を呼ばずにモックデータを使用。

```ts
const IS_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const load = useCallback(async () => {
  if (IS_MOCK) { setBookmarks(MOCK_BOOKMARKS); return; }
  // ...API呼び出し
}, []);
// addBookmark, updateBookmarkTags, deleteBookmark も IS_MOCK 時はAPI skip
```

モックデータ: `src/lib/mock/data.ts`（MOCK_BOOKMARKS, MOCK_TAGS）

### 4. スティッキーヘッダー（MainScreen.tsx）

ヘッダー・検索バー・タグフィルターを `position: sticky; top: 0; zIndex: 10` の単一ラッパーに格納。
antd デザイントークン（`theme.useToken()`）でダークモード自動対応。

```
[スティッキーラッパー]
  ├── ヘッダー: タイトル / ログアウト・タグ管理・追加ボタン
  ├── 検索バー: Input（allowClear, prefix=<SearchOutlined />）
  └── タグフィルター: Tag.CheckableTag（すべて + 各タグ名）

[スクロールエリア]
  └── main: BookmarkCard × n
```

### 5. ツイート再レンダリング対策（BookmarkCard.tsx）

**問題:** タグ切り替え時に親が再レンダリング → BookmarkCard 再レンダリング → Twitter iframeが消える

**解決:** `TweetEmbed` を `React.memo` でラップ + `dangerouslySetInnerHTML` 廃止

```tsx
const TweetEmbed = memo(function TweetEmbed({ html, bgColor }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ダーク注入 → innerHTML → widgets.load（htmlが変わった時だけ実行）
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    ref.current.innerHTML = isDark
      ? html.replace(/<blockquote class="twitter-tweet"/g,
          '<blockquote class="twitter-tweet" data-theme="dark"')
      : html;
    window.twttr?.widgets?.load(ref.current);
  }, [html]);

  useEffect(() => {
    // テーマ変化時はiframeを触らず背景色だけ更新
    if (ref.current) ref.current.style.background = bgColor;
  }, [bgColor]);

  return <div ref={ref} style={{ display: "flex", justifyContent: "center", background: bgColor }} />;
}, (prev, next) => prev.html === next.html); // htmlが変わらない限り再レンダリングしない
```

### 6. AddBookmarkModal: インライン新規タグ作成

`onCreateTag: (name: string) => Promise<Tag>` propsを追加。
モーダル内でタグ選択と新規タグ作成を完結。

```tsx
// モーダルのprops
interface Props {
  tags: TagType[];
  onAdd: (url: string, selectedTags: string[]) => Promise<void>;
  onCreateTag: (name: string) => Promise<TagType>; // ← 追加
  onClose: () => void;
}
```

### 7. EditBookmarkModal: CheckableTag でタグ選択

### 8. TagManagerModal: Popconfirm で削除確認

---

## 未解決の問題 ⚠️

### カード四隅の白いコーナー（最重要・要対応）

**症状:** ダークモードでツイートカードの四隅（角丸の角部分）に白/明るい色が残る

**ユーザーが確認したスクリーンショット:** `/Users/hyuga/Desktop/スクリーンショット 2026-02-20 18.02.29.png`
- カード左上コーナーに白い矩形領域が見える
- ツイートiframe自体はダークモードで正常表示

**調査で判明した数値（Chrome DevTools）:**
- カード外側div背景: `rgb(20, 20, 20)` ← ダーク ✓
- カード: `border-radius: 8px`, `overflow: hidden`
- iframe: `allowtransparency=true`, `width: 550px`（カード幅600px内に中央配置）
- TweetEmbed div背景: `bgColor` prop = `token.colorBgContainer = rgb(20, 20, 20)` ← ダーク ✓

**試みた対策（いずれも不十分）:**
1. `willChange: "transform"` → GPUヒントだが保証なし
2. `transform: "translateZ(0)"` → GPU合成レイヤー昇格（現在適用中）
3. `background: bgColor` を TweetEmbed ref div に設定（現在適用中）

**根本原因の考察:**
Twitterウィジェットは `<blockquote>` を `<iframe>` に置き換える際、iframeの外側（550px幅のiframeとカード幅の差分）にTweetEmbed divの背景が見える。
カード角丸の角部分でこの領域が視覚的に「白い角」として見える可能性。
また、iframe自身が独自のGPU合成コンテキストを持つため、`overflow: hidden` のクリップが完全に機能しない場合がある。

**次に試すべき対策（未実施）:**

```tsx
// 案1: clip-path（overflow:hidden より確実なクリップ）
// BookmarkCard の外側 div のstyleに追加
clipPath: `inset(0 round ${token.borderRadiusLG}px)`,

// 案2: TweetEmbed wrapper に border-radius を付けて上角を丸める
// TweetEmbed の ref div
borderRadius: `${token.borderRadiusLG}px ${token.borderRadiusLG}px 0 0`,
overflow: "hidden",

// 案3: paddingでiframeを内側に収め、角にカード背景を露出させない
// (Twitter iframeが550px固定なのでpadding追加でずれる可能性あり)
```

---

## 現在のファイル構成と主要実装

```
src/
├── App.tsx                    ← ConfigProvider + OS ダークモード検知
├── hooks/
│   ├── useBookmarks.ts        ← IS_MOCK フラグ、検索/タグフィルタリング
│   └── useTags.ts             ← IS_MOCK フラグ
├── lib/
│   └── mock/
│       └── data.ts            ← MOCK_BOOKMARKS（「離乳食」テキスト含む）, MOCK_TAGS
└── components/
    ├── LoginScreen.tsx         ← antd Button/Typography/Alert
    ├── MainScreen.tsx          ← antd + スティッキーヘッダー + theme.useToken()
    ├── BookmarkCard.tsx        ← TweetEmbed（React.memo）+ ダーク注入
    ├── AddBookmarkModal.tsx    ← antd Modal + インライン新規タグ作成
    ├── EditBookmarkModal.tsx   ← antd Modal + Tag.CheckableTag
    └── TagManagerModal.tsx     ← antd Modal + List + Popconfirm
```

## antd デザイントークン（theme.useToken()）

```ts
token.colorBgContainer    // カード背景色（ダーク: rgb(20,20,20)）
token.colorBgLayout       // ページ背景色
token.colorBorderSecondary // ボーダー色
token.colorFillQuaternary  // フッター背景（薄い）
token.borderRadiusLG       // 角丸 = 8px
token.boxShadow / boxShadowTertiary // 影
```

---

## 未コミット状態

現在 16 ファイルが未コミット。
白コーナー問題を解消してから commit すること。

---

## 元の実装SOW（参考）

以下は初期実装のSOWです。すべてのTASKは完了済み。

### データ構造（Google Sheets）

**bookmarksシート（1行目はヘッダー）**
| カラム | 型 |
|---|---|
| id | UUID |
| url | 正規化済みツイートURL（twitter.com） |
| author_name | 投稿者名 |
| text | ツイート本文（プレーンテキスト） |
| embedded_html | oEmbedで取得した埋め込みHTML |
| tags | カンマ区切りタグ名（例: `"技術,Python"`） |
| saved_at | ISO 8601 |

**tagsシート（1行目はヘッダー）**
| カラム | 型 |
|---|---|
| id | UUID |
| name | タグ名 |
| created_at | ISO 8601 |

### 重要なアーキテクチャ決定

- **oEmbed取得タイミング:** 保存時に取得してSheetsに保存（ツイート削除後も内容が残る）
- **URL正規化:** 保存前に `x.com` → `twitter.com` に統一（`src/lib/utils.ts: normalizeTweetUrl`）
- **access_token管理:** Reactのstateで管理（localStorageには保存しない）
- **検索:** フロントエンド側でフィルタリング（検索対象: `text`, `author_name`）
- **widgets.js:** `index.html` に1回だけ読み込み。ツイート表示後に `window.twttr?.widgets?.load()` を呼ぶ
