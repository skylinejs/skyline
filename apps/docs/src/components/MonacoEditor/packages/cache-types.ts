export default `
declare module "packages/cache/src/lib/interface/cache-key.type" {
    export type CacheKey = string | number | BigInt | boolean;
}
declare module "packages/cache/src/lib/cache-error" {
    import type { CacheKey } from "packages/cache/src/lib/interface/cache-key.type";
    export class CacheInconsistencyError extends Error {
        readonly key: CacheKey;
        readonly namespace: string;
        readonly value: string;
        readonly cachedValue: string;
        constructor(message: string, context: {
            key: CacheKey;
            namespace: string;
            value: string;
            cachedValue: string;
        });
    }
    export class CacheInputValidationError extends Error {
        readonly parameter: string;
        readonly value: unknown;
        constructor(message: string, context: {
            parameter: string;
            value: unknown;
        });
    }
    export class CacheStorageEngineError extends Error {
        readonly operation: string;
        readonly storageEninge: string;
        constructor(message: string, context: {
            operation: string;
            storageEninge: string;
        });
    }
}
declare module "packages/cache/src/lib/logger/cache-logger.interface" {
    import type { CacheKey } from "packages/cache/src/lib/interface/cache-key.type";
    export interface CacheLoggerConfiguration {
        enabled: boolean;
        logLevels: CacheLogLevel[];
    }
    export enum CacheLogLevel {
        LOG = "log",
        WARN = "warn",
        ERROR = "error"
    }
    export enum CacheMessageInfoType {
        CACHE_STALE = "cache_stale",
        UNKNOWN_ERROR = "unknown_error",
        CACHE_INCONSISTENCY = "cache_inconsistency",
        STORAGE_ENGINE_ERROR = "storage_engine_error",
        INPUT_VALIDATION_ERROR = "input_validation_error"
    }
    interface CacheMessageInfo {
        type: CacheMessageInfoType;
    }
    export interface CacheStaleMessageInfo extends CacheMessageInfo {
        type: CacheMessageInfoType.CACHE_STALE;
        key: CacheKey;
        namespace: string;
        durationMs: number;
        staleThresholdMs: number;
    }
    export interface CacheUnknownErrorMessageInfo extends CacheMessageInfo {
        type: CacheMessageInfoType.UNKNOWN_ERROR;
        error: unknown;
    }
    export interface CacheInconsistencyMessageInfo extends CacheMessageInfo {
        type: CacheMessageInfoType.CACHE_INCONSISTENCY;
        key: CacheKey;
        namespace: string;
        value: string;
        cachedValue: string;
    }
    export interface CacheInputValidationErrorMessageInfo extends CacheMessageInfo {
        type: CacheMessageInfoType.INPUT_VALIDATION_ERROR;
        parameter: string;
        value: unknown;
    }
    export type CacheMessageInfoUnion = CacheStaleMessageInfo | CacheUnknownErrorMessageInfo | CacheInconsistencyMessageInfo | CacheInputValidationErrorMessageInfo;
}
declare module "packages/cache/src/lib/interface/cache-configuration.interface" {
    import type { CacheLogLevel } from "packages/cache/src/lib/logger/cache-logger.interface";
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
        /**
         * Whether to throw if an error occurrs.\
         * Defaults to "false"
         */
        throwOnError: boolean;
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
        /**
         * The seed for the random number generator
         * Defaults to "cache-rnd-seed"
         */
        randomGeneratorSeed: string;
    }
}
declare module "packages/cache/src/lib/interface/cache-statistics.interface" {
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
}
declare module "packages/cache/src/lib/cache.utils" {
    export function isNotNullish<T>(el: T | null | undefined): el is T;
    export function isNullish<T>(value?: T | null | undefined): value is null | undefined;
    export function extractMessageFromError(error: unknown): string | undefined;
    export function extractStackFromError(error: unknown): string | undefined;
    /**
     * Get a random number generator based on a seed string
     * @param seed The seed string
     * @returns A random number generator that produces a number between 0 and 1
     */
    export function getRandomNumberGenerator(seed?: string): () => number;
}
declare module "packages/cache/src/lib/logger/cache-logger" {
    import { CacheLoggerConfiguration, CacheMessageInfoUnion } from "packages/cache/src/lib/logger/cache-logger.interface";
    export class CacheLogger {
        private readonly config?;
        constructor(config?: Partial<CacheLoggerConfiguration>);
        log(message: string, info: CacheMessageInfoUnion): void;
        warn(message: string, info: CacheMessageInfoUnion): void;
        error(message: string, info: CacheMessageInfoUnion): void;
    }
}
declare module "packages/cache/src/lib/storage-engine/cache-storage-engine" {
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
        abstract set(key: string, value: string, opts?: {
            expiresIn?: number;
        }): Promise<unknown>;
        abstract setMany(inputs: {
            key: string;
            value: string;
            expiresIn?: number;
        }[]): Promise<unknown>;
        /**
         * Set a value for a key if it does not exist yet.
         * @param key The key to set the value for.
         * @param value The value to set.
         * @param opts.expiresIn The time in milliseconds after which the value should expire.
         */
        abstract setIfNotExist(key: string, value: string, opts?: {
            expiresIn?: number;
        }): Promise<unknown>;
        abstract setManyIfNotExist(inputs: {
            key: string;
            value: string;
            expiresIn?: number;
        }[]): Promise<unknown>;
    }
}
declare module "packages/cache/src/lib/storage-engine/in-memory-cache-storage-engine" {
    import { CacheStorageEngine } from "packages/cache/src/lib/storage-engine/cache-storage-engine";
    interface InMemoryCacheStorageEngineConfiguration {
        periodicCleanup?: boolean;
        cleanupIntervalMs: number;
    }
    /**
     * A cache storage engine that stores the cache in memory.
     */
    export class InMemoryCacheStorageEngine extends CacheStorageEngine {
        private readonly config;
        private readonly cache;
        constructor(config?: Partial<InMemoryCacheStorageEngineConfiguration>);
        /**
         * Get a value from the cache
         * @param key The key to get the value for
         * @returns The value or "undefined" if not found
         */
        get(key: string): Promise<string | undefined>;
        getMany(keys: string[]): Promise<Array<string | undefined>>;
        ttl(key: string): Promise<number | undefined>;
        /**
         * Get all keys matching a pattern. The pattern can contain "*" as a wildcard, which matches any number of characters (including zero)
         * @param pattern The pattern to match
         * @returns The keys matching the pattern
         */
        getKeysByPattern(_pattern: string): Promise<string[]>;
        /**
         * Set a value for a key.
         * @param key The key to set the value for.
         * @param value The value to set.
         * @param opts.expiresIn The time in milliseconds after which the value should expire.
         */
        set(key: string, value: string, opts?: {
            expiresIn?: number;
        }): Promise<void>;
        setMany(inputs: {
            key: string;
            value: string;
            expiresIn?: number;
        }[]): Promise<void>;
        setIfNotExist(key: string, value: string, opts?: {
            expiresIn?: number;
        }): Promise<void>;
        setManyIfNotExist(inputs: {
            key: string;
            value: string;
            expiresIn?: number;
        }[]): Promise<void>;
    }
}
declare module "packages/cache/src/lib/cache" {
    import { CacheConfiguration } from "packages/cache/src/lib/interface/cache-configuration.interface";
    import { CacheStatistics } from "packages/cache/src/lib/interface/cache-statistics.interface";
    import { CacheKey } from "packages/cache/src/lib/interface/cache-key.type";
    import { CacheLogger } from "packages/cache/src/lib/logger/cache-logger";
    import { CacheStorageEngine } from "packages/cache/src/lib/storage-engine/cache-storage-engine";
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
        private readonly config;
        private readonly storage;
        private readonly logger;
        private readonly random;
        /** Whether the cache skipping feature is disabled */
        private cacheSkippingDisabled;
        /** Disabled namespaces (e.g., due to detected cache inconsistency) */
        private disabledNamespaces;
        /** Cache statistics */
        private readonly statistics;
        constructor({ config, storage, logger, }?: {
            config?: Partial<CacheConfiguration>;
            storage?: CacheStorageEngine;
            logger?: CacheLogger | typeof CacheLogger;
        });
        /**
         * Get the storage key for a given namespace and key.
         * Takes the cache prefix and cache version into account if configured.
         * @param namespace The namespace.
         * @param key The key.
         * @returns The storage key.
         */
        private getStorageKey;
        /**
         * Get a value from the cache.
         * @param namespace The namespace of the cached value (e.g. "user").
         * @param key The key of the cached value (e.g. the user ID: "123")
         * @param validator A validator function to validate the cached value.
         * @param opts.skip A probability between 0 and 1 whether the cache read should be skipped.
         *                  This is used to detect cache inconsistencies.
         *                  If the cache read is skipped, the function artifically returns "undefined" (= cache miss).
         *                  Defaults to 0 (0% of cache reads are skipped).
         * @returns The cached value if it exists and is valid, "undefined" otherwise.
         */
        get<T>(namespace: string, key: CacheKey, validator: (input: unknown) => asserts input is T, opts?: {
            skip?: number;
        }): Promise<{
            value: T | undefined;
            skipped: boolean;
        }>;
        /**
         * Get multiple values from the cache.
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
        getMany<T>(namespace: string, keys: ReadonlyArray<CacheKey>, validator: (input: unknown) => asserts input is T, opts?: {
            skip?: number;
        }): Promise<{
            values: Array<T | undefined>;
            skipped: boolean;
        }>;
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
        setIfNotExist<T>(namespace: string, keyFunc: (input: T) => CacheKey, value: T, { fetchedAt, expiresIn, ...opts }: {
            fetchedAt: number;
            expiresIn?: number;
            validate?: boolean;
        }): Promise<void>;
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
         */
        setManyIfNotExist<T>(namespace: string, keyFunc: (input: T) => CacheKey, values: T[], { fetchedAt, expiresIn, ...opts }: {
            fetchedAt: number;
            expiresIn?: number;
            validate?: boolean;
        }): Promise<void>;
        /**
         * Invalidate a cache value in the cache. Blocks the key for a short period of time to avoid timing bugs.
         * @param namespace The namespace of the cached value (e.g. "user").
         * @param key The key of the cached value (e.g. the user ID: "123").
         * @param opts.expiresIn The expiration of the blocked state in milliseconds.
         */
        invalidate(namespace: string, key: CacheKey, { expiresIn }?: {
            expiresIn?: number;
        }): Promise<void>;
        /**
         * Invalidate multiple cache values in the cache. Blocks each key for a short period of time to avoid timing bugs.
         * @param keys Array of namespace and key pairs to invalidate.
         * @param opts.expiresIn The expiration of the blocked state in milliseconds.
         */
        invalidateMany(keys: ReadonlyArray<{
            namespace: string;
            key: CacheKey;
        }>, { expiresIn }?: {
            expiresIn?: number;
        }): Promise<void>;
        /**
         * Private/ internal function to check the cache consistency.
         * @param valueStr The value to check.
         * @param cachedValueStr The cached value to check.
         * @param context The context in which the check is performed.
         */
        private checkCacheConsistency;
        /**
         * Private/ internal function to handle errors that occurred while handling the cache.
         * Handle an error that occurred while handling the cache.
         * @param error The error that occurred.
         * @param context The context in which the error occurred.
         */
        private handleError;
        /**
         * Dump the entire contents of the cache.
         * This should only be used for debugging purposes.
         */
        dumpCache(): Promise<{
            [key: string]: string | undefined;
        }>;
        /**
         * Get caching statistics.
         * @returns The caching statistics.
         */
        getStatistics(): CacheStatistics;
        /**
         * Reset caching statistics.
         */
        resetStatistics(): void;
        /**
         * Enables the cache skipping feature. This restore the default behavior of cache skips. \
         * This function only needs to be called if cache skips have been disabled in the first place.
         */
        enableCacheSkipping(): void;
        /**
         * Disable the cache skipping feature. \
         * This is useful for local development to see how the application behaves with full cache hits. \
         * This is equivalent to setting skip: 0 for all cache read operations. \
         * This option takes precedence over forceCacheSkips.
         */
        disableCacheSkipping(): void;
        /**
         * Private/ internal function to check if a namespace is disabled.
         * @param namespace The namespace to check.
         * @returns True if the namespace is disabled, false otherwise.
         */
        private isNamespaceDisabled;
        /**
         * Private/ internal function to disable a namespace.
         * @param namespace The namespace to disable.
         */
        private disableNamespace;
        /**
         * Synchronize the disabled namespaces.
         * This function is periodically called to synchronize the disabled namespaces from storage.
         */
        synchronizeDisabledNamespaces(): Promise<void>;
        /**
         * Get the disabled namespaces.
         * The namespaces are periodically synchronized from storage.
         * Therefore, only the namespaces that have been synchronized are returned.
         * @returns The disabled namespaces.
         */
        getDisabledNamespaces(): string[];
        /**
         * Set disabled namespaces.
         * Use this method if you want to manually handle namespace disabling.
         * @param namespaces The namespaces to disable.
         */
        setDisabledNamespaces(...namespaces: string[]): void;
        /**
         * Remove all disabled namespaces.
         * Use this method if you want to manually handle namespace disabling.
         */
        clearDisabledNamespaces(): void;
    }
}
declare module "packages/cache/src/lib/storage-engine/redis-cache-storage-engine.interface" {
    /**
     * ioredis client interface
     */
    export interface IoRedisClient {
        multi(options: {
            pipeline: false;
        }): Promise<'OK'>;
        multi(): IoRedisChainableCommander;
        multi(options: {
            pipeline: true;
        }): IoRedisChainableCommander;
        multi(commands?: unknown[][]): IoRedisChainableCommander;
        get(key: string): Promise<string | null | undefined>;
        mget(keys: string[]): Promise<Array<string | null | undefined>>;
        keys(pattern: string): Promise<string[]>;
    }
    type Callback<T = any> = (err?: Error | null, result?: T) => void;
    interface IoRedisChainableCommander {
        exec(callback?: Callback<[error: Error | null, result: unknown][] | null>): Promise<[error: Error | null, result: unknown][] | null>;
        set(key: string, value: string): IoRedisChainableCommander;
        set(key: string, value: string, secondsToken: 'EX', seconds: number | string): IoRedisChainableCommander;
        set(key: string, value: string, nx: 'NX'): IoRedisChainableCommander;
        set(key: string, value: string, secondsToken: 'EX', seconds: number | string, nx: 'NX'): IoRedisChainableCommander;
    }
    /**
     * node-redis client interface
     */
    export interface NodeRedisClient {
        multi: () => NodeRedisClientMultiCommand;
        get(key: string): Promise<string | null | undefined>;
        mGet(keys: string[]): Promise<Array<string | null | undefined>>;
        keys(pattern: string): Promise<string[]>;
    }
    type MaximumOneOf<T, K extends keyof T = keyof T> = K extends keyof T ? {
        [P in K]?: T[K];
    } & Partial<Record<Exclude<keyof T, K>, never>> : never;
    type SetTTL = MaximumOneOf<{
        EX: number;
        PX: number;
        EXAT: number;
        PXAT: number;
        KEEPTTL: true;
    }>;
    type SetGuards = MaximumOneOf<{
        NX: true;
        XX: true;
    }>;
    interface SetCommonOptions {
        GET?: true;
    }
    type NodeRedisSetOptions = SetTTL & SetGuards & SetCommonOptions;
    interface NodeRedisClientMultiCommand {
        exec(): Promise<Array<any>>;
        set(key: string, value: string, options: NodeRedisSetOptions): NodeRedisClientMultiCommand;
    }
    /**
     * Unified redis client interface
     */
    export interface RedisClient {
        multi(): RedisClientChainable;
        get(key: string): Promise<string | null | undefined>;
        mget(keys: string[]): Promise<Array<string | null | undefined>>;
        keys(pattern: string): Promise<string[]>;
    }
    interface RedisClientChainable {
        exec(): Promise<unknown>;
        set(key: string, value: string, options: {
            ex?: number;
            nx?: boolean;
        }): RedisClientChainable;
    }
}
declare module "packages/cache/src/lib/storage-engine/redis-cache-storage-engine.utils" {
    import { IoRedisClient, NodeRedisClient, RedisClient } from "packages/cache/src/lib/storage-engine/redis-cache-storage-engine.interface";
    export function getRedisClientFromNodeOrIoRedisClient(client: IoRedisClient | NodeRedisClient): RedisClient;
    export function getRedisClientFromNodeRedisClient(client: NodeRedisClient): RedisClient;
    export function getRedisClientFromIoRedisClient(client: IoRedisClient): RedisClient;
}
declare module "packages/cache/src/lib/storage-engine/redis-cache-storage-engine" {
    import { CacheStorageEngine } from "packages/cache/src/lib/storage-engine/cache-storage-engine";
    import { IoRedisClient, NodeRedisClient } from "packages/cache/src/lib/storage-engine/redis-cache-storage-engine.interface";
    /**
     * A cache storage engine that stores the cache in Redis.
     */
    export class RedisCacheStorageEngine extends CacheStorageEngine {
        private readonly redis;
        constructor({ redis }: {
            redis: IoRedisClient | NodeRedisClient;
        });
        get(key: string): Promise<string | undefined>;
        getMany(keys: string[]): Promise<Array<string | undefined>>;
        getKeysByPattern(pattern: string): Promise<string[]>;
        setMany(inputs: {
            key: string;
            value: string;
            expiresIn: number;
        }[]): Promise<unknown>;
        set(key: string, value: string, opts: {
            expiresIn: number;
        }): Promise<unknown>;
        setIfNotExist(key: string, value: string, opts: {
            expiresIn: number;
        }): Promise<unknown>;
        setManyIfNotExist(inputs: {
            key: string;
            value: string;
            expiresIn: number;
        }[]): Promise<unknown>;
    }
}
declare module "@skyline-js/cache" {
    export * from "packages/cache/src/lib/cache";
    export * from "packages/cache/src/lib/cache-error";
    export * from "packages/cache/src/lib/interface/cache-key.type";
    export * from "packages/cache/src/lib/interface/cache-statistics.interface";
    export * from "packages/cache/src/lib/interface/cache-configuration.interface";
    export * from "packages/cache/src/lib/logger/cache-logger";
    export * from "packages/cache/src/lib/logger/cache-logger.interface";
    export * from "packages/cache/src/lib/storage-engine/cache-storage-engine";
    export * from "packages/cache/src/lib/storage-engine/redis-cache-storage-engine";
    export * from "packages/cache/src/lib/storage-engine/in-memory-cache-storage-engine";
}

`;