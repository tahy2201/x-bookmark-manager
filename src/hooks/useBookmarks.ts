import { useState, useEffect, useMemo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Bookmark } from "../types";
import {
  fetchBookmarks,
  addBookmark as apiAddBookmark,
  updateBookmarkTags as apiUpdateBookmarkTags,
  deleteBookmark as apiDeleteBookmark,
} from "../lib/googleSheets";
import { fetchOEmbed } from "../lib/oembed";
import { normalizeTweetUrl } from "../lib/utils";

export function useBookmarks(accessToken: string, spreadsheetId: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookmarks(accessToken, spreadsheetId);
      setBookmarks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  }, [accessToken, spreadsheetId]);

  useEffect(() => {
    load();
  }, [load]);

  const addBookmark = useCallback(
    async (url: string, tags: string[]) => {
      const normalized = normalizeTweetUrl(url.trim());
      const oembed = await fetchOEmbed(normalized);
      const bookmark: Bookmark = {
        id: uuidv4(),
        url: normalized,
        author_name: oembed.author_name,
        text: oembed.html.replace(/<[^>]+>/g, " ").trim(),
        embedded_html: oembed.html,
        tags,
        saved_at: new Date().toISOString(),
      };
      await apiAddBookmark(accessToken, spreadsheetId, bookmark);
      setBookmarks((prev) => [bookmark, ...prev]);
      return bookmark;
    },
    [accessToken, spreadsheetId]
  );

  const updateBookmarkTags = useCallback(
    async (bookmarkId: string, tags: string[]) => {
      await apiUpdateBookmarkTags(accessToken, spreadsheetId, bookmarkId, tags);
      setBookmarks((prev) =>
        prev.map((b) => (b.id === bookmarkId ? { ...b, tags } : b))
      );
    },
    [accessToken, spreadsheetId]
  );

  const deleteBookmark = useCallback(
    async (bookmarkId: string) => {
      await apiDeleteBookmark(accessToken, spreadsheetId, bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    },
    [accessToken, spreadsheetId]
  );

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        b.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag =
        selectedTag === null || b.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [bookmarks, searchQuery, selectedTag]);

  return {
    bookmarks,
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
    reload: load,
  };
}
