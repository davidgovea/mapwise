import type { ByOptions } from './types';

/* -----------------------------------------------------
   PROPERTY-BASED KEY, NO VALUE TRANSFORMER
   - Keys are extracted from a specified object property.
   - Values are the full objects.
------------------------------------------------------ */
export function keyBy<T extends object, K extends keyof T>(
  items: T[],
  keyExtractor: K,
): Map<T[K], T>;
export function keyBy<T extends object, K extends keyof T>(
  items: (T | null | undefined)[],
  keyExtractor: K,
  options: { excludeNullish: true },
): Map<T[K], T>;

/* -----------------------------------------------------
   PROPERTY-BASED KEY, PROPERTY-BASED VALUE
   - Keys are extracted from a specified object property.
   - Values are extracted from another specified object property.
------------------------------------------------------ */
export function keyBy<T extends object, K extends keyof T, V extends keyof T>(
  items: T[],
  keyExtractor: K,
  valueTransformer: V,
): Map<T[K], T[V]>;
export function keyBy<T extends object, K extends keyof T, V extends keyof T>(
  items: (T | null | undefined)[],
  keyExtractor: K,
  valueTransformer: V,
  options: { excludeNullish: true },
): Map<T[K], T[V]>;

/* -----------------------------------------------------
   PROPERTY-BASED KEY, FUNCTION-BASED VALUE
   - Keys are extracted from a specified object property.
   - Values are computed by a transformer function.
------------------------------------------------------ */
export function keyBy<T extends object, K extends keyof T, V>(
  items: T[],
  keyExtractor: K,
  valueTransformer: (item: T, index: number) => V,
): Map<T[K], V>;
export function keyBy<T extends object, K extends keyof T, V>(
  items: (T | null | undefined)[],
  keyExtractor: K,
  valueTransformer: (item: T, index: number) => V,
  options: { excludeNullish: true },
): Map<T[K], V>;

/* -----------------------------------------------------
   FUNCTION-BASED KEY, NO VALUE TRANSFORMER
   - Keys are computed by a key extractor function.
   - Values are the full objects.
------------------------------------------------------ */
export function keyBy<T extends object, K>(
  items: T[],
  keyExtractor: (item: T, index: number) => K,
): Map<K, T>;
export function keyBy<T extends object, K>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  options: { excludeNullish: true },
): Map<K, T>;
export function keyBy<T extends object, K>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  options?: { excludeNullish?: false | undefined },
): Map<K, T | null | undefined>;

/* -----------------------------------------------------
   FUNCTION-BASED KEY, PROPERTY-BASED VALUE
   - Keys are computed by a key extractor function.
   - Values are extracted from a specified object property.
------------------------------------------------------ */
export function keyBy<T extends object, K, V extends keyof T>(
  items: T[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: V,
): Map<K, T[V]>;
export function keyBy<T extends object, K, V extends keyof T>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: V,
  options: { excludeNullish: true },
): Map<K, T[V]>;
export function keyBy<T extends object, K, V extends keyof T>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  valueTransformer: V,
  options?: { excludeNullish?: false | undefined },
): Map<K, T[V] | null | undefined>;

/* -----------------------------------------------------
   FUNCTION-BASED KEY, FUNCTION-BASED VALUE
   - Keys are computed by a key extractor function.
   - Values are computed by a transformer function.
------------------------------------------------------ */
export function keyBy<T extends object, K, V>(
  items: T[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: (item: T, index: number) => V,
): Map<K, V>;
export function keyBy<T extends object, K, V>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T, index: number) => K,
  valueTransformer: (item: T, index: number) => V,
  options: { excludeNullish: true },
): Map<K, V>;
export function keyBy<T extends object, K, V>(
  items: (T | null | undefined)[],
  keyExtractor: (item: T | null | undefined, index: number) => K,
  valueTransformer: (item: T | null | undefined, index: number) => V,
  options?: { excludeNullish?: false | undefined },
): Map<K, V | null | undefined>;

/* -----------------------------------------------------
   KEYBY IMPLEMENTATION
   - Handles all overloads by distinguishing argument types at runtime.
   - Creates a Map with computed keys and values based on provided extractors/transformers.
------------------------------------------------------ */
export function keyBy(...args: any[]): Map<unknown, unknown> {
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
  const result = new Map<unknown, unknown>();

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

    // Set the key-value pair in the Map (later entries overwrite earlier ones for duplicate keys).
    result.set(computedKey, computedValue);
  });

  return result;
}
