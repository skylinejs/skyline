import type { CacheKey } from '../cache.interface';

export interface CacheLoggerConfiguration {
  enabled: boolean;
  logLevel: CacheLogLevel;
}

export enum CacheLogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum CacheMessageType {
  CACHE_STALE = 'cache_stale',
  UNKNOWN_ERROR = 'unknown_error',
  CACHE_INCONSISTENCY = 'cache_inconsistency',
}

export interface CacheMessage {
  type: CacheMessageType;
  level: CacheLogLevel;
  message: string;
}

export interface CacheStaleMessage extends CacheMessage {
  type: CacheMessageType.CACHE_STALE;
  key: CacheKey;
  namespace: string;
  durationMs: number;
  staleThresholdMs: number;
}

export interface CacheUnknownErrorMessage extends CacheMessage {
  type: CacheMessageType.UNKNOWN_ERROR;
  error: unknown;
}

export interface CacheInconsistencyMessage extends CacheMessage {
  type: CacheMessageType.CACHE_INCONSISTENCY;
  namespace: string;
  key: CacheKey;
  value: string;
  cachedValue: string;
}

export type CacheMessageUnion = CacheStaleMessage | CacheUnknownErrorMessage | CacheInconsistencyMessage;
