/**
 * Options for configuring keyBy and groupBy behavior.
 */
export interface ByOptions {
  /**
   * If true, excludes null or undefined items and keys from the resulting Map.
   * Defaults to false, meaning nullish values are included unless explicitly excluded.
   */
  excludeNullish?: boolean;
}
