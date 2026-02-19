import { useState } from "react";
import type { Tag } from "../types";

interface Props {
  tags: Tag[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (tagName: string) => Promise<void>;
  onClose: () => void;
}

export function TagManagerModal({ tags, onAdd, onDelete, onClose }: Props) {
  const [newTagName, setNewTagName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingTag, setDeletingTag] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    const name = newTagName.trim();
    if (!name) return;
    if (tags.some((t) => t.name === name)) {
      setError("同じ名前のタグが既に存在します");
      return;
    }
    setError(null);
    setAdding(true);
    try {
      await onAdd(name);
      setNewTagName("");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (tagName: string) => {
    setDeletingTag(tagName);
    try {
      await onDelete(tagName);
    } finally {
      setDeletingTag(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>タグ管理</h2>

        <div style={styles.addRow}>
          <input
            style={styles.input}
            type="text"
            placeholder="新しいタグ名"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button style={styles.addButton} onClick={handleAdd} disabled={adding}>
            {adding ? "追加中..." : "追加"}
          </button>
        </div>
        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.tagList}>
          {tags.length === 0 && (
            <p style={styles.empty}>タグがありません</p>
          )}
          {tags.map((tag) => (
            <div key={tag.id} style={styles.tagRow}>
              <span style={styles.tagName}>{tag.name}</span>
              {confirmDelete === tag.name ? (
                <div style={styles.confirmRow}>
                  <span style={styles.confirmText}>削除しますか？</span>
                  <button
                    style={styles.confirmYes}
                    onClick={() => handleDelete(tag.name)}
                    disabled={deletingTag === tag.name}
                  >
                    {deletingTag === tag.name ? "削除中..." : "削除"}
                  </button>
                  <button
                    style={styles.confirmNo}
                    onClick={() => setConfirmDelete(null)}
                  >
                    キャンセル
                  </button>
                </div>
              ) : (
                <button
                  style={styles.deleteButton}
                  onClick={() => setConfirmDelete(tag.name)}
                >
                  削除
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button style={styles.closeButton} onClick={onClose}>
            閉じる
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
    maxHeight: "70vh",
    overflowY: "auto",
  },
  title: { fontSize: "18px", fontWeight: "bold", marginBottom: "20px" },
  addRow: { display: "flex", gap: "8px", marginBottom: "8px" },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#1d9bf0",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  error: { color: "#e0245e", fontSize: "13px", marginBottom: "8px" },
  tagList: { marginTop: "16px", marginBottom: "24px" },
  empty: { color: "#999", fontSize: "14px" },
  tagRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  tagName: { fontSize: "14px", color: "#1a1a1a" },
  deleteButton: {
    padding: "4px 12px",
    border: "1px solid #e0245e",
    borderRadius: "6px",
    backgroundColor: "#fff",
    color: "#e0245e",
    cursor: "pointer",
    fontSize: "13px",
  },
  confirmRow: { display: "flex", alignItems: "center", gap: "8px" },
  confirmText: { fontSize: "13px", color: "#e0245e" },
  confirmYes: {
    padding: "4px 12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#e0245e",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
  },
  confirmNo: {
    padding: "4px 12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    color: "#555",
  },
  footer: { display: "flex", justifyContent: "flex-end" },
  closeButton: {
    padding: "10px 24px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
};
