import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getUsersByIds(userIds: number[]) {
    if (!userIds.length) return [];

    // Check cache
    this.dataSource.createQueryBuilder(UserEntity, 'user').whereInIds(userIds);

    return { message: 'Hello API' };
  }
}
