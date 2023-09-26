import type { CacheLogLevel } from './logger/cache-logger.interface';

export type CacheKey = string | number | BigInt | boolean;

export interface CacheConfiguration {
  /** The prefix for all keys of this cache instance */
  cachePrefix: string;

  /** Optional version for the cache. This is useful to invalidate the cache when the data structure changes. */
  cacheVersion?: string;

  /** Whether to force cache skips. This is useful for local development and CI environments to validate every cache. */
  forceCacheSkips: boolean;

  /** Default expiration time in ms for cache entries */
  defaultCacheExpirationMs: number;

  /** Threshold in ms to consider data stale, causing the data to be discarded instead of writing it to the cache */
  staleThresholdMs: number;

  // Disabling namespaces
  /** Whether to disable namespaces on cache inconsistency */
  disableNamespaces: boolean;
  /** The prefix for the key to store disabled namespaces information in storage */
  disabledNamespacesKeyPrefix: string;
  /** The interval in ms to check synchronize disabled namespaces from storage */
  disabledNamespacesSyncIntervalMs: number;
  /** The expiration time in ms for disabling a namespace */
  disabledNamespaceExpirationMs: number;

  // Blocking keys
  /** The value written to a key to block it */
  cacheKeyBlockedValue: string;
  /** The expiration time in ms for blocking a key */
  blockedKeyExpirationMs: number;

  // Error handling
  /** Whether to throw if an error occurrs */
  throwOnError: boolean;

  // Logging
  /** Whether logging is enabled */
  loggingEnabled: boolean;
  /** The log levels to log */
  logLevels: CacheLogLevel[];

  // Random
  /** The seed for the random number generator */
  randomGeneratorSeed: string;
}

export interface CacheStatistics {
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
