import { Controller, Get } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Controller()
export class UserController {
  constructor(private readonly userRepo: UserRepository) {}

  @Get()
  getData() {
    return this.userRepo.getUsersByIds([]);
  }
}
