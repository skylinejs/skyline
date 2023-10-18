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
    return {
      runtime: env.runtime,
    };
  }

  @Post('register')
  async sendRegistrationEmail(@Body() { email }: { email: string }) {
    // Check if email is allowed to register
    if (new RegExp(env.registration.emailPattern).test(email) === false) {
      throw new Error('Email is not allowed to register');
    }

    // Send registration email
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
