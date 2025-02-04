export function keyBy<T extends object, K extends keyof T>(
  items: (T | null | undefined)[],
  key: K
): Map<T[K], T>;

export function keyBy<T extends object, KeyType>(
  items: (T | null | undefined)[],
  keyFn: (item: T) => KeyType
): Map<KeyType, T>;

/**
 * Implementation signature to unify both property-name
 * and callback usage. (We hide this behind the overload signatures above.)
 */
export function keyBy<T extends object>(
  items: (T | null | undefined)[],
  keyOrFn: keyof T | ((item: T) => unknown)
): Map<unknown, T> {
  const map = new Map<unknown, T>();
  for (const item of items) {
    if (item == null) continue;

    const mapKey =
      typeof keyOrFn === "function" ? keyOrFn(item) : item[keyOrFn];

    map.set(mapKey, item);
  }
  return map;
}

export function groupBy<T extends object, K extends keyof T>(
  items: (T | null | undefined)[],
  key: K
): Map<T[K], T[]>;

export function groupBy<T extends object, KeyType>(
  items: (T | null | undefined)[],
  keyFn: (item: T) => KeyType
): Map<KeyType, T[]>;

export function groupBy<T extends object>(
  items: (T | null | undefined)[],
  keyOrFn: keyof T | ((item: T) => unknown)
): Map<unknown, T[]> {
  const map = new Map<unknown, T[]>();

  for (const item of items) {
    if (item == null) continue;

    const mapKey =
      typeof keyOrFn === "function" ? keyOrFn(item) : item[keyOrFn];

    const existing = map.get(mapKey);
    if (existing) {
      existing.push(item);
    } else {
      map.set(mapKey, [item]);
    }
  }
  return map;
}
