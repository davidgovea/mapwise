export interface ByOptions {
  excludeNullish?: boolean;
}

/* -----------------------------------------------------
   KEYBY: property‑based key, no "value transformer"
------------------------------------------------------ */
export function keyBy<
  T extends object,
  K extends keyof T
>(
  items: T[],
  keyExtractor: K
): Map<T[K], T>;
export function keyBy<
  T extends object,
  K extends keyof T
>(
  items: (T | null | undefined)[],
  keyExtractor: K,
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
  keyExtractor: K,
  valueTransformer: V
): Map<T[K], T[V]>;
export function keyBy<
  T extends object,
  K extends keyof T,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  keyExtractor: K,
  valueTransformer: V,
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
  keyExtractor: K,
  valueTransformer: (item: T, index: number) => V
): Map<T[K], V>;
export function keyBy<
  T extends object,
  K extends keyof T,
  V
>(
  items: (T | null | undefined)[],
  keyExtractor: K,
  valueTransformer: (item: T, index: number) => V,
  options: { excludeNullish: true }
): Map<T[K], V>;

/* -----------------------------------------------------
   KEYBY: function‑based key, no value transformer
------------------------------------------------------ */
// Overload for non‑null array: callback receives T
export function keyBy<
  T extends object,
  K
>(
  items: T[],
  keyExtractor: (item: T, index: number) => K
): Map<K, T>;
// Overloads for maybe‑null arrays:
export function keyBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  options: { excludeNullish: true }
): Map<K, T>;
export function keyBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  options?: { excludeNullish?: false | undefined }
): Map<K, T | null | undefined>;

/* -----------------------------------------------------
   KEYBY: function‑based key, property‑based value
------------------------------------------------------ */
export function keyBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: T[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: V
): Map<K, T[V]>;
 // Overloads for maybe‑null arrays:
export function keyBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: V,
  options: { excludeNullish: true }
): Map<K, T[V]>;
export function keyBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  valueTransformer: V,
  options?: { excludeNullish?: false | undefined }
): Map<K, T[V] | null | undefined>;

/* -----------------------------------------------------
   KEYBY: function‑based key, function‑based value
------------------------------------------------------ */
export function keyBy<
  T extends object,
  K,
  V
>(
  items: T[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: (item: T, index: number) => V
): Map<K, V>;
// Overloads for maybe‑null arrays:
export function keyBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: (item: T, index: number) => V,
  options: { excludeNullish: true }
): Map<K, V>;
export function keyBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  valueTransformer: (item: T | null | undefined, index: number) => V,
  options?: { excludeNullish?: false | undefined }
): Map<K, V | null | undefined>;

/* -----------------------------------------------------
   KEYBY IMPLEMENTATION
------------------------------------------------------ */
export function keyBy(...args: any[]): Map<unknown, unknown> {
  const [items, keyExtractorOrProp, valueTransformerOrOpts, maybeOpts] = args;

  let valueTransformer: any;
  let opts: ByOptions | undefined;

  // Distinguish between a value transformer and an options object.
  if (
    typeof valueTransformerOrOpts === "object" &&
    valueTransformerOrOpts !== null &&
    !("call" in valueTransformerOrOpts)
  ) {
    opts = valueTransformerOrOpts;
  } else if (typeof maybeOpts === "object" && maybeOpts !== null) {
    valueTransformer = valueTransformerOrOpts;
    opts = maybeOpts;
  } else {
    valueTransformer = valueTransformerOrOpts;
  }

  const excludeNullish = opts?.excludeNullish ?? false;
  const result = new Map<unknown, unknown>();

  (items as any[]).forEach((item, index) => {
    if (excludeNullish && item == null) return;

    let computedKey: unknown;
    if (typeof keyExtractorOrProp === "function") {
      computedKey = keyExtractorOrProp(item, index);
    } else {
      // property‑based key extraction
      computedKey = item?.[keyExtractorOrProp];
    }

    if (excludeNullish && computedKey == null) return;

    let computedValue: unknown;
    if (valueTransformer == null) {
      computedValue = item;
    } else if (typeof valueTransformer === "function") {
      computedValue = valueTransformer(item, index);
    } else {
      computedValue = item?.[valueTransformer];
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
  keyExtractor: K
): Map<T[K], T[]>;
export function groupBy<
  T extends object,
  K extends keyof T
>(
  items: (T | null | undefined)[],
  keyExtractor: K,
  options: { excludeNullish: true }
): Map<T[K], T[]>;

/* ============= PROPERTY‑BASED KEY, PROPERTY‑BASED VALUE ============= */
export function groupBy<
  T extends object,
  K extends keyof T,
  V extends keyof T
>(
  items: T[],
  keyExtractor: K,
  valueTransformer: V
): Map<T[K], Array<T[V]>>;
export function groupBy<
  T extends object,
  K extends keyof T,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  keyExtractor: K,
  valueTransformer: V,
  options: { excludeNullish: true }
): Map<T[K], Array<T[V]>>;

/* ============= PROPERTY‑BASED KEY, FUNCTION‑BASED VALUE ============= */
export function groupBy<
  T extends object,
  K extends keyof T,
  V
>(
  items: T[],
  keyExtractor: K,
  valueTransformer: (item: T, index: number) => V
): Map<T[K], V[]>;
export function groupBy<
  T extends object,
  K extends keyof T,
  V
>(
  items: (T | null | undefined)[],
  keyExtractor: K,
  valueTransformer: (item: T, index: number) => V,
  options: { excludeNullish: true }
): Map<T[K], V[]>;

/* ============= FUNCTION‑BASED KEY, NO VALUE ============= */
// Overload for non‑null array: callback receives T
export function groupBy<
  T extends object,
  K
>(
  items: T[],
  keyExtractor: (item: T, index: number) => K
): Map<K, T[]>;
// Overloads for maybe‑null arrays:
export function groupBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  options: { excludeNullish: true }
): Map<K, T[]>;
export function groupBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  options?: { excludeNullish?: false | undefined }
): Map<K, Array<T | null | undefined>>;

/* ============= FUNCTION‑BASED KEY, PROPERTY‑BASED VALUE ============= */
export function groupBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: T[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: V
): Map<K, Array<T[V]>>;
export function groupBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: V,
  options: { excludeNullish: true }
): Map<K, Array<T[V]>>;
export function groupBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  valueTransformer: V,
  options?: { excludeNullish?: false | undefined }
): Map<K, Array<T[V] | null | undefined>>;

/* ============= FUNCTION‑BASED KEY, FUNCTION‑BASED VALUE ============= */
export function groupBy<
  T extends object,
  K,
  V
>(
  items: T[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: (item: T, index: number) => V
): Map<K, Array<V>>;
export function groupBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: (item: T, index: number) => V,
  options: { excludeNullish: true }
): Map<K, Array<V>>;
export function groupBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  valueTransformer: (item: T | null | undefined, index: number) => V,
  options?: { excludeNullish?: false | undefined }
): Map<K, Array<V | null | undefined>>;

/* ============= GROUPBY IMPLEMENTATION ============= */
export function groupBy(...args: any[]): Map<unknown, unknown[]> {
  const [items, keyExtractorOrProp, valueTransformerOrOpts, maybeOpts] = args;

  let valueTransformer: any;
  let opts: ByOptions | undefined;

  if (
    typeof valueTransformerOrOpts === "object" &&
    valueTransformerOrOpts !== null &&
    !("call" in valueTransformerOrOpts)
  ) {
    opts = valueTransformerOrOpts;
  } else if (typeof maybeOpts === "object" && maybeOpts !== null) {
    valueTransformer = valueTransformerOrOpts;
    opts = maybeOpts;
  } else {
    valueTransformer = valueTransformerOrOpts;
  }

  const excludeNullish = opts?.excludeNullish ?? false;
  const result = new Map<unknown, unknown[]>();

  (items as any[]).forEach((item, index) => {
    if (excludeNullish && item == null) return;

    let computedKey: unknown;
    if (typeof keyExtractorOrProp === "function") {
      computedKey = keyExtractorOrProp(item, index);
    } else {
      computedKey = item?.[keyExtractorOrProp];
    }

    if (excludeNullish && computedKey == null) return;

    let computedValue: unknown;
    if (valueTransformer == null) {
      computedValue = item;
    } else if (typeof valueTransformer === "function") {
      computedValue = valueTransformer(item, index);
    } else {
      computedValue = item?.[valueTransformer];
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
