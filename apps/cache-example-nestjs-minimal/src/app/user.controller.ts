import { Controller, Get, Param, Post } from '@nestjs/common';
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
  async createUser() {
    const user = await this.userRepo.createUser({ name: 'John Doe' });
    return { user };
  }
}
