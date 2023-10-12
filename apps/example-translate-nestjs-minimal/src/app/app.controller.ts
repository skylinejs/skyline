import { Body, Controller, Post, Req } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { Translations } from './translations';

@Controller()
export class AppController {
  private readonly transporter = createTransport({});

  @Post('register')
  async sendRegistrationEmail(@Req() req: Request, @Body() input: { email: string }) {
    const language = req.headers['accept-language']?.split(',')[0] || 'en';

    const subject = Translations.translate(Translations.key.registrationEmail.subject, {
      params: { email: input.email },
      language,
    });

    const body = Translations.translate(Translations.key.registrationEmail.body, {
      params: { email: input.email },
      language,
    });

    await this.transporter.sendMail({
      from: 'info@skylinejs.com',
      to: input.email,
      subject,
      text: body,
    });

    return { success: true };
  }
}
