import type { CacheKey } from '../interface/cache-key.type';

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
  STORAGE_ENGINE_ERROR = 'storage_engine_error',
  INPUT_VALIDATION_ERROR = 'input_validation_error',
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

export type CacheMessageInfoUnion =
  | CacheStaleMessageInfo
  | CacheUnknownErrorMessageInfo
  | CacheInconsistencyMessageInfo
  | CacheInputValidationErrorMessageInfo;
