import type { CacheKey } from './cache.interface';

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

export class CacheValidationError extends Error {}
