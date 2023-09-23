import { RedisCacheStorageEngine, SkylineCache } from '@skylinejs/cache';
import { execSync } from 'child_process';
import { join } from 'path';
import Redis from 'ioredis';

describe('RedisCache: ioredis package', () => {
  const redis = new Redis({
    host: 'skyline_redis',
    port: 6379,
    lazyConnect: true,
  });

  beforeAll(async () => {
    const filepath = join(__dirname, '..', '..', 'docker-compose.yml');
    execSync(`docker-compose -f ${filepath} up -d`);

    await redis.connect();
    await redis.set('foo', 'bar');
    const value = await redis.get('foo');
    expect(value).toBe('bar');
  });

  it('Connect to redis', async () => {
    const cache = new SkylineCache({
      storage: new RedisCacheStorageEngine({ redis }),
    });
  });

  afterAll(async () => {
    await redis.disconnect();
  });
});
