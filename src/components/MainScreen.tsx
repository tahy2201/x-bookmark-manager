import { useState } from "react";
import { Button, Input, Tag, Typography, Alert, Tooltip, theme } from "antd";
import { PlusOutlined, TagsOutlined, LogoutOutlined, SearchOutlined } from "@ant-design/icons";
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
  const { token } = theme.useToken();

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

  const allTagNames = Array.from(new Set(tags.map((t) => t.name)));

  return (
    <div style={{ minHeight: "100vh", background: token.colorBgLayout }}>

      {/* ヘッダー・検索・タグを一つの sticky ラッパーに */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: token.colorBgContainer,
        boxShadow: token.boxShadow,
      }}>
        {/* ヘッダー */}
        <header style={{
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            X Bookmark Manager
          </Typography.Title>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {user.name}
            </Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={onLogout} size="small">
              ログアウト
            </Button>
            <Tooltip title="タグ管理">
              <Button
                icon={<TagsOutlined />}
                onClick={() => setShowTagManager(true)}
                size="small"
              />
            </Tooltip>
            <Tooltip title="ブックマークを追加">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddModal(true)}
                shape="circle"
              />
            </Tooltip>
          </div>
        </header>

        {/* 検索バー */}
        <div style={{
          padding: "12px 24px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="ツイート本文・投稿者名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ borderRadius: 24 }}
          />
        </div>

        {/* タグフィルター */}
        {allTagNames.length > 0 && (
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            padding: "10px 24px",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}>
            <Tag.CheckableTag
              checked={selectedTag === null}
              onChange={() => setSelectedTag(null)}
            >
              すべて
            </Tag.CheckableTag>
            {allTagNames.map((name) => (
              <Tag.CheckableTag
                key={name}
                checked={selectedTag === name}
                onChange={() => setSelectedTag(selectedTag === name ? null : name)}
              >
                {name}
              </Tag.CheckableTag>
            ))}
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {(error || actionError) && (
        <Alert
          type="error"
          message={error ?? actionError}
          style={{ margin: "8px 24px" }}
          closable
        />
      )}

      {/* ブックマーク一覧 */}
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>
        {loading && (
          <Typography.Text type="secondary" style={{ display: "block", textAlign: "center", padding: "48px 0" }}>
            読み込み中...
          </Typography.Text>
        )}
        {!loading && filteredBookmarks.length === 0 && (
          <Typography.Text type="secondary" style={{ display: "block", textAlign: "center", padding: "48px 0" }}>
            ブックマークがありません
          </Typography.Text>
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
          onCreateTag={addTag}
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
