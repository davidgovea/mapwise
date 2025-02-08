export interface ByOptions {
  excludeNullish?: boolean;
}

/**
 * We define separate sets of overloads for property-based keys:
 *  - (1) Strict T[] with no excludeNullish
 *  - (2) (T | null | undefined)[] with excludeNullish:true
 *
 * Then we define the function-based key overloads, which
 * always allow (T | null | undefined)[] for items (with optional excludeNullish).
 */

/* -----------------------------------------------------
   KEYBY: property-based key, no "value getter"
------------------------------------------------------ */
export function keyBy<
  T extends object,
  K extends keyof T
>(
  items: T[],
  key: K
): Map<T[K], T>;

/**
 * Same property-based key, but now the array can be
 * (T|null|undefined)[] only if excludeNullish: true
 */
export function keyBy<
  T extends object,
  K extends keyof T
>(
  items: (T | null | undefined)[],
  key: K,
  options: { excludeNullish: true }
): Map<T[K], T>;

/* -----------------------------------------------------
   KEYBY: property-based key, property-based value
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
   KEYBY: property-based key, function-based value
------------------------------------------------------ */
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
   KEYBY: function-based key (always pass (T|null|undefined)[])
   because function-based keys do not require that T be
   strictly non-null. The excludeNullish option is optional.
------------------------------------------------------ */
export function keyBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  options?: { excludeNullish?: boolean }
): Map<K, T>;

/* function-based key, property-based value */
export function keyBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  value: V,
  options?: { excludeNullish?: boolean }
): Map<K, T[V]>;

/* function-based key, function-based value */
export function keyBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  value: (item: T, index: number) => V,
  options?: { excludeNullish?: boolean }
): Map<K, V>;

/* -----------------------------------------------------
   KEYBY IMPLEMENTATION
------------------------------------------------------ */
export function keyBy(...args: any[]): Map<unknown, unknown> {
  const [items, keyOrProp, valueOrOpts, maybeOpts] = args;

  let valueGetter: any;
  let opts: ByOptions | undefined;

  // Distinguish (value vs options)
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
    if (excludeNullish && item == null) {
      return; // skip
    }

    let computedKey: unknown;
    if (typeof keyOrProp === "function") {
      computedKey = keyOrProp(item, index);
    } else {
      // property-based
      computedKey = item?.[keyOrProp];
    }

    if (excludeNullish && computedKey == null) {
      return; // skip
    }

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

/* ============= PROPERTY-BASED KEY, NO VALUE ============= */
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

/* ============= PROPERTY-BASED KEY, PROPERTY-BASED VALUE ============= */
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

/* ============= PROPERTY-BASED KEY, FUNCTION-BASED VALUE ============= */
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

/* ============= FUNCTION-BASED KEY (ALWAYS ALLOW NULLISH ITEMS) ============= */
export function groupBy<
  T extends object,
  K
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  options?: { excludeNullish?: boolean }
): Map<K, T[]>;

export function groupBy<
  T extends object,
  K,
  V extends keyof T
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  value: V,
  options?: { excludeNullish?: boolean }
): Map<K, Array<T[V]>>;

export function groupBy<
  T extends object,
  K,
  V
>(
  items: (T | null | undefined)[],
  key: (item: T, index: number) => K,
  value: (item: T, index: number) => V,
  options?: { excludeNullish?: boolean }
): Map<K, Array<V>>;

/* ============= groupBy IMPLEMENTATION ============= */
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
