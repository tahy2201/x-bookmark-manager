import { useState } from "react";
import type { Bookmark, GoogleUser } from "../types";
import { useBookmarks } from "../hooks/useBookmarks";
import { useTags } from "../hooks/useTags";
import { BookmarkCard } from "./BookmarkCard";
import { AddBookmarkModal } from "./AddBookmarkModal";
import { EditBookmarkModal } from "./EditBookmarkModal";
import { TagManagerModal } from "./TagManagerModal";

interface Props {
  user: GoogleUser;
  spreadsheetId: string;
  onLogout: () => void;
}

export function MainScreen({ user, spreadsheetId, onLogout }: Props) {
  const {
    filteredBookmarks,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    addBookmark,
    updateBookmarkTags,
    deleteBookmark,
  } = useBookmarks(user.access_token, spreadsheetId);

  const { tags, addTag, deleteTag } = useTags(user.access_token, spreadsheetId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAddBookmark = async (url: string, selectedTags: string[]) => {
    setActionError(null);
    try {
      await addBookmark(url, selectedTags);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "追加に失敗しました");
      throw e;
    }
  };

  const handleUpdateTags = async (bookmarkId: string, tags: string[]) => {
    setActionError(null);
    try {
      await updateBookmarkTags(bookmarkId, tags);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "更新に失敗しました");
      throw e;
    }
  };

  const handleDelete = async (bookmarkId: string) => {
    if (!window.confirm("このブックマークを削除しますか？")) return;
    setActionError(null);
    try {
      await deleteBookmark(bookmarkId);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "削除に失敗しました");
    }
  };

  // 全タグ一覧（bookmarks + tagsシート のユニオン）
  const allTagNames = Array.from(
    new Set(tags.map((t) => t.name))
  );

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>X Bookmark Manager</h1>
        <div style={styles.headerRight}>
          <span style={styles.userName}>{user.name}</span>
          <button style={styles.logoutButton} onClick={onLogout}>
            ログアウト
          </button>
          <button style={styles.addButton} onClick={() => setShowAddModal(true)}>
            + 追加
          </button>
        </div>
      </header>

      {/* 検索バー */}
      <div style={styles.searchBar}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="🔍 ツイート本文・投稿者名で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button style={styles.tagManagerButton} onClick={() => setShowTagManager(true)}>
          タグ管理
        </button>
      </div>

      {/* タグフィルター */}
      {allTagNames.length > 0 && (
        <div style={styles.tagFilter}>
          <button
            style={{
              ...styles.tagFilterChip,
              ...(selectedTag === null ? styles.tagFilterChipActive : {}),
            }}
            onClick={() => setSelectedTag(null)}
          >
            すべて
          </button>
          {allTagNames.map((name) => (
            <button
              key={name}
              style={{
                ...styles.tagFilterChip,
                ...(selectedTag === name ? styles.tagFilterChipActive : {}),
              }}
              onClick={() => setSelectedTag(selectedTag === name ? null : name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {/* エラー表示 */}
      {(error || actionError) && (
        <p style={styles.error}>{error ?? actionError}</p>
      )}

      {/* ブックマーク一覧 */}
      <main style={styles.main}>
        {loading && <p style={styles.message}>読み込み中...</p>}
        {!loading && filteredBookmarks.length === 0 && (
          <p style={styles.message}>ブックマークがありません</p>
        )}
        {filteredBookmarks.map((bookmark) => (
          <BookmarkCard
            key={bookmark.id}
            bookmark={bookmark}
            onEdit={setEditingBookmark}
            onDelete={handleDelete}
          />
        ))}
      </main>

      {/* モーダル */}
      {showAddModal && (
        <AddBookmarkModal
          tags={tags}
          onAdd={handleAddBookmark}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingBookmark && (
        <EditBookmarkModal
          bookmark={editingBookmark}
          tags={tags}
          onSave={handleUpdateTags}
          onClose={() => setEditingBookmark(null)}
        />
      )}
      {showTagManager && (
        <TagManagerModal
          tags={tags}
          onAdd={async (name) => { await addTag(name); }}
          onDelete={deleteTag}
          onClose={() => setShowTagManager(false)}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #e1e8ed",
    padding: "0 24px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1a1a1a",
    margin: 0,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userName: { fontSize: "13px", color: "#666" },
  logoutButton: {
    padding: "6px 14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    color: "#555",
  },
  addButton: {
    padding: "8px 20px",
    backgroundColor: "#1d9bf0",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
  },
  searchBar: {
    display: "flex",
    gap: "12px",
    padding: "16px 24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e1e8ed",
  },
  searchInput: {
    flex: 1,
    padding: "10px 16px",
    border: "1px solid #ccc",
    borderRadius: "24px",
    fontSize: "14px",
    outline: "none",
  },
  tagManagerButton: {
    padding: "10px 20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    color: "#555",
    whiteSpace: "nowrap",
  },
  tagFilter: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e1e8ed",
  },
  tagFilterChip: {
    padding: "4px 16px",
    borderRadius: "16px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    color: "#555",
  },
  tagFilterChipActive: {
    backgroundColor: "#1d9bf0",
    color: "#fff",
    borderColor: "#1d9bf0",
  },
  error: {
    color: "#e0245e",
    fontSize: "14px",
    padding: "12px 24px",
    backgroundColor: "#fff9fa",
    borderBottom: "1px solid #fce4ec",
  },
  main: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "24px 16px",
  },
  message: {
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
    padding: "48px 0",
  },
};
