import { CacheStorageEngine } from './cache-storage-engine';

type Callback<T = any> = (err?: Error | null, result?: T) => void;
interface RedisChainableCommander {
  exec(
    callback?: Callback<[error: Error | null, result: unknown][] | null>
  ): Promise<[error: Error | null, result: unknown][] | null>;
  set(key: string, value: string): RedisChainableCommander;
  set(
    key: string,
    value: string,
    secondsToken: 'EX',
    seconds: number | string
  ): RedisChainableCommander;
  set(
    key: string,
    value: string,
    secondsToken: 'EX',
    seconds: number | string,
    nx: 'NX'
  ): RedisChainableCommander;
}

interface RedisClient {
  multi(options: { pipeline: false }): Promise<'OK'>;
  multi(): RedisChainableCommander;
  multi(options: { pipeline: true }): RedisChainableCommander;
  multi(commands?: unknown[][]): RedisChainableCommander;

  get(key: string): Promise<string | null | undefined>;
  mget(keys: string[]): Promise<Array<string | null | undefined>>;
  keys(pattern: string): Promise<string[]>;
}

/**
 * A cache storage engine that stores the cache in Redis.
 */
export class RedisCacheStorageEngine extends CacheStorageEngine {
  private readonly redis: RedisClient;
  constructor({ redis }: { redis: RedisClient }) {
    super();
    this.redis = redis;
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
      multi.set(input.key, input.value, 'EX', input.expiresIn);
    });
    return multi.exec();
  }

  set(
    key: string,
    value: string,
    opts: { expiresIn: number }
  ): Promise<unknown> {
    const multi = this.redis.multi();
    multi.set(key, value, 'EX', opts.expiresIn);
    return multi.exec();
  }

  setIfNotExist(
    key: string,
    value: string,
    opts: { expiresIn: number }
  ): Promise<unknown> {
    const multi = this.redis.multi();
    multi.set(key, value, 'EX', opts.expiresIn, 'NX');
    return multi.exec();
  }

  setManyIfNotExist(
    inputs: { key: string; value: string; expiresIn: number }[]
  ): Promise<unknown> {
    const multi = this.redis.multi();
    inputs.forEach((input) => {
      multi.set(input.key, input.value, 'EX', input.expiresIn, 'NX');
    });
    return multi.exec();
  }
}
