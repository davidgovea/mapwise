export function keyBy<T extends object, K extends keyof T>(
  items: (T | null | undefined)[],
  keyOrFn: K | ((item: T) => string)
): Map<T[K] | string, T> {
  const map = new Map<T[K] | string, T>();
  for (const item of items) {
    if (item == null) continue;

    let mapKey: string | T[K];
    if (typeof keyOrFn === 'function') {
      mapKey = keyOrFn(item);
    } else {
      // For a string key, we assume that key is a valid property of T
      // (the type signature enforces that).
      mapKey = item[keyOrFn];
    }
    // If there's a collision, the latter item will overwrite the previous.
    map.set(mapKey, item);
  }
  return map;
}

export function groupBy<T extends object, K extends keyof T>(
  items: (T | null | undefined)[],
  keyOrFn: K | ((item: T) => string)
): Map<T[K] | string, T[]> {
  const map = new Map<T[K] | string, T[]>();
  for (const item of items) {
    if (item == null) continue;

    let mapKey: string | T[K];
    if (typeof keyOrFn === 'function') {
      mapKey = keyOrFn(item);
    } else {
      mapKey = item[keyOrFn];
    }

    const existing = map.get(mapKey);
    if (existing) {
      existing.push(item);
    } else {
      map.set(mapKey, [item]);
    }
  }
  return map;
}
