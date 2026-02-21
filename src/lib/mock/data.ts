import type { Bookmark, Tag } from "../../types";

export const MOCK_SPREADSHEET_ID = "mock-spreadsheet-id";

export const MOCK_BOOKMARKS: Bookmark[] = [
  {
    id: "mock-bookmark-1",
    url: "https://twitter.com/chomukocomeon/status/2016781181120106719",
    author_name: "ちょむこ",
    text: "離乳食のレシピをまとめました！ブロッコリーとかぼちゃのポタージュが大人気です",
    embedded_html:
      '<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">離乳食のレシピをまとめました！ブロッコリーとかぼちゃのポタージュが大人気です</p>&mdash; ちょむこ (@chomukocomeon) <a href="https://twitter.com/chomukocomeon/status/2016781181120106719">February 20, 2026</a></blockquote>',
    tags: ["sample"],
    saved_at: "2026-02-20T00:00:00.000Z",
  },
  {
    id: "mock-bookmark-2",
    url: "https://twitter.com/kensuu/status/2023300749342675250",
    author_name: "けんすう",
    text: "けんすうのツイート：スタートアップの話",
    embedded_html:
      '<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">けんすうのツイート：スタートアップの話</p>&mdash; けんすう (@kensuu) <a href="https://twitter.com/kensuu/status/2023300749342675250">February 20, 2026</a></blockquote>',
    tags: ["sample", "tech"],
    saved_at: "2026-02-20T06:00:00.000Z",
  },
  {
    id: "mock-bookmark-3",
    url: "https://twitter.com/May_Roma/status/2022714523333902444",
    author_name: "May_Roma めいろま 谷本真由美",
    text: "May_Romaのツイート：テクノロジーと社会",
    embedded_html:
      '<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">May_Romaのツイート：テクノロジーと社会</p>&mdash; May_Roma めいろま 谷本真由美 (@May_Roma) <a href="https://twitter.com/May_Roma/status/2022714523333902444">February 20, 2026</a></blockquote>',
    tags: ["tech"],
    saved_at: "2026-02-20T12:00:00.000Z",
  },
];

export const MOCK_TAGS: Tag[] = [
  {
    id: "mock-tag-1",
    name: "sample",
    created_at: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "mock-tag-2",
    name: "tech",
    created_at: "2026-02-01T00:00:00.000Z",
  },
];
