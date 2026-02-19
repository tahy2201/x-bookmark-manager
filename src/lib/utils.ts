export function normalizeTweetUrl(url: string): string {
  return url
    .replace("www.x.com", "twitter.com")
    .replace("www.twitter.com", "twitter.com")
    .replace("x.com", "twitter.com");
}

export function isValidTweetUrl(url: string): boolean {
  try {
    const normalized = normalizeTweetUrl(url.trim());
    const parsed = new URL(normalized);
    return (
      parsed.hostname === "twitter.com" &&
      /^\/\w+\/status\/\d+/.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

export function tagsStringToArray(tags: string): string[] {
  if (!tags.trim()) return [];
  return tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
}

export function tagsArrayToString(tags: string[]): string {
  return tags.join(",");
}
