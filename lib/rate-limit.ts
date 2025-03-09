import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache<string, [number, number[]]>({
  max: 500, // Maximum number of entries in the cache
  ttl: 60000, // Time-to-live for each entry (1 minute in milliseconds)
});

const DEFAULT_THRESHOLD = 5; // Requests per minute
const threshold = parseInt(process.env.RATE_LIMIT_THRESHOLD || String(DEFAULT_THRESHOLD), 10);

export async function rateLimit(identifier: string, email?: string) {
  try {
    const now = Date.now();
    let combinedIdentifier = identifier;

    if (email) {
      combinedIdentifier = `${identifier}-${email}`; // Combine IP and email
    }

    const record: [number, number[]] = rateLimitCache.get(combinedIdentifier) || [0, []];
    const [hitCount, timestamps] = record;

    timestamps.push(now);

    const cutoff = now - 60000; // 1 minute
    const validTimestamps = timestamps.filter((t) => t > cutoff);

    rateLimitCache.set(combinedIdentifier, [validTimestamps.length, validTimestamps]);

    if (validTimestamps.length > threshold) { // Allow requests per minute
      return { success: false, resetTime: cutoff };
    }

    return { success: true };
  } catch (error) {
    console.error("Rate limiting error:", error);
    return { success: false, error: "Rate limiting failed" }; // Indicate failure
  }
}

export function clearRateLimit(identifier: string, email?: string) {
  let combinedIdentifier = identifier;

  if (email) {
    combinedIdentifier = `${identifier}-${email}`; // Combine IP and email
  }

  rateLimitCache.delete(combinedIdentifier);
}