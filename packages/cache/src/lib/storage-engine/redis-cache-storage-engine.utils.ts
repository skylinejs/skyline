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
): RedisClient {}

export function getRedisClientFromIoRedisClient(
  client: IoRedisClient
): RedisClient {}
