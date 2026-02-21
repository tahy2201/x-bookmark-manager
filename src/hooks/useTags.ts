import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Tag } from "../types";
import {
  fetchTags,
  addTag as apiAddTag,
  deleteTag as apiDeleteTag,
} from "../lib/googleSheets";
import { MOCK_TAGS } from "../lib/mock/data";

const IS_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export function useTags(accessToken: string, spreadsheetId: string) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (IS_MOCK) {
        setTags(MOCK_TAGS);
        return;
      }
      const data = await fetchTags(accessToken, spreadsheetId);
      setTags(data);
    } finally {
      setLoading(false);
    }
  }, [accessToken, spreadsheetId]);

  useEffect(() => {
    load();
  }, [load]);

  const addTag = useCallback(
    async (name: string) => {
      const tag: Tag = {
        id: uuidv4(),
        name: name.trim(),
        created_at: new Date().toISOString(),
      };
      if (!IS_MOCK) {
        await apiAddTag(accessToken, spreadsheetId, tag);
      }
      setTags((prev) => [...prev, tag]);
      return tag;
    },
    [accessToken, spreadsheetId]
  );

  const deleteTag = useCallback(
    async (tagName: string) => {
      if (!IS_MOCK) {
        await apiDeleteTag(accessToken, spreadsheetId, tagName);
      }
      setTags((prev) => prev.filter((t) => t.name !== tagName));
    },
    [accessToken, spreadsheetId]
  );

  return { tags, loading, addTag, deleteTag, reload: load };
}
