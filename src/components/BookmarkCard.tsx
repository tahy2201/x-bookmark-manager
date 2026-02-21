import { useEffect, useRef, memo } from "react";
import { Button, Tag, Space, theme } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Bookmark } from "../types";

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

// Twitterウィジェット内部カードのborder-radius（白い角をクリップするために使用）
const TWEET_CLIP_RADIUS = 12;

// React.memo でラップし、html が変わらない限り再レンダリング・DOM操作を一切しない。
// bgColor 変化時は useEffect で直接 DOM を更新して iframe を保護する。
const TweetEmbed = memo(function TweetEmbed({ html, bgColor }: { html: string; bgColor: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    ref.current.innerHTML = isDark
      ? html.replace(/<blockquote class="twitter-tweet"/g, '<blockquote class="twitter-tweet" data-theme="dark"')
      : html;
    window.twttr?.widgets?.load(ref.current);
  }, [html]);

  // テーマ変化時は innerHTML を触らず背景色だけ更新（iframe が消えない）
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.background = bgColor;
  }, [bgColor]);

  // iframeとラッパーdivにclip-pathを適用してiframe内部の白い角をクリップする
  useEffect(() => {
    if (!ref.current) return;
    const applyClip = () => {
      ref.current?.querySelectorAll("iframe").forEach((iframe) => {
        (iframe as HTMLIFrameElement).style.clipPath = `inset(0 round ${TWEET_CLIP_RADIUS}px)`;
      });
      ref.current?.querySelectorAll(".twitter-tweet").forEach((el) => {
        (el as HTMLElement).style.overflow = "hidden";
        (el as HTMLElement).style.borderRadius = `${TWEET_CLIP_RADIUS}px`;
      });
    };
    const observer = new MutationObserver(applyClip);
    observer.observe(ref.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} style={{ display: "flex", justifyContent: "center", background: bgColor }} />;
}, (prev, next) => prev.html === next.html);

interface Props {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmarkId: string) => void;
}

export function BookmarkCard({ bookmark, onEdit, onDelete }: Props) {
  const { token } = theme.useToken();

  return (
    <div style={{
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      overflow: "hidden",
      marginBottom: 16,
      background: token.colorBgContainer,
      boxShadow: token.boxShadowTertiary,
    }}>
      <TweetEmbed html={bookmark.embedded_html} bgColor={token.colorBgContainer} />
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 16px",
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorFillQuaternary,
        flexWrap: "wrap",
        gap: 8,
      }}>
        <Space size={[4, 4]} wrap>
          {bookmark.tags.map((tag) => (
            <Tag key={tag} color="blue">{tag}</Tag>
          ))}
        </Space>
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(bookmark)}
          >
            編集
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(bookmark.id)}
          >
            削除
          </Button>
        </Space>
      </div>
    </div>
  );
}
