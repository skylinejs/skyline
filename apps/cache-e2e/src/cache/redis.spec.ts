import { execSync } from 'child_process';
import { join } from 'path';
import { createClient, RedisClientType } from 'redis';
import { SkylineCache } from '@skylinejs/cache';

describe('RedisCache: redis package', () => {
  const client = createClient({});

  beforeAll(async () => {
    execSync(
      `docker-compose -f ${join(__dirname, 'docker-compose.yml')} up -d`
    );
    await client.connect();
    await client.set('foo', 'bar');
    const value = await client.get('foo');
    expect(value).toBe('bar');
  });

  it('Connect to redis', async () => {
    const cache = new SkylineCache({});
  });

  afterAll(() => {});
});
