export function normalizeResponseArray(payload, fallbackKeys = []) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of fallbackKeys) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
}
