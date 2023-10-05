---
sidebar_position: 2
slug: environment
label: Environment
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Environment

:::info

This page describes the guiding principles of the Skyline environment approach. <br />
The API reference of the `@skyline-js/env` package can be found here: [@skyline-js/env](/docs/api-reference/env)

:::

## Introduction

> Even the best CI/CD setup does not prevent your application to crash in production because someone forgot to set `SERVER_PRD_DB_TLS_CONNECTION=true`

Environment variable management is not a good conversation topic when attending a social event. Even when you talk to another developer, chances are they just don't care that much about their environment variables.
Even worse, they might have been responsible for a production downtime due to an environment variable issue and now you just re-traumatized them. As you can see, it is much more appropriate for you to talk about the weather, like everybody else does.

Anyways, as you are reading the SkylineJS documentation, I assume you are most likely not attending such an event. Therefore, we will discuss how your environment variable management strategy can ensure maximum type safety, perform runtime validations and provide you with an overall peace of mind.

We all have seen code like this:

```ts
db.connect({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  useTLS: process.env.DB_TLS === '1' ? true : false,
  auth: {
    username: process.env.DB_USER || 'admin',
    password:
      process.env.DB_PASSWORD || 'strong_password_with_special_chars_%#!',
  },
});
```

And we have all debugged code like that in production because `DB_HOST` is missing the protocol prefix, `DB_TLS` is set to `"true"` instead of `"1"` and `DB_PASSWORD` is incorrect because the special characters got url-encoded when the password got pulled from a secrets manager via FTP (yes I know).

To avoid these issues, your environment variable management should be based on the following principles:

1. Environment variables are parsed and validated by a single module of your codebase. Nobody else touches `process.env`. Everyone else gets their environment variables from this module.

2. Every environment variable is tested for syntactical correctness during parsing. This ensures that the type and shape of the environment variable is guaranteed to the rest of the application during runtime.

3. All non-sensitive environment variables are declared and maintained inside the codebase. There is no value in scattering your different environment configs across multiple `.env` files and inside your deployment scripts.

4. Error handling should be as strict as possible. Each unexpected environment state should lead to a failure of the application. This way you can rollback the application update immediately and prevent it from causing issues in production later on.

## Example code walkthrough

To demonstrate the implementation of the principles above, we take a look at a basic environment variable parsing using the `@skyline-js/env` package:

```ts
import { SkylineEnv } from '@skyline-js/env';

const parser = new SkylineEnv();

export const env = {
  api: {
    host: parser.parseString('SERVER_API_HOST'),
    port: parser.parseNumber('SERVER_API_PORT'),
    cors: parser.parseBoolean('SERVER_CORS_ENABLED'),
  },
  database: {
    host: parser.parseString('SERVER_DATABASE_HOST'),
    port: parser.parseString('SERVER_DATABASE_PORT'),
  },
};
```

The rest of the application can now consume the parsed environment variables the same way they would access `process.env`:

```ts
import { env } from '@myapp/env';

// ...

db.connect({
  host: env.database.host,
  port: env.database.port,
});

// ...

api.listen({
  host: env.api.host,
  port: env.api.port,
  enableCors: env.api.cors,
});
```

This minimal example only follows principle 1 by keeping the environment variable parsing in a single place. Principle 2 is partially covered as the type of each environment variable is validated (string, number, boolean). Let's rewrite the example above:

```ts
import { SkylineEnv } from '@skyline-js/env';

export enum RuntimeEnvironment {
  DEV = 'DEV',
  CI = 'CI',
  PRD = 'PRD',
}

const parser = new SkylineEnv({
  runtime: process.env.NODE_ENV,
  runtimes: RuntimeEnvironment,
  valueTrim: true,
});

export const env = {
  api: {
    host: parser.parseString('SERVER_API_HOST', {
      default: 'http://localhost',
      CI: 'http://skyline_ci_database',
      PRD: 'https://skyline_prd_database',
      stringPattern: /https?:\/\/.+/,
    }),
    port: parser.parseNumber('SERVER_API_PORT', {
      default: 3000,
      numberIsInteger: true,
    }),
    cors: parser.parseBoolean('SERVER_CORS_ENABLED', {
      default: false,
      PRD: true,
    }),
  },
  database: {
    host: parser.parseString('SERVER_DATABASE_HOST', {
      default: 'localhost',
      CI: 'skyline_ci_database',
      PRD: 'skyline_prd_database',
    }),
    port: parser.parseString('SERVER_DATABASE_PORT', {
      default: 5432,
      numberIsInteger: true,
    }),
    password: parser.parseString('SERVER_DATABASE_PASSWORD', {
      default: 'password123',
      minLength: 6,
      valueRemoveAfterParse: true,
    }),
  },
};
```

<!--
Example "email" and "file upload" that are lazy initialized and if not validated at application start can cause issues later on when they get used.

## Derived state

The environment is not the time to derive any state/ configs.
The env should be an exact representation of your env vars.
decryption/ encryption

RuntimeEnvironemt -> DEV, CI, PRD
base64 encoding etc?

Example: Redis host + port. You might have 10 features that want to create a redis connection
-->
