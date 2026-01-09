import { Injectable } from '@nestjs/common';

import nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NodemailerService {
  constructor(private configService: ConfigService) {}
  async sendEmail(email: string, template: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('GMAIL_ACCOUNT')!,
        pass: this.configService.get('GMAIL_PASSWORD')!,
      },
    });
    console.log('email sending', email);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      await transporter.sendMail({
        from: '"Kek 👻"  <dr1pdef@gmail.com>',
        to: email,
        subject: 'RegistrationInput',
        html: template, // html body
      });
      return;
    } catch (e: unknown) {
      console.log('Sending email failed', e);
    }
  }
}
