import type { OEmbedData } from "../types";

export async function fetchOEmbed(tweetUrl: string): Promise<OEmbedData> {
  const proxyUrl = import.meta.env.VITE_OEMBED_PROXY_URL;
  if (!proxyUrl) {
    throw new Error("VITE_OEMBED_PROXY_URL is not configured");
  }

  const res = await fetch(
    `${proxyUrl}?url=${encodeURIComponent(tweetUrl)}&omit_script=true`
  );

  if (!res.ok) {
    throw new Error(`oEmbed fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    html?: string;
    author_name?: string;
    url?: string;
  };

  if (!data.html || !data.author_name) {
    throw new Error("Invalid oEmbed response");
  }

  return {
    html: data.html,
    author_name: data.author_name,
    url: data.url ?? tweetUrl,
  };
}
