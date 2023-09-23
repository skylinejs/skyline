import { execSync } from 'child_process';
import { join } from 'path';
import * as Redis from 'ioredis';

describe('RedisCache: ioredis package', () => {
  it('should print a message', () => {
    expect(1).toBe(1);
  });
});
