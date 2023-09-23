/**
 * ioredis client interface
 */
export interface IoRedisClient {
  multi(options: { pipeline: false }): Promise<'OK'>;
  multi(): IoRedisChainableCommander;
  multi(options: { pipeline: true }): IoRedisChainableCommander;
  multi(commands?: unknown[][]): IoRedisChainableCommander;

  get(key: string): Promise<string | null | undefined>;
  mget(keys: string[]): Promise<Array<string | null | undefined>>;
  keys(pattern: string): Promise<string[]>;
}

type Callback<T = any> = (err?: Error | null, result?: T) => void;
interface IoRedisChainableCommander {
  exec(
    callback?: Callback<[error: Error | null, result: unknown][] | null>
  ): Promise<[error: Error | null, result: unknown][] | null>;
  set(key: string, value: string): IoRedisChainableCommander;
  set(
    key: string,
    value: string,
    secondsToken: 'EX',
    seconds: number | string
  ): IoRedisChainableCommander;
  set(
    key: string,
    value: string,
    secondsToken: 'EX',
    seconds: number | string,
    nx: 'NX'
  ): IoRedisChainableCommander;
}

/**
 * node-redis client interface
 */
export interface NodeRedisClient {
  multi: () => NodeRedisClientMultiCommand;
  get(key: string): Promise<string | null | undefined>;
  mGet(keys: string[]): Promise<Array<string | null | undefined>>;
  keys(pattern: string): Promise<string[]>;
}

type MaximumOneOf<T, K extends keyof T = keyof T> = K extends keyof T
  ? {
      [P in K]?: T[K];
    } & Partial<Record<Exclude<keyof T, K>, never>>
  : never;
type SetTTL = MaximumOneOf<{
  EX: number;
  PX: number;
  EXAT: number;
  PXAT: number;
  KEEPTTL: true;
}>;
type SetGuards = MaximumOneOf<{
  NX: true;
  XX: true;
}>;
interface SetCommonOptions {
  GET?: true;
}
type NodeRedisSetOptions = SetTTL & SetGuards & SetCommonOptions;

interface NodeRedisClientMultiCommand {
  exec(): Promise<Array<any>>;
  set(
    key: string,
    value: string,
    options: NodeRedisSetOptions
  ): NodeRedisClientMultiCommand;
}

/**
 * Unified redis client interface
 */
export interface RedisClient {
  multi(): RedisClientChainable;
  get(key: string): Promise<string | null | undefined>;
  mget(keys: string[]): Promise<Array<string | null | undefined>>;
  keys(pattern: string): Promise<string[]>;
}

interface RedisClientChainable {
  exec(): Promise<unknown>;
  set(key: string, value: string): RedisClientChainable;
  set(
    key: string,
    value: string,
    secondsToken: 'EX',
    seconds: number | string
  ): RedisClientChainable;
  set(
    key: string,
    value: string,
    secondsToken: 'EX',
    seconds: number | string,
    nx: 'NX'
  ): RedisClientChainable;
}
