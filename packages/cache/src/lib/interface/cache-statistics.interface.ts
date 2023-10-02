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
