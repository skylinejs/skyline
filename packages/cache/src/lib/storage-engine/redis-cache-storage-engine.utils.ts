import {
  IoRedisClient,
  NodeRedisClient,
  RedisClient,
} from './redis-cache-storage-engine.interface';

export function getRedisClientFromNodeOrIoRedisClient(
  client: IoRedisClient | NodeRedisClient
): RedisClient {
  // Check if the client is node-redis
  if (typeof (client as NodeRedisClient).mGet === 'function') {
    return getRedisClientFromNodeRedisClient(client as NodeRedisClient);
  }
  return getRedisClientFromIoRedisClient(client as IoRedisClient);
}

export function getRedisClientFromNodeRedisClient(
  client: NodeRedisClient
): RedisClient {
  return {
    get: (key: string) => client.get(key),
    mget: (keys: string[]) => client.mGet(keys),
    keys: (pattern: string) => client.keys(pattern),
    multi: () => {
      const multi = client.multi();
      const chainable = {
        set: (
          key: string,
          value: string,
          options: { ex?: number; nx?: boolean }
        ) => {
          if (options?.nx) {
            multi.set(key, value, {
              EX: options.ex,
              NX: true,
            });
          } else {
            multi.set(key, value, {
              EX: options.ex,
            });
          }
          return chainable;
        },
        exec: () => multi.exec(),
      };
      return chainable;
    },
  };
}

export function getRedisClientFromIoRedisClient(
  client: IoRedisClient
): RedisClient {
  return {
    get: (key: string) => client.get(key),
    mget: (keys: string[]) => client.mget(keys),
    keys: (pattern: string) => client.keys(pattern),
    multi: () => {
      const multi = client.multi();
      const chainable = {
        set: (
          key: string,
          value: string,
          options: { ex?: number; nx?: boolean }
        ) => {
          if (options.ex && options.nx) {
            multi.set(key, value, 'EX', options.ex, 'NX');
          } else if (options.ex) {
            multi.set(key, value, 'EX', options.ex);
          } else if (options.nx) {
            multi.set(key, value, 'NX');
          } else {
            multi.set(key, value);
          }

          return chainable;
        },
        exec: () => multi.exec(),
      };
      return chainable;
    },
  };
}
