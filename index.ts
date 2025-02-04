export function keyBy<
  T extends object,
  K extends keyof T
>(
  items: (T | null | undefined)[],
  key: K
): Map<T[K], T>;

export function keyBy<
  T extends object,
  K extends keyof T,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: K,
  value: V
): Map<T[K], T[V]>;

export function keyBy<
  T extends object,
  K extends keyof T,
  V
>(
  items: (T | null | undefined)[],
  key: K,
  value: (item: T) => V
): Map<T[K], V>;

export function keyBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  key: (item: T) => K
): Map<K, T>;

export function keyBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: (item: T) => K,
  value: V
): Map<K, T[V]>;

export function keyBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  key: (item: T) => K,
  value: (item: T) => V
): Map<K, V>;

/**
 * Implementation signature to unify both property-name
 * and callback usage for key and value getters.
 */
export function keyBy<T extends object>(
  items: (T | null | undefined)[],
  keyOrFn: keyof T | ((item: T) => unknown),
  valueOrFn?: keyof T | ((item: T) => unknown)
): Map<unknown, unknown> {
  const map = new Map<unknown, unknown>();
  for (const item of items) {
    if (item == null) continue;

    const mapKey =
      typeof keyOrFn === "function" ? keyOrFn(item) : item[keyOrFn];

    const mapValue =
      valueOrFn == null
        ? item
        : typeof valueOrFn === "function"
        ? valueOrFn(item)
        : item[valueOrFn];

    map.set(mapKey, mapValue);
  }
  return map;
}

export function groupBy<
  T extends object,
  K extends keyof T
>(
  items: (T | null | undefined)[],
  key: K
): Map<T[K], T[]>;

export function groupBy<
  T extends object,
  K extends keyof T,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: K,
  value: V
): Map<T[K], Array<T[V]>>;

export function groupBy<
  T extends object,
  K extends keyof T,
  V
>(
  items: (T | null | undefined)[],
  key: K,
  value: (item: T) => V
): Map<T[K], Array<V>>;

export function groupBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  key: (item: T) => K
): Map<K, T[]>;

export function groupBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: (item: T) => K,
  value: V
): Map<K, Array<T[V]>>;

export function groupBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  key: (item: T) => K,
  value: (item: T) => V
): Map<K, Array<V>>;

/**
 * Implementation signature to unify both property-name
 * and callback usage for key and (optional) value getters.
 */
export function groupBy<T extends object>(
  items: (T | null | undefined)[],
  keyOrFn: keyof T | ((item: T) => unknown),
  valueOrFn?: keyof T | ((item: T) => unknown)
): Map<unknown, unknown[]> {
  const map = new Map<unknown, unknown[]>();

  for (const item of items) {
    if (item == null) continue;

    const mapKey =
      typeof keyOrFn === "function" ? keyOrFn(item) : item[keyOrFn];

    const mapValue =
      valueOrFn == null
        ? item
        : typeof valueOrFn === "function"
        ? valueOrFn(item)
        : item[valueOrFn];

    const existing = map.get(mapKey);
    if (existing) {
      existing.push(mapValue);
    } else {
      map.set(mapKey, [mapValue]);
    }
  }
  return map;
}
