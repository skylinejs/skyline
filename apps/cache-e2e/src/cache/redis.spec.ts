import {
  CacheConfiguration,
  CacheInputValidationErrorMessageInfo,
  CacheMessageInfoType,
  RedisCacheStorageEngine,
  SkylineCache,
} from '@skylinejs/cache';
import { execSync } from 'child_process';
import { join } from 'path';
import { createClient } from 'redis';
import { MockCacheLogger } from '../util/mock-cache-logger';

const USER_CACHE_NAMESPACE = 'user';

interface UserCache {
  id: number;
  name: string;
}

function isUserCacheOrThrow(value: unknown): asserts value is UserCache {
  if (typeof value !== 'object') throw new Error();
  if (typeof (value as any).id !== 'number') throw new Error();
  if (typeof (value as any).name !== 'string') throw new Error();
}

const config: Partial<CacheConfiguration> = {
  defaultCacheExpirationMs: 20_000,
  randomGeneratorSeed: 'cache-seed-1',
};

describe('RedisCache: redis package', () => {
  const redis = createClient({
    url: 'redis://skyline_redis:6379',
  });

  beforeAll(async () => {
    const filepath = join(__dirname, '..', '..', 'docker-compose.yml');
    execSync(`docker-compose -f ${filepath} up -d`);
    await redis.connect();
    await redis.set('foo', 'bar');
    const value = await redis.get('foo');
    expect(value).toBe('bar');
  });

  it('Set a (key, value) pair', async () => {
    const cache = new SkylineCache({
      config,
      storage: new RedisCacheStorageEngine({ redis }),
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
      isUserCacheOrThrow
    );

    expect(value).toEqual({ id: 1, name: 'user-1' });
    expect(skipped).toBe(false);
  });

  it('Discard a (key, value) pair if the key already exists', async () => {
    const cache = new SkylineCache({
      config,
      storage: new RedisCacheStorageEngine({ redis }),
    });

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
    const cache = new SkylineCache({
      config,
      storage: new RedisCacheStorageEngine({ redis }),
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
  });

  it('config.forceCacheSkips: Force a cache skip', async () => {
    const cache = new SkylineCache({
      config: { ...config, forceCacheSkips: true },
      storage: new RedisCacheStorageEngine({ redis }),
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
      storage: new RedisCacheStorageEngine({ redis }),
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
    const cache = new SkylineCache({
      config,
      storage: new RedisCacheStorageEngine({ redis }),
    });
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

  it('cache.get: Expect throwing and error logging for connection failure', async () => {
    const redisFail = createClient({
      url: 'redis://skyline_redis:6378',
    });

    const logger = new MockCacheLogger();
    const cache = new SkylineCache({
      logger,
      config: { ...config, throwOnError: true },
      storage: new RedisCacheStorageEngine({ redis: redisFail }),
    });

    {
      await expect(
        cache.setIfNotExist(
          USER_CACHE_NAMESPACE,
          ({ id }) => id,
          { id: 1, name: 'user-1' },
          { fetchedAt: Date.now() }
        )
      ).rejects.toThrow('The client is closed');

      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.UNKNOWN_ERROR);
    }

    await expect(
      cache.get(USER_CACHE_NAMESPACE, 2, isUserCacheOrThrow, { skip: 0 })
    ).rejects.toThrow('The client is closed');

    expect(logger.logs).toHaveLength(0);
    expect(logger.warns).toHaveLength(0);
    expect(logger.errors).toHaveLength(1);
    const { info } =
      logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
    expect(info.type).toBe(CacheMessageInfoType.UNKNOWN_ERROR);
  });

  it('cache.get: Expect error logging for connection failure', async () => {
    const redisFail = createClient({
      url: 'redis://skyline_redis:6378',
    });

    const logger = new MockCacheLogger();
    const cache = new SkylineCache({
      logger,
      config: { ...config, throwOnError: false },
      storage: new RedisCacheStorageEngine({ redis: redisFail }),
    });

    {
      await cache.setIfNotExist(
        USER_CACHE_NAMESPACE,
        ({ id }) => id,
        { id: 1, name: 'user-1' },
        { fetchedAt: Date.now() }
      );

      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } =
        logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
      expect(info.type).toBe(CacheMessageInfoType.UNKNOWN_ERROR);
    }

    const { skipped, value } = await cache.get(
      USER_CACHE_NAMESPACE,
      2,
      isUserCacheOrThrow,
      { skip: 0 }
    );
    expect(skipped).toBe(false);
    expect(value).toBeUndefined();

    expect(logger.logs).toHaveLength(0);
    expect(logger.warns).toHaveLength(0);
    expect(logger.errors).toHaveLength(1);
    const { info } =
      logger.popErrorOrFail<CacheInputValidationErrorMessageInfo>();
    expect(info.type).toBe(CacheMessageInfoType.UNKNOWN_ERROR);
  });

  afterAll(async () => {
    await redis.disconnect();
  });
});
