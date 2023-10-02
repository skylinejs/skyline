# API Reference `@skyline-js/cache`

---

## Interfaces

### CacheConfiguration

```ts path="packages/cache/src/lib/interface/cache-configuration.interface.ts"

```

### CacheStatistics

```ts path="packages/cache/src/lib/interface/cache-statistics.interface.ts"

```

### CacheKey

The type a cache key can have. `undefined` and `null` are explicitly excluded.

```ts path="packages/cache/src/lib/interface/cache-key.type.ts"
export type CacheKey = string | number | BigInt | boolean;

```
