/**
 * Curseur composite pour le fil (score ↓, createdAt ↓, id ↓).
 * Encodage base64url partagé client / API.
 */
export type FeedCursor = {
  score: number;
  createdAt: string;
  id: string;
};

function isFeedCursor(value: unknown): value is FeedCursor {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.score === "number" &&
    typeof o.createdAt === "string" &&
    typeof o.id === "string"
  );
}

export function encodeFeedCursor(c: FeedCursor): string {
  const json = JSON.stringify(c);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8").toString("base64url");
  }
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeFeedCursor(raw: string): FeedCursor | null {
  try {
    let json: string;
    if (typeof Buffer !== "undefined") {
      json = Buffer.from(raw, "base64url").toString("utf8");
    } else {
      const pad = raw.length % 4 === 0 ? "" : "=".repeat(4 - (raw.length % 4));
      const b64 = raw.replace(/-/g, "+").replace(/_/g, "/") + pad;
      json = decodeURIComponent(escape(atob(b64)));
    }
    const parsed: unknown = JSON.parse(json);
    return isFeedCursor(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
