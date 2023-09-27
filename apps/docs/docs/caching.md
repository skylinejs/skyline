---
sidebar_position: 3
slug: /caching
---

import CachingChart from '@site/src/components/CachingChart';
import CoverImage from '@site/src/components/CoverImage';

# Caching

> There are only two hard things in Computer Science: cache invalidation and managing your package.json.

Good news, we are about to solve cache invalidation. Regarding your package-lock.json merge conflicts, we send our prayers and thoughts.

But why is caching so difficult? Consider this simple scenario of two servers, a database and a cache:

```mermaid
sequenceDiagram
    autonumber

    participant Server 1
    participant Cache
    participant Server 2

    Server 1->> Cache: Get user:1
    Cache -->> Server 1: Cache miss
    Server 1->> Server 1: Get user:1 from database

    Server 2->> Server 2: Update user:1 in database
    Server 2 ->>+Cache: Write udpated user:1

    Server 1 ->> Cache: Write old user:1

    Note over Server 1,Server 2: Cache is inconsistent


```

<!--
TODO: interactive analytics dashboard of caching statistics
<CachingChart></CachingChart>

## Error handling

Caching is fully optional, so the cache should never cause a failure in production. At least we should be able to configure it to do so.

- Document BigInt what is necessary for stringify/ parse
- Handle storage engine failures (e.g., Redis not reachable)

-->
