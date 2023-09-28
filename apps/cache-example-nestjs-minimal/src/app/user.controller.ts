import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Controller()
export class UserController {
  constructor(private readonly userRepo: UserRepository) {}

  @Get('user/:id')
  getUserById(@Param() params: { id: number }) {
    const id = Number(params.id);
    return this.userRepo.getUsersById(id);
  }

  @Get('users/:ids')
  getUsersByIds(@Param() params: { ids: string }) {
    const ids = params.ids.split(',').map(Number);
    return this.userRepo.getUsersByIds(ids);
  }

  @Post('user')
  createUser() {
    return this.userRepo.createUser({ name: 'John Doe' });
  }
}
