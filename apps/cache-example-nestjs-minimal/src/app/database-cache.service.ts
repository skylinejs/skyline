import { Injectable } from '@nestjs/common';
import { SkylineCache } from '@skylinejs/cache';

@Injectable()
export class DatabaseCacheService extends SkylineCache {
  constructor() {
    super({
      config: {},
    });
  }
}
