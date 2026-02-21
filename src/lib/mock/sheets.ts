import { v4 as uuidv4 } from "uuid";
import type { Bookmark, Tag } from "../../types";
import { tagsArrayToString, tagsStringToArray } from "../utils";
import { MOCK_SPREADSHEET_ID, MOCK_BOOKMARKS, MOCK_TAGS } from "./data";

const STORAGE_KEY = "x_bookmark_mock_store";

interface MockStore {
  bookmarks: Bookmark[];
  tags: Tag[];
}

function getStore(): MockStore {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as MockStore;
    } catch {
      // パース失敗時は初期データに戻す
    }
  }
  const initial: MockStore = {
    bookmarks: MOCK_BOOKMARKS,
    tags: MOCK_TAGS,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveStore(store: MockStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// ---- スプレッドシート初期化 ----

export async function mockInitSpreadsheet(): Promise<string> {
  getStore(); // localStorageを初期化
  return MOCK_SPREADSHEET_ID;
}

export function mockSaveSpreadsheetId(_id: string): void {
  // モック時は何もしない（IDは固定）
}

export function mockGetSpreadsheetId(): string {
  return MOCK_SPREADSHEET_ID;
}

// ---- ブックマーク ----

export async function mockFetchBookmarks(): Promise<Bookmark[]> {
  return getStore().bookmarks;
}

export async function mockAddBookmark(bookmark: Bookmark): Promise<void> {
  const store = getStore();
  store.bookmarks = [bookmark, ...store.bookmarks];
  saveStore(store);
}

export async function mockUpdateBookmarkTags(
  bookmarkId: string,
  tags: string[]
): Promise<void> {
  const store = getStore();
  store.bookmarks = store.bookmarks.map((b) =>
    b.id === bookmarkId ? { ...b, tags } : b
  );
  saveStore(store);
}

export async function mockDeleteBookmark(bookmarkId: string): Promise<void> {
  const store = getStore();
  store.bookmarks = store.bookmarks.filter((b) => b.id !== bookmarkId);
  saveStore(store);
}

// ---- タグ ----

export async function mockFetchTags(): Promise<Tag[]> {
  return getStore().tags;
}

export async function mockAddTag(tag: Tag): Promise<void> {
  const store = getStore();
  store.tags = [...store.tags, tag];
  saveStore(store);
}

export async function mockDeleteTag(tagName: string): Promise<void> {
  const store = getStore();
  // tagsシートから削除
  store.tags = store.tags.filter((t) => t.name !== tagName);
  // 全ブックマークから該当タグを除去
  store.bookmarks = store.bookmarks.map((b) => ({
    ...b,
    tags: b.tags.filter((t) => t !== tagName),
  }));
  saveStore(store);
}

export { uuidv4 };
// tagsStringToArray・tagsArrayToString は utils.ts から流用（モック固有実装不要）
export { tagsStringToArray, tagsArrayToString };
