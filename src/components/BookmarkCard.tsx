import { useEffect, useRef } from "react";
import type { Bookmark } from "../types";

interface Props {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmarkId: string) => void;
}

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

export function BookmarkCard({ bookmark, onEdit, onDelete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.twttr?.widgets?.load(containerRef.current ?? undefined);
  }, [bookmark.embedded_html]);

  return (
    <div style={styles.card}>
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: bookmark.embedded_html }}
        style={styles.embed}
      />
      <div style={styles.footer}>
        <div style={styles.tags}>
          {bookmark.tags.map((tag) => (
            <span key={tag} style={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <div style={styles.actions}>
          <button style={styles.editButton} onClick={() => onEdit(bookmark)}>
            編集
          </button>
          <button
            style={styles.deleteButton}
            onClick={() => onDelete(bookmark.id)}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #e1e8ed",
    overflow: "hidden",
    marginBottom: "16px",
  },
  embed: {
    padding: "0",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 16px",
    borderTop: "1px solid #e1e8ed",
    backgroundColor: "#f9f9f9",
    flexWrap: "wrap",
    gap: "8px",
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  tag: {
    backgroundColor: "#e8f5fe",
    color: "#1d9bf0",
    fontSize: "12px",
    padding: "2px 10px",
    borderRadius: "12px",
    fontWeight: 500,
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  editButton: {
    backgroundColor: "transparent",
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "4px 12px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#555",
  },
  deleteButton: {
    backgroundColor: "transparent",
    border: "1px solid #e0245e",
    borderRadius: "6px",
    padding: "4px 12px",
    fontSize: "13px",
    cursor: "pointer",
    color: "#e0245e",
  },
};
