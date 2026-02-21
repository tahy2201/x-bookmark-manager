import { v4 as uuidv4 } from "uuid";
import type { Bookmark, Tag } from "../types";
import { tagsStringToArray, tagsArrayToString } from "./utils";
import {
  mockInitSpreadsheet,
  mockSaveSpreadsheetId,
  mockGetSpreadsheetId,
  mockFetchBookmarks,
  mockAddBookmark,
  mockUpdateBookmarkTags,
  mockDeleteBookmark,
  mockFetchTags,
  mockAddTag,
  mockDeleteTag,
} from "./mock/sheets";

const IS_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const DRIVE_API = "https://www.googleapis.com/drive/v3/files";
const SPREADSHEET_ID_KEY = "x_bookmark_manager_spreadsheet_id";

const BOOKMARK_HEADERS = [
  "id",
  "url",
  "author_name",
  "text",
  "embedded_html",
  "tags",
  "saved_at",
];
const TAG_HEADERS = ["id", "name", "created_at"];

// ---- localStorage ----

export function saveSpreadsheetId(id: string): void {
  if (IS_MOCK) return mockSaveSpreadsheetId(id);
  localStorage.setItem(SPREADSHEET_ID_KEY, id);
}

export function getSpreadsheetId(): string | null {
  if (IS_MOCK) return mockGetSpreadsheetId();
  return localStorage.getItem(SPREADSHEET_ID_KEY);
}

// ---- 内部ヘルパー ----

async function sheetsRequest(
  accessToken: string,
  url: string,
  options: RequestInit = {}
): Promise<unknown> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets API error ${res.status}: ${body}`);
  }
  return res.json();
}

// ---- スプレッドシート初期化 ----

export async function initSpreadsheet(accessToken: string): Promise<string> {
  if (IS_MOCK) return mockInitSpreadsheet();
  // 既存のスプレッドシートを検索
  const searchRes = await fetch(
    `${DRIVE_API}?q=name%3D'X+Bookmark+Manager'+and+mimeType%3D'application%2Fvnd.google-apps.spreadsheet'+and+trashed%3Dfalse&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!searchRes.ok) {
    throw new Error(`Drive API error ${searchRes.status}`);
  }
  const searchData = (await searchRes.json()) as { files: { id: string }[] };

  if (searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // 新規作成
  const createData = (await sheetsRequest(
    accessToken,
    SHEETS_API,
    {
      method: "POST",
      body: JSON.stringify({
        properties: { title: "X Bookmark Manager" },
        sheets: [
          { properties: { title: "bookmarks" } },
          { properties: { title: "tags" } },
        ],
      }),
    }
  )) as { spreadsheetId: string };

  const spreadsheetId = createData.spreadsheetId;

  // ヘッダー行を書き込む
  await sheetsRequest(
    accessToken,
    `${SHEETS_API}/${spreadsheetId}/values/bookmarks!A1:G1?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [BOOKMARK_HEADERS] }),
    }
  );
  await sheetsRequest(
    accessToken,
    `${SHEETS_API}/${spreadsheetId}/values/tags!A1:C1?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [TAG_HEADERS] }),
    }
  );

  return spreadsheetId;
}

// ---- ブックマーク ----

export async function fetchBookmarks(
  accessToken: string,
  spreadsheetId: string
): Promise<Bookmark[]> {
  if (IS_MOCK) return mockFetchBookmarks();
  const data = (await sheetsRequest(
    accessToken,
    `${SHEETS_API}/${spreadsheetId}/values/bookmarks!A2:G`
  )) as { values?: string[][] };

  if (!data.values) return [];

  return data.values
    .filter((row) => row[0]) // idが空の行をスキップ
    .map((row) => ({
      id: row[0] ?? "",
      url: row[1] ?? "",
      author_name: row[2] ?? "",
      text: row[3] ?? "",
      embedded_html: row[4] ?? "",
      tags: tagsStringToArray(row[5] ?? ""),
      saved_at: row[6] ?? "",
    }));
}

export async function addBookmark(
  accessToken: string,
  spreadsheetId: string,
  bookmark: Bookmark
): Promise<void> {
  if (IS_MOCK) return mockAddBookmark(bookmark);
  await sheetsRequest(
    accessToken,
    `${SHEETS_API}/${spreadsheetId}/values/bookmarks!A1:G1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({
        values: [
          [
            bookmark.id,
            bookmark.url,
            bookmark.author_name,
            bookmark.text,
            bookmark.embedded_html,
            tagsArrayToString(bookmark.tags),
            bookmark.saved_at,
          ],
        ],
      }),
    }
  );
}

export async function updateBookmarkTags(
  accessToken: string,
  spreadsheetId: string,
  bookmarkId: string,
  tags: string[]
): Promise<void> {
  if (IS_MOCK) return mockUpdateBookmarkTags(bookmarkId, tags);
  const bookmarks = await fetchBookmarks(accessToken, spreadsheetId);
  const index = bookmarks.findIndex((b) => b.id === bookmarkId);
  if (index === -1) throw new Error(`Bookmark not found: ${bookmarkId}`);

  // 2行目からデータ開始（ヘッダーが1行目）なのでrow = index + 2
  const rowNumber = index + 2;
  await sheetsRequest(
    accessToken,
    `${SHEETS_API}/${spreadsheetId}/values/bookmarks!F${rowNumber}?valueInputOption=RAW`,
    {
      method: "PUT",
      body: JSON.stringify({ values: [[tagsArrayToString(tags)]] }),
    }
  );
}

export async function deleteBookmark(
  accessToken: string,
  spreadsheetId: string,
  bookmarkId: string
): Promise<void> {
  if (IS_MOCK) return mockDeleteBookmark(bookmarkId);
  const bookmarks = await fetchBookmarks(accessToken, spreadsheetId);
  const index = bookmarks.findIndex((b) => b.id === bookmarkId);
  if (index === -1) throw new Error(`Bookmark not found: ${bookmarkId}`);

  const rowNumber = index + 2;
  await sheetsRequest(
    accessToken,
    `${SHEETS_API}/${spreadsheetId}/values/bookmarks!A${rowNumber}:G${rowNumber}:clear`,
    { method: "POST" }
  );
}

// ---- タグ ----

export async function fetchTags(
  accessToken: string,
  spreadsheetId: string
): Promise<Tag[]> {
  if (IS_MOCK) return mockFetchTags();
  const data = (await sheetsRequest(
    accessToken,
    `${SHEETS_API}/${spreadsheetId}/values/tags!A2:C`
  )) as { values?: string[][] };

  if (!data.values) return [];

  return data.values
    .filter((row) => row[0])
    .map((row) => ({
      id: row[0] ?? "",
      name: row[1] ?? "",
      created_at: row[2] ?? "",
    }));
}

export async function addTag(
  accessToken: string,
  spreadsheetId: string,
  tag: Tag
): Promise<void> {
  if (IS_MOCK) return mockAddTag(tag);
  await sheetsRequest(
    accessToken,
    `${SHEETS_API}/${spreadsheetId}/values/tags!A1:C1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      body: JSON.stringify({
        values: [[tag.id, tag.name, tag.created_at]],
      }),
    }
  );
}

export async function deleteTag(
  accessToken: string,
  spreadsheetId: string,
  tagName: string
): Promise<void> {
  if (IS_MOCK) return mockDeleteTag(tagName);
  // 1. tagsシートから削除対象を探してクリア
  const tags = await fetchTags(accessToken, spreadsheetId);
  const tagIndex = tags.findIndex((t) => t.name === tagName);
  if (tagIndex !== -1) {
    const rowNumber = tagIndex + 2;
    await sheetsRequest(
      accessToken,
      `${SHEETS_API}/${spreadsheetId}/values/tags!A${rowNumber}:C${rowNumber}:clear`,
      { method: "POST" }
    );
  }

  // 2. 全ブックマークから該当タグを除去して一括更新
  const bookmarks = await fetchBookmarks(accessToken, spreadsheetId);
  const affected = bookmarks
    .map((b, i) => ({ bookmark: b, index: i }))
    .filter(({ bookmark }) => bookmark.tags.includes(tagName));

  for (const { bookmark, index } of affected) {
    const newTags = bookmark.tags.filter((t) => t !== tagName);
    const rowNumber = index + 2;
    await sheetsRequest(
      accessToken,
      `${SHEETS_API}/${spreadsheetId}/values/bookmarks!F${rowNumber}?valueInputOption=RAW`,
      {
        method: "PUT",
        body: JSON.stringify({ values: [[tagsArrayToString(newTags)]] }),
      }
    );
  }
}

// uuidv4をre-export（他モジュールで使いやすくするため）
export { uuidv4 };
