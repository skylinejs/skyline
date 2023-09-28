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
