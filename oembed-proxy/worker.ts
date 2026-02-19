/**
 * Cloudflare Workers - oEmbed CORS Proxy
 * X Bookmark Manager用 oEmbedプロキシ
 *
 * 役割: ブラウザから直接叩けないpublish.twitter.com/oembedへの
 *       リクエストをサーバーサイドで中継し、CORSヘッダーを付与して返す
 */

// ==========================================
// 設定
// ==========================================
const CONFIG = {
  // GitHub PagesのURL（デプロイ後に変更してください）
  ALLOWED_ORIGIN: "https://tahy2201.github.io",

  OEMBED_ENDPOINT: "https://publish.twitter.com/oembed",
} as const;

// ==========================================
// 型定義
// ==========================================
interface OEmbedResponse {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
  width: number;
  height: number | null;
  type: string;
  cache_age: string;
  provider_name: string;
  provider_url: string;
  version: string;
}

// ==========================================
// CORSヘッダーを生成
// ==========================================
function buildCORSHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

// ==========================================
// Originの検証
// ==========================================
function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");

  const allowedOrigins = [
    CONFIG.ALLOWED_ORIGIN,
    "http://localhost:5173", // Vite dev server
    "http://localhost:4173", // Vite preview
  ];

  return origin !== null && allowedOrigins.includes(origin);
}

// ==========================================
// tweetURLのバリデーション
// ==========================================
function isValidTweetUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const isValidHost =
      parsed.hostname === "twitter.com" ||
      parsed.hostname === "x.com" ||
      parsed.hostname === "www.twitter.com" ||
      parsed.hostname === "www.x.com";

    const pathPattern = /^\/[^/]+\/status\/\d+/;
    return isValidHost && pathPattern.test(parsed.pathname);
  } catch {
    return false;
  }
}

// ==========================================
// メインハンドラー
// ==========================================
export default {
  async fetch(request: Request): Promise<Response> {
    const origin = request.headers.get("Origin") ?? CONFIG.ALLOWED_ORIGIN;
    const corsHeaders = buildCORSHeaders(origin);

    // OPTIONSプリフライトリクエストへの対応
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // GETのみ許可
    if (request.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Origin検証
    if (!isAllowedOrigin(request)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // クエリパラメータ取得
    const url = new URL(request.url);
    const tweetUrl = url.searchParams.get("url");

    if (!tweetUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: url" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // tweetURLバリデーション
    if (!isValidTweetUrl(tweetUrl)) {
      return new Response(
        JSON.stringify({ error: "Invalid tweet URL format" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // oEmbed APIへプロキシ
    try {
      const oembedUrl = new URL(CONFIG.OEMBED_ENDPOINT);
      oembedUrl.searchParams.set("url", tweetUrl);
      oembedUrl.searchParams.set("omit_script", "true");

      const response = await fetch(oembedUrl.toString(), {
        headers: { "User-Agent": "X-Bookmark-Manager/1.0" },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return new Response(
            JSON.stringify({ error: "Tweet not found or private" }),
            { status: 404, headers: corsHeaders }
          );
        }
        return new Response(
          JSON.stringify({ error: `oEmbed API error: ${response.status}` }),
          { status: response.status, headers: corsHeaders }
        );
      }

      const data: OEmbedResponse = await response.json();

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (error) {
      console.error("Proxy error:", error);
      return new Response(
        JSON.stringify({ error: "Internal Server Error" }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
