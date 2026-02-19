export interface Bookmark {
  id: string;
  url: string;
  author_name: string;
  text: string;
  embedded_html: string;
  tags: string[]; // アプリ内では配列で扱う
  saved_at: string;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface OEmbedData {
  html: string;
  author_name: string;
  url: string;
}

export interface GoogleUser {
  access_token: string;
  email: string;
  name: string;
}
