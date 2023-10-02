import type { CacheLogLevel } from '../logger/cache-logger.interface';

export interface CacheConfiguration {
  /**
   * The prefix for all keys of this cache instance.\
   * Defaults to "cache"
   */
  cachePrefix: string;

  /**
   * Optional version for the cache. This can be used to invalidate the cache when the data structure has changed.\
   * Defaults to "undefined"
   */
  cacheVersion?: string;

  /**
   * Whether to force cache skips. This is useful for local development and CI environments to validate every cache.\
   * Defaults to "false"
   */
  forceCacheSkips: boolean;

  /**
   * Default expiration time in ms for cache entries.\
   * Defaults to 24 hours
   */
  defaultCacheExpirationMs: number;

  /**
   * Threshold in ms to consider data stale, causing the data to be discarded instead of writing it to the cache.\
   * Defaults to 2 seconds
   */
  staleThresholdMs: number;

  // Disabling namespaces
  /**
   * Whether to disable namespaces on cache inconsistency.\
   * Defaults to "false"
   */
  disableNamespaces: boolean;

  /**
   * The prefix for the key to store disabled namespaces information in storage.\
   * Defaults to "disabled-namespaces"
   */
  disabledNamespacesKeyPrefix: string;

  /**
   * The interval in ms to check synchronize disabled namespaces from storage.\
   * Defaults to 30 seconds
   */
  disabledNamespacesSyncIntervalMs: number;

  /**
   * The expiration time in ms for disabling a namespace.\
   * Defaults to 24 hours
   */
  disabledNamespaceExpirationMs: number;

  // Blocking keys
  /**
   * The value written to a key to block it.\
   * Defaults to "blocked"
   */
  cacheKeyBlockedValue: string;

  /**
   * The expiration time in ms for blocking a key.\
   * Defaults to 10 seconds
   */
  blockedKeyExpirationMs: number;

  // Error handling
  /**
   * Whether to throw if an error occurrs.\
   * Defaults to "false"
   */
  throwOnError: boolean;

  // Logging
  /**
   * Whether logging is enabled.\
   * Defaults to "true"
   */
  loggingEnabled: boolean;

  /**
   * The log levels to log.\
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
