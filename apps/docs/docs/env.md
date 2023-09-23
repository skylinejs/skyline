---
sidebar_position: 2
---

# Environment variables

@skyline-js/env

## Derived state

The environment is not the time to derive any state/ configs.
The env should be an exact representation of your env vars.

Example: Redis host + port. You might have 10 features that want to create a redis connection
