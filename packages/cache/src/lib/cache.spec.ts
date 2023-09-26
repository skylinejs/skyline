import { CacheConfiguration } from './cache.interface';
import { SkylineCache } from './cache';
import { CacheLogger } from './logger/cache-logger';
import {
  CacheMessageInfoType,
  CacheMessageInfoUnion,
} from './logger/cache-logger.interface';

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

class MockCacheLogger extends CacheLogger {
  readonly logs: { message: string; info: CacheMessageInfoUnion }[] = [];
  readonly warns: { message: string; info: CacheMessageInfoUnion }[] = [];
  readonly errors: { message: string; info: CacheMessageInfoUnion }[] = [];

  override log(message: string, info: CacheMessageInfoUnion): void {
    this.logs.push({ message, info });
  }

  override warn(message: string, info: CacheMessageInfoUnion): void {
    this.warns.push({ message, info });
  }

  override error(message: string, info: CacheMessageInfoUnion): void {
    this.errors.push({ message, info });
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

  it('cache.get: Throw on incorrect input', async () => {
    const logger = new MockCacheLogger();
    const cache = new SkylineCache({
      logger,
      config: { ...config, throwOnError: true },
    });

    // Throw on invalid namespace
    {
      await expect(
        cache.get(null as unknown as string, 1, isUserCacheOrThrow)
      ).rejects.toThrow();
      expect(logger.logs).toHaveLength(0);
      expect(logger.warns).toHaveLength(0);
      expect(logger.errors).toHaveLength(1);
      const { info } = logger.errors[0];
      expect(info.type).toBe(CacheMessageInfoType.CACHE_INCONSISTENCY);
    }

    await expect(
      cache.get(undefined as unknown as string, 1, isUserCacheOrThrow)
    ).rejects.toThrow();

    await expect(
      cache.get(1 as unknown as string, 1, isUserCacheOrThrow)
    ).rejects.toThrow();

    // Throw on invalid key
    await expect(
      cache.get(
        USER_CACHE_NAMESPACE,
        null as unknown as number,
        isUserCacheOrThrow
      )
    ).rejects.toThrow();

    await expect(
      cache.get(
        USER_CACHE_NAMESPACE,
        undefined as unknown as number,
        isUserCacheOrThrow
      )
    ).rejects.toThrow();

    // Throw on invalid skip
    await expect(
      cache.get(USER_CACHE_NAMESPACE, 1, isUserCacheOrThrow, { skip: -1 })
    ).rejects.toThrow();

    await expect(
      cache.get(USER_CACHE_NAMESPACE, 1, isUserCacheOrThrow, { skip: 1.1 })
    ).rejects.toThrow();
  });

  it('cache.get: Handle throwing of validatior function', async () => {
    const cache = new SkylineCache({
      config: { ...config, throwOnError: true },
    });
  });
});
