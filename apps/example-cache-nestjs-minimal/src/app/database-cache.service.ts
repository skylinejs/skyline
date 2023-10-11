import { Injectable } from '@nestjs/common';
import { RedisCacheStorageEngine, SkylineCache } from '@skyline-js/cache';
import { createClient } from 'redis';

@Injectable()
export class DatabaseCacheService extends SkylineCache {
  constructor() {
    const redis = createClient({ url: 'redis://skyline_redis:6379' });
    redis.connect();

    super({
      storage: new RedisCacheStorageEngine({
        redis,
      }),
      config: {},
    });
  }
}
