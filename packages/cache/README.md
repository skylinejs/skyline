<p align="center">
  <a href="https://skylinejs.com/docs/caching" target="blank"><img src="https://raw.githubusercontent.com/skylinejs/skyline/main/apps/docs/static/img/skylinejs-social.png" width="100%" alt="Skyline" /></a>
</p>

<p align="center">
Fast, reliable and zero dependency cache with built-in cache inconsistency observability and reporting.
</p>
<br />

The Skyline cache library is designed for mission critical production environments. To achieve the necessary reliability, a cache inconsistency observability strategy is forced on the developer. This ensures that the number of occurrences as well as the impact of cache inconsistencies in production is kept to an absolute minimum.

The cache inconsistency observability strategy is comprised of the following measurements:

- **Staleness checking**: Caching a value is only possible when providing a `fetchedAt` timestamp. This way, a value gets discarded if it was fetched from the source of truth too long ago (late write). This can happen due to a slow connection or the application performance is degraded (e.g, the event loop is blocked for longer times)
- **Key blocking**: To avoid timing bugs, the invalidation of a cache key blocks the key for a certain amount of time. While blocked, no one can write to this cache key. This avoids timing bugs where a late read-through caching operation writes an incorrect value to cache.
- **Schema validation**: Every value read from the cache has to be validated via a validation function. This prevents inconsistent values from entering the application. This can easily happen if the schema or structure of a cached value has changed but the cache has not been cleared/ invalidated.
- **Visibility**: Inconsistent caches will nevertheless occurr in production. Caching is to complex. A pragmatic approach to this reality is to make cache inconsistencies (1) visible and (2) reduce their impact. This is accomplished by providing a cache validation probability as well as reporting functionality to log when a cache inconsistency was detected.

The validation probability parameter allows for a gradual rollout of a newly cached value on a per-feature basis. The longer a cache works in production without producing any inconsistencies, the greater the confidence and therefore less cache requests need to get validated.

<br />

# Getting started

Install `@skyline-js/cache` using your preferred package manager:

```sh
npm install @skyline-js/cache
```

This is a minimal example of how to set and retrieve a key from the cache:

```ts
import { SkylineCache } from '@skyline-js/cache';

const cache = new SkylineCache();

// Cache the user with ID 1 under the "user" namespace
await cache.setIfNotExist(
  'user',
  (user) => user.id,
  { id: 1, name: 'John Doe' },
  { fetchedAt: Date.now() }
);

// Get the user with ID 1 from the cache
const { value: user } = await cache.get(
  'user',
  1,
  (user): asserts user is { id: number; name: string } => {}
);

console.log(user);
```

This is a minimal useful example on implementing a read-through cache:

```ts
import { SkylineCache } from '@skyline-js/cache';

const cache = new SkylineCache();

interface User {
  id: number;
  name: string;
}

function isUserOrThrow(user: unknown): asserts user is User {
  if (
    !user ||
    typeof user !== 'object' ||
    typeof user?.id !== 'number' ||
    typeof user?.name !== 'string'
  ) {
    throw new Error(`Invalid cached user value!`);
  }
}

async function getUserById(userId: number): User | undefined {
  // Check the cache, skip the cache read with a 50% probability
  let { value, skipped } = await cache.get('user', userId, isUserOrThrow, {
    skip: 0.5,
  });

  // If value was not found in the cache, check the database
  if (!value) {
    const fetchedAt = Date.now();
    // Perform your database query here ...
    value = { id: 1, name: 'John Doe' };

    // Write the retrieved value to cache as it was not found in the cache earlier.
    // Validate the currently cached value with the fetched one if the cache read was skipped
    await cache.setIfNotExist('user', (user) => user.id, value, {
      fetchedAt,
      validate: skipped,
    });
  }

  return value;
}
```

This example shows a simple yet powerful control flow.

<!-- As you can see, Skyline is not your usual cache with simple `cache.set` and `cache.get` functions. This is intentional - let's get the ball rolling. -->

# API Reference

<!-- <Include path="apps/docs/docs/api-reference/env.md"> -->
---
sidebar_position: 1
label: env
slug: env
---

# `@skyline-js/env`

:::info

This is the API reference for the `@skyline-js/env` package. <br />
The guiding principles of the Skyline environment approach can be found here: [Environment Primer](/docs/environment).

:::

<!-- TODO: use monaco editor here with index.d.ts loaded to demonstrate type-safety of package -->

## SkylineEnv

Installation

```sh
npm install @skyline-js/env
```

```ts
import { SkylineEnv } from '@skyline-js/env';

const env = new SkylineEnv();
```

<br />

## Interfaces

### EnvConfiguration

```ts path="packages/env/src/lib/env-configuration.interface.ts" skipLines="2" remove="export "
interface EnvConfiguration<
  RuntimeEnvironment extends { [key: string]: string } = {}
> {
  // ===  Runtime environment ===
  /** The runtime of your application */
  runtime?: RuntimeEnvironment[keyof RuntimeEnvironment] | string;

  /** The possible runtimes of your application.
   * Provide this option if you want to validate that the runtime is one of the provided runtimes.
   */
  runtimes?: RuntimeEnvironment;

  /** The process environment (probably only useful for testing).
   * Provide this option if you want to use a custom process environment.
   * @default process.env
   */
  processEnv: NodeJS.ProcessEnv;

  // ===  Variable name ===
  /**
   * The prefix of your environment variables.
   * Provide this option if you want to validate that the environment variable name starts with the provided prefix.
   */
  variableNamePrefix: string;

  /**
   * Whether to ignore the casing of your environment variable names.
   * @default false
   */
  variableNameIgnoreCasing: boolean;

  // ===  Variable value ===
  /**
   * Whether to trim the value of your environment variables.
   * @default false
   */
  valueTrim: boolean;

  /**
   * The encoding of your environment variables.
   * Provide this option if you want to decode the value of your environment variables.
   * Possible values are 'base64', 'base64url', 'hex' and 'url'.
   */
  valueEncoding?: ValueEncodingType;

  /**
   * Whether to remove the value of your environment variables after parsing.
   * Provide this option if you want to remove the value of your environment variables after parsing.
   * This can improve the security of your application.
   * @default false
   */
  valueRemoveAfterParse: boolean;

  // === Boolean parsing ===
  /**
   * The values (strings) that are considered as true.
   * @default true, 1, yes, y, on, enabled, enable, ok, okay
   */
  booleanTrueValues: string[];

  /**
   * The values (strings) that are considered as false.
   * @default false, 0, no, n, off, disabled, disable
   */
  booleanFalseValues: string[];

  // === String parsing ===
  /**
   * The minimum length of the string.
   */
  stringMinLength?: number;

  /**
   * The maximum length of the string.
   */
  stringMaxLength?: number;

  /**
   * The pattern of the string.
   */
  stringPattern?: RegExp | string;

  // === Number parsing ===
  /**
   * The minimum value of the number.
   */
  numberMinimum?: number;

  /**
   * The maximum value of the number.
   */
  numberMaximum?: number;

  /**
   * The minimum value of the number (exclusive).
   */
  numberExclusiveMinimum?: number;

  /**
   * The maximum value of the number (exclusive).
   */
  numberExclusiveMaximum?: number;

  // === JSON parsing ===
  /**
   * The minimum number of properties of the JSON object.
   */
  jsonMinProperties?: number;

  /**
   * The maximum number of properties of the JSON object.
   */
  jsonMaxProperties?: number;

  /**
   * The required properties of the JSON object.
   */
  jsonRequired?: string[];

  // === Array parsing ===
  /**
   * The separator of the array.
   * @default ,
   */
  arraySeparator: string;

  /**
   * The minimum length of the array.
   */
  arrayMinLength?: number;

  /**
   * The maximum length of the array.
   */
  arrayMaxLength?: number;

  /**
   * Whether to ensure that the array has unique items.
   * @default false
   */
  arrayUniqueItems: boolean;
}
```

<!-- </Include> -->- </Include> -->
