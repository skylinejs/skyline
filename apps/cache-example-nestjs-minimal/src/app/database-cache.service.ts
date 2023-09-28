import { Injectable } from '@nestjs/common';
import { RedisCacheStorageEngine, SkylineCache } from '@skylinejs/cache';
import { createClient } from 'redis';

@Injectable()
export class DatabaseCacheService extends SkylineCache {
  constructor() {
    super({
      storage: new RedisCacheStorageEngine({ redis: createClient({}) }),
      config: {},
    });
  }
}
