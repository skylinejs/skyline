import { Body, Controller, Get, Post } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { env } from './env';

@Controller()
export class AppController {
  private readonly transporter = createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
  });

  @Get('runtime-env')
  getServerRuntimeEnvironment() {
    return env.runtime;
  }

  @Post('register')
  async sendRegistrationEmail(@Body() { email }: { email: string }) {
    await this.transporter.sendMail({
      from: env.mail.from,
      to: email,
      subject: 'Welcome to SkylineJS',
      text: 'Welcome to SkylineJS',
    });

    return {
      from: env.mail.from,
      to: email,
    };
  }
}
