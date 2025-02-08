export interface ByOptions {
  excludeNullish?: boolean;
}

/* -----------------------------------------------------
   KEYBY: property‑based key, no "value getter"
------------------------------------------------------ */
export function keyBy<
  T extends object,
  K extends keyof T
>(
  items: T[],
  key: K
): Map<T[K], T>;
export function keyBy<
  T extends object,
  K extends keyof T
>(
  items: (T | null | undefined)[],
  key: K,
  options: { excludeNullish: true }
): Map<T[K], T>;

/* -----------------------------------------------------
   KEYBY: property‑based key, property‑based value
------------------------------------------------------ */
export function keyBy<
  T extends object,
  K extends keyof T,
  V extends keyof T
>(
  items: T[],
  key: K,
  value: V
): Map<T[K], T[V]>;
export function keyBy<
  T extends object,
  K extends keyof T,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: K,
  value: V,
  options: { excludeNullish: true }
): Map<T[K], T[V]>;

/* -----------------------------------------------------
   KEYBY: property‑based key, function‑based value
------------------------------------------------------ */
// (Only allowed for non‑null arrays or maybe‑null arrays with excludeNullish)
export function keyBy<
  T extends object,
  K extends keyof T,
  V
>(
  items: T[],
  key: K,
  value: (item: T, index: number) => V
): Map<T[K], V>;
export function keyBy<
  T extends object,
  K extends keyof T,
  V
>(
  items: (T | null | undefined)[],
  key: K,
  value: (item: T, index: number) => V,
  options: { excludeNullish: true }
): Map<T[K], V>;

/* -----------------------------------------------------
   KEYBY: function‑based key, no value getter
------------------------------------------------------ */
// Overload for non‑null array: callback receives T
export function keyBy<
  T extends object,
  K
>(
  items: T[],
  key: (item: T, index: number) => K
): Map<K, T>;
// Overloads for maybe‑null arrays:
export function keyBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  options: { excludeNullish: true }
): Map<K, T>;
export function keyBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  key: (item: T | null | undefined, index: number) => K,
  options?: { excludeNullish?: false | undefined }
): Map<K, T | null | undefined>;

/* -----------------------------------------------------
   KEYBY: function‑based key, property‑based value
------------------------------------------------------ */
// Overload for non‑null array: callback receives T
export function keyBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: T[],
  key: (item: T, index: number) => K,
  value: V
): Map<K, T[V]>;
 // Overloads for maybe‑null arrays:
export function keyBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  value: V,
  options: { excludeNullish: true }
): Map<K, T[V]>;
export function keyBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: (item: T | null | undefined, index: number) => K,
  value: V,
  options?: { excludeNullish?: false | undefined }
): Map<K, T[V] | null | undefined>;

/* -----------------------------------------------------
   KEYBY: function‑based key, function‑based value
------------------------------------------------------ */
// Overload for non‑null array: callback receives T
export function keyBy<
  T extends object,
  K,
  V
>(
  items: T[],
  key: (item: T, index: number) => K,
  value: (item: T, index: number) => V
): Map<K, V>;
// Overloads for maybe‑null arrays:
export function keyBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  value: (item: T, index: number) => V,
  options: { excludeNullish: true }
): Map<K, V>;
export function keyBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  key: (item: T | null | undefined, index: number) => K,
  value: (item: T | null | undefined, index: number) => V,
  options?: { excludeNullish?: false | undefined }
): Map<K, V | null | undefined>;

/* -----------------------------------------------------
   KEYBY IMPLEMENTATION
------------------------------------------------------ */
export function keyBy(...args: any[]): Map<unknown, unknown> {
  const [items, keyOrProp, valueOrOpts, maybeOpts] = args;

  let valueGetter: any;
  let opts: ByOptions | undefined;

  // Distinguish between a value getter and an options object.
  if (typeof valueOrOpts === "object" && valueOrOpts !== null && !("call" in valueOrOpts)) {
    opts = valueOrOpts;
  } else if (typeof maybeOpts === "object" && maybeOpts !== null) {
    valueGetter = valueOrOpts;
    opts = maybeOpts;
  } else {
    valueGetter = valueOrOpts;
  }

  const excludeNullish = opts?.excludeNullish ?? false;
  const result = new Map<unknown, unknown>();

  (items as any[]).forEach((item, index) => {
    if (excludeNullish && item == null) return;

    let computedKey: unknown;
    if (typeof keyOrProp === "function") {
      computedKey = keyOrProp(item, index);
    } else {
      // property‑based key
      computedKey = item?.[keyOrProp];
    }

    if (excludeNullish && computedKey == null) return;

    let computedValue: unknown;
    if (valueGetter == null) {
      computedValue = item;
    } else if (typeof valueGetter === "function") {
      computedValue = valueGetter(item, index);
    } else {
      computedValue = item?.[valueGetter];
    }

    result.set(computedKey, computedValue);
  });

  return result;
}

/* -----------------------------------------------------------------
   GROUPBY: same pattern of overloads
------------------------------------------------------------------ */

/* ============= PROPERTY‑BASED KEY, NO VALUE ============= */
export function groupBy<
  T extends object,
  K extends keyof T
>(
  items: T[],
  key: K
): Map<T[K], T[]>;
export function groupBy<
  T extends object,
  K extends keyof T
>(
  items: (T | null | undefined)[],
  key: K,
  options: { excludeNullish: true }
): Map<T[K], T[]>;

/* ============= PROPERTY‑BASED KEY, PROPERTY‑BASED VALUE ============= */
export function groupBy<
  T extends object,
  K extends keyof T,
  V extends keyof T
>(
  items: T[],
  key: K,
  value: V
): Map<T[K], Array<T[V]>>;
export function groupBy<
  T extends object,
  K extends keyof T,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: K,
  value: V,
  options: { excludeNullish: true }
): Map<T[K], Array<T[V]>>;

/* ============= PROPERTY‑BASED KEY, FUNCTION‑BASED VALUE ============= */
export function groupBy<
  T extends object,
  K extends keyof T,
  V
>(
  items: T[],
  key: K,
  value: (item: T, index: number) => V
): Map<T[K], V[]>;
export function groupBy<
  T extends object,
  K extends keyof T,
  V
>(
  items: (T | null | undefined)[],
  key: K,
  value: (item: T, index: number) => V,
  options: { excludeNullish: true }
): Map<T[K], V[]>;

/* ============= FUNCTION‑BASED KEY, NO VALUE ============= */
// Overload for non‑null array: callback receives T
export function groupBy<
  T extends object,
  K
>(
  items: T[],
  key: (item: T, index: number) => K
): Map<K, T[]>;
// Overloads for maybe‑null arrays:
export function groupBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  options: { excludeNullish: true }
): Map<K, T[]>;
export function groupBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  key: (item: T | null | undefined, index: number) => K,
  options?: { excludeNullish?: false | undefined }
): Map<K, Array<T | null | undefined>>;

/* ============= FUNCTION‑BASED KEY, PROPERTY‑BASED VALUE ============= */
// Overload for non‑null array: callback receives T
export function groupBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: T[],
  key: (item: T, index: number) => K,
  value: V
): Map<K, Array<T[V]>>;
// Overloads for maybe‑null arrays:
export function groupBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  value: V,
  options: { excludeNullish: true }
): Map<K, Array<T[V]>>;
export function groupBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: (item: T | null | undefined, index: number) => K,
  value: V,
  options?: { excludeNullish?: false | undefined }
): Map<K, Array<T[V] | null | undefined>>;

/* ============= FUNCTION‑BASED KEY, FUNCTION‑BASED VALUE ============= */
// Overload for non‑null array: callback receives T
export function groupBy<
  T extends object,
  K,
  V
>(
  items: T[],
  key: (item: T, index: number) => K,
  value: (item: T, index: number) => V
): Map<K, Array<V>>;
// Overloads for maybe‑null arrays:
export function groupBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  value: (item: T, index: number) => V,
  options: { excludeNullish: true }
): Map<K, Array<V>>;
export function groupBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  key: (item: T | null | undefined, index: number) => K,
  value: (item: T | null | undefined, index: number) => V,
  options?: { excludeNullish?: false | undefined }
): Map<K, Array<V | null | undefined>>;

/* ============= GROUPBY IMPLEMENTATION ============= */
export function groupBy(...args: any[]): Map<unknown, unknown[]> {
  const [items, keyOrProp, valueOrOpts, maybeOpts] = args;

  let valueGetter: any;
  let opts: ByOptions | undefined;

  if (typeof valueOrOpts === "object" && valueOrOpts !== null && !("call" in valueOrOpts)) {
    opts = valueOrOpts;
  } else if (typeof maybeOpts === "object" && maybeOpts !== null) {
    valueGetter = valueOrOpts;
    opts = maybeOpts;
  } else {
    valueGetter = valueOrOpts;
  }

  const excludeNullish = opts?.excludeNullish ?? false;
  const result = new Map<unknown, unknown[]>();

  (items as any[]).forEach((item, index) => {
    if (excludeNullish && item == null) return;

    let computedKey: unknown;
    if (typeof keyOrProp === "function") {
      computedKey = keyOrProp(item, index);
    } else {
      computedKey = item?.[keyOrProp];
    }

    if (excludeNullish && computedKey == null) return;

    let computedValue: unknown;
    if (valueGetter == null) {
      computedValue = item;
    } else if (typeof valueGetter === "function") {
      computedValue = valueGetter(item, index);
    } else {
      computedValue = item?.[valueGetter];
    }

    const arr = result.get(computedKey);
    if (arr) {
      arr.push(computedValue);
    } else {
      result.set(computedKey, [computedValue]);
    }
  });

  return result;
}
