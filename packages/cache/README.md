<p align="center">
  <a href="https://skylinejs.com/docs/caching" target="blank"><img src="https://raw.githubusercontent.com/skylinejs/skyline/main/apps/docs/static/img/skylinejs-social.png" width="100%" alt="Skyline" /></a>
</p>

<p align="center">
Fast, reliable and zero dependency cache with built-in cache inconsistency observability and reporting.
</p>
<br />

The Skyline cache library is designed for mission critical production environments. To achieve the necessary reliability, a cache inconsistency observability strategy is forced on the developer. This ensures that the number of occurrences as well as the impact of cache inconsistencies in production is kept to an absolute minimum.

The cache inconsistency observability strategy is comprised of the following measurements:

- **Staleness checking**: Caching a value is only possible when providing a `fetchedAt` timestamp. This way, a value gets discarded if it was fetched from the source of truth too long ago (late write). This can happen due to a slow connection or the application performance is degraded (e.g, the event loop is blocked for longer times)
- **Key blocking**: To avoid timing bugs, the invalidation of a cache key blocks the key for a certain amount of time. While blocked, no one can write to this cache key. This avoids timing bugs where a late read-through caching operation writes an incorrect value to cache.
- **Schema validation**: Every value read from the cache has to be validated via a validation function. This prevents inconsistent values from entering the application. This can easily happen if the schema or structure of a cached value has changed but the cache has not been cleared/ invalidated.
- **Visibility**: Inconsistent caches will nevertheless occurr in production. Caching is to complex. A pragmatic approach to this reality is to make cache inconsistencies (1) visible and (2) reduce their impact. This is accomplished by providing a cache validation probability as well as reporting functionality to log when a cache inconsistency was detected.

The validation probability parameter allows for a gradual rollout of a newly cached value on a per-feature basis. The longer a cache works in production without producing any inconsistencies, the greater the confidence and therefore less cache requests need to get validated.

<br />

# Getting started

Install `@skyline-js/cache` using your preferred package manager:

```sh
npm install @skyline-js/cache
```

This is a minimal example of how to set and retrieve a key from the cache:

```ts
import { SkylineCache } from '@skyline-js/cache';

const cache = new SkylineCache();

// Cache the user with ID 1 under the "user" namespace
await cache.setIfNotExist(
  'user',
  (user) => user.id,
  { id: 1, name: 'John Doe' },
  { fetchedAt: Date.now() }
);

// Get the user with ID 1 from the cache
const { value: user } = await cache.get(
  'user',
  1,
  (user): asserts user is { id: number; name: string } => {}
);

console.log(user);
```

This is a minimal useful example on implementing a read-through cache:

```ts
import { SkylineCache } from '@skyline-js/cache';

const cache = new SkylineCache();

interface User {
  id: number;
  name: string;
}

function isUserOrThrow(user: unknown): asserts user is User {
  if (
    !user ||
    typeof user !== 'object' ||
    typeof user?.id !== 'number' ||
    typeof user?.name !== 'string'
  ) {
    throw new Error(`Invalid cached user value!`);
  }
}

async function getUserById(userId: number): User | undefined {
  // Check the cache, skip the cache read with a 50% probability
  let { value, skipped } = await cache.get('user', userId, isUserOrThrow, {
    skip: 0.5,
  });

  // If value was not found in the cache, check the database
  if (!value) {
    const fetchedAt = Date.now();
    // Perform your database query here ...
    value = { id: 1, name: 'John Doe' };

    // Write the retrieved value to cache as it was not found in the cache earlier.
    // Validate the currently cached value with the fetched one if the cache read was skipped
    await cache.setIfNotExist('user', (user) => user.id, value, {
      fetchedAt,
      validate: skipped,
    });
  }

  return value;
}
```

This example shows a simple yet powerful control flow.

<!-- As you can see, Skyline is not your usual cache with simple `cache.set` and `cache.get` functions. This is intentional - let's get the ball rolling. -->

# API Reference

<!-- <Include path="apps/docs/docs/api-reference/cache.md" skipLines="18"> -->

Installation

```sh
npm install @skyline-js/cache
```

<MonacoEditor height="200px">

```ts
import { SkylineCache } from '@skyline-js/cache';

const cache = new SkylineCache();
```

</MonacoEditor>

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
    opts: { fetchedAt: number; expiresIn?: number; validate?: boolean }
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
    opts: { fetchedAt: number; expiresIn?: number; validate?: boolean }
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
    opts: { expiresIn?: number } = {}
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
    opts: { expiresIn?: number } = {}
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

  // === Disabling namespaces ===
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

  // === Blocking keys ===
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

  // === Error handling ===
  /**
   * Whether to throw if an error occurrs.
   * Defaults to "false"
   */
  throwOnError: boolean;

  // === Logging ===
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

  // === Random ===
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

<!-- </Include> -->
