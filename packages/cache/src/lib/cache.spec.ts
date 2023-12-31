import { SkylineCache } from './cache';
import {
  CacheInconsistencyError,
  CacheInputValidationError,
} from './cache-error';
import { CacheConfiguration } from './interface/cache-configuration.interface';
import { CacheLogger } from './logger/cache-logger';
import {
  CacheInconsistencyMessageInfo,
  CacheInputValidationErrorMessageInfo,
  CacheMessageInfoType,
  CacheMessageInfoUnion,
  CacheStaleMessageInfo,
} from './logger/cache-logger.interface';
import { InMemoryCacheStorageEngine } from './storage-engine/in-memory-cache-storage-engine';

const USER_CACHE_NAMESPACE = 'user';

interface UserCache {
  id: number;
  name: string;
}

function isUserCacheOrThrow(value: unknown): asserts value is UserCache {
  if (typeof value !== 'object') throw new Error(`Expected an object`);
  if (typeof (value as any).id !== 'number') throw new Error(`Expected an id`);
  if (typeof (value as any).name !== 'string')
    throw new Error(`Expected a name`);

  // No additional properties allowed
  if (Object.keys(value as object).length !== 2)
    throw new Error(`No additional properties allowed`);
}

const config: Partial<CacheConfiguration> = {
  defaultCacheExpirationMs: 20_000,
  randomGeneratorSeed: 'cache-seed-1',
};

class MockCacheLogger extends CacheLogger {
  logs: { message: string; info: CacheMessageInfoUnion }[] = [];
  warns: { message: string; info: CacheMessageInfoUnion }[] = [];
  errors: { message: string; info: CacheMessageInfoUnion }[] = [];

  override log(message: string, info: CacheMessageInfoUnion): void {
    this.logs.push({ message, info });
  }

  override warn(message: string, info: CacheMessageInfoUnion): void {
    this.warns.push({ message, info });
  }

  override error(message: string, info: CacheMessageInfoUnion): void {
    this.errors.push({ message, info });
  }

  popLogOrFail<T extends CacheMessageInfoUnion>(): {
    message: string;
    info: T;
  } {
    const log = this.logs.pop();
    if (!log) throw new Error(`Expected a log message to exist`);
    return log as { message: string; info: T };
  }

  popWarnOrFail<T extends CacheMessageInfoUnion>(): {
    message: string;
    info: T;
  } {
    const warn = this.warns.pop();
    if (!warn) throw new Error(`Expected a warn message to exist`);
    return warn as { message: string; info: T };
  }

  popErrorOrFail<T extends CacheMessageInfoUnion>(): {
    message: string;
    info: T;
  } {
    const error = this.errors.pop();
    if (!error) throw new Error(`Expected a error message to exist`);
    return error as { message: string; info: T };
  }
}

describe('SyklineCache', () => {
  it('Set a (key, value) pair', async () => {
    const cache = new SkylineCache({ config });
    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );
    const { value, skipped } = await cache.get(
      USER_CACHE_NAMESPACE,
      1,
      isUserCacheOrThrow
    );

    expect(value).toEqual({ id: 1, name: 'user-1' });
    expect(skipped).toBe(false);
  });

  it('Discard a (key, value) pair if the key already exists', async () => {
    const cache = new SkylineCache({ config });

    // Set the value for the first time
    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );

    // Expect the value to be set
    {
      const { value } = await cache.get(
        USER_CACHE_NAMESPACE,
        1,
        isUserCacheOrThrow
      );
      expect(value).toEqual({ id: 1, name: 'user-1' });
    }

    // Try to set the value again (should be discarded)
    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-2' },
      { fetchedAt: Date.now() }
    );

    // Expect the value to be unchanged
    {
      const { value } = await cache.get(
        USER_CACHE_NAMESPACE,
        1,
        isUserCacheOrThrow
      );
      expect(value).toEqual({ id: 1, name: 'user-1' });
    }
  });

  it('cache.get: Force a cache skip', async () => {
    const cache = new SkylineCache({ config });
    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );
    const { value, skipped } = await cache.get(
      USER_CACHE_NAMESPACE,
      1,
      isUserCacheOrThrow,
      {
        skip: 1,
      }
    );

    expect(value).toBeUndefined();
    expect(skipped).toBe(true);
  });

  it('config.forceCacheSkips: Force a cache skip', async () => {
    const cache = new SkylineCache({
      config: { ...config, forceCacheSkips: true },
    });
    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );
    const { value, skipped } = await cache.get(
      USER_CACHE_NAMESPACE,
      1,
      isUserCacheOrThrow,
      {
        skip: 0,
      }
    );

    expect(value).toBeUndefined();
    expect(skipped).toBe(true);
  });

  it('cache.disableCacheSkipping: Takes precedence over config.forceCacheSkips', async () => {
    const cache = new SkylineCache({
      config: { ...config, forceCacheSkips: true },
    });
    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );
    cache.disableCacheSkipping();
    const { value, skipped } = await cache.get(
      USER_CACHE_NAMESPACE,
      1,
      isUserCacheOrThrow,
      {
        skip: 1,
      }
    );

    expect(value).toEqual({ id: 1, name: 'user-1' });
    expect(skipped).toBe(false);
  });

  it('cache.get: skip=0.5 option results in 50% cache skips', async () => {
    const cache = new SkylineCache({ config });
    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );

    // Expect the value to be skipped (test depends on randomGeneratorSeed)
    {
      const { value, skipped } = await cache.get(
        USER_CACHE_NAMESPACE,
        1,
        isUserCacheOrThrow,
        {
          skip: 0.5,
        }
      );

      expect(value).toBeUndefined();
      expect(skipped).toBe(true);
    }

    // Expect the value to not be skipped (test depends on randomGeneratorSeed)
    {
      const { value, skipped } = await cache.get(
        USER_CACHE_NAMESPACE,
        1,
        isUserCacheOrThrow,
        {
          skip: 0.5,
        }
      );

      expect(value).toEqual({ id: 1, name: 'user-1' });
      expect(skipped).toBe(false);
    }

    // Expect the value to be skipped (test depends on randomGeneratorSeed)
    {
      const { value, skipped } = await cache.get(
        USER_CACHE_NAMESPACE,
        1,
        isUserCacheOrThrow,
        {
          skip: 0.5,
        }
      );

      expect(value).toBeUndefined();
      expect(skipped).toBe(true);
    }

    // Expect the value to not be skipped (test depends on randomGeneratorSeed)
    {
      const { value, skipped } = await cache.get(
        USER_CACHE_NAMESPACE,
        1,
        isUserCacheOrThrow,
        {
          skip: 0.5,
        }
      );

      expect(value).toEqual({ id: 1, name: 'user-1' });
      expect(skipped).toBe(false);
    }
  });

  it('cache.get: Expect throwing and error logging on incorrect input', async () => {
    const logger = new MockCacheLogger();
    const cache = new SkylineCache({
      logger,
      config: { ...config, throwOnError: true },
    });

    // Throw and log error on invalid namespace
    {
      await expect(
        cache.get(null as unknown as string, 1, isUserCacheOrThrow)
      ).rejects.toThrow(CacheInputValidationError);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('namespace');
      expect(info.value).toBe(null);
    }

    {
      await expect(
        cache.get(undefined as unknown as string, 1, isUserCacheOrThrow)
      ).rejects.toThrow(CacheInputValidationError);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('namespace');
      expect(info.value).toBe(undefined);
    }

    {
      await expect(
        cache.get(1 as unknown as string, 1, isUserCacheOrThrow)
      ).rejects.toThrow(CacheInputValidationError);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('namespace');
      expect(info.value).toBe(1);
    }

    // Throw and log error on invalid key
    {
      await expect(
        cache.get(
          USER_CACHE_NAMESPACE,
          null as unknown as number,
          isUserCacheOrThrow
        )
      ).rejects.toThrow(CacheInputValidationError);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('key');
      expect(info.value).toBe(null);
    }

    {
      await expect(
        cache.get(
          USER_CACHE_NAMESPACE,
          undefined as unknown as number,
          isUserCacheOrThrow
        )
      ).rejects.toThrow(CacheInputValidationError);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('key');
      expect(info.value).toBe(undefined);
    }

    // Throw and log error on invalid skip
    {
      await expect(
        cache.get(USER_CACHE_NAMESPACE, 1, isUserCacheOrThrow, { skip: -1 })
      ).rejects.toThrow(CacheInputValidationError);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('skip');
      expect(info.value).toBe(-1);
    }

    {
      await expect(
        cache.get(USER_CACHE_NAMESPACE, 1, isUserCacheOrThrow, { skip: 1.1 })
      ).rejects.toThrow(CacheInputValidationError);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('skip');
      expect(info.value).toBe(1.1);
    }
  });

  it('cache.get: Expect error logging on incorrect input', async () => {
    const logger = new MockCacheLogger();
    const cache = new SkylineCache({
      logger,
      config: { ...config, throwOnError: false },
    });

    // Log an error on invalid namespace
    {
      await cache.get(null as unknown as string, 1, isUserCacheOrThrow);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('namespace');
      expect(info.value).toBe(null);
    }

    {
      await cache.get(undefined as unknown as string, 1, isUserCacheOrThrow);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('namespace');
      expect(info.value).toBe(undefined);
    }

    {
      await cache.get(1 as unknown as string, 1, isUserCacheOrThrow);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('namespace');
      expect(info.value).toBe(1);
    }

    // Log an error on invalid key
    {
      await cache.get(
        USER_CACHE_NAMESPACE,
        null as unknown as number,
        isUserCacheOrThrow
      );
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('key');
      expect(info.value).toBe(null);
    }

    {
      await cache.get(
        USER_CACHE_NAMESPACE,
        undefined as unknown as number,
        isUserCacheOrThrow
      );
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('key');
      expect(info.value).toBe(undefined);
    }

    // Log an error on invalid skip
    {
      await cache.get(USER_CACHE_NAMESPACE, 1, isUserCacheOrThrow, {
        skip: -1,
      });
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('skip');
      expect(info.value).toBe(-1);
    }

    {
      await cache.get(USER_CACHE_NAMESPACE, 1, isUserCacheOrThrow, {
        skip: 1.1,
      });
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.INPUT_VALIDATION_ERROR);
      expect(info.parameter).toBe('skip');
      expect(info.value).toBe(1.1);
    }
  });

  it('cache.get: Expect throwing and error logging on validator function throwing an error', async () => {
    const logger = new MockCacheLogger();
    const cache = new SkylineCache({
      logger,
      config: { ...config, throwOnError: true },
    });

    // Expect throwing and error logging on validator throwing an error
    {
      await cache.setIfNotExist(
        USER_CACHE_NAMESPACE,
        ({ id }) => id,
        { id: 1, name: null },
        { fetchedAt: Date.now() }
      );
      // Expect to throw
      await expect(
        cache.get(USER_CACHE_NAMESPACE, 1, isUserCacheOrThrow, { skip: 0 })
      ).rejects.toThrow('Expected a name');
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.UNKNOWN_ERROR);
    }

    // Expect throwing and error logging on validator throwing an error
    {
      await cache.setIfNotExist(
        USER_CACHE_NAMESPACE,
        ({ id }) => id,
        { id: 2, name: 'user-1', isAdmin: true },
        { fetchedAt: Date.now() }
      );
      await expect(
        cache.get(USER_CACHE_NAMESPACE, 2, isUserCacheOrThrow, { skip: 0 })
      ).rejects.toThrow('No additional properties allowed');
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.UNKNOWN_ERROR);
    }
  });

  it('cache.get: Expect error logging on validator function throwing an error', async () => {
    const logger = new MockCacheLogger();
    const cache = new SkylineCache({
      logger,
      config: { ...config, throwOnError: false },
    });

    // Expect throwing and error logging on validator throwing an error
    {
      await cache.setIfNotExist(
        USER_CACHE_NAMESPACE,
        ({ id }) => id,
        { id: 1, name: null },
        { fetchedAt: Date.now() }
      );
      // Expect not to throw, value should be undefined and skipped should be false (equal to a cache miss)
      const { value, skipped } = await cache.get(
        USER_CACHE_NAMESPACE,
        1,
        isUserCacheOrThrow,
        { skip: 0 }
      );
      expect(value).toBeUndefined();
      expect(skipped).toBe(false);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.UNKNOWN_ERROR);
    }

    // Expect throwing and error logging on validator throwing an error
    {
      await cache.setIfNotExist(
        USER_CACHE_NAMESPACE,
        ({ id }) => id,
        { id: 2, name: 'user-1', isAdmin: true },
        { fetchedAt: Date.now() }
      );
      // Expect not to throw, value should be undefined and skipped should be false (equal to a cache miss)
      const { value, skipped } = await cache.get(
        USER_CACHE_NAMESPACE,
        2,
        isUserCacheOrThrow,
        { skip: 0 }
      );
      expect(value).toBeUndefined();
      expect(skipped).toBe(false);
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.UNKNOWN_ERROR);
    }
  });

  it('cache.get: Forced cache skipping does not affect cache.setIfNotExist validation', async () => {
    const logger = new MockCacheLogger();
    const cache = new SkylineCache({
      logger,
      config: { ...config, throwOnError: true, forceCacheSkips: true },
    });

    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );

    const { value, skipped } = await cache.get(
      USER_CACHE_NAMESPACE,
      1,
      isUserCacheOrThrow,
      {
        skip: 1,
      }
    );

    expect(value).toBeUndefined();
    expect(skipped).toBe(true);

    await expect(
      cache.setIfNotExist(
        USER_CACHE_NAMESPACE,
        ({ id }) => id,
        { id: 1, name: 'user-2' },
        { fetchedAt: Date.now(), validate: skipped }
      )
    ).rejects.toThrow(CacheInconsistencyError);

    expect(logger.logs).toHaveLength(0);
    expect(logger.warns).toHaveLength(0);
    expect(logger.errors).toHaveLength(1);
    const { info } = logger.popErrorOrFail<CacheInconsistencyMessageInfo>();
    expect(info.type).toBe(CacheMessageInfoType.CACHE_INCONSISTENCY);
    expect(info.namespace).toBe(USER_CACHE_NAMESPACE);
    expect(info.key).toBe(1);
    expect(info.value).toEqual(JSON.stringify({ id: 1, name: 'user-2' }));
    expect(info.cachedValue).toEqual(JSON.stringify({ id: 1, name: 'user-1' }));
  });

  it('cache.get: Forced cache skipping can be overriden via cache.disableCacheSkipping', async () => {
    const logger = new MockCacheLogger();
    const cache = new SkylineCache({
      logger,
      config: { ...config, throwOnError: true, forceCacheSkips: true },
    });

    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );

    // Get the value with forced cache skipping
    {
      const { value, skipped } = await cache.get(
        USER_CACHE_NAMESPACE,
        1,
        isUserCacheOrThrow,
        {
          skip: 1,
        }
      );
      expect(value).toBeUndefined();
      expect(skipped).toBe(true);
    }

    // Disable cache skipping
    cache.disableCacheSkipping();

    // Get the value with disabled cache skipping
    {
      const { value, skipped } = await cache.get(
        USER_CACHE_NAMESPACE,
        1,
        isUserCacheOrThrow,
        {
          skip: 1,
        }
      );
      expect(value).toEqual({ id: 1, name: 'user-1' });
      expect(skipped).toBe(false);
    }
  });

  it('cache.setIfNotExist: Use config.cachePrefix, namespace and key for storage key', async () => {
    const logger = new MockCacheLogger();
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    const cache = new SkylineCache({
      logger,
      storage,
      config: {
        ...config,
        cachePrefix: 'cache-prefix',
      },
    });

    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );

    const expectedStorageKey = `cache-prefix:${USER_CACHE_NAMESPACE}:${1}`;
    const value = await storage.get(expectedStorageKey);
    expect(value).toEqual(JSON.stringify({ id: 1, name: 'user-1' }));
  });

  it('cache.setIfNotExist: Use config.cachePrefix, config.cacheVersion, namespace and key for storage key', async () => {
    const logger = new MockCacheLogger();
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    const cache = new SkylineCache({
      logger,
      storage,
      config: {
        ...config,
        cachePrefix: 'cache-prefix',
        cacheVersion: 'cache-version',
      },
    });

    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );

    const expectedStorageKey = `cache-prefix:cache-version:${USER_CACHE_NAMESPACE}:${1}`;
    const value = await storage.get(expectedStorageKey);
    expect(value).toEqual(JSON.stringify({ id: 1, name: 'user-1' }));
  });

  it('cache.setIfNotExist: Discard stale value', async () => {
    const logger = new MockCacheLogger();
    const cache = new SkylineCache({
      logger,
      config: { ...config, staleThresholdMs: 0 },
    });

    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() - 1 }
    );

    const { value, skipped } = await cache.get(
      USER_CACHE_NAMESPACE,
      1,
      isUserCacheOrThrow
    );

    expect(value).toBeUndefined();
    expect(skipped).toBe(false);

    expect(logger.logs).toHaveLength(1);
    expect(logger.warns).toHaveLength(0);
    expect(logger.errors).toHaveLength(0);
    const { info } = logger.popLogOrFail<CacheStaleMessageInfo>();
    expect(info.type).toBe(CacheMessageInfoType.CACHE_STALE);
    expect(info.namespace).toBe(USER_CACHE_NAMESPACE);
    expect(info.key).toBe(1);
    expect(info.staleThresholdMs).toBe(0);
    expect(info.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('cache.invalidate: Use config.cacheKeyBlockedValue and config.blockedKeyExpirationMs for blocking a value', async () => {
    const logger = new MockCacheLogger();
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    const cache = new SkylineCache({
      logger,
      storage,
      config: {
        ...config,
        cachePrefix: 'cache-prefix',
        cacheVersion: 'cache-version',
        cacheKeyBlockedValue: 'blocked-value',
        blockedKeyExpirationMs: 80_000,
      },
    });

    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );

    await cache.invalidate(USER_CACHE_NAMESPACE, 1);

    const expectedStorageKey = `cache-prefix:cache-version:${USER_CACHE_NAMESPACE}:${1}`;
    const value = await storage.get(expectedStorageKey);
    expect(value).toEqual('blocked-value');
    const ttl = await storage.ttl(expectedStorageKey);
    expect(ttl).toBeGreaterThanOrEqual(75);
    expect(ttl).toBeLessThanOrEqual(85);
  });

  it('cache.invalidateMany: Use config.cacheKeyBlockedValue and config.blockedKeyExpirationMs for blocking values', async () => {
    const logger = new MockCacheLogger();
    const storage = new InMemoryCacheStorageEngine({ periodicCleanup: false });
    const cache = new SkylineCache({
      logger,
      storage,
      config: {
        ...config,
        cachePrefix: 'cache-prefix',
        cacheVersion: 'cache-version',
        cacheKeyBlockedValue: 'blocked-value',
        blockedKeyExpirationMs: 80_000,
      },
    });

    await cache.setIfNotExist(
      USER_CACHE_NAMESPACE,
      ({ id }) => id,
      { id: 1, name: 'user-1' },
      { fetchedAt: Date.now() }
    );

    await cache.invalidateMany([
      { namespace: USER_CACHE_NAMESPACE, key: 1 },
      { namespace: USER_CACHE_NAMESPACE, key: 2 },
    ]);

    // Check first key
    {
      const expectedStorageKey = `cache-prefix:cache-version:${USER_CACHE_NAMESPACE}:${1}`;
      const value = await storage.get(expectedStorageKey);
      expect(value).toEqual('blocked-value');
      const ttl = await storage.ttl(expectedStorageKey);
      expect(ttl).toBeGreaterThanOrEqual(75);
      expect(ttl).toBeLessThanOrEqual(85);
    }

    // Check second key
    {
      const expectedStorageKey = `cache-prefix:cache-version:${USER_CACHE_NAMESPACE}:${2}`;
      const value = await storage.get(expectedStorageKey);
      expect(value).toEqual('blocked-value');
      const ttl = await storage.ttl(expectedStorageKey);
      expect(ttl).toBeGreaterThanOrEqual(75);
      expect(ttl).toBeLessThanOrEqual(85);
    }
  });
});
