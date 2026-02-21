import { useState } from "react";
import { Modal, Input, Button, List, Space, Typography, Popconfirm, Alert } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
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
    }
  };

  return (
    <Modal
      open
      title="タグ管理"
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          閉じる
        </Button>,
      ]}
      width={480}
    >
      <Space.Compact style={{ width: "100%", marginBottom: 8 }}>
        <Input
          placeholder="新しいタグ名"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onPressEnter={handleAdd}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          loading={adding}
        >
          追加
        </Button>
      </Space.Compact>
      {error && <Alert type="error" message={error} style={{ marginBottom: 8 }} />}

      <List
        style={{ maxHeight: "50vh", overflowY: "auto", marginTop: 8 }}
        dataSource={tags}
        locale={{ emptyText: <Typography.Text type="secondary">タグがありません</Typography.Text> }}
        renderItem={(tag) => (
          <List.Item
            actions={[
              <Popconfirm
                key="delete"
                title="このタグを削除しますか？"
                onConfirm={() => handleDelete(tag.name)}
                okText="削除"
                cancelText="キャンセル"
                okButtonProps={{ danger: true }}
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deletingTag === tag.name}
                >
                  削除
                </Button>
              </Popconfirm>,
            ]}
          >
            <Typography.Text>{tag.name}</Typography.Text>
          </List.Item>
        )}
      />
    </Modal>
  );
}
