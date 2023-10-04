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

Anyways, as you are reading the SkylineJS documentation, I assume you are most likely not attending such an event. Therefore, we will discuss how your environment variable management strategy can ensure maximum type safety, runtime validation and overall peace of mind.

We have all seen code like this:

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

And we have all debugged code like that in production because `DB_HOST` is missing the protocol prefix, `DB_TLS` is set to `true` instead of `1` and `DB_PASSWORD` is incorrect because the special characters got url-encoded when the password got pulled from a secret manager via HTTP.

<!--
## Derived state

The environment is not the time to derive any state/ configs.
The env should be an exact representation of your env vars.
decryption/ encryption

RuntimeEnvironemt -> DEV, CI, PRD
base64 encoding etc?

Example: Redis host + port. You might have 10 features that want to create a redis connection
-->
