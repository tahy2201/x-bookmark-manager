import { useState } from "react";
import { Modal, Button, Tag, Space, Typography } from "antd";
import type { Bookmark, Tag as TagType } from "../types";

interface Props {
  bookmark: Bookmark;
  tags: TagType[];
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
    <Modal
      open
      title="タグを編集"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          キャンセル
        </Button>,
        <Button key="save" type="primary" onClick={handleSave} loading={saving}>
          保存
        </Button>,
      ]}
      width={480}
    >
      <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        @{bookmark.author_name}
      </Typography.Text>
      {tags.length === 0 ? (
        <Typography.Text type="secondary">
          タグがありません。先にタグを作成してください。
        </Typography.Text>
      ) : (
        <Space size={[6, 6]} wrap style={{ marginBottom: 8 }}>
          {tags.map((tag) => (
            <Tag.CheckableTag
              key={tag.id}
              checked={selectedTags.includes(tag.name)}
              onChange={() => toggleTag(tag.name)}
            >
              {tag.name}
            </Tag.CheckableTag>
          ))}
        </Space>
      )}
    </Modal>
  );
}
