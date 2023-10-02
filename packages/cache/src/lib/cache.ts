import {
  CacheInconsistencyError,
  CacheInputValidationError,
} from './cache-error';
import {
  CacheConfiguration,
  CacheKey,
  CacheStatistics,
} from './cache.interface';
import {
  extractMessageFromError,
  extractStackFromError,
  getRandomNumberGenerator,
  isNotNullish,
  isNullish,
} from './cache.utils';
import { CacheLogger } from './logger/cache-logger';
import {
  CacheLogLevel,
  CacheLoggerConfiguration,
  CacheMessageInfoType,
} from './logger/cache-logger.interface';
import { CacheStorageEngine } from './storage-engine/cache-storage-engine';
import { InMemoryCacheStorageEngine } from './storage-engine/in-memory-cache-storage-engine';

/**
 * ### SkylineCache
 *
 * TODO: Good documentation
 * Results of source queries can be cached by their primary key. A typical caching operation consists of the "namespace" (e.g. "user") and the primary key (e.g. the user ID: "123").
 * Aggregate results can also be cached. For example, all user IDs for the organization. In this case, the namespace would be "organization-user-ids" and the primary key would be "organizationId".
 * To avoid timing bugs, the cache invalidation blocks the key for a short period of time. Writing to a cache key is only possible if the key does not exist.
 * The cache key invalidation should happen at the end of the source transaction but before the transaction is committed.
 * A transaction gets the source from one consistent state to another consistent state. If we would invalidate the caches after the transaction is committed, we might return an inconsistent state because some caches might be invalidated and some might not.
 * If a transaction is long-running, invalidating the cache key at the start of the transaction might be insufficient as the blocking period might run out before the transaction is committed.
 * Therefore, we "collect" the cache keys that need to be invalidated during the transaction and invalidate them right before the transaction is committed.
 *
 * # Cache consistency observability
 * It is close to impossible to write bug-free cache invalidation code. Therefore, we need to be able to observe the cache consistency and react to inconsistencies.
 * The cache consistency observability is implemented by using the following strategy:
 * The developer can configure a percentage of cache reads that should be skipped. This value should be 100% when a cache is first introduced. This way no cached values are used and every cached value will be checked for correctness.
 * As the "get" / "getMany" function returns an artifical cache miss, the application goes on and fetches the data from the source. Afterwards, the fetched values will be written to cache via the "setIfNotExist" / "setManyIfNotExist" functions.
 * These functions check if the key already exists. If so, the given value will be compared with the cached value. If the values are not equal, an cache inconsistency is detected and an exception will be thrown.
 * When no cache inconsistencies are observed, the percentage value can be gradually lowered so that we enjoy the benefits of the caching with increasing confidence in the consistency of the cache. The value should never be 0%, otherwise
 * we have no way of observing cache inconsistencies.
 *
 * Potential causes for cache inconsistencies:
 *   - Developer forgets to invalidate the cache (deterministic inconsistency)
 *   - Transaction committing takes longer than the cache key blocking period (timing dependent inconsistency)
 *   - The staleness check passes but the writing to cache takes longer than blocking period (timing dependent inconsistency)
 */
export class SkylineCache {
  private readonly config: CacheConfiguration;
  private readonly storage: CacheStorageEngine;
  private readonly logger: CacheLogger;
  private readonly random: () => number;

  /** Whether the cache skipping feature is disabled */
  private cacheSkippingDisabled = false;

  /** Disabled namespaces (e.g., due to detected cache inconsistency) */
  private disabledNamespaces: string[] = [];

  /** Cache statistics */
  private readonly statistics: CacheStatistics = {
    numCacheHits: 0,
    numCacheSkips: 0,
    numCacheMisses: 0,
    numCacheErrors: 0,
    numCacheInvalidations: 0,
    numCacheInconsistencies: 0,
    numCacheConsistencyChecks: 0,
    numCacheDisabledNamespaceSkips: 0,
  };

  constructor({
    config,
    storage,
    logger,
  }: {
    config?: Partial<CacheConfiguration>;
    storage?: CacheStorageEngine;
    logger?: CacheLogger | typeof CacheLogger;
  } = {}) {
    // Assemble config with defaults
    this.config = {
      cachePrefix: config?.cachePrefix ?? 'cache',
      cacheVersion: config?.cacheVersion,
      forceCacheSkips: config?.forceCacheSkips ?? false,
      staleThresholdMs: config?.staleThresholdMs ?? 2_000,
      defaultCacheExpirationMs:
        config?.defaultCacheExpirationMs ?? 1_000 * 60 * 60 * 24,

      // Disabling namespaces
      disableNamespaces: config?.disableNamespaces ?? false,
      disabledNamespacesSyncIntervalMs:
        config?.disabledNamespacesSyncIntervalMs ?? 30_000,
      disabledNamespacesKeyPrefix:
        config?.disabledNamespacesKeyPrefix ?? 'disabled-namespaces',
      disabledNamespaceExpirationMs:
        config?.disabledNamespaceExpirationMs ?? 1_000 * 60 * 60 * 24,

      // Blocking keys
      blockedKeyExpirationMs: config?.blockedKeyExpirationMs ?? 10_000,
      cacheKeyBlockedValue: config?.cacheKeyBlockedValue ?? 'blocked',

      // Error handling
      throwOnError: config?.throwOnError ?? false,

      // Logging
      loggingEnabled: config?.loggingEnabled ?? true,
      logLevels: config?.logLevels ?? Object.values(CacheLogLevel),

      // Random
      randomGeneratorSeed: config?.randomGeneratorSeed ?? 'cache-rnd-seed',
    };

    // Initialize the storage engine (defaults to in-memory storage engine)
    this.storage = storage ?? new InMemoryCacheStorageEngine();

    // Assembe logger config
    const loggerConfig: CacheLoggerConfiguration = {
      enabled: this.config.loggingEnabled,
      logLevels: this.config.logLevels,
    };

    // Initialize the logger (defaults to console logger)
    if (typeof logger === 'function') {
      this.logger = new logger(loggerConfig);
    } else if (logger) {
      this.logger = logger;
    } else {
      this.logger = new CacheLogger(loggerConfig);
    }

    // Initialize the random number generator
    this.random = getRandomNumberGenerator(this.config.randomGeneratorSeed);

    // Sync disabled namespaces from storage
    if (this.config.disableNamespaces) {
      // Set interval to synchronize disabled namespaces from storage
      setInterval(
        () => void this.synchronizeDisabledNamespaces(),
        this.config.disabledNamespacesSyncIntervalMs
      );
    }
  }

  /**
   * Get the storage key for a given namespace and key.
   * Takes the cache prefix and cache version into account if configured.
   * @param namespace The namespace.
   * @param key The key.
   * @returns The storage key.
   */
  private getStorageKey(namespace: string, key: CacheKey): string {
    if (this.config.cacheVersion) {
      return `${this.config.cachePrefix}:${this.config.cacheVersion}:${namespace}:${key}`;
    }
    return `${this.config.cachePrefix}:${namespace}:${key}`;
  }

  /**
   * Get a cached value from the cache.
   * @param namespace The namespace of the cached value (e.g. "user").
   * @param key The key of the cached value (e.g. the user ID: "123")
   * @param validator A validator function to validate the cached value.
   * @param opts.skip A probability between 0 and 1 whether the cache read should be skipped.
   *                  This is used to detect cache inconsistencies.
   *                  If the cache read is skipped, the function artifically returns "undefined" (= cache miss).
   *                  Defaults to 0 (0% of cache reads are skipped).
   * @returns The cached value if it exists and is valid, "undefined" otherwise.
   */
  async get<T>(
    namespace: string,
    key: CacheKey,
    validator: (input: unknown) => asserts input is T,
    opts: { skip?: number } = {}
  ): Promise<{ value: T | undefined; skipped: boolean }> {
    try {
      // Validate inputs
      if (!namespace || typeof namespace !== 'string') {
        throw new CacheInputValidationError(
          `Valid namespace must be provided, but was "${namespace}"`,
          {
            parameter: 'namespace',
            value: namespace,
          }
        );
      }
      if (!key) {
        throw new CacheInputValidationError(
          `Valid key must be provided, but was "${key}"`,
          {
            parameter: 'key',
            value: key,
          }
        );
      }
      if (opts.skip && (opts.skip < 0 || opts.skip > 1)) {
        throw new CacheInputValidationError(
          `Skip must be between 0 and 1, but was "${opts.skip}"`,
          {
            parameter: 'skip',
            value: opts.skip,
          }
        );
      }

      // Check if namespace is disabled
      if (this.isNamespaceDisabled(namespace)) {
        this.statistics.numCacheDisabledNamespaceSkips++;
        return { value: undefined, skipped: false };
      }

      // Check if cache read should be skipped (default: 0)
      let skip = 0;

      // Disable cache skipping has highest precedence
      if (this.cacheSkippingDisabled) {
        skip = 0;
      }
      // Force cache skips has second highest precedence
      else if (this.config.forceCacheSkips) {
        skip = 1;
      }
      // If provided, use the skip probability from the options
      else if (opts.skip !== undefined) {
        skip = opts.skip;
      }

      if (skip >= 1 || (skip > 0 && this.random() < skip)) {
        this.statistics.numCacheSkips++;
        return { value: undefined, skipped: true };
      }

      // Calculate the storage cache key
      const storageKey = this.getStorageKey(namespace, key);

      // Check storage if a cached value exists for the given key
      const result = await this.storage.get(storageKey);

      // If no result exists or the result is blocked, return undefined (=cache miss)
      if (!result || result === this.config.cacheKeyBlockedValue) {
        this.statistics.numCacheMisses++;
        return { value: undefined, skipped: false };
      }

      // Parse and validate the result
      const value: unknown = JSON.parse(result);
      validator(value);
      this.statistics.numCacheHits++;
      return { value, skipped: false };
    } catch (error: unknown) {
      this.handleError(error, {
        location: 'cache.get',
        identifier: `${namespace}:${key}`,
      });
    }

    // If the result is invalid, return undefined (= cache miss)
    return { value: undefined, skipped: false };
  }

  /**
   * Get multiple cached values from the cache.
   * @param namespace The namespace of the cached values (e.g. "user").
   * @param keys The keys of the cached values (e.g. the user IDs: ["123", "456"])
   * @param validator A validator function to validate each cached value.
   * @param opts.skip A probability between 0 and 1 whether the cache read should be skipped.
   *                  This is used to detect cache inconsistencies.
   *                  If the cache read is skipped, the function artifically returns "undefined" (= cache miss).
   *                  Defaults to 0 (0% of cache reads are skipped).
   * @returns An array containing the cached values if they exist and are valid, "undefined" otherwise.
   *          The order of the array is the same as the order of the input keys.
   *          The length of the array is the same as the length of the input keys.
   */
  async getMany<T>(
    namespace: string,
    keys: ReadonlyArray<CacheKey>,
    validator: (input: unknown) => asserts input is T,
    opts: { skip?: number } = {}
  ): Promise<{ values: Array<T | undefined>; skipped: boolean }> {
    try {
      // Validate inputs
      if (!namespace || typeof namespace !== 'string') {
        throw new CacheInputValidationError(
          `cache.getMany: Namespace must be provided, but was "${namespace}"`,
          {
            parameter: 'namespace',
            value: namespace,
          }
        );
      }
      if (!keys.every((key) => !!key)) {
        throw new CacheInputValidationError(
          `cache.getMany: Keys must be provided, but was "${keys}"`,
          {
            parameter: 'keys',
            value: keys,
          }
        );
      }
      if (typeof validator !== 'function') {
        throw new CacheInputValidationError(
          `cache.getMany: Validator must be a function, but was "${typeof validator}"`,
          {
            parameter: 'validator',
            value: validator,
          }
        );
      }
      if (opts.skip && (opts.skip < 0 || opts.skip > 1)) {
        throw new CacheInputValidationError(
          `cache.getMany: Skip must be between 0 and 1, but was "${opts.skip}"`,
          {
            parameter: 'skip',
            value: opts.skip,
          }
        );
      }

      // Do not proceed if no keys are provided
      if (keys.length === 0) {
        return { values: keys.map(() => undefined), skipped: false };
      }

      // Do not proceed if the namespace is disabled
      if (this.isNamespaceDisabled(namespace)) {
        this.statistics.numCacheDisabledNamespaceSkips += keys.length;
        return { values: keys.map(() => undefined), skipped: true };
      }

      // Check if cache read should be skipped (default: 0)
      let skip = 0;

      // Disable cache skipping has highest precedence
      if (this.cacheSkippingDisabled) {
        skip = 0;
      }
      // Force cache skips has second highest precedence
      else if (this.config.forceCacheSkips) {
        skip = 1;
      }
      // If provided, use the skip probability from the options
      else if (opts.skip !== undefined) {
        skip = opts.skip;
      }

      if (skip >= 1 || (skip > 0 && this.random() < skip)) {
        this.statistics.numCacheSkips += keys.length;
        return { values: keys.map(() => undefined), skipped: true };
      }

      // Calculate the storage cache keys
      const storageKeys = keys.map((key) => this.getStorageKey(namespace, key));

      // Get the values from storage
      const results = await this.storage.getMany(storageKeys);

      const values = results.map((result, index) => {
        // If the result is null or undefined, return undefined
        if (!result || result === this.config.cacheKeyBlockedValue)
          return undefined;

        // Parse and validate the result
        try {
          const parsed: unknown = JSON.parse(result);
          validator(parsed);
          return parsed;
        } catch (error: unknown) {
          const key = keys[index];
          this.handleError(error, {
            location: 'cache.getMany',
            identifier: `${namespace}:${key}`,
          });
        }

        return undefined;
      });

      this.statistics.numCacheHits += values.filter(isNotNullish).length;
      this.statistics.numCacheMisses += values.filter(isNullish).length;

      return { values, skipped: false };
    } catch (error: unknown) {
      this.handleError(error, {
        location: 'cache.getMany',
        identifier: keys.map((key) => `${namespace}:${key}`),
      });
    }

    // If an error occurred and did not get thrown, we handle this as a cache miss
    return { values: keys.map(() => undefined), skipped: false };
  }

  /**
   * Set a cache value in the cache if it does not already exist.
   * This operation does nothing if the value already exists or is blocked.
   * @param namespace The namespace of the cached value (e.g. "user").
   * @param keyFunc A function to calculate the key of the cached value (e.g. the user ID: "123").
   * @param value  The value to cache.
   * @param opts.fetchedAt The timestamp when the value was fetched from the source.
   *                       Used to determine if the value is stale (time difference is above the stale threshold).
   *                       Timestamp is in UNIX milliseconds.
   * @param opts.expiresIn The expiration of the cached value in milliseconds.
   * @param opts.validate  Whether the cache value should be validated.
   *                       This is used to detect cache inconsistencies.
   *                       Defaults to false (no cache values are validated).
   */
  async setIfNotExist<T>(
    namespace: string,
    keyFunc: (input: T) => CacheKey,
    value: T,
    {
      fetchedAt,
      expiresIn,
      ...opts
    }: { fetchedAt: number; expiresIn?: number; validate?: boolean }
  ): Promise<void> {
    let key: CacheKey | undefined = undefined;

    try {
      // Calculate the key
      key = keyFunc(value);

      // Do not proceed if the namespace is disabled
      if (this.isNamespaceDisabled(namespace)) return;

      // Check if cache value should be validated
      if (opts.validate) {
        this.statistics.numCacheConsistencyChecks++;

        // Get the cached value
        const storageKey = this.getStorageKey(namespace, key);
        const cachedValueStr = await this.storage.get(storageKey);
        const valueStr = JSON.stringify(value);
        this.checkCacheConsistency(valueStr, cachedValueStr, {
          namespace,
          key,
        });
      }

      // Discard if value is stale (fetchedAt is older than stale threshold)
      const durationMs = Date.now() - fetchedAt;
      if (durationMs > this.config.staleThresholdMs) {
        this.logger.log(
          `Cache stale for key "${namespace}:${key}" as ${durationMs}ms passwd between fetching and writing to cache.`,
          {
            type: CacheMessageInfoType.CACHE_STALE,
            key,
            namespace,
            durationMs,
            staleThresholdMs: this.config.staleThresholdMs,
          }
        );
        return;
      }

      // Set the default expiration to 1 hour
      expiresIn = (expiresIn ?? this.config.defaultCacheExpirationMs) / 1000;

      // Execute the set command
      await this.storage.setIfNotExist(
        this.getStorageKey(namespace, key),
        JSON.stringify(value),
        {
          expiresIn,
        }
      );
    } catch (error: unknown) {
      this.handleError(error, {
        location: 'cache.setIfNotExist',
        identifier: `${namespace}:${key}`,
      });
    }
  }

  /**
   * Set multiple cache values in the cache if they do not already exist.
   * @param namespace The namespace of the cached values (e.g. "user").
   * @param keyFunc A function to calculate the key of the cached value (e.g. the user ID: "123").
   * @param values The values to cache.
   * @param opts.fetchedAt The timestamp when the value was fetched from the source. Used to determine if the value is stale (time difference is above the stale threshold). Timestamp is in UNIX milliseconds.
   * @param opts.expiresIn The expiration of the cached value in milliseconds.
   * @param opts.validate  Whether the cache value should be validated.
   *                       This is used to detect cache inconsistencies.
   *                       Defaults to false (no cache values are validated).
   * @return Nothing.
   */
  async setManyIfNotExist<T>(
    namespace: string,
    keyFunc: (input: T) => CacheKey,
    values: T[],
    {
      fetchedAt,
      expiresIn,
      ...opts
    }: { fetchedAt: number; expiresIn?: number; validate?: boolean }
  ): Promise<void> {
    let keys: CacheKey[] = [];

    try {
      keys = values.map((value) => keyFunc(value));

      // Do not proceed if writes are disabled or no values are provided
      if (values.length === 0) return;

      // Do not proceed if the namespace is disabled
      if (this.isNamespaceDisabled(namespace)) return;

      // Discard if values are stale (fetchedAt is older than stale threshold)
      const durationMs = Date.now() - fetchedAt;
      if (durationMs > this.config.staleThresholdMs) {
        this.logger.log(
          `Cache stale for namespace "${namespace}" as ${durationMs}ms passwd between fetching and writing to cache.`,
          {
            type: CacheMessageInfoType.CACHE_STALE,
            namespace,
            durationMs,
            key: keyFunc(values[0]),
            staleThresholdMs: this.config.staleThresholdMs,
          }
        );
        return;
      }

      // Check if cache value should be validated
      if (opts.validate) {
        this.statistics.numCacheConsistencyChecks += values.length;
        // Get the cached values
        // TODO
        const storageKeys = keys.map((key) =>
          this.getStorageKey(namespace, key)
        );
        const cachedValueStrs = await this.storage.getMany(storageKeys);

        // Compare the cached values with the new values
        cachedValueStrs.forEach((cachedValueStr, index) => {
          const value = values[index];
          const valueStr = JSON.stringify(value);
          this.checkCacheConsistency(valueStr, cachedValueStr, {
            namespace,
            key: keys[index],
          });
        });
      }

      // Set the default expiration to 1 hour
      expiresIn = (expiresIn ?? this.config.defaultCacheExpirationMs) / 1000;

      await this.storage.setManyIfNotExist(
        values.map((value) => ({
          key: this.getStorageKey(namespace, keyFunc(value)),
          value: JSON.stringify(value),
          expiresIn,
        }))
      );
    } catch (error: unknown) {
      this.handleError(error, {
        location: 'cache.setManyIfNotExist',
        identifier: keys.map((key) => `${namespace}:${key}`),
      });
    }
  }

  /**
   * Invalidate a cache value in the cache. Blocks the key for a short period of time to avoid timing bugs.
   * @param namespace The namespace of the cached value (e.g. "user").
   * @param key The key of the cached value (e.g. the user ID: "123").
   * @param opts.expiresIn The expiration of the blocked state in milliseconds.
   */
  async invalidate(
    namespace: string,
    key: CacheKey,
    { expiresIn }: { expiresIn?: number } = {}
  ): Promise<void> {
    // Set the default expiration of the blocked state
    expiresIn = Math.ceil(
      (expiresIn ?? this.config.blockedKeyExpirationMs) / 1000
    );

    // Set the key to blocked for the given expiration (EX)
    try {
      const storageKey = this.getStorageKey(namespace, key);
      await this.storage.set(storageKey, this.config.cacheKeyBlockedValue, {
        expiresIn,
      });
      this.statistics.numCacheInvalidations++;
    } catch (error: unknown) {
      this.handleError(error, {
        location: 'cache.invalidate',
        identifier: `${namespace}:${key}`,
      });
    }
  }

  /**
   * Invalidate multiple cache values in the cache. Blocks each key for a short period of time to avoid timing bugs.
   * @param keys Array of namespace and key pairs to invalidate.
   * @param opts.expiresIn The expiration of the blocked state in milliseconds.
   */
  async invalidateMany(
    keys: ReadonlyArray<{ namespace: string; key: CacheKey }>,
    { expiresIn }: { expiresIn?: number } = {}
  ): Promise<void> {
    // Do not proceed if writes are disabled or no keys are provided
    if (keys.length === 0) return;

    // Set the default expiration
    expiresIn = Math.ceil(
      (expiresIn ?? this.config.blockedKeyExpirationMs) / 1000
    );

    try {
      await this.storage.setMany(
        keys.map(({ key, namespace }) => ({
          key: this.getStorageKey(namespace, key),
          value: this.config.cacheKeyBlockedValue,
          expiresIn,
        }))
      );

      this.statistics.numCacheInvalidations += keys.length;
    } catch (error: unknown) {
      this.handleError(error, {
        location: 'cache.invalidateMany',
        identifier: keys.map(({ namespace, key }) => `${namespace}:${key}`),
      });
    }
  }

  /**
   * Private/ internal function to check the cache consistency.
   * @param valueStr The value to check.
   * @param cachedValueStr The cached value to check.
   * @param context The context in which the check is performed.
   */
  private checkCacheConsistency(
    valueStr: string,
    cachedValueStr: string | undefined,
    context: {
      namespace: string;
      key: CacheKey;
    }
  ): void {
    const { namespace, key } = context;
    if (
      cachedValueStr !== undefined &&
      cachedValueStr !== this.config.cacheKeyBlockedValue &&
      cachedValueStr !== valueStr
    ) {
      this.statistics.numCacheInconsistencies++;

      // Disable the namespace if a cache inconsistency is detected
      void this.disableNamespace(namespace);

      throw new CacheInconsistencyError(
        `Cache inconsistency detected for key "${namespace}:${key}".\nCached value: "${cachedValueStr}"\nCorrect value: "${valueStr}"`,
        {
          key,
          namespace,
          value: valueStr,
          cachedValue: cachedValueStr,
        }
      );
    }
  }

  /**
   * Private/ internal function to handle errors that occurred while handling the cache.
   * Handle an error that occurred while handling the cache.
   * @param error The error that occurred.
   * @param context The context in which the error occurred.
   */
  private handleError(
    error: unknown,
    context: {
      location: string;
      identifier: string | ReadonlyArray<string>;
    }
  ): void {
    // Handle CacheInconsistencyError
    if (error instanceof CacheInconsistencyError) {
      this.statistics.numCacheInconsistencies++;
      const message = `[${context.location}] ${error.message}`;
      this.logger.error(message, {
        type: CacheMessageInfoType.CACHE_INCONSISTENCY,
        key: error.key,
        cachedValue: error.cachedValue,
        namespace: error.namespace,
        value: error.value,
      });
    }
    // Handle CacheInputValidationError
    else if (error instanceof CacheInputValidationError) {
      const message = `[${context.location}] ${error.message}`;
      this.logger.error(message, {
        type: CacheMessageInfoType.INPUT_VALIDATION_ERROR,
        parameter: error.parameter,
        value: error.value,
      });
    }
    // Handle generic error
    else {
      this.statistics.numCacheErrors++;

      // Assemble error message
      const errorMessage = extractMessageFromError(error);
      const errorStack = extractStackFromError(error);
      let message = `[${context.location}] An error occurred`;
      if (Array.isArray(context.identifier)) {
        message += ` while handling cache for ${context.identifier
          .map((identifier) => `"${identifier}"`)
          .join(', ')}`;
      } else {
        message += ` while handling cache for "${context.identifier}"`;
      }
      message += `:\n${errorMessage}\n${errorStack}`;

      // Log the error
      this.logger.error(message, {
        type: CacheMessageInfoType.UNKNOWN_ERROR,
        error,
      });
    }

    // Re-throw the error if configured to do so
    if (this.config.throwOnError) {
      throw error;
    }
  }

  /**
   * Dump the entire contents of the cache.
   * This should only be used for debugging purposes.
   */
  async dumpCache(): Promise<{ [key: string]: string | undefined }> {
    const keys = await this.storage.getKeysByPattern(
      `${this.config.cachePrefix}:*`
    );
    const values = await this.storage.getMany(keys);
    const dump: { [key: string]: string | undefined } = {};
    keys.forEach((key, index) => {
      dump[key] = values[index];
    });
    return dump;
  }

  /**
   * Get caching statistics.
   * @returns The caching statistics.
   */
  getStatistics(): CacheStatistics {
    return { ...this.statistics };
  }

  /**
   * Reset caching statistics.
   */
  resetStatistics(): void {
    this.statistics.numCacheHits = 0;
    this.statistics.numCacheSkips = 0;
    this.statistics.numCacheMisses = 0;
    this.statistics.numCacheErrors = 0;
    this.statistics.numCacheInvalidations = 0;
    this.statistics.numCacheInconsistencies = 0;
    this.statistics.numCacheConsistencyChecks = 0;
    this.statistics.numCacheDisabledNamespaceSkips = 0;
  }

  /**
   * Enables the cache skipping feature. This restore the default behavior of cache skips.
   * This function only needs to be called if cache skips have been disabled in the first place.
   */
  enableCacheSkipping(): void {
    this.cacheSkippingDisabled = false;
  }

  /**
   * Disable the cache skipping feature. \
   * This is useful for local development to see how the application behaves with full cache hits. \
   * This is equivalent to setting skip: 0 for all cache read operations. \
   * This option takes precedence over forceCacheSkips.
   */
  disableCacheSkipping(): void {
    this.cacheSkippingDisabled = true;
  }

  /**
   * Check if a namespace is disabled.
   * @param namespace The namespace to check.
   * @returns True if the namespace is disabled, false otherwise.
   */
  private isNamespaceDisabled(namespace: string): boolean {
    if (!this.config.disableNamespaces) return false;
    return this.disabledNamespaces.includes(namespace);
  }

  /**
   * Disable a namespace.
   * @param namespace The namespace to disable.
   */
  private async disableNamespace(namespace: string): Promise<void> {
    if (!this.config.disableNamespaces) return;
    const storageKey = `${this.config.cachePrefix}:${this.config.disabledNamespacesKeyPrefix}:${namespace}`;
    await this.storage.set(storageKey, 'disabled', {
      expiresIn: this.config.disabledNamespaceExpirationMs / 1000,
    });

    // Synchronize the disabled namespaces from storage after disabling a namespace
    await this.synchronizeDisabledNamespaces();
  }

  /**
   * Synchronize the disabled namespaces.
   * This function is periodically called to synchronize the disabled namespaces from storage.
   */
  async synchronizeDisabledNamespaces(): Promise<void> {
    try {
      const prefix = `${this.config.cachePrefix}:${this.config.disabledNamespacesKeyPrefix}:`;
      const keys = await this.storage.getKeysByPattern(`${prefix}*`);
      this.disabledNamespaces = keys.map((key) => key.slice(prefix.length));
    } catch (error: unknown) {
      this.handleError(error, {
        location: 'cache.synchronizeDisabledNamespaces',
        identifier: 'disabled-namespaces',
      });
    }
  }

  /**
   * Get the disabled namespaces.
   * The namespaces are periodically synchronized from storage.
   * Therefore, only the namespaces that have been synchronized are returned.
   * @returns The disabled namespaces.
   */
  getDisabledNamespaces(): ReadonlyArray<string> {
    return [...this.disabledNamespaces];
  }

  /**
   * Add disabled namespaces.
   * Use this method if you want to manually handle namespace disabling.
   * @param namespaces The namespaces to add.
   */
  setDisabledNamespaces(...namespaces: string[]): void {
    this.disabledNamespaces = [...namespaces];
  }

  /**
   * Remove all disabled namespaces.
   * Use this method if you want to manually handle namespace disabling.
   */
  clearDisabledNamespaces(): void {
    this.disabledNamespaces = [];
  }
}
