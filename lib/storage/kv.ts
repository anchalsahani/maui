const KV_URL =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

export function hasKvStore() {
  return Boolean(KV_URL && KV_TOKEN);
}

export async function kvGetJson<T>(key: string): Promise<T | null> {
  if (!hasKvStore()) {
    return null;
  }

  const response = await fetch(KV_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["GET", key]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to read from KV store.");
  }

  const payload = (await response.json()) as { result?: unknown };

  if (payload.result === null || payload.result === undefined) {
    return null;
  }

  if (typeof payload.result === "string") {
    return JSON.parse(payload.result) as T;
  }

  return payload.result as T;
}

export async function kvSetJson(key: string, value: unknown) {
  if (!hasKvStore()) {
    return;
  }

  const response = await fetch(KV_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["SET", key, JSON.stringify(value)]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to write to KV store.");
  }
}
