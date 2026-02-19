import { useState } from "react";
import type { Bookmark, Tag } from "../types";

interface Props {
  bookmark: Bookmark;
  tags: Tag[];
  onSave: (bookmarkId: string, tags: string[]) => Promise<void>;
  onClose: () => void;
}

export function EditBookmarkModal({ bookmark, tags, onSave, onClose }: Props) {
  const [selectedTags, setSelectedTags] = useState<string[]>(bookmark.tags);
  const [saving, setSaving] = useState(false);

  const toggleTag = (name: string) => {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(bookmark.id, selectedTags);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>タグを編集</h2>
        <p style={styles.author}>@{bookmark.author_name}</p>

        {tags.length === 0 ? (
          <p style={styles.empty}>タグがありません。先にタグを作成してください。</p>
        ) : (
          <div style={styles.tagList}>
            {tags.map((tag) => (
              <button
                key={tag.id}
                style={{
                  ...styles.tagChip,
                  ...(selectedTags.includes(tag.name) ? styles.tagChipSelected : {}),
                }}
                onClick={() => toggleTag(tag.name)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        <div style={styles.buttons}>
          <button style={styles.cancelButton} onClick={onClose}>
            キャンセル
          </button>
          <button style={styles.saveButton} onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "32px",
    width: "100%",
    maxWidth: "480px",
  },
  title: { fontSize: "18px", fontWeight: "bold", marginBottom: "8px" },
  author: { fontSize: "14px", color: "#666", marginBottom: "20px" },
  empty: { color: "#999", fontSize: "14px", marginBottom: "20px" },
  tagList: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" },
  tagChip: {
    padding: "4px 14px",
    borderRadius: "16px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    color: "#555",
  },
  tagChipSelected: {
    backgroundColor: "#1d9bf0",
    color: "#fff",
    borderColor: "#1d9bf0",
  },
  buttons: { display: "flex", justifyContent: "flex-end", gap: "12px" },
  cancelButton: {
    padding: "10px 24px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
  saveButton: {
    padding: "10px 24px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#1d9bf0",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },
};
