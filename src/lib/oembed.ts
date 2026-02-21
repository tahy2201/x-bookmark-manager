import type { OEmbedData } from "../types";
import { mockFetchOEmbed } from "./mock/oembed";

const IS_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function fetchOEmbed(tweetUrl: string): Promise<OEmbedData> {
  if (IS_MOCK) return mockFetchOEmbed(tweetUrl);

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
