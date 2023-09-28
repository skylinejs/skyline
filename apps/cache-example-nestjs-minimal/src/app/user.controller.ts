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
