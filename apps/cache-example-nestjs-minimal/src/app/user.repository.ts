import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityNotFoundError } from 'typeorm';
import { DatabaseCacheService } from './database-cache.service';
import { UserEntity } from './user.entity';
import {
  CreateUserInputValobj,
  UpdateUserInputValobj,
  UserValobj,
} from './user.interface';
import { isUserRowOrThrow, isUserRowsOrThrow } from './user.utils';

@Injectable()
export class UserRepository {
  constructor(
    private readonly cache: DatabaseCacheService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async getUsersByIds(
    userIds: number[]
  ): Promise<Array<UserValobj | undefined>> {
    if (!userIds.length) return [];

    // Check cache
    const { values: cachedUserRows, skipped } = await this.cache.getMany(
      'user',
      userIds,
      isUserRowOrThrow,
      { skip: 0.5 }
    );

    const missingUserIds = userIds.filter(
      (userId) => !cachedUserRows.some(({ id }) => id === userId)
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
    if (!user)
      throw new EntityNotFoundError(
        UserEntity,
        `User with ID ${userId} not found`
      );

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
}
