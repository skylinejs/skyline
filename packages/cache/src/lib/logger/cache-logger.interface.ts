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
  VALIDATION_ERROR = 'validation_error',
  CACHE_INCONSISTENCY = 'cache_inconsistency',
  STORAGE_ENGINE_ERROR = 'storage_engine_error',
  INPUT_VALIDATION_ERROR = 'input_validation_error',
  SERIALIZATION_ERROR = 'serialization_error',
  DESERIALIZATION_ERROR = 'deserialization_error',
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

export interface CacheValidationErrorInfo extends CacheMessageInfo {
  type: CacheMessageInfoType.VALIDATION_ERROR;
}

export interface CacheInputValidationErrorInfo extends CacheMessageInfo {
  type: CacheMessageInfoType.INPUT_VALIDATION_ERROR;
  parameter: string;
  value: unknown;
}

export interface CacheSerializationErrorInfo extends CacheMessageInfo {
  type: CacheMessageInfoType.SERIALIZATION_ERROR;
}

export interface CacheDeserializationErrorInfo extends CacheMessageInfo {
  type: CacheMessageInfoType.DESERIALIZATION_ERROR;
}

export type CacheMessageInfoUnion =
  | CacheStaleMessageInfo
  | CacheUnknownErrorMessageInfo
  | CacheInconsistencyMessageInfo
  | CacheValidationErrorInfo
  | CacheInputValidationErrorInfo
  | CacheSerializationErrorInfo
  | CacheDeserializationErrorInfo;
