import { RedisCacheStorageEngine, SkylineCache } from '@skylinejs/cache';
import { execSync } from 'child_process';
import { join } from 'path';
import { createClient } from 'redis';

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

  it('Connect to redis', async () => {
    const cache = new SkylineCache({
      // storage: new RedisCacheStorageEngine({ redis }),
    });
  });

  afterAll(async () => {
    await redis.disconnect();
  });
});
