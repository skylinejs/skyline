import { execSync } from 'child_process';
import { join } from 'path';
import { createClient, RedisClientType } from 'redis';
import { RedisCacheStorageEngine, SkylineCache } from '@skylinejs/cache';

describe('RedisCache: redis package', () => {
  const redis = createClient({
    url: 'redis://skyline_redis:6379',
  });

  beforeAll(async () => {
    execSync(
      `docker-compose -f ${join(
        __dirname,
        '..',
        '..',
        'docker-compose.yml'
      )} up -d`
    );
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
