import type { ByOptions } from './types';

/* -----------------------------------------------------
   PROPERTY-BASED KEY, NO VALUE TRANSFORMER
   - Keys are extracted from a specified object property.
   - Values are arrays of full objects.
------------------------------------------------------ */
export function groupBy<T extends object, K extends keyof T>(
  items: readonly T[],
  keyExtractor: K,
): Map<T[K], T[]>;
export function groupBy<T extends object, K extends keyof T>(
  items: readonly (T | null | undefined)[],
  keyExtractor: K,
  options: { excludeNullish: true },
): Map<T[K], T[]>;

/* -----------------------------------------------------
   PROPERTY-BASED KEY, PROPERTY-BASED VALUE
   - Keys are extracted from a specified object property.
   - Values are arrays of values extracted from another property.
------------------------------------------------------ */
export function groupBy<T extends object, K extends keyof T, V extends keyof T>(
  items: readonly T[],
  keyExtractor: K,
  valueTransformer: V,
): Map<T[K], Array<T[V]>>;
export function groupBy<T extends object, K extends keyof T, V extends keyof T>(
  items: readonly (T | null | undefined)[],
  keyExtractor: K,
  valueTransformer: V,
  options: { excludeNullish: true },
): Map<T[K], Array<T[V]>>;

/* -----------------------------------------------------
   PROPERTY-BASED KEY, FUNCTION-BASED VALUE
   - Keys are extracted from a specified object property.
   - Values are arrays of values computed by a transformer function.
------------------------------------------------------ */
export function groupBy<T extends object, K extends keyof T, V>(
  items: readonly T[],
  keyExtractor: K,
  valueTransformer: (item: T, index: number) => V,
): Map<T[K], V[]>;
export function groupBy<T extends object, K extends keyof T, V>(
  items: readonly (T | null | undefined)[],
  keyExtractor: K,
  valueTransformer: (item: T, index: number) => V,
  options: { excludeNullish: true },
): Map<T[K], V[]>;

/* -----------------------------------------------------
   FUNCTION-BASED KEY, NO VALUE TRANSFORMER
   - Keys are computed by a key extractor function.
   - Values are arrays of full objects.
------------------------------------------------------ */
export function groupBy<T extends object, K>(
  items: readonly T[],
  keyExtractor: (item: T, index: number) => K,
): Map<K, T[]>;
export function groupBy<T extends object, K>(
  items: readonly (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  options: { excludeNullish: true },
): Map<K, T[]>;
export function groupBy<T extends object, K>(
  items: readonly (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  options?: { excludeNullish?: false | undefined },
): Map<K, Array<T | null | undefined>>;

/* -----------------------------------------------------
   FUNCTION-BASED KEY, PROPERTY-BASED VALUE
   - Keys are computed by a key extractor function.
   - Values are arrays of values extracted from a specified property.
------------------------------------------------------ */
export function groupBy<T extends object, K, V extends keyof T>(
  items: readonly T[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: V,
): Map<K, Array<T[V]>>;
export function groupBy<T extends object, K, V extends keyof T>(
  items: readonly (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: V,
  options: { excludeNullish: true },
): Map<K, Array<T[V]>>;
export function groupBy<T extends object, K, V extends keyof T>(
  items: readonly (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  valueTransformer: V,
  options?: { excludeNullish?: false | undefined },
): Map<K, Array<T[V] | null | undefined>>;

/* -----------------------------------------------------
   FUNCTION-BASED KEY, FUNCTION-BASED VALUE
   - Keys are computed by a key extractor function.
   - Values are arrays of values computed by a transformer function.
------------------------------------------------------ */
export function groupBy<T extends object, K, V>(
  items: readonly T[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: (item: T, index: number) => V,
): Map<K, Array<V>>;
export function groupBy<T extends object, K, V>(
  items: readonly (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: (item: T, index: number) => V,
  options: { excludeNullish: true },
): Map<K, Array<V>>;
export function groupBy<T extends object, K, V>(
  items: readonly (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  valueTransformer: (item: T | null | undefined, index: number) => V,
  options?: { excludeNullish?: false | undefined },
): Map<K, Array<V | null | undefined>>;

/* -----------------------------------------------------
   GROUPBY IMPLEMENTATION
   - Handles all overloads by distinguishing argument types at runtime.
   - Creates a Map where each key maps to an array of values.
------------------------------------------------------ */
export function groupBy(...args: any[]): Map<unknown, unknown[]> {
  const [items, keyExtractorOrProp, valueTransformerOrOpts, maybeOpts] = args;

  let valueTransformer: any;
  let opts: ByOptions | undefined;

  // Determine if the third argument is a value transformer or options object.
  if (
    typeof valueTransformerOrOpts === 'object' &&
    valueTransformerOrOpts !== null &&
    !('call' in valueTransformerOrOpts)
  ) {
    opts = valueTransformerOrOpts;
  } else if (typeof maybeOpts === 'object' && maybeOpts !== null) {
    valueTransformer = valueTransformerOrOpts;
    opts = maybeOpts;
  } else {
    valueTransformer = valueTransformerOrOpts;
  }

  const excludeNullish = opts?.excludeNullish ?? false;
  const result = new Map<unknown, unknown[]>();

  // Process each item in the input array.
  (items as any[]).forEach((item, index) => {
    // Skip nullish items if excludeNullish is true.
    if (excludeNullish && item == null) return;

    // Compute the key based on whether keyExtractorOrProp is a function or property name.
    let computedKey: unknown;
    if (typeof keyExtractorOrProp === 'function') {
      computedKey = keyExtractorOrProp(item, index);
    } else {
      computedKey = item?.[keyExtractorOrProp];
    }

    // Skip entries with nullish keys if excludeNullish is true.
    if (excludeNullish && computedKey == null) return;

    // Compute the value based on the value transformer (none, function, or property).
    let computedValue: unknown;
    if (valueTransformer == null) {
      computedValue = item;
    } else if (typeof valueTransformer === 'function') {
      computedValue = valueTransformer(item, index);
    } else {
      computedValue = item?.[valueTransformer];
    }

    // Append the value to the array for this key, creating a new array if none exists.
    const arr = result.get(computedKey);
    if (arr) {
      arr.push(computedValue);
    } else {
      result.set(computedKey, [computedValue]);
    }
  });

  return result;
}
