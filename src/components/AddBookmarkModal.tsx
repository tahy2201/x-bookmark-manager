import { useState } from "react";
import type { Tag } from "../types";
import { fetchOEmbed } from "../lib/oembed";
import { isValidTweetUrl, normalizeTweetUrl } from "../lib/utils";

interface Props {
  tags: Tag[];
  onAdd: (url: string, tags: string[]) => Promise<void>;
  onClose: () => void;
}

export function AddBookmarkModal({ tags, onAdd, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleFetch = async () => {
    setFetchError(null);
    const trimmed = url.trim();
    if (!isValidTweetUrl(trimmed)) {
      setFetchError("有効なツイートURLを入力してください");
      return;
    }
    setFetching(true);
    try {
      const oembed = await fetchOEmbed(normalizeTweetUrl(trimmed));
      setPreviewHtml(oembed.html);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "取得に失敗しました");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!previewHtml) return;
    setSaving(true);
    try {
      await onAdd(url.trim(), selectedTags);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (name: string) => {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>ブックマークを追加</h2>

        <div style={styles.row}>
          <input
            style={styles.input}
            type="text"
            placeholder="https://twitter.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
          />
          <button style={styles.fetchButton} onClick={handleFetch} disabled={fetching}>
            {fetching ? "取得中..." : "取得"}
          </button>
        </div>

        {fetchError && <p style={styles.error}>{fetchError}</p>}

        {previewHtml && (
          <div
            style={styles.preview}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}

        {tags.length > 0 && (
          <div style={styles.tagSection}>
            <p style={styles.tagLabel}>タグを選択</p>
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
          </div>
        )}

        <div style={styles.buttons}>
          <button style={styles.cancelButton} onClick={onClose}>
            キャンセル
          </button>
          <button
            style={styles.saveButton}
            onClick={handleSave}
            disabled={!previewHtml || saving}
          >
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
    maxWidth: "560px",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  title: { fontSize: "18px", fontWeight: "bold", marginBottom: "20px" },
  row: { display: "flex", gap: "8px", marginBottom: "8px" },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
  },
  fetchButton: {
    padding: "10px 20px",
    backgroundColor: "#1d9bf0",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  error: { color: "#e0245e", fontSize: "13px", marginBottom: "12px" },
  preview: {
    border: "1px solid #e1e8ed",
    borderRadius: "8px",
    padding: "8px",
    marginBottom: "16px",
    overflow: "hidden",
  },
  tagSection: { marginBottom: "20px" },
  tagLabel: { fontSize: "13px", color: "#666", marginBottom: "8px" },
  tagList: { display: "flex", flexWrap: "wrap", gap: "8px" },
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
