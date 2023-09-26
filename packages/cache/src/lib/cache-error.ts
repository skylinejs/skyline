import type { CacheKey } from './cache.interface';

export class CacheInconsistencyError extends Error {
  readonly key: CacheKey;
  readonly namespace: string;

  constructor({
    message,
    key,
    namespace,
  }: {
    message: string;
    key: CacheKey;
    namespace: string;
  }) {
    super(message);
    this.key = key;
    this.namespace = namespace;
  }
}

export class CacheValidationError extends Error {}
