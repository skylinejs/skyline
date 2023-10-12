import { Body, Controller, Post, Req } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { Translations } from './translations';
import type { Request } from 'express';

@Controller()
export class AppController {
  private readonly transporter = createTransport({
    host: 'skyline_mailhog',
    port: 1025,
    secure: false,
  });

  @Post('register')
  async sendRegistrationEmail(@Req() req: Request, @Body() input: { email: string }) {
    const language = req.headers['accept-language']?.split(',')[0] || 'en';

    // Translate email subject
    const subject = Translations.translate(Translations.key.registrationEmail.subject, {
      params: { email: input.email },
      language,
    });

    // Translate email body
    const body = Translations.translate(Translations.key.registrationEmail.body, {
      params: { email: input.email },
      language,
    });

    // Send email
    await this.transporter.sendMail({
      from: 'info@skylinejs.com',
      to: input.email,
      subject,
      text: body,
    });

    return { success: true };
  }
}
