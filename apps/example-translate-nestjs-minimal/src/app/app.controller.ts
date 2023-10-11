import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('register')
  sendRegistrationEmail(@Body() input: { email: string }) {
    return this.appService.getData();
  }
}
