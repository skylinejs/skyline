/**
 * The interface for a cache storage engine.
 */
export abstract class CacheStorageEngine {
  /**
   * Get a value from the cache
   * @param key The key to get the value for
   * @returns The value or "undefined" if not found
   */
  abstract get(key: string): Promise<string | undefined>;
  abstract getMany(keys: string[]): Promise<Array<string | undefined>>;
  abstract getKeysByPattern(pattern: string): Promise<string[]>;

  /**
   * Set a value for a key.
   * @param key The key to set the value for.
   * @param value The value to set.
   * @param opts.expiresIn The time in milliseconds after which the value should expire.
   */
  abstract set(
    key: string,
    value: string,
    opts?: { expiresIn?: number }
  ): Promise<unknown>;

  abstract setMany(
    inputs: { key: string; value: string; expiresIn?: number }[]
  ): Promise<unknown>;

  /**
   * Set a value for a key if it does not exist yet.
   * @param key The key to set the value for.
   * @param value The value to set.
   * @param opts.expiresIn The time in milliseconds after which the value should expire.
   */
  abstract setIfNotExist(
    key: string,
    value: string,
    opts?: { expiresIn?: number }
  ): Promise<unknown>;

  abstract setManyIfNotExist(
    inputs: { key: string; value: string; expiresIn?: number }[]
  ): Promise<unknown>;
}
