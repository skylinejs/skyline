---
sidebar_position: 3
slug: /caching
label: Caching
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CachingChart from '@site/src/components/CachingChart';

# Caching

:::info

This page describes the guiding principles of the Skyline caching approach. <br />
The API reference of the `@skyline-js/cache` package can be found here: [@skyline-js/cache](/docs/api-reference/cache)

:::

## Introduction

> There are only two hard things in Computer Science: cache invalidation and managing your package.json.

Good news, we are about to solve cache invalidation. Regarding your package-lock.json merge conflicts, we send our prayers and thoughts. But why is caching so difficult? Consider this simple scenario of two servers, a database and a cache:

<br />

```mermaid
%%{init:{'themeCSS':' .noteText { tspan { fill: white; } }; .note { fill: darkred };'}}%%

sequenceDiagram
    autonumber

    participant Server 1
    participant Cache
    participant Server 2

    Server 1->> Cache: Get user:1
    Cache ->> Server 1: Cache miss
    Server 1->> Server 1: Get user:1 from database

    Server 2->> Server 2: Update user:1 in database
    Server 2 ->> Cache: Write udpated user:1

    Server 1 ->> Cache: Write old user:1

    Note over Server 1,Server 2: Cache is inconsistent


```

> Note: the diagram does not show the database as a separate column due to space constraints.

<br />

Server 1 wants to read `user:1` from the cache. As the user is not cached yet, he has to fetch the user from the database. To have the user cached for the next read operation, Server 1 writes the user to the cache. In the meantime, Server 2 updates the name of `user:1`. He then proceeds to write the updated user to the cache.

The diagram shows how an unfortunate timing of these operations can result in an inconsistent cache. Timing dependent bugs are hard to observe and reproduce and are therfore well suited to destroy the morale and sanity of one or more developers.

How can we protect ourselves against this scenario? A solution could be to only write to the cache if no value exists for the key. This would prevent the write operation from Server 1 to write an old value for `user:1` to the cache. However, what if the write operation of Server 1 is faster than the write operation of Server 2? In this case, a value for `user:1` would already exist in the cache and therefore the write operation of Server 2 would be discarded, producing an inconsistent cache again.

To solve this problem, we could always write to the cache after we perform an update operation, regardless of whether a value exists in the cache or not. Sounds good, but this just produces more problems. Consider this diagram where two servers update the same user in parallel:

```mermaid
%%{init:{'themeCSS':'.note { fill: darkred }; .noteText { tspan { fill: white; } } '}}%%
sequenceDiagram
    autonumber

    participant Server 1
    participant Cache
    participant Server 2

    Server 1 ->> Server 1: Update user:1 in database
    Server 2 ->> Server 2: Update user:1 in database
    Server 2 ->> Cache: Write udpated user:1
    Server 1 ->> Cache: Write udpated user:1

    Note over Server 1,Server 2: Cache is inconsistent
```

<br />

I hope that this short thought experiment clearly demonstrates the need for a caching strategy that provides consistency regardless of the order of operations that are executed on the cache. This guarantuee cannot come at the expense of the complexity of the code that needs to be written, because complex code is hard to write and even harder to test, so it will be buggy and therefore not provide a guarantuee.

Enter the Skyline caching framework, that solves all of these problems while still providing a simple interface to the developer - by borrowing a trick or two from theoretical computer science.

## Caching strategy overview

The skyline caching strategy is based on the following rules:

1. Writing a value to a cache key only happens if the cache key is not set yet.
1. Writing a value to a cache key only happens if the value is not stale.
1. Invalidating a cache key sets the value to `blocked` for a certain amount of time.
1. A value retrieved for a cache key has to be validated regarding its structure.

Following these rules, no cache inconsistencies can occurr due to timing issues. However, the cache invalidation itself still needs to be done by the developer whenever a value changes. As this is very easy to forget, we furthermore need a process in place to deal with cache inconsistencies due to missing invalidations:

1. Every cache read has a probability of being skipped, which is resulting in a forced cache miss. This probability should be set to 100% for a newly introduced cache.
1. A skipped cache read results in the fetching of the value from the source of truth, followed by writing the value to the cache. The write operation fetches the cached value and compares it to the value that was fetched from the source of truth to detect an inconsistency.
1. The skip probability can be reduced with increasing confidence in the feature. However, in local development, CI and testing environments it should always be 100% to catch any inconsistencies that have been (re)introduced.

Finally, we need a strategy for minimizing the impact that a caching error has on our production system:

1. Caching has to be optional to the correct functioning of the application. If the cache throws an error, it will be identical to a cache miss for the application. Errors are always logged but catched in production - in local development, CI and testing environments always thrown.
2. A cache key consists of a namespace (e.g., `user`) and a key (e.g., `1`). If a cache inconsistency is detected, the entire namespace is disabled as the inconsistency is likely due to a systematic problem with that namespace's invalidation instead of only the individual key being affected.

<br />

Let's revisit the initial diagram with these rules in mind:

```mermaid
%%{init:{'themeCSS':'.note { fill: darkgreen }; .noteText { tspan { fill: white; } } '}}%%


sequenceDiagram
    autonumber

    participant Server 1
    participant Cache
    participant Server 2

    Server 1->> Cache: Get user:1
    Cache ->> Server 1: Cache miss
    Server 1->> Server 1: Get user:1 from database

    Server 2 ->> Server 2: Update user:1 in database
    Server 2 ->> Cache: Invalidate user:1

    Server 1 -->> Cache: Write old user:1

    Note over Server 1,Server 2: Cache is consistent

```

<br />

Why is the cache now consistent? Step 1 - 4 are identical, however Step 5 invalidates the cache `user:1`, which sets the value of the key to `blocked` for a certain amount of time (e.g., 1 second). This causes the cache write of the old value in Step 6 to be discarded.

You could argue: _"What if the time between Step 5 and Step 6 is longer than 1 second? In this case, the old value would still be written to the cache!"_.

This would be correct without the staleness check rule. A value is stale and will therefore be discarded when writing it to the cache if it has been fetched from the source of truth longer than a certain threshold amount of time (e.g., 1 second). In this scenario, the `fetchedAt` timestamp is recorded on Step 3, before the database is queried for the user. If the time between Step 5 and Step 6 is below 1 second, the write will be discarded because the cache key still exists (with the `blocked` value). If the time is above 1 second, the write will be discarded because the value has passed the stale threshold.

The cache inconsistencies are mitigated, let's see if the happy path of this diagram is still fullfilled: If Step 4 and 5 do not happen, the cache key `user:1` never gets blocked and therefore the correct value for `user:1` is written to the cache in Step 6. Nice!

<br />

Let's look at the second diagram:

```mermaid
%%{init:{'themeCSS':'.note { fill: darkgreen }; .noteText { tspan { fill: white; } } '}}%%
sequenceDiagram
    autonumber

    participant Server 1
    participant Cache
    participant Server 2

    Server 1 ->> Server 1: Update user:1 in database
    Server 2 ->> Server 2: Update user:1 in database
    Server 2 ->> Cache: Invalidate user:1
    Server 1 ->> Cache: Invalidate user:1

    Note over Server 1,Server 2: Cache is inconsistent
```

<br />

This one is easy. The cache just gets invalidated twice, so it is obviously not inconsistent. However, an important detail here is that the second invalidation has to reset the TTL (time-to-live) of the `blocked` value for `user:1` to its configured value, otherwise the cache key's `blocked` value could expire to soon and a late write operation as depicted in the first diagram could mess up our cache afterall.

To summarize, we leverage the asymmetry of a cache key being read (a lot) and a cache key being invalidated (not so often) by blocking a cache key for some time on invalidation. While we loose using the cache during this time, we gain the guarantee of a consistent cache for the rest of cache value's lifetime. Quite a bargain if you ask me! If a cache key gets invalidated frequently, we would not be able to use the cache. However, in this case caching might be the wrong approach anyways as caching is most useful for values that do not change too often.

## Code example walkthrough

I will demonstrate the Skyline caching strategy based on the following scenario: You want to build a NestJS web application server that stores its data in a relational database and uses Redis for caching. Your application has a dedicated data-access layer, which abstracts away the communication with the database. This is done via repositories, which offer methods to perform SQL operations on a specific database table (or multiple depending on the use-case). The database schema and therefore the SQL query structure is hidden from the consumer of the repository. The repository implements a read-through caching strategy:

1. Retrieve the requested value from the cache.
2. If the value could be retrieved from the cache, return it.
3. If the value is not present, retrieve the value from the database, write it to the cache and then return it.

We start with such a repository for the `user` entity:

<Tabs path="apps/example-cache-nestjs-minimal/src/app/" order="user.repository.ts, user.entity.ts, user.interface.ts, user.utils.ts, user.controller.ts, database-cache.service.ts">
<TabItem value="user.repository" label="user.repository.ts">

```ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { DatabaseCacheService } from './database-cache.service';
import { UserEntity } from './user.entity';
import { CreateUserInputValobj, UpdateUserInputValobj, UserValobj } from './user.interface';
import { isUserRowOrThrow, isUserRowsOrThrow } from './user.utils';

@Injectable()
export class UserRepository {
  constructor(
    private readonly cache: DatabaseCacheService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getUsersByIds(userIds: number[]): Promise<Array<UserValobj | undefined>> {
    if (!userIds.length) return [];

    // Check cache
    const { values: cachedUserRows, skipped } = await this.cache.getMany(
      'user',
      userIds,
      isUserRowOrThrow,
      { skip: 0.5 },
    );

    const missingUserIds = userIds.filter(
      (userId) => !cachedUserRows.some((row) => row?.id === userId),
    );

    // Query database for missing userIds
    let missingRows: UserValobj[] = [];
    if (missingUserIds.length > 0) {
      const fetchedAt = Date.now();
      missingRows = await this.dataSource
        .createQueryBuilder(UserEntity, 'user')
        .select('*')
        .whereInIds(missingUserIds)
        .execute();

      isUserRowsOrThrow(missingRows);

      // Cache missing rows
      await this.cache.setManyIfNotExist('user', (row) => row.id, missingRows, {
        fetchedAt,
        validate: skipped,
      });
    }

    const rows = [...cachedUserRows, ...missingRows];
    return userIds.map((userId) => rows.find((user) => user?.id === userId));
  }

  async getUsersById(userId: number): Promise<UserValobj | undefined> {
    const [user] = await this.getUsersByIds([userId]);
    return user;
  }

  async getUsersByIdOrFail(userId: number): Promise<UserValobj> {
    const user = await this.getUsersById(userId);
    if (!user) throw new EntityNotFoundError(UserEntity, `User with ID ${userId} not found`);

    return user;
  }

  async createUser(input: CreateUserInputValobj) {
    const rows =
      (
        await this.dataSource
          .createQueryBuilder()
          .insert()
          .into(UserEntity)
          .values(input)
          .returning('*')
          .execute()
      ).raw ?? [];

    isUserRowsOrThrow(rows);
    const user = rows[0];
    return user;
  }

  async updateUser(input: UpdateUserInputValobj) {
    // Invalidate cache
    await this.cache.invalidate('user', input.id);

    const rows =
      (
        await this.dataSource
          .createQueryBuilder()
          .update(UserEntity)
          .set(input)
          .where('id = :id', { id: input.id })
          .returning('*')
          .execute()
      ).raw ?? [];

    isUserRowsOrThrow(rows);
    const user = rows[0];
    return user;
  }

  async deleteUser(userId: number) {
    // Invalidate cache
    await this.cache.invalidate('user', userId);

    await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(UserEntity)
      .where('id = :id', { id: userId })
      .execute();
  }
}
```

</TabItem>
<TabItem value="user.entity" label="user.entity.ts">

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;
}
```

</TabItem>
<TabItem value="user.interface" label="user.interface.ts">

```ts
export interface UserValobj {
  id: number;
  name: string;
}

export interface CreateUserInputValobj {
  name: string;
}

export interface UpdateUserInputValobj {
  id: number;
  name: string;
}
```

</TabItem>
<TabItem value="user.utils" label="user.utils.ts">

```ts
import { UserValobj } from './user.interface';

export function isUserRowsOrThrow(candidates: unknown[]): asserts candidates is UserValobj[] {
  if (!Array.isArray(candidates)) {
    throw new Error(`Expected array, got ${typeof candidates}`);
  }

  for (const candidate of candidates) {
    if (typeof candidate !== 'object' || candidate === null) {
      throw new Error(`Expected object, got ${typeof candidate}`);
    }

    if (typeof (candidate as UserValobj).id !== 'number') {
      throw new Error(`Expected number, got ${typeof (candidate as UserValobj).id}`);
    }

    if (typeof (candidate as UserValobj).name !== 'string') {
      throw new Error(`Expected string, got ${typeof (candidate as UserValobj).name}`);
    }
  }
}

export function isUserRowOrThrow(candidate: unknown): asserts candidate is UserValobj {
  isUserRowsOrThrow([candidate]);
}
```

</TabItem>
<TabItem value="user.controller" label="user.controller.ts">

```ts
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Controller()
export class UserController {
  constructor(private readonly userRepo: UserRepository) {}

  @Get('user/:id')
  async getUserById(@Param() params: { id: number }) {
    const id = Number(params.id);
    const user = await this.userRepo.getUsersById(id);
    return { user };
  }

  @Get('users/:ids')
  async getUsersByIds(@Param() params: { ids: string }) {
    const ids = params.ids.split(',').map(Number);
    const users = await this.userRepo.getUsersByIds(ids);
    return { users };
  }

  @Post('user')
  async createUser(@Body() input: { name: string }) {
    const user = await this.userRepo.createUser({ name: input.name });
    return { user };
  }

  @Delete('user/:id')
  async deleteUser(@Param() params: { id: number }) {
    const id = Number(params.id);
    await this.userRepo.deleteUser(id);
    return { id };
  }
}
```

</TabItem>
<TabItem value="database-cache.service" label="database-cache.service.ts">

```ts
import { Injectable } from '@nestjs/common';
import { RedisCacheStorageEngine, SkylineCache } from '@skyline-js/cache';
import { createClient } from 'redis';

@Injectable()
export class DatabaseCacheService extends SkylineCache {
  constructor() {
    const redis = createClient({ url: 'redis://skyline_redis:6379' });
    redis.connect();

    super({
      storage: new RedisCacheStorageEngine({
        redis,
      }),
      config: {},
    });
  }
}
```

</TabItem>
<TabItem value="app.module" label="app.module.ts">

```ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { DatabaseCacheService } from './database-cache.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgres://postgres:postgres@skyline_postgres:5432/postgres',
      schema: 'public',
      dropSchema: true,
      synchronize: true,
      entities: [UserEntity],
    }),
  ],
  controllers: [UserController],
  providers: [DatabaseCacheService, UserRepository],
})
export class AppModule {}
```

</TabItem>
</Tabs>

The `getUsersByIds` retrieves one or more users by their ID. This method should be the basic building block for most of your repositories, as many other methods such as `getUserById`, `getUserByIdOrFail` etc. can be derived from it (and you are not tempted to implement a `Promise.all()` if you need to get multiple entities by ID later on...).

Due to the batched API of the method, we need to adjust the read-through caching execution flow as follows:

1. Retrieve the values for all input IDs from the cache.
2. If some values are missing, retrieve the missing values from the database and write them to the cache.
3. For each input ID, return either the retrieved value or `undefined` if the ID does not exist.

This is the only read/write interaction with the cache that this repository has to implement, as all other read operations are derived from `getUsersByIds`. This part was easy, and the remaining cache interactions get even easier.

The `updateUser` and `deleteUser` methods simply need to invalidate the cache key for the given user ID **before** the update/ deletion is performed on the database row. If the cache is invalidated after the database operation has finished, the cache would be in an inconsistent state as it still holds the old user value which now diverges from the database row. If other repositories change make changes to the user table, they need to invalidate the respective cache keys as well. One of the main advantages of the invalidation approach instead of writing the updated value to the cache is that the method performing the update of the entity does not need to know how all the new values of the affected cache keys have to look like (which can be complex derivations or aggregates). This turns out to be very useful for larger applications.

## Monitoring

While the SkylineJS caching approach gives developers an easy to use caching pattern that prevents many of the common caching bug sources, the invalidation of caches is still an issue. It is very easy to forget invalidating all caches that are affected by modifying some data inside the primary data storage. As it is a certainty that developers will forget to invalidate certain caches and this code will find its way into production, we need a monitoring strategy in place to make these cache inconsistencies visible and actionable. A simple chart like the one above can be created using the caching statistics features of the `@skyline-js/cache` library:

<CachingChart></CachingChart>

The bar chart shows how many cache hits, cache misses, cache skips, cache consistency checks and cache invalidations have been performed during each 10 minute interval. The example data show a healthy caching behavior regarding the distribution of the different event types. If you have much more cache misses than cache hits this might be worth investigating. Same goes for a significant difference in the number of cache skips and cache consistency checks, as those should go hand-in-hand and have therefore comparable numbers.

To collect the data for such a chart, you can use the `cache.getStatistics` and `cache.resetStatistics` methods. These are intentionally generic so you can choose your own way of implementing the periodic collection and resetting of the cache statistics e.g., using `setInterval` or the [@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling) package:

```ts
import { SkylineCache } from '@skyline-js/cache';

const cache = new SkylineCache();

// Collect cache statistics every 10 minutes using setInterval
setInterval(() => {
  const statistics = cache.getStatistics();
  cache.resetStatistics();
  // ... send statistics to your analytics platform (e.g., Kibana)
}, 1000 * 60 * 10);
```

```ts
import { Injectable, Logger } from '@nestjs/common';
import { SkylineCache } from '@skyline-js/cache';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CacheService extends SkylineCache {
  // Collect cache statistics every 10 minutes using @nestjs/schedule
  @Cron('*/10 * * * *')
  collectCacheStatistics() {
    const statistics = this.getStatistics();
    this.resetStatistics();
    // ... send statistics to your analytics platform (e.g., Kibana)
  }
}
```

<!--

## Best practices
 - keep caching inside the data-access layer
 - ensure composability of repositories
 - avoid aggregates as much as possible, one cache per entity should be the goal (demonstrate ID pattern)

TODO:
- Document BigInt what is necessary for stringify/ parse
- Handle storage engine failures (e.g., Redis not reachable)
-->
