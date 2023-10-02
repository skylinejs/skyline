import type { CacheKey } from './interface/cache-key.type';

export class CacheInconsistencyError extends Error {
  readonly key: CacheKey;
  readonly namespace: string;
  readonly value: string;
  readonly cachedValue: string;

  constructor(
    message: string,
    context: {
      key: CacheKey;
      namespace: string;
      value: string;
      cachedValue: string;
    }
  ) {
    super(message);
    this.key = context.key;
    this.namespace = context.namespace;
    this.value = context.value;
    this.cachedValue = context.cachedValue;
  }
}

export class CacheInputValidationError extends Error {
  readonly parameter: string;
  readonly value: unknown;

  constructor(
    message: string,
    context: {
      parameter: string;
      value: unknown;
    }
  ) {
    super(message);
    this.parameter = context.parameter;
    this.value = context.value;
  }
}

export class CacheStorageEngineError extends Error {
  readonly operation: string;
  readonly storageEninge: string;

  constructor(
    message: string,
    context: {
      operation: string;
      storageEninge: string;
    }
  ) {
    super(message);
    this.operation = context.operation;
    this.storageEninge = context.storageEninge;
  }
}
