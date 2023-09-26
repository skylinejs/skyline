import type { CacheKey } from '../cache.interface';

export interface CacheLoggerConfiguration {
  enabled: boolean;
  logLevels: CacheLogLevel[];
}

export enum CacheLogLevel {
  LOG = 'log',
  WARN = 'warn',
  ERROR = 'error',
}

export enum CacheMessageInfoType {
  CACHE_STALE = 'cache_stale',
  UNKNOWN_ERROR = 'unknown_error',
  CACHE_INCONSISTENCY = 'cache_inconsistency',
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
  namespace: string;
  key: CacheKey;
  value: string;
  cachedValue: string;
}

export type CacheMessageInfoUnion =
  | CacheStaleMessageInfo
  | CacheUnknownErrorMessageInfo
  | CacheInconsistencyMessageInfo;
