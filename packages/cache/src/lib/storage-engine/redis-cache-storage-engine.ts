import { CacheStorageEngine } from './cache-storage-engine';
import {
  IoRedisClient,
  NodeRedisClient,
  RedisClient,
} from './redis-cache-storage-engine.interface';
import { getRedisClientFromNodeOrIoRedisClient } from './redis-cache-storage-engine.utils';

/**
 * A cache storage engine that stores the cache in Redis.
 */
export class RedisCacheStorageEngine extends CacheStorageEngine {
  private readonly redis: RedisClient;
  constructor({ redis }: { redis: IoRedisClient | NodeRedisClient }) {
    super();
    this.redis = getRedisClientFromNodeOrIoRedisClient(redis);
  }

  async get(key: string): Promise<string | undefined> {
    const value = await this.redis.get(key);
    return value ?? undefined;
  }

  async getMany(keys: string[]): Promise<Array<string | undefined>> {
    const values = await this.redis.mget(keys);
    return values.map((value) => value ?? undefined);
  }

  async getKeysByPattern(pattern: string): Promise<string[]> {
    const keys = await this.redis.keys(pattern);
    return keys;
  }

  setMany(
    inputs: { key: string; value: string; expiresIn: number }[]
  ): Promise<unknown> {
    const multi = this.redis.multi();
    inputs.forEach((input) => {
      multi.set(input.key, input.value, { ex: input.expiresIn });
    });
    return multi.exec();
  }

  set(
    key: string,
    value: string,
    opts: { expiresIn: number }
  ): Promise<unknown> {
    const multi = this.redis.multi();
    multi.set(key, value, { ex: opts.expiresIn });
    return multi.exec();
  }

  setIfNotExist(
    key: string,
    value: string,
    opts: { expiresIn: number }
  ): Promise<unknown> {
    return this.redis
      .multi()
      .set(key, value, { ex: opts.expiresIn, nx: true })
      .exec();
  }

  setManyIfNotExist(
    inputs: { key: string; value: string; expiresIn: number }[]
  ): Promise<unknown> {
    const multi = this.redis.multi();
    inputs.forEach((input) => {
      multi.set(input.key, input.value, { ex: input.expiresIn, nx: true });
    });
    return multi.exec();
  }
}
