import { useState } from "react";
import { Modal, Input, Button, Tag, Space, Typography, Alert } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { Tag as TagType } from "../types";
import { fetchOEmbed } from "../lib/oembed";
import { isValidTweetUrl, normalizeTweetUrl } from "../lib/utils";

interface Props {
  tags: TagType[];
  onAdd: (url: string, tags: string[]) => Promise<void>;
  onCreateTag: (name: string) => Promise<TagType>;
  onClose: () => void;
}

export function AddBookmarkModal({ tags, onAdd, onCreateTag, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

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

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setCreatingTag(true);
    try {
      await onCreateTag(name);
      setSelectedTags((prev) => [...prev, name]);
      setNewTagName("");
      setShowNewTagInput(false);
    } finally {
      setCreatingTag(false);
    }
  };

  return (
    <Modal
      open
      title="ブックマークを追加"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          キャンセル
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
          disabled={!previewHtml}
          loading={saving}
        >
          保存
        </Button>,
      ]}
      width={560}
    >
      <Space.Compact style={{ width: "100%", marginBottom: 8 }}>
        <Input
          placeholder="https://twitter.com/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPressEnter={handleFetch}
        />
        <Button type="primary" onClick={handleFetch} loading={fetching}>
          取得
        </Button>
      </Space.Compact>

      {fetchError && (
        <Alert type="error" message={fetchError} style={{ marginBottom: 12 }} />
      )}

      {previewHtml && (
        <div
          style={{
            border: "1px solid var(--ant-color-border)",
            borderRadius: 8,
            padding: 8,
            marginBottom: 16,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      )}

      <div style={{ marginBottom: 16 }}>
        <Typography.Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
          タグを選択
        </Typography.Text>
        <Space size={[6, 6]} wrap>
          {tags.map((tag) => (
            <Tag.CheckableTag
              key={tag.id}
              checked={selectedTags.includes(tag.name)}
              onChange={() => toggleTag(tag.name)}
            >
              {tag.name}
            </Tag.CheckableTag>
          ))}
          {showNewTagInput ? (
            <Space.Compact size="small">
              <Input
                size="small"
                placeholder="タグ名"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onPressEnter={handleCreateTag}
                autoFocus
                style={{ width: 100 }}
              />
              <Button size="small" type="primary" loading={creatingTag} onClick={handleCreateTag}>
                追加
              </Button>
              <Button size="small" onClick={() => { setShowNewTagInput(false); setNewTagName(""); }}>
                ✕
              </Button>
            </Space.Compact>
          ) : (
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => setShowNewTagInput(true)}
              type="dashed"
            >
              新規タグ
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
}
