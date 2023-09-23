import { CacheStorageEngine } from './cache-storage-engine';

interface InMemoryCacheStorageEngineConfiguration {
  periodicCleanup?: boolean;
  cleanupIntervalMs: number;
}

/**
 * A cache storage engine that stores the cache in memory.
 */
export class InMemoryCacheStorageEngine extends CacheStorageEngine {
  private readonly config: InMemoryCacheStorageEngineConfiguration;
  private readonly cache = new Map<
    string,
    { value: string; expiresAt?: number }
  >();

  constructor(config?: Partial<InMemoryCacheStorageEngineConfiguration>) {
    super();

    // Assemble configuration
    this.config = {
      periodicCleanup: config?.periodicCleanup ?? true,
      cleanupIntervalMs: config?.cleanupIntervalMs ?? 1_000 * 60,
    };

    // Periodically clean up expired entries
    if (this.config.periodicCleanup) {
      setInterval(() => {
        const entries = Array.from(this.cache.entries());
        const now = Date.now();

        entries.forEach(([key, entry]) => {
          if (entry?.expiresAt && entry.expiresAt < now) {
            this.cache.delete(key);
          }
        });
      }, this.config.cleanupIntervalMs)?.unref();
    }
  }

  /**
   * Get a value from the cache
   * @param key The key to get the value for
   * @returns The value or "undefined" if not found
   */
  async get(key: string): Promise<string | undefined> {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry?.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  async getMany(keys: string[]): Promise<Array<string | undefined>> {
    const entries = keys.map((key) => ({ key, entry: this.cache.get(key) }));

    return entries.map(({ key, entry }) => {
      if (!entry) {
        return undefined;
      }

      if (entry?.expiresAt && entry.expiresAt < Date.now()) {
        this.cache.delete(key);
        return undefined;
      }

      return entry.value;
    });
  }

  /**
   * Get all keys matching a pattern. The pattern can contain "*" as a wildcard, which matches any number of characters (including zero)
   * @param pattern The pattern to match
   * @returns The keys matching the pattern
   */
  async getKeysByPattern(_pattern: string): Promise<string[]> {
    // Replace "*" with ".*" to make it a valid regex, unless it is escaped with a backslash
    const pattern = _pattern.replace(/(?<!\\)\*/g, '.*');
    const regex = new RegExp(`^${pattern}$`);
    const entries = Array.from(this.cache.entries());
    return entries.filter(([key]) => key.match(regex)).map(([key]) => key);
  }

  /**
   * Set a value for a key.
   * @param key The key to set the value for.
   * @param value The value to set.
   * @param opts.expiresIn The time in milliseconds after which the value should expire.
   */
  async set(
    key: string,
    value: string,
    opts?: { expiresIn?: number }
  ): Promise<void> {
    const expiresAt = opts?.expiresIn ? Date.now() + opts.expiresIn : undefined;
    this.cache.set(key, { value, expiresAt });
  }

  async setMany(
    inputs: { key: string; value: string; expiresIn?: number }[]
  ): Promise<void> {
    inputs.forEach(({ key, value, expiresIn }) => {
      const expiresAt = expiresIn ? Date.now() + expiresIn : undefined;
      this.cache.set(key, { value, expiresAt });
    });
  }

  async setIfNotExist(
    key: string,
    value: string,
    opts?: { expiresIn?: number }
  ): Promise<void> {
    const entry = this.cache.get(key);
    if (entry?.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
    }

    if (!this.cache.has(key)) {
      const expiresAt = opts?.expiresIn
        ? Date.now() + opts.expiresIn
        : undefined;
      this.cache.set(key, { value, expiresAt });
    }
  }

  async setManyIfNotExist(
    inputs: { key: string; value: string; expiresIn?: number }[]
  ): Promise<void> {
    inputs.forEach(({ key, value, expiresIn }) => {
      const entry = this.cache.get(key);
      if (entry?.expiresAt && entry.expiresAt < Date.now()) {
        this.cache.delete(key);
      }

      if (!this.cache.has(key)) {
        const expiresAt = expiresIn ? Date.now() + expiresIn : undefined;
        this.cache.set(key, { value, expiresAt });
      }
    });
  }
}
