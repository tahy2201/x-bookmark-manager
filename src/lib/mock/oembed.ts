import type { OEmbedData } from "../../types";

export async function mockFetchOEmbed(tweetUrl: string): Promise<OEmbedData> {
  // URLからユーザー名とツイートIDを抽出
  const match = tweetUrl.match(/twitter\.com\/(\w+)\/status\/(\d+)/);
  const username = match?.[1] ?? "unknown";
  const tweetId = match?.[2] ?? "0";

  // 少し待機してAPI呼び出しらしさを演出
  await new Promise((resolve) => setTimeout(resolve, 300));

  const html = `<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">これはモックツイートですわ～！ Tweet ID: ${tweetId} by @${username}</p>&mdash; ${username} (@${username}) <a href="${tweetUrl}">${new Date().toLocaleDateString("ja-JP")}</a></blockquote>`;

  return {
    html,
    author_name: username,
    url: tweetUrl,
  };
}
