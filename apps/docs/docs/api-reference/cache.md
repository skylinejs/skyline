---
sidebar_position: 2
label: cache
slug: cache
---

# `@skyline-js/cache`

:::info

This is the API reference for the `@skyline-js/cache` package. <br />
The guiding principles of the Skyline caching approach can be found here: [Caching Primer](/docs/caching).

:::

## SkylineCache

```ts
const cache = new SkylineCache({});
```

### cache.get

Get a value from the cache.

```ts
  get<T>(
    namespace: string,
    key: CacheKey,
    validator: (input: unknown) => asserts input is T,
    opts: { skip?: number } = {}
  ): Promise<{ value: T | undefined; skipped: boolean }>
```

| Parameter   |                                                                                                                                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `namespace` | The namespace of the cached value (e.g. "user").                                                                                                                                                                                                                |
| `key`       | The key of the cached value (e.g. the user ID: "123")                                                                                                                                                                                                           |
| `validator` | A validator function to validate the cached value.                                                                                                                                                                                                              |
| `opts.skip` | A probability between 0 and 1 whether the cache read should be skipped. This is used to detect cache inconsistencies. If the cache read is skipped, the function artifically returns "undefined" (= cache miss). Defaults to 0 (0% of cache reads are skipped). |
| returns     | The cached value if it exists and is valid, "undefined" otherwise.                                                                                                                                                                                              |

### cache.getMany

Get multiple values from the cache.

```ts
getMany<T>(
    namespace: string,
    keys: ReadonlyArray<CacheKey>,
    validator: (input: unknown) => asserts input is T,
    opts: { skip?: number } = {}
  ): Promise<{ values: Array<T | undefined>; skipped: boolean }>
```

| Parameter   |                                                                                                                                                                                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `namespace` | The namespace of the cached values (e.g. "user").                                                                                                                                                                                                               |
| `keys`      | The keys of the cached values (e.g. the user IDs: ["123", "456"])                                                                                                                                                                                               |
| `validator` | A validator function to validate each cached value.                                                                                                                                                                                                             |
| `opts.skip` | A probability between 0 and 1 whether the cache read should be skipped. This is used to detect cache inconsistencies. If the cache read is skipped, the function artifically returns "undefined" (= cache miss). Defaults to 0 (0% of cache reads are skipped). |
| returns     | An array containing the cached values if they exist and are valid, "undefined" otherwise. The order of the array is the same as the order of the input keys. The length of the array is the same as the length of the input keys.                               |

### cache.setIfNotExist

Set a cache value in the cache if it does not already exist. This operation does nothing if the value already exists or is blocked.

```ts
setIfNotExist<T>(
    namespace: string,
    keyFunc: (input: T) => CacheKey,
    value: T,
    {
      fetchedAt,
      expiresIn,
      ...opts
    }: { fetchedAt: number; expiresIn?: number; validate?: boolean }
  ): Promise<void>
```

| Parameter        |                                                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `namespace`      | The namespace of the cached value (e.g. "user").                                                                                                                                     |
| `keyFunc`        | A function to calculate the key of the cached value (e.g. the user ID: "123").                                                                                                       |
| `value`          | The value to cache.                                                                                                                                                                  |
| `opts.fetchedAt` | The timestamp when the value was fetched from the source. Used to determine if the value is stale (time difference is above the stale threshold). Timestamp is in UNIX milliseconds. |
| `opts.expiresIn` | The expiration of the cached value in milliseconds.                                                                                                                                  |
| `opts.validate`  | Whether the cache value should be validated. This is used to detect cache inconsistencies. Defaults to false (no cache values are validated).                                        |

### cache.setManyIfNotExist

Set multiple cache values in the cache if they do not already exist.

```ts
setManyIfNotExist<T>(
    namespace: string,
    keyFunc: (input: T) => CacheKey,
    values: T[],
    {
      fetchedAt,
      expiresIn,
      ...opts
    }: { fetchedAt: number; expiresIn?: number; validate?: boolean }
  ): Promise<void>
```

| Parameter        |                                                                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `namespace`      | The namespace of the cached values (e.g. "user").                                                                                                                                    |
| `keyFunc`        | A function to calculate the key of the cached value (e.g. the user ID: "123").                                                                                                       |
| `value`          | The values to cache.                                                                                                                                                                 |
| `opts.fetchedAt` | The timestamp when the value was fetched from the source. Used to determine if the value is stale (time difference is above the stale threshold). Timestamp is in UNIX milliseconds. |
| `opts.expiresIn` | The expiration of the cached value in milliseconds.                                                                                                                                  |
| `opts.validate`  | Whether the cache value should be validated. This is used to detect cache inconsistencies. Defaults to false (no cache values are validated).                                        |

### cache.invalidate

Invalidate a cache value in the cache. Blocks the key for a short period of time to avoid timing bugs.

```ts
invalidate(
    namespace: string,
    key: CacheKey,
    { expiresIn }: { expiresIn?: number } = {}
  ): Promise<void>
```

| Parameter        |                                                        |
| ---------------- | ------------------------------------------------------ |
| `namespace`      | The namespace of the cached value (e.g. "user").       |
| `key`            | The key of the cached value (e.g. the user ID: "123"). |
| `opts.expiresIn` | The expiration of the blocked state in milliseconds.   |

### cache.invalidateMany

Invalidate multiple cache values in the cache. Blocks each key for a short period of time to avoid timing bugs.

```ts
invalidateMany(
    keys: ReadonlyArray<{ namespace: string; key: CacheKey }>,
    { expiresIn }: { expiresIn?: number } = {}
  ): Promise<void>
```

| Parameter        |                                                      |
| ---------------- | ---------------------------------------------------- |
| `keys`           | Array of namespace and key pairs to invalidate.      |
| `opts.expiresIn` | The expiration of the blocked state in milliseconds. |

### cache.getStatistics

Get caching statistics.

```ts
getStatistics(): CacheStatistics
```

### cache.resetStatistics

Reset caching statistics.

```ts
resetStatistics(): void
```

### cache.enableCacheSkipping

Enables the cache skipping feature. This restore the default behavior of cache skips.
This function only needs to be called if cache skips have been disabled in the first place.

```ts
enableCacheSkipping(): void
```

### cache.disableCacheSkipping

Disable the cache skipping feature.
This is useful for local development to see how the application behaves with full cache hits.
This is equivalent to setting skip: 0 for all cache read operations.
This option takes precedence over forceCacheSkips.

```ts
disableCacheSkipping(): void
```

### cache.synchronizeDisabledNamespaces

Synchronize the disabled namespaces.
This function is periodically called to synchronize the disabled namespaces from storage.

```ts
synchronizeDisabledNamespaces(): Promise<void>
```

### cache.getDisabledNamespaces

Get the disabled namespaces.
The namespaces are periodically synchronized from storage.
Therefore, only the namespaces that have been synchronized are returned.

```ts
getDisabledNamespaces(): string[]
```

### cache.setDisabledNamespaces

Set disabled namespaces.
Use this method if you want to manually handle namespace disabling.

```ts
setDisabledNamespaces(...namespaces: string[]): void
```

| Parameter    |                            |
| ------------ | -------------------------- |
| `namespaces` | The namespaces to disable. |

### cache.clearDisabledNamespaces

Remove all disabled namespaces.
Use this method if you want to manually handle namespace disabling.

```ts
clearDisabledNamespaces(): void
```

<br />

## Interfaces

### CacheConfiguration

```ts path="packages/cache/src/lib/interface/cache-configuration.interface.ts" skipLines="2" remove="export "
interface CacheConfiguration {
  /**
   * The prefix for all keys of this cache instance.
   * Defaults to "cache"
   */
  cachePrefix: string;

  /**
   * Optional version for the cache. This can be used to invalidate the cache when the data structure has changed.
   * Defaults to "undefined"
   */
  cacheVersion?: string;

  /**
   * Whether to force cache skips. This is useful for local development and CI environments to validate every cache.
   * Defaults to "false"
   */
  forceCacheSkips: boolean;

  /**
   * Default expiration time in ms for cache entries.
   * Defaults to 24 hours
   */
  defaultCacheExpirationMs: number;

  /**
   * Threshold in ms to consider data stale, causing the data to be discarded instead of writing it to the cache.
   * Defaults to 2 seconds
   */
  staleThresholdMs: number;

  // Disabling namespaces
  /**
   * Whether to disable namespaces on cache inconsistency.
   * Defaults to "false"
   */
  disableNamespaces: boolean;

  /**
   * The prefix for the key to store disabled namespaces information in storage.
   * Defaults to "disabled-namespaces"
   */
  disabledNamespacesKeyPrefix: string;

  /**
   * The interval in ms to check synchronize disabled namespaces from storage.
   * Defaults to 30 seconds
   */
  disabledNamespacesSyncIntervalMs: number;

  /**
   * The expiration time in ms for disabling a namespace.
   * Defaults to 24 hours
   */
  disabledNamespaceExpirationMs: number;

  // Blocking keys
  /**
   * The value written to a key to block it.
   * Defaults to "blocked"
   */
  cacheKeyBlockedValue: string;

  /**
   * The expiration time in ms for blocking a key.
   * Defaults to 10 seconds
   */
  blockedKeyExpirationMs: number;

  // Error handling
  /**
   * Whether to throw if an error occurrs.
   * Defaults to "false"
   */
  throwOnError: boolean;

  // Logging
  /**
   * Whether logging is enabled.
   * Defaults to "true"
   */
  loggingEnabled: boolean;

  /**
   * The log levels to log.
   * Defaults to all available log levels
   */
  logLevels: CacheLogLevel[];

  // Random
  /**
   * The seed for the random number generator
   * Defaults to "cache-rnd-seed"
   */
  randomGeneratorSeed: string;
}
```

### CacheStatistics

```ts path="packages/cache/src/lib/interface/cache-statistics.interface.ts" remove="export "
interface CacheStatistics {
  /** Number of cache hits */
  numCacheHits: number;

  /** Number of cache misses */
  numCacheMisses: number;

  /** Number of cache skips */
  numCacheSkips: number;

  /** Number of cache skips due to disabled namespaces */
  numCacheDisabledNamespaceSkips: number;

  /** Number of cache invalidations */
  numCacheInvalidations: number;

  /** Number of cache consistency checks */
  numCacheConsistencyChecks: number;

  /** Number of cache inconsistencies */
  numCacheInconsistencies: number;

  /** Number of unknown cache errors */
  numCacheErrors: number;
}
```

### CacheKey

The type a cache key can have. `undefined` and `null` are explicitly excluded.

```ts path="packages/cache/src/lib/interface/cache-key.type.ts" remove="export "
type CacheKey = string | number | BigInt | boolean;
```
